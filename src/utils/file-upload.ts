import { FILE_UPLOAD } from '@/constants/candidate';

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export interface FileInfo {
  name: string;
  size: number;
  type: string;
  extension: string;
  lastModified: Date;
}

/**
 * Validate if file type is allowed for CV upload
 */
export function validateFileType(file: File): FileValidationResult {
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
  const isAllowedType = (FILE_UPLOAD.ALLOWED_CV_TYPES as readonly string[]).includes(file.type);
  const isAllowedExtension =
    (FILE_UPLOAD.ALLOWED_CV_EXTENSIONS as readonly string[]).includes(fileExtension);

  if (!isAllowedType && !isAllowedExtension) {
    return {
      isValid: false,
      error: `Invalid file type. Allowed types: ${FILE_UPLOAD.ALLOWED_CV_EXTENSIONS.join(', ')}`,
    };
  }

  return { isValid: true };
}

/**
 * Validate file size
 */
export function validateFileSize(file: File): FileValidationResult {
  if (file.size > FILE_UPLOAD.MAX_SIZE_BYTES) {
    return {
      isValid: false,
      error: `File size exceeds ${FILE_UPLOAD.MAX_SIZE_MB}MB limit`,
    };
  }

  if (file.size === 0) {
    return {
      isValid: false,
      error: 'File is empty',
    };
  }

  return { isValid: true };
}

/**
 * Validate file for CV upload (both type and size)
 */
export function validateCVFile(file: File): FileValidationResult {
  const typeValidation = validateFileType(file);
  if (!typeValidation.isValid) {
    return typeValidation;
  }

  const sizeValidation = validateFileSize(file);
  if (!sizeValidation.isValid) {
    return sizeValidation;
  }

  return { isValid: true };
}

/**
 * Convert file to base64 string
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Convert file to ArrayBuffer
 */
export function fileToArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve(reader.result as ArrayBuffer);
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsArrayBuffer(file);
  });
}

/**
 * Create FormData for file upload
 */
export function createFormData(
  file: File,
  additionalFields?: Record<string, string | Blob>
): FormData {
  const formData = new FormData();
  formData.append('file', file);

  if (additionalFields) {
    Object.entries(additionalFields).forEach(([key, value]) => {
      formData.append(key, value);
    });
  }

  return formData;
}

/**
 * Get file information
 */
export function getFileInfo(file: File): FileInfo {
  const nameParts = file.name.split('.');
  const extension = nameParts.length > 1 ? nameParts.pop()!.toLowerCase() : '';

  return {
    name: file.name,
    size: file.size,
    type: file.type,
    extension,
    lastModified: new Date(file.lastModified),
  };
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Generate a unique filename with timestamp
 */
export function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now();
  const nameParts = originalName.split('.');
  const extension = nameParts.pop();
  const baseName = nameParts.join('.');

  return `${baseName}_${timestamp}.${extension}`;
}

/**
 * Check if file is a PDF
 */
export function isPDF(file: File): boolean {
  return (
    file.type === 'application/pdf' ||
    file.name.toLowerCase().endsWith('.pdf')
  );
}

/**
 * Check if file is a Word document
 */
export function isWordDocument(file: File): boolean {
  return (
    file.type === 'application/msword' ||
    file.type ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    file.name.toLowerCase().endsWith('.doc') ||
    file.name.toLowerCase().endsWith('.docx')
  );
}

/**
 * Get file type icon name based on file type
 */
export function getFileTypeIcon(file: File): string {
  if (isPDF(file)) {
    return 'file-text';
  }
  if (isWordDocument(file)) {
    return 'file-text';
  }
  return 'file';
}

/**
 * Extract text from filename (remove extension and replace separators)
 */
export function cleanFilename(filename: string): string {
  const nameParts = filename.split('.');
  if (nameParts.length > 1) {
    nameParts.pop(); // Remove extension
  }

  return nameParts
    .join('.')
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Download a blob as a file
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Read file as text (useful for parsing)
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve(reader.result as string);
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file as text'));
    };

    reader.readAsText(file);
  });
}

/**
 * Create a file from base64 string
 */
export function base64ToFile(
  base64: string,
  filename: string,
  mimeType: string
): File {
  const byteString = atob(base64);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);

  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  return new File([ab], filename, { type: mimeType });
}

/**
 * Compress image file (for avatars, etc.)
 */
export async function compressImage(
  file: File,
  maxWidth: number = 800,
  quality: number = 0.8
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // Calculate new dimensions
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        file.type,
        quality
      );
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = URL.createObjectURL(file);
  });
}
