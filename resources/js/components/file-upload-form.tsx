import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Upload, X, FileIcon, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface FileUploadFormProps {
  categoryId: number;
  onSuccess?: () => void;
}

export function FileUploadForm({ categoryId, onSuccess }: FileUploadFormProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string>('');

  const { data, setData, post, processing, errors, reset } = useForm({
    files: [] as File[],
    category_id: categoryId,
  });

  const validateFile = (file: File): string | null => {
    const maxSize = 20 * 1024 * 1024; // 20MB

    if (file.size > maxSize) {
      return `File ${file.name} terlalu besar. Maksimal 20MB.`;
    }

    return null;
  };

  const handleFilesSelect = (fileList: FileList | File[]) => {
    const files = Array.from(fileList);
    const validFiles: File[] = [];
    let errorMessage = '';

    for (const file of files) {
      const error = validateFile(file);
      if (error) {
        errorMessage = error;
        break;
      }
      validFiles.push(file);
    }

    if (errorMessage) {
      setFileError(errorMessage);
      return;
    }

    // Add new files to existing ones
    const newFiles = [...selectedFiles, ...validFiles];
    setSelectedFiles(newFiles);
    setData('files', newFiles);
    setFileError('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFilesSelect(e.target.files);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedFiles.length === 0) {
      setFileError('Silakan pilih file untuk diupload');
      return;
    }

    post('/files', {
      onSuccess: () => {
        reset();
        setSelectedFiles([]);
        setFileError('');
        toast.success('File berhasil diupload!', {
          description: `${selectedFiles.length} file telah berhasil diupload.`
        });
        onSuccess?.();
      },
      onError: (errors) => {
        if (errors.files) {
          const errorMessage = Array.isArray(errors.files) ? errors.files[0] : errors.files;
          setFileError(errorMessage);
          toast.error('Upload file gagal!', {
            description: errorMessage
          });
        } else {
          toast.error('Upload file gagal!', {
            description: 'Terjadi kesalahan saat mengupload file.'
          });
        }
      }
    });
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    setData('files', newFiles);
    if (newFiles.length === 0) {
      setFileError('');
    }
  };

  const removeAllFiles = () => {
    setSelectedFiles([]);
    setData('files', []);
    setFileError('');
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* File Input */}
      <div className="space-y-2">
        <Label htmlFor="file-upload">Pilih File</Label>
        <Input
          id="file-upload"
          type="file"
          onChange={handleInputChange}
          accept="*/*"
          multiple
          className="cursor-pointer"
        />
      </div>

      {/* Selected Files Display */}
      {selectedFiles.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-medium text-sm">
              {selectedFiles.length} file terpilih
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={removeAllFiles}
              className="text-destructive hover:text-destructive"
            >
              <X className="h-4 w-4 mr-1" />
              Hapus Semua
            </Button>
          </div>

          <ScrollArea className="h-[300px] w-full">
            <div className="space-y-2 pr-4">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileIcon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Error Messages */}
      {(fileError || errors.files) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {fileError || errors.files}
          </AlertDescription>
        </Alert>
      )}

      {errors.category_id && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {errors.category_id}
          </AlertDescription>
        </Alert>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={processing || selectedFiles.length === 0}
        className="w-full"
      >
        {processing ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
            Mengupload...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4 mr-2" />
            Upload {selectedFiles.length > 0 ? `${selectedFiles.length} File` : 'File'}
          </>
        )}
      </Button>
    </form>
  );
}