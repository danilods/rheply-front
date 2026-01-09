"use client";

import { useCallback, useState } from "react";
import { Upload, FileText, Image, AlertCircle, CheckCircle, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { validateCVFile } from "@/lib/validations/candidate";
import { UploadStatus } from "@/types/candidate";
import { cn } from "@/lib/utils";

interface CVUploaderProps {
  onFileSelect: (file: File) => void;
  uploadProgress: number;
  uploadStatus: UploadStatus;
  error?: string;
  onReset?: () => void;
  selectedFile?: File | null;
}

export function CVUploader({
  onFileSelect,
  uploadProgress,
  uploadStatus,
  error,
  onReset,
  selectedFile,
}: CVUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      setValidationError(null);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        const file = files[0];
        const validation = validateCVFile(file);
        if (validation.valid) {
          onFileSelect(file);
        } else {
          setValidationError(validation.error || "Arquivo invalido");
        }
      }
    },
    [onFileSelect]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setValidationError(null);
      const files = e.target.files;
      if (files && files.length > 0) {
        const file = files[0];
        const validation = validateCVFile(file);
        if (validation.valid) {
          onFileSelect(file);
        } else {
          setValidationError(validation.error || "Arquivo invalido");
        }
      }
    },
    [onFileSelect]
  );

  const getFileIcon = (file: File) => {
    if (file.type.includes("pdf") || file.type.includes("word")) {
      return <FileText className="h-8 w-8 text-primary" />;
    }
    return <Image className="h-8 w-8 text-primary" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getStatusContent = () => {
    switch (uploadStatus) {
      case UploadStatus.UPLOADING:
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
            <div className="space-y-2">
              <div className="text-center font-medium">Enviando arquivo...</div>
              <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                <div
                  className="bg-primary h-full transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <div className="text-center text-sm text-muted-foreground">
                {uploadProgress}% concluido
              </div>
            </div>
          </div>
        );

      case UploadStatus.PARSING:
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <div className="relative">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-4 w-4 bg-primary/20 rounded-full animate-pulse" />
                </div>
              </div>
            </div>
            <div className="text-center space-y-2">
              <div className="font-medium text-lg">Analisando seu curriculo...</div>
              <div className="text-sm text-muted-foreground">
                Nossa IA esta extraindo suas informacoes
              </div>
            </div>
          </div>
        );

      case UploadStatus.SUCCESS:
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <div className="text-center space-y-2">
              <div className="font-medium text-lg text-green-600">
                Curriculo analisado com sucesso!
              </div>
              <div className="text-sm text-muted-foreground">
                Confira os dados extraidos abaixo
              </div>
            </div>
          </div>
        );

      case UploadStatus.ERROR:
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <AlertCircle className="h-12 w-12 text-destructive" />
            </div>
            <div className="text-center space-y-2">
              <div className="font-medium text-lg text-destructive">
                Erro ao processar arquivo
              </div>
              <div className="text-sm text-destructive/80">{error}</div>
              <Button variant="outline" onClick={onReset} className="mt-2">
                Tentar novamente
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (uploadStatus !== UploadStatus.IDLE) {
    return (
      <Card className="border-2">
        <CardContent className="p-8">{getStatusContent()}</CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card
        className={cn(
          "border-2 border-dashed transition-all duration-300 cursor-pointer",
          isDragging
            ? "border-primary bg-primary/5 scale-[1.02]"
            : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
          validationError && "border-destructive"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="p-8">
          <label className="cursor-pointer block">
            <input
              type="file"
              className="hidden"
              accept=".pdf,.docx,.jpg,.jpeg,.png"
              onChange={handleFileInput}
            />
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="p-4 bg-primary/10 rounded-full">
                <Upload className="h-10 w-10 text-primary" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-lg font-medium">
                  Arraste e solte seu curriculo aqui
                </p>
                <p className="text-sm text-muted-foreground">
                  Ou clique para selecionar
                </p>
              </div>
              <div className="text-xs text-muted-foreground">
                PDF, DOCX, JPG ou PNG (max. 10MB)
              </div>
            </div>
          </label>
        </CardContent>
      </Card>

      {selectedFile && uploadStatus === UploadStatus.IDLE && (
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getFileIcon(selectedFile)}
                <div>
                  <p className="font-medium text-sm">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              </div>
              {onReset && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onReset}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {(validationError || error) && (
        <div className="flex items-center space-x-2 text-destructive text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>{validationError || error}</span>
        </div>
      )}

      <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
        <div className="flex items-center space-x-1">
          <div className="h-2 w-2 bg-green-500 rounded-full" />
          <span>Seguro</span>
        </div>
        <span>|</span>
        <div className="flex items-center space-x-1">
          <div className="h-2 w-2 bg-blue-500 rounded-full" />
          <span>Criptografado</span>
        </div>
        <span>|</span>
        <div className="flex items-center space-x-1">
          <div className="h-2 w-2 bg-purple-500 rounded-full" />
          <span>LGPD Compliant</span>
        </div>
      </div>
    </div>
  );
}
