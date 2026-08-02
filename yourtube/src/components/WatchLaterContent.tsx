"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { MoreVertical, X, Clock, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import axiosInstance from "@/lib/axiosinstance";
import { useUser } from "@/lib/AuthContext";

type WatchLaterItem = {
  _id: string;
  createdAt?: string;
  videoid?: {
    _id?: string;
    videotitle?: string;
    title?: string;
    thumbnail?: string;
    videoThumbnail?: string;
    poster?: string;
    videochanel?: string;
    channel?: string;
    views?: number;
    createdAt?: string;
    filepath?: string;
    videoPath?: string;
  };
};

export default function WatchLaterContent() {
  const [watchLater, setWatchLater] = useState<WatchLaterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://youtube-07v0.onrender.com";

  useEffect(() => {
    if (user?._id) {
      loadWatchLater();
    } else {
      setLoading(false);
    }
  }, [user?._id]);

  const loadWatchLater = async () => {
    if (!user?._id) return;

    try {
      setLoading(true);
      const response = await axiosInstance.get(`/watchlater/user/${user._id}`);
      setWatchLater(response.data || []);
    } catch (error) {
      console.error("Error loading watch later videos:", error);
      setWatchLater([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWatchLater = async (videoId?: string, watchLaterRecordId?: string) => {
    try {
      if (!user?._id || !videoId || !watchLaterRecordId) return;
      await axiosInstance.post(`/watchlater/video/${videoId}`, { userId: user._id });
      setWatchLater((prev) => prev.filter((item) => item._id !== watchLaterRecordId));
    } catch (error) {
      console.error("Error removing from watch later:", error);
    }
  };

  const getVideoSrc = (video: any) => {
    const filepath = video?.filepath || video?.videoPath;
    if (!filepath) return `${backendUrl}/video/vdo.mp4`;
    if (filepath.startsWith("http")) return filepath;
    const filename = filepath.split(/[\\/]/).pop();
    return `${backendUrl}/uploads/${encodeURIComponent(filename || "")}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-zinc-400 font-mono animate-pulse">
        Loading watch later videos...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12 select-none">
        <Clock className="w-16 h-16 mx-auto text-zinc-300 mb-4" />
        <h2 className="text-xl font-bold mb-2 text-black">Save videos for later</h2>
        <p className="text-zinc-500 text-sm max-w-xs mx-auto">
          Sign in to access your Watch later playlist.
        </p>
      </div>
    );
  }

  if (watchLater.length === 0) {
    return (
      <div className="text-center py-12 select-none">
        <Clock className="w-16 h-16 mx-auto text-zinc-300 mb-4" />
        <h2 className="text-xl font-bold mb-2 text-black">No videos saved</h2>
        <p className="text-zinc-500 text-sm max-w-xs mx-auto">
          Videos you save for later will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 text-black bg-white select-none">
      <div className="flex justify-between items-center border-b pb-3">
        <p className="text-sm text-zinc-600 font-semibold">{watchLater.length} videos available</p>
        <Button className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white rounded-full px-5 text-xs font-bold shadow-xs cursor-pointer border-none">
          <Play className="w-3.5 h-3.5 fill-white" />
          Play all
        </Button>
      </div>

      <div className="space-y-4 pt-2">
        {watchLater.map((item) => {
          const video = item.videoid;
          if (!video) return null;

          const thumbnailUrl = video.thumbnail || video.videoThumbnail || video.poster;

          return (
            <div key={item._id} className="flex flex-col sm:flex-row gap-4 group relative items-start hover:bg-zinc-50 p-2.5 rounded-xl transition-all border border-transparent hover:border-zinc-100">
              <Link href={`/watch/${video._id}`} className="shrink-0 w-full sm:w-auto">
                <div className="relative w-full sm:w-40 aspect-video bg-zinc-900 rounded-lg overflow-hidden border border-zinc-200 flex items-center justify-center">
                  <Play className="w-6 h-6 text-white/80 absolute z-10 drop-shadow-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  {thumbnailUrl ? (
                    <img 
                      src={thumbnailUrl} 
                      alt={video.videotitle || "Video thumbnail"} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  ) : (
                    <video
                      src={getVideoSrc(video)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      preload="metadata"
                    />
                  )}
                </div>
              </Link>

              <div className="flex-1 min-w-0 py-0.5">
                <Link href={`/watch/${video._id}`}>
                  <h3 className="font-bold text-sm line-clamp-2 group-hover:text-red-600 transition-colors mb-1 text-black leading-snug">
                    {video.videotitle || video.title}
                  </h3>
                </Link>
                <p className="text-xs text-zinc-600 font-medium">
                  {video.videochanel || video.channel || "Unknown"}
                </p>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  {(video.views || 0).toLocaleString()} views •{" "}
                  {video.createdAt ? formatDistanceToNow(new Date(video.createdAt)) : ""} ago
                </p>
                <p className="text-[10px] text-zinc-400 mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Added {item.createdAt ? formatDistanceToNow(new Date(item.createdAt)) : "recently"} ago
                </p>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 rounded-full cursor-pointer hover:bg-zinc-200"
                  >
                    <MoreVertical className="w-4 h-4 text-zinc-600" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white text-black border shadow-md">
                  <DropdownMenuItem
                    onClick={() => {
                      if (video?._id && item?._id) {
                        handleRemoveFromWatchLater(video._id, item._id);
                      }
                    }}
                    className="cursor-pointer text-red-600 font-semibold focus:text-red-700 focus:bg-red-50 flex items-center text-xs"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Remove from Watch later
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        })}
      </div>
    </div>
  );
}