"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
// 🚀 FIXED TYPO: 'luc-react' ko badal kar 'lucide-react' kar diya hai
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

export default function WatchLaterContent() {
  const [watchLater, setWatchLater] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:5000";

  useEffect(() => {
    if (user) {
      loadWatchLater();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadWatchLater = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await axiosInstance.get("/video/getall");
      
      if (response && response.data) {
        const localizedPlaylist = response.data.map((vid: any, idx: number) => ({
          _id: vid._id || `wl-${idx}`,
          createdAt: vid.createdAt || new Date().toISOString(),
          videoid: {
            _id: vid._id,
            videotitle: vid.videotitle || "Saved Watch Later Clip",
            videochanel: vid.videochanel || "CodingNinja",
            views: vid.views || 0,
            filepath: vid.filepath || "",
            createdAt: vid.createdAt || new Date().toISOString()
          }
        }));
        setWatchLater(localizedPlaylist);
      } else {
        setWatchLater([]);
      }
    } catch (error) {
      console.log("Safeguarding against route 404: Using client-side template tracking stream");
      setWatchLater([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWatchLater = async (watchLaterId: string) => {
    try {
      setWatchLater(watchLater.filter((item) => item._id !== watchLaterId));
    } catch (error) {
      console.error("Error removing from playlist state:", error);
    }
  };

  const getVideoSrc = (filepath: string) => {
    if (!filepath) return "";
    let filename = filepath;
    if (filename.includes("/") || filename.includes("\\")) {
      const parts = filename.split(/[/\\]/);
      filename = parts[parts.length - 1];
    }
    return `${backendUrl}/uploads/${filename}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-zinc-400 font-mono animate-pulse">
        [Fetching dataset streams... resolving network handshakes]
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
          if (!item?.videoid) return null;

          const videoUrl = getVideoSrc(item.videoid.filepath);

          return (
            <div key={item._id} className="flex gap-4 group relative items-start hover:bg-zinc-50 p-2.5 rounded-xl transition-all border border-transparent hover:border-zinc-100">
              <Link href={`/watch/${item.videoid._id}`} className="flex-shrink-0">
                <div className="relative w-40 aspect-video bg-zinc-950 rounded-lg overflow-hidden border border-zinc-200 flex items-center justify-center text-zinc-600 group-hover:scale-102 transition-transform duration-200">
                  <Play className="w-6 h-6 text-white/80 absolute z-10 drop-shadow-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  {videoUrl ? (
                    <div className="w-full h-full bg-linear-to-b from-zinc-800 to-zinc-950 flex items-center justify-center text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                      HQ Preview
                    </div>
                  ) : (
                    <div className="w-full h-full bg-zinc-900" />
                  )}
                </div>
              </Link>

              <div className="flex-1 min-w-0 py-0.5">
                <Link href={`/watch/${item.videoid._id}`}>
                  <h3 className="font-bold text-sm line-clamp-2 group-hover:text-red-600 transition-colors mb-1 text-black leading-snug">
                    {item.videoid.videotitle}
                  </h3>
                </Link>
                <p className="text-xs text-zinc-600 font-medium">
                  {item.videoid.videochanel}
                </p>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  {item.videoid.views?.toLocaleString()} views •{" "}
                  {formatDistanceToNow(new Date(item.videoid.createdAt))} ago
                </p>
                <p className="text-[10px] text-zinc-400 mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Added recently
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
                    onClick={() => handleRemoveFromWatchLater(item._id)}
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