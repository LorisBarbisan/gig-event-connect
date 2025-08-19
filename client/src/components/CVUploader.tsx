import { useState } from "react";
import Uppy from "@uppy/core";
import { DashboardModal } from "@uppy/react";
import "@uppy/core/dist/style.min.css";
import "@uppy/dashboard/dist/style.min.css";
import AwsS3 from "@uppy/aws-s3";
import type { UploadResult } from "@uppy/core";
import { Button } from "@/components/ui/button";
import { FileText, Upload, Download, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface CVUploaderProps {
  userId: number;
  currentCV?: {
    fileName?: string;
    fileType?: string;
    fileSize?: number;
    fileUrl?: string;
  };
  onUploadComplete?: () => void;
}

export function CVUploader({ userId, currentCV, onUploadComplete }: CVUploaderProps) {
  const [showModal, setShowModal] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [uppy] = useState(() =>
    new Uppy({
      restrictions: {
        maxNumberOfFiles: 1,
        maxFileSize: 10485760, // 10MB
        allowedFileTypes: [
          '.pdf',
          '.doc',
          '.docx',
          '.txt',
          '.rtf',
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain',
          'application/rtf'
        ],
      },
      autoProceed: false,
    })
      .use(AwsS3, {
        shouldUseMultipart: false,
        getUploadParameters: async () => {
          const response = await apiRequest("/api/cv/upload-url", {
            method: "POST",
          });
          return {
            method: "PUT" as const,
            url: response.uploadURL,
          };
        },
      })
      .on("complete", async (result) => {
        if (result.successful && result.successful.length > 0) {
          const uploadedFile = result.successful[0];
          const fileInfo = {
            fileName: uploadedFile.name,
            fileType: uploadedFile.type || 'application/octet-stream',
            fileSize: uploadedFile.size,
            fileUrl: uploadedFile.uploadURL,
          };

          try {
            await apiRequest("/api/cv", {
              method: "POST",
              body: JSON.stringify({
                ...fileInfo,
                userId,
              }),
            });
            
            toast({
              title: "CV Uploaded",
              description: "Your CV has been uploaded successfully.",
            });
            
            queryClient.invalidateQueries({ queryKey: ["/api/freelancer/profile"] });
            onUploadComplete?.();
            setShowModal(false);
          } catch (error) {
            console.error("Error saving CV:", error);
            toast({
              title: "Error",
              description: "Failed to save CV information.",
              variant: "destructive",
            });
          }
        }
      })
  );

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("/api/cv", {
        method: "DELETE",
        body: JSON.stringify({ userId }),
      });
    },
    onSuccess: () => {
      toast({
        title: "CV Deleted",
        description: "Your CV has been removed successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/freelancer/profile"] });
      onUploadComplete?.();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete CV.",
        variant: "destructive",
      });
    },
  });

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    return mb < 1 ? `${(bytes / 1024).toFixed(1)} KB` : `${mb.toFixed(1)} MB`;
  };

  const getFileTypeColor = (fileType?: string) => {
    if (fileType?.includes('pdf')) return 'bg-red-100 text-red-800';
    if (fileType?.includes('word') || fileType?.includes('doc')) return 'bg-blue-100 text-blue-800';
    if (fileType?.includes('text')) return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
  };

  if (currentCV?.fileName) {
    return (
      <Card className="border-2 border-dashed border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">{currentCV.fileName}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className={getFileTypeColor(currentCV.fileType)}>
                    {currentCV.fileType?.split('/')[1]?.toUpperCase() || 'FILE'}
                  </Badge>
                  {currentCV.fileSize && (
                    <span className="text-xs text-muted-foreground">
                      {formatFileSize(currentCV.fileSize)}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {currentCV.fileUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(currentCV.fileUrl, '_blank')}
                  data-testid="button-download-cv"
                >
                  <Download className="w-4 h-4 mr-1" />
                  View
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowModal(true)}
                data-testid="button-replace-cv"
              >
                <Upload className="w-4 h-4 mr-1" />
                Replace
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
                data-testid="button-delete-cv"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <Card className="border-2 border-dashed border-gray-200 hover:border-primary/50 transition-colors">
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-lg mb-2">Upload Your CV</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Share your CV with potential employers. Supported formats: PDF, Word, Text files (max 10MB)
              </p>
              <Button 
                onClick={() => setShowModal(true)}
                className="bg-primary hover:bg-primary-hover"
                data-testid="button-upload-cv"
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose File
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <DashboardModal
        uppy={uppy}
        open={showModal}
        onRequestClose={() => setShowModal(false)}
        proudlyDisplayPoweredByUppy={false}
      />
    </div>
  );
}