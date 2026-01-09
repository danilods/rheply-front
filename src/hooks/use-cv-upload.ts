import { useState, useCallback, useRef } from 'react';
import { candidateApi } from '@/services/candidate-api';
import { ParsedCVResponse, ParsedCVData } from '@/types/api-responses';
import { validateCVFile, getFileInfo, formatFileSize } from '@/utils/file-upload';

interface UseCVUploadOptions {
  maxRetries?: number;
  pollingInterval?: number;
  maxPollingTime?: number;
  onSuccess?: (data: ParsedCVData) => void;
  onError?: (error: string) => void;
}

interface FileInfo {
  name: string;
  size: string;
  type: string;
}

interface UseCVUploadReturn {
  uploadProgress: number;
  parsingProgress: number;
  isUploading: boolean;
  isParsing: boolean;
  parsedData: ParsedCVData | null;
  error: string | null;
  fileInfo: FileInfo | null;
  uploadId: string | null;

  // Actions
  uploadFile: (file: File) => Promise<void>;
  cancelUpload: () => void;
  resetUpload: () => void;
  validateData: () => Promise<boolean>;
  saveParsedData: () => Promise<void>;
  retryUpload: () => Promise<void>;
}

const DEFAULT_OPTIONS: UseCVUploadOptions = {
  maxRetries: 3,
  pollingInterval: 2000, // 2 seconds
  maxPollingTime: 300000, // 5 minutes
};

export function useCVUpload(
  options: UseCVUploadOptions = {}
): UseCVUploadReturn {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const [uploadProgress, setUploadProgress] = useState(0);
  const [parsingProgress, setParsingProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedCVData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [uploadId, setUploadId] = useState<string | null>(null);

  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastFileRef = useRef<File | null>(null);
  const retryCountRef = useRef(0);

  // Clear polling timer
  const clearPolling = useCallback(() => {
    if (pollingTimerRef.current) {
      clearTimeout(pollingTimerRef.current);
      pollingTimerRef.current = null;
    }
  }, []);

  // Poll for parsing status
  const pollParsingStatus = useCallback(
    async (id: string, startTime: number) => {
      const elapsedTime = Date.now() - startTime;

      if (elapsedTime > opts.maxPollingTime!) {
        setError('CV parsing timed out. Please try again.');
        setIsParsing(false);
        clearPolling();
        return;
      }

      try {
        const response = await candidateApi.getCVParsingStatus(id);

        setParsingProgress(response.progress);

        switch (response.status) {
          case 'completed':
            if (response.data) {
              setParsedData(response.data);
              setIsParsing(false);
              clearPolling();
              opts.onSuccess?.(response.data);
            }
            break;

          case 'failed':
            setError(response.error || 'CV parsing failed');
            setIsParsing(false);
            clearPolling();
            opts.onError?.(response.error || 'CV parsing failed');
            break;

          case 'processing':
            // Continue polling
            pollingTimerRef.current = setTimeout(() => {
              pollParsingStatus(id, startTime);
            }, opts.pollingInterval);
            break;
        }
      } catch (err) {
        console.error('Error polling parsing status:', err);

        // Retry polling
        if (retryCountRef.current < opts.maxRetries!) {
          retryCountRef.current++;
          pollingTimerRef.current = setTimeout(() => {
            pollParsingStatus(id, startTime);
          }, opts.pollingInterval);
        } else {
          setError('Failed to check parsing status');
          setIsParsing(false);
          clearPolling();
        }
      }
    },
    [opts, clearPolling]
  );

  // Upload file
  const uploadFile = useCallback(
    async (file: File) => {
      // Validate file
      const validation = validateCVFile(file);
      if (!validation.isValid) {
        setError(validation.error || 'Invalid file');
        opts.onError?.(validation.error || 'Invalid file');
        return;
      }

      // Reset state
      setError(null);
      setParsedData(null);
      setUploadProgress(0);
      setParsingProgress(0);
      retryCountRef.current = 0;

      // Store file info
      const info = getFileInfo(file);
      setFileInfo({
        name: info.name,
        size: formatFileSize(info.size),
        type: info.extension.toUpperCase(),
      });
      lastFileRef.current = file;

      // Create abort controller for cancellation
      abortControllerRef.current = new AbortController();

      setIsUploading(true);

      try {
        // Upload file with progress tracking
        const response: ParsedCVResponse = await candidateApi.uploadCV(
          file,
          (progress) => {
            setUploadProgress(progress);
          }
        );

        setUploadId(response.id);
        setIsUploading(false);
        setUploadProgress(100);

        // Start polling for parsing status
        if (response.status === 'processing') {
          setIsParsing(true);
          setParsingProgress(response.progress);
          pollParsingStatus(response.id, Date.now());
        } else if (response.status === 'completed' && response.data) {
          setParsedData(response.data);
          setParsingProgress(100);
          opts.onSuccess?.(response.data);
        } else if (response.status === 'failed') {
          setError(response.error || 'Upload failed');
          opts.onError?.(response.error || 'Upload failed');
        }
      } catch (err) {
        setIsUploading(false);

        if (err instanceof Error && err.name === 'AbortError') {
          setError('Upload cancelled');
        } else {
          const message =
            err instanceof Error ? err.message : 'Failed to upload file';
          setError(message);
          opts.onError?.(message);
        }
      }
    },
    [opts, pollParsingStatus]
  );

  // Cancel upload
  const cancelUpload = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    clearPolling();
    setIsUploading(false);
    setIsParsing(false);
    setError('Upload cancelled');
  }, [clearPolling]);

  // Reset upload state
  const resetUpload = useCallback(() => {
    clearPolling();

    setUploadProgress(0);
    setParsingProgress(0);
    setIsUploading(false);
    setIsParsing(false);
    setParsedData(null);
    setError(null);
    setFileInfo(null);
    setUploadId(null);
    lastFileRef.current = null;
    retryCountRef.current = 0;
  }, [clearPolling]);

  // Validate parsed data
  const validateData = useCallback(async () => {
    if (!parsedData) {
      setError('No parsed data to validate');
      return false;
    }

    try {
      await candidateApi.validateParsedData(parsedData);
      return true;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Validation failed';
      setError(message);
      return false;
    }
  }, [parsedData]);

  // Save parsed data to profile
  const saveParsedData = useCallback(async () => {
    if (!parsedData) {
      setError('No parsed data to save');
      return;
    }

    try {
      await candidateApi.saveParsedCVToProfile(parsedData);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to save data';
      setError(message);
      throw err;
    }
  }, [parsedData]);

  // Retry upload
  const retryUpload = useCallback(async () => {
    if (!lastFileRef.current) {
      setError('No file to retry');
      return;
    }

    retryCountRef.current++;
    if (retryCountRef.current > opts.maxRetries!) {
      setError('Maximum retry attempts reached');
      return;
    }

    setError(null);
    await uploadFile(lastFileRef.current);
  }, [opts.maxRetries, uploadFile]);

  return {
    uploadProgress,
    parsingProgress,
    isUploading,
    isParsing,
    parsedData,
    error,
    fileInfo,
    uploadId,
    uploadFile,
    cancelUpload,
    resetUpload,
    validateData,
    saveParsedData,
    retryUpload,
  };
}

export default useCVUpload;
