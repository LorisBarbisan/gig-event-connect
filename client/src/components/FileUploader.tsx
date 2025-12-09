import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, X, FileIcon, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiRequest } from "@/lib/queryClient";

interface FileUploaderProps {
  onUploadComplete: (
    filePath: string,
    fileName: string,
    fileSize: number,
    fileType: string
  ) => void;
  onUploadError: (error: string) => void;
  maxFileSize?: number;
  allowedTypes?: string[];
  disabled?: boolean;
}

export function FileUploader({
  onUploadComplete,
  onUploadError,
  maxFileSize = 5 * 1024 * 1024, // 5MB default
  allowedTypes = [".pdf", ".jpg", ".jpeg", ".png", ".docx"],
  disabled = false,
}: FileUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxFileSize) {
      return `File size must be less than ${Math.round(maxFileSize / 1024 / 1024)}MB`;
    }

    // Check file type
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
    if (!allowedTypes.some(type => type.toLowerCase() === fileExtension)) {
      return `File type not allowed. Allowed types: ${allowedTypes.join(", ")}`;
    }

    return null;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // Get upload URL from backend
      const { uploadURL } = await apiRequest("/api/objects/upload", {
        method: "POST",
      });

      // Upload file to object storage
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", event => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded * 100) / event.total);
          setUploadProgress(progress);
        }
      });

      xhr.addEventListener("load", async () => {
        if (xhr.status === 200) {
          try {
            // Set ACL policy and get normalized path
            const { objectPath } = await apiRequest("/api/attachments/create", {
              method: "POST",
              body: JSON.stringify({
                uploadURL: uploadURL,
                originalFilename: selectedFile.name,
                fileType: selectedFile.type,
                fileSize: selectedFile.size,
              }),
            });

            onUploadComplete(objectPath, selectedFile.name, selectedFile.size, selectedFile.type);
            setSelectedFile(null);
            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }
          } catch (error) {
            console.error("Error creating attachment:", error);
            onUploadError("Failed to process uploaded file");
          }
        } else {
          onUploadError("Upload failed");
        }
        setUploading(false);
      });

      xhr.addEventListener("error", () => {
        onUploadError("Upload failed");
        setUploading(false);
      });

      xhr.open("PUT", uploadURL);
      xhr.setRequestHeader("Content-Type", selectedFile.type);
      xhr.send(selectedFile);
    } catch (error) {
      console.error("Upload error:", error);
      onUploadError("Failed to start upload");
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          accept={allowedTypes.join(",")}
          className="hidden"
          disabled={disabled || uploading}
        />

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploading}
          data-testid="button-attach-file"
        >
          <Upload className="h-4 w-4 mr-2" />
          Attach File
        </Button>

        {selectedFile && !uploading && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <FileIcon className="h-4 w-4" />
              <span className="truncate max-w-[150px]">{selectedFile.name}</span>
              <span>({Math.round(selectedFile.size / 1024)}KB)</span>
            </div>

            <Button type="button" size="sm" onClick={handleUpload} data-testid="button-upload-file">
              Upload
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              data-testid="button-cancel-upload"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {uploading && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Uploading {selectedFile?.name}...</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="w-full" />
        </div>
      )}
    </div>
  );
}
