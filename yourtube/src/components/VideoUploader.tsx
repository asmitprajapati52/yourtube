import { Check, FileVideo, Upload, X } from "lucide-react";
import React, { ChangeEvent, useRef, useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Progress } from "./ui/progress";
import axiosInstance from "@/lib/axiosinstance";

interface VideoUploaderProps {
  channelId?: string;
  channelName?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

const VideoUploader = ({ channelId, channelName, isOpen = true, onClose }: VideoUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoTitle, setVideoTitle] = useState("");
  const [uploadComplete, setUploadComplete] = useState(false);
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const handlefilechange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (!file.type.startsWith("video/")) {
        toast.error("Please upload a valid video file.");
        return;
      }
      if (file.size > 100 * 1024 * 1024) {
        toast.error("File size exceeds 100MB limit.");
        return;
      }
      setVideoFile(file);
      const filename = file.name;
      if (!videoTitle) {
        setVideoTitle(filename);
      }
    }
  };

  const handleCloseTrigger = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation(); // Stop routing and state bubbling triggers
    }
    setVideoFile(null);
    setVideoTitle("");
    setIsUploading(false);
    setUploadProgress(0);
    setUploadComplete(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (onClose) {
      onClose();
    }
  };

  const handleUpload = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Direct form submission isolation
    if (!videoFile || !videoTitle.trim()) {
      toast.error("Please provide file and title");
      return;
    }
    const formdata = new FormData();
    formdata.append("file", videoFile);
    formdata.append("videotitle", videoTitle);
    formdata.append("videochanel", channelName || "Anonymous Channel");
    formdata.append("uploader", channelId || "");

    try {
      setIsUploading(true);
      setUploadProgress(0);
      const res = await axiosInstance.post("/video/upload", formdata, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progresEvent: any) => {
          const progress = Math.round(
            (progresEvent.loaded * 100) / progresEvent.total
          );
          setUploadProgress(progress);
        },
      });
      toast.success("Upload successfully");
      handleCloseTrigger();
    } catch (error) {
      console.error("Error uploading video:", error);
      toast.error("There was an error uploading your video. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => {
        // 🚀 BACKDROP OVERLAY CLOSING: Bahar click karne par safe close hoga
        e.stopPropagation();
        if (!isUploading) {
          handleCloseTrigger(e);
        }
      }}
    >
      <div 
        className="bg-white text-black rounded-xl shadow-2xl border p-6 max-w-md w-full relative z-[10000]"
        onClick={(e) => {
          // 🚀 MODAL INSIDE ISOLATION: Modal ke andar click karne par overlay toggle handle nahi hoga
          e.stopPropagation();
        }}
      >
        
        {/* Close Button UI Node binding */}
        <button 
          onClick={(e) => handleCloseTrigger(e)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors bg-gray-100 hover:bg-gray-200 p-1.5 rounded-full z-10 cursor-pointer"
          type="button"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold mb-4 border-b pb-2 text-gray-900 select-none">Upload a video</h2>

        <div className="space-y-4">
          {!videoFile ? (
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 hover:border-red-500 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              <Upload className="w-12 h-12 mx-auto text-gray-400 mb-2" />
              <p className="text-base font-semibold text-gray-700">
                Drag and drop video files to upload
              </p>
              <p className="text-sm text-gray-400 mt-1">
                or click to select files
              </p>
              <p className="text-xs text-gray-400 mt-4">
                MP4, WebM, MOV or AVI • Up to 100MB
              </p>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="video/*"
                onChange={handlefilechange}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                <div className="bg-blue-100 p-2 rounded-md">
                  <FileVideo className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate text-gray-800">{videoFile.name}</p>
                  <p className="text-sm text-gray-500">
                    {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
                {!isUploading && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setVideoFile(null);
                      setVideoTitle("");
                    }}
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </Button>
                )}
                {uploadComplete && (
                  <div className="bg-green-100 p-1 rounded-full">
                    <Check className="w-5 h-5 text-green-600" />
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="title" className="text-gray-700 font-medium">Title (required)</Label>
                  <Input
                    id="title"
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                    placeholder="Add a title that describes your video"
                    disabled={isUploading || uploadComplete}
                    className="mt-1 text-black bg-white"
                  />
                </div>
              </div>

              {isUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium text-gray-700">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                {!uploadComplete && (
                  <>
                    <Button 
                      variant="outline" 
                      onClick={(e) => handleCloseTrigger(e)} 
                      disabled={isUploading}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="bg-red-600 hover:bg-red-700 text-white"
                      onClick={(e) => handleUpload(e)}
                      disabled={isUploading || !videoTitle.trim()}
                    >
                      {isUploading ? "Uploading..." : "Upload"}
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoUploader;