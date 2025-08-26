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
          // Main container for the dropzone
          container: {
            border: "2px dashed #d1d5db", // Light gray dashed border
            borderRadius: "0.5rem", // Rounded corners
            padding: "2rem", // Increase padding for more space (equivalent to py-8 px-8)
            backgroundColor: "transparent", // Make background transparent
            // Additional styles for when it's ready (e.g., hover state)
            // You can use a ut-ready: prefix here if needed, but it's typically for states defined in Uploadthing
          },
          // Styles for the "Choose File" button
          button: {
            backgroundColor: "#4f46e5", // A nice shade of indigo
            color: "white",
            padding: "0.75rem 1.5rem", // More padding for a larger button (py-3 px-6)
            borderRadius: "0.5rem", // Rounded corners for the button
            fontSize: "1rem", // Standard font size
            fontWeight: "600", // Semi-bold text
            "&:hover": {
              backgroundColor: "#4338ca", // Darker indigo on hover
            },
            // Uploadthing specific states
            "--ut-readying": {
              backgroundColor: "#9ca3af", // Gray for readying state
            },
            "--ut-uploading": {
              backgroundColor: "#3b82f6", // Blue for uploading state
            },
            // The `after` pseudo-element for the progress indicator
            "--ut-uploading-after": {
              backgroundColor: "#60a5fa", // Lighter blue for upload progress
            },
          },
          // Styles for the label text (e.g., "Drag & drop files here")
          label: {
            color: "#4b5563", // Darker gray for the label
            fontSize: "1.125rem", // Slightly larger font size
            fontWeight: "500",
          },
          // Styles for the allowed content text (e.g., "Max file size 4MB")
          allowedContent: {
            color: "#6b7280", // Medium gray for allowed content
            fontSize: "0.875rem", // Smaller font size
          },
        }}
        config={{
          mode: "auto",
        }}
      />
    </div>
  );
};
