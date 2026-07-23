import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  Clock,
  Download,
  MoreHorizontal,
  Share,
  ThumbsDown,
  ThumbsUp,
  Check,
  Users,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useUser } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";
import { recordDownload } from "@/services/api";
import { useRouter } from "next/router";

interface VideoInfoProps {
  video: {
    _id: string;
    videotitle: string;
    videochanel: string;
    Like?: number;
    Dislike?: number;
    views?: number;
    createdAt?: string;
    description?: string;
    filePath?: string;
    videoUrl?: string;
  };
}

const VideoInfo = ({ video }: VideoInfoProps) => {
  const router = useRouter();
  const [likes, setlikes] = useState(video?.Like || 0);
  const [dislikes, setDislikes] = useState(video?.Dislike || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const { user } = useUser();
  const [isWatchLater, setIsWatchLater] = useState(false);
  
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    setlikes(video?.Like || 0);
    setDislikes(video?.Dislike || 0);
    setIsLiked(false);
    setIsDisliked(false);
  }, [video]);

  useEffect(() => {
    const checkIfDownloaded = async () => {
      if (!user?._id || !video?._id) return;
      try {
        const { data } = await axiosInstance.get(`/downloads/user-downloads/${user._id}`);
        const alreadyDownloaded = data.some(
          (item: any) => item.videoId?._id === video._id || item.videoId === video._id
        );
        setIsDownloaded(alreadyDownloaded);
      } catch (error) {
        console.error("Error checking download status:", error);
      }
    };

    checkIfDownloaded();
  }, [user?._id, video?._id]);

  useEffect(() => {
    const handleviews = async () => {
      if (!video?._id) return;
      if (user) {
        try {
          return await axiosInstance.post(`/history/${video._id}`, {
            userId: user?._id,
          });
        } catch (error) {
          return console.log(error);
        }
      } else {
        try {
          return await axiosInstance.post(`/history/views/${video?._id}`);
        } catch (error) {
          console.log(error);
        }
      }
    };
    handleviews();
  }, [user, video?._id]);

  const handleLike = async () => {
    if (!user || !video?._id) return;
    try {
      const res = await axiosInstance.post(`/like/${video._id}`, {
        userId: user?._id,
      });
      if (res.data.liked) {
        if (isLiked) {
          setlikes((prev: any) => prev - 1);
          setIsLiked(false);
        } else {
          setlikes((prev: any) => prev + 1);
          setIsLiked(true);
          if (isDisliked) {
            setDislikes((prev: any) => prev - 1);
            setIsDisliked(false);
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleWatchLater = async () => {
    if (!user || !video?._id) return;
    try {
      const res = await axiosInstance.post(`/watch/${video._id}`, {
        userId: user?._id,
      });
      if (res.data.watchlater) {
        setIsWatchLater(!isWatchLater);
      } else {
        setIsWatchLater(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleDislike = async () => {
    if (!user || !video?._id) return;
    try {
      const res = await axiosInstance.post(`/like/${video._id}`, {
        userId: user?._id,
      });
      if (!res.data.liked) {
        if (isDisliked) {
          setDislikes((prev: any) => prev - 1);
          setIsDisliked(false);
        } else {
          setDislikes((prev: any) => prev + 1);
          setIsDisliked(true);
          if (isLiked) {
            setlikes((prev: any) => prev - 1);
            setIsLiked(false);
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleDownload = async () => {
    if (!user || !video?._id) {
      alert("Please log in to download videos!");
      return;
    }

    try {
      setDownloading(true);
      const response = await recordDownload(user._id, video._id);
      alert(`Success! ${response.data.message} (Remaining today: ${response.data.remainingDownloads})`);
      setIsDownloaded(true);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to download video";
      alert(errorMessage);
    } finally {
      setDownloading(false);
    }
  };

  // 🚀 Robust Watch Party Handler with Fallback File Support
  const handleStartWatchParty = () => {
    const randomRoomId = Math.random().toString(36).substring(2, 9);
    
    const videoPath = video?.filePath || video?.videoUrl || (video as any)?.filepath || (video as any)?.url || (video as any)?.filename || "";
    const normalizedPath = videoPath.replace(/\\/g, "/");
    let videoFileName = normalizedPath ? normalizedPath.split("/").pop() : "";

    // Agar path ya filename na mile toh default uploaded file use karein
    if (!videoFileName || videoFileName === "undefined") {
      videoFileName = "2026-07-07T20-09-27.786Z-vdo.mp4";
    }

    const fullVideoUrl = `http://localhost:5000/uploads/${encodeURIComponent(videoFileName)}`;

    router.push({
      pathname: `/watch-party/${randomRoomId}`,
      query: { videoUrl: fullVideoUrl }
    });
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-black">{video?.videotitle || "Untitled Video"}</h1>

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-gray-200 text-black">
              {video?.videochanel ? video.videochanel[0].toUpperCase() : "Y"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium text-black">{video?.videochanel || "Unknown Channel"}</h3>
            <p className="text-sm text-gray-600">1.2M subscribers</p>
          </div>
          <Button className="ml-4 bg-black hover:bg-zinc-800 text-white rounded-full">Subscribe</Button>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-gray-100 rounded-full">
            <Button
              variant="ghost"
              size="sm"
              className="rounded-l-full hover:bg-gray-200 text-black"
              onClick={handleLike}
            >
              <ThumbsUp
                className={`w-5 h-5 mr-2 ${
                  isLiked ? "fill-black text-black" : ""
                }`}
              />
              {likes.toLocaleString()}
            </Button>
            <div className="w-px h-6 bg-gray-300" />
            <Button
              variant="ghost"
              size="sm"
              className="rounded-r-full hover:bg-gray-200 text-black"
              onClick={handleDislike}
            >
              <ThumbsDown
                className={`w-5 h-5 mr-2 ${
                  isDisliked ? "fill-black text-black" : ""
                }`}
              />
              {dislikes.toLocaleString()}
            </Button>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className={`bg-gray-100 hover:bg-gray-200 rounded-full text-black ${
              isWatchLater ? "text-red-600 font-semibold" : ""
            }`}
            onClick={handleWatchLater}
          >
            <Clock className="w-5 h-5 mr-2" />
            {isWatchLater ? "Saved" : "Watch Later"}
          </Button>

          {/* 🚀 Watch Party Button */}
          <Button
            variant="ghost"
            size="sm"
            className="bg-gray-100 hover:bg-gray-200 rounded-full text-black"
            onClick={handleStartWatchParty}
          >
            <Users className="w-5 h-5 mr-2 text-blue-600" />
            Watch Party
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="bg-gray-100 hover:bg-gray-200 rounded-full text-black"
          >
            <Share className="w-5 h-5 mr-2" />
            Share
          </Button>
          
          {isDownloaded ? (
            <Button
              variant="ghost"
              size="sm"
              disabled
              className="bg-gray-100 rounded-full text-green-700 font-semibold cursor-default border border-gray-200"
            >
              <Check className="w-5 h-5 mr-2 text-green-600" />
              Downloaded
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="bg-gray-100 hover:bg-gray-200 rounded-full text-black"
              onClick={handleDownload}
              disabled={downloading}
            >
              <Download className="w-5 h-5 mr-2" />
              {downloading ? "Downloading..." : "Download"}
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="bg-gray-100 hover:bg-gray-200 rounded-full text-black"
          >
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="bg-gray-100 rounded-lg p-4">
        <div className="flex gap-4 text-sm font-medium mb-2 text-gray-700">
          <span>{video?.views?.toLocaleString() || 0} views</span>
          {video?.createdAt && (
            <span>
              {(() => {
                try {
                  return `${formatDistanceToNow(new Date(video.createdAt))} ago`;
                } catch (e) {
                  return "Recently";
                }
              })()}
            </span>
          )}
        </div>
        <div className={`text-sm text-gray-800 ${showFullDescription ? "" : "line-clamp-3"}`}>
          <p>
            {video?.description || "Sample video description. This would contain the actual video description from the database."}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="mt-2 p-0 h-auto font-medium text-black hover:bg-transparent"
          onClick={() => setShowFullDescription(!showFullDescription)}
        >
          {showFullDescription ? "Show less" : "Show more"}
        </Button>
      </div>
    </div>
  );
};

export default VideoInfo;