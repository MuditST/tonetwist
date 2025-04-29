"use client";

import { useState, useCallback, useEffect } from "react";
import { Upload, FileAudio, X } from "lucide-react";
import { FileRejection, useDropzone } from "react-dropzone";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface AudioUploaderProps {
  onFileSelect: (file: File | null) => void;
  currentFile: File | null;
  disabled?: boolean;
}

export function AudioUploader({
  onFileSelect,
  currentFile,
  disabled = false,
}: AudioUploaderProps) {
  const [file, setFile] = useState<File | null>(currentFile);

  useEffect(() => {
    setFile(currentFile);
  }, [currentFile]);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      if (rejectedFiles && rejectedFiles.length > 0) {
        console.error("File rejected:", rejectedFiles);
        toast.error("File Upload Error", {
          description:
            rejectedFiles[0].errors[0]?.message || "Invalid file type or size.",
        });
        return;
      }

      if (acceptedFiles && acceptedFiles[0]) {
        const selectedFile = acceptedFiles[0];
        setFile(selectedFile);
        onFileSelect(selectedFile);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "audio/mpeg": [".mp3"],
      "audio/wav": [".wav"],
      "audio/mp4": [".m4a"],
      "audio/ogg": [".ogg"],
      "audio/webm": [".webm"],
    },
    maxSize: 25 * 1024 * 1024,
    multiple: false,
    disabled: disabled,
  });

  const handleRemoveFile = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setFile(null);
    onFileSelect(null);
  };

  return (
    <div
      {...getRootProps()}
      className={`cursor-pointer  ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      <input {...getInputProps()} id="audio-upload" disabled={disabled} />
      <Card
        className={`border-dashed bg-accent/20 ${
          isDragActive ? "border-primary" : ""
        } ${disabled ? "bg-muted/30" : ""}`}
      >
        <CardContent className="flex flex-col items-center justify-center p-6 h-[180px]">
          {file ? (
            <div className="flex flex-col items-center text-center">
              <FileAudio size={40} className="text-primary mb-3" />
              <p className="font-medium break-all">{file.name}</p>
              <p className="text-sm text-muted-foreground">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveFile}
                className="mt-3 h-8 px-2"
                disabled={disabled}
              >
                <X size={16} className="mr-1" /> Remove
              </Button>
            </div>
          ) : (
            <>
              <Upload
                size={40}
                className={`${
                  isDragActive ? "text-primary" : "text-muted-foreground"
                } mb-3`}
              />
              <p className="font-medium text-center mb-2">
                {isDragActive
                  ? "Drop your audio file here"
                  : "Drag & drop audio file"}
              </p>
              <p className="text-sm text-muted-foreground text-center mb-3">
                or click to browse
              </p>
              <p className="mt-3 text-xs text-muted-foreground text-center">
                MP3, WAV, M4A, OGG, WEBM up to 25MB and 60 seconds
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
