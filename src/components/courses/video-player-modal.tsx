"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ReactPlayer from "react-player";
import { X, Play, Volume2, Maximize } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  videoUrl: string;
}

export const VideoPlayerModal = ({
  isOpen,
  onClose,
  title,
  videoUrl,
}: VideoPlayerModalProps) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-transparent border-0 shadow-none">
        <div className="relative bg-gradient-to-br from-slate-900 to-gray-900 rounded-xl overflow-hidden shadow-2xl">
          {/* Header */}
          <DialogHeader className="flex flex-row items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-700/80 to-purple-700/80">
            <DialogTitle className="text-white text-lg font-semibold truncate max-w-md">
              {title}
            </DialogTitle>
          </DialogHeader>

          {/* Video Player */}
          <div className="relative aspect-video bg-black">
            {isOpen && (
              <ReactPlayer
                src={videoUrl}
                width="100%"
                height="100%"
                controls={true}
                playing={true}
                playIcon={
                  <div className="flex items-center justify-center w-20 h-20 bg-white/90 rounded-full hover:bg-white hover:scale-110 transition-transform">
                    <Play className="h-10 w-10 text-blue-600 fill-current ml-1" />
                  </div>
                }
                light={false}
                config={{
                  file: {
                    attributes: {
                      controlsList: "nodownload",
                    },
                  },
                }}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
