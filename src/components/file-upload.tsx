"use client";

import { UploadDropzone } from "@/lib/uploadthing";
import { toast } from "sonner";

interface FileUploadProps {
  onChange: (url?: string) => void;
  endpoint: string;
}

export const FileUpload = ({ onChange, endpoint }: FileUploadProps) => {
  return (
    <div className="relative">
      <UploadDropzone
        endpoint={endpoint}
        onClientUploadComplete={(res) => {
          onChange(res?.[0]?.url);
        }}
        onUploadError={(error: Error) => {
          toast.error(error?.message || "File upload failed");
        }}
        appearance={{
          container: {
            border: "2px dashed #d1d5db",
            borderRadius: "0.5rem",
            padding: "2rem",
            backgroundColor: "transparent",
          },
          button: {
            backgroundColor: "#4f46e5",
            color: "white",
            padding: "0.75rem 1.5rem",
            borderRadius: "0.5rem",
            fontSize: "1rem",
            fontWeight: "600",
            "&:hover": {
              backgroundColor: "#4338ca",
            },
            "--ut-readying": {
              backgroundColor: "#9ca3af",
            },
            "--ut-uploading": {
              backgroundColor: "#3b82f6",
            },
            "--ut-uploading-after": {
              backgroundColor: "#60a5fa",
            },
          },
          label: {
            color: "#4b5563",
            fontSize: "1.125rem",
            fontWeight: "500",
          },
          allowedContent: {
            color: "#6b7280",
            fontSize: "0.875rem",
          },
        }}
        config={{
          mode: "auto",
        }}
      />
    </div>
  );
};
