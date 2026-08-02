"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { MoreVertical, X, ThumbsUp, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUser } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";

export default function LikedVideosContent() {
  const [likedVideos, setLikedVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      loadLikedVideos();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadLikedVideos = async () => {
    if (!user) return;

    try {
      const likedData = await axiosInstance.get(`/like/${user?._id}`);
      // 🚀 SAFETY FIX: Sirf wahi liked items rakho jinka videoid exist karta ho!
      const validLikedVideos = (likedData.data || []).filter(
        (item: any) => item && item.videoid != null
      );
      setLikedVideos(validLikedVideos);
    } catch (error) {
      console.error("Error loading liked videos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlikeVideo = async (videoId: string, likedVideoId: string) => {
    if (!user) return;

    try {
      console.log("Unliking video:", videoId, "for user:", user._id);
      setLikedVideos(likedVideos.filter((item) => item._id !== likedVideoId));
    } catch (error) {
      console.error("Error unliking video:", error);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <ThumbsUp className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold mb-2">
          Keep track of videos you like
        </h2>
        <p className="text-gray-600">Sign in to see your liked videos.</p>
      </div>
    );
  }

  if (loading) {
    return <div className="text-white p-6">Loading liked videos...</div>;
  }

  if (likedVideos.length === 0) {
    return (
      <div className="text-center py-12">
        <ThumbsUp className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold mb-2">No liked videos yet</h2>
        <p className="text-gray-600">Videos you like will appear here.</p>
      </div>
    );
  }

  const backendBaseUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || "https://youtube-07v0.onrender.com";

  const getVideoSrc = (video: any) => {
    if (!video?.filepath) return `${backendBaseUrl}/video/vdo.mp4`;
    if (video.filepath.startsWith("http")) return video.filepath;
    const filename = video.filepath.split(/[\\/]/).pop();
    return `${backendBaseUrl}/uploads/${encodeURIComponent(filename || "")}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">{likedVideos.length} videos</p>
        <Button className="flex items-center gap-2">
          <Play className="w-4 h-4" />
          Play all
        </Button>
      </div>

      <div className="space-y-4">
        {likedVideos.map((item) => {
          if (!item?.videoid) return null;

          return (
            <div key={item._id} className="flex flex-col sm:flex-row gap-4 group">
              <Link href={`/watch/${item.videoid._id}`} className="shrink-0 w-full sm:w-auto">
                <div className="relative w-full sm:w-40 aspect-video bg-gray-100 rounded overflow-hidden">
                  <video
                    src={getVideoSrc(item.videoid)}
                    className="object-cover group-hover:scale-105 transition-transform duration-200 w-full h-full"
                  />
                </div>
              </Link>

              <div className="flex-1 min-w-0">
                <Link href={`/watch/${item.videoid._id}`}>
                  <h3 className="font-medium text-sm line-clamp-2 group-hover:text-blue-600 mb-1">
                    {item.videoid.videotitle || "Untitled Video"}
                  </h3>
                </Link>
                <p className="text-sm text-gray-600">
                  {item.videoid.videochanel || "Unknown Channel"}
                </p>
                <p className="text-sm text-gray-600">
                  {(item.videoid.views || 0).toLocaleString()} views •{" "}
                  {item.videoid.createdAt ? formatDistanceToNow(new Date(item.videoid.createdAt)) : ""} ago
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Liked {item.createdAt ? formatDistanceToNow(new Date(item.createdAt)) : ""} ago
                </p>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => handleUnlikeVideo(item.videoid._id, item._id)}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Remove from liked videos
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