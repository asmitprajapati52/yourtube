"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { MoreVertical, X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import axiosInstance from "@/lib/axiosinstance";
import { useUser } from "@/lib/AuthContext";

export default function HistoryContent() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      loadHistory();
    } else {
      setLoading(true);
    }
  }, [user]);

  const loadHistory = async () => {
    if (!user) return;

    try {
      const historyData = await axiosInstance.get(`/history/${user?._id}`);
      // 🚀 SAFETY FIX: Sirf wahi history items rakho jinka videoid exist karta ho!
      const validHistory = (historyData.data || []).filter(
        (item: any) => item && item.videoid != null
      );
      setHistory(validHistory);
    } catch (error) {
      console.error("Error loading history:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-white p-6">Loading history...</div>;
  }

  const handleRemoveFromHistory = async (historyId: string) => {
    try {
      console.log("Removing from history:", historyId);
      setHistory(history.filter((item) => item._id !== historyId));
    } catch (error) {
      console.error("Error removing from history:", error);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <Clock className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold mb-2">
          Keep track of what you watch
        </h2>
        <p className="text-gray-600">
          Watch history isn't viewable when signed out.
        </p>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold mb-2">No watch history yet</h2>
        <p className="text-gray-600">Videos you watch will appear here.</p>
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
        <p className="text-sm text-gray-600">{history.length} videos</p>
      </div>

      <div className="space-y-4">
        {history.map((item) => {
          // Extra safety check per iteration
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
                  Added {item.createdAt ? formatDistanceToNow(new Date(item.createdAt)) : ""} ago
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
                    onClick={() => handleRemoveFromHistory(item._id)}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Remove from watch history
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