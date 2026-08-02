import React, { useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosinstance";
import { useUser } from "@/lib/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";

export default function DownloadsContent() {
  const [downloads, setDownloads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    const fetchDownloads = async () => {
      if (!user?._id) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await axiosInstance.get(`/downloads/user-downloads/${user._id}`);
        setDownloads(data || []);
      } catch (error) {
        console.error("Error fetching downloads:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDownloads();
  }, [user?._id]);

  const backendBaseUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || "https://youtube-07v0.onrender.com";

  // 🚀 Helper function to get correct video source URL
  const getVideoSrc = (video: any) => {
    const filepath = video?.filepath || video?.videoPath || video?.url;
    if (!filepath) return `${backendBaseUrl}/video/vdo.mp4`;
    if (filepath.startsWith("http")) return filepath;
    const filename = filepath.split(/[\\/]/).pop();
    return `${backendBaseUrl}/uploads/${encodeURIComponent(filename || "")}`;
  };

  if (loading) {
    return <div className="text-center py-10 text-gray-500">Loading your downloaded videos...</div>;
  }

  if (!user) {
    return <div className="text-center py-10 text-gray-600">Please log in to view your downloaded videos.</div>;
  }

  return (
    <div>
      {downloads.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-500 text-sm">No downloaded videos yet. Download videos from the watch page to see them here!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {downloads.map((item) => {
            const video = item.videoId;
            if (!video) return null;

            // Check all possible thumbnail property names from backend
            const thumbnailUrl = 
              video.thumbnail || 
              video.videoThumbnail || 
              video.poster || 
              video.image;

            return (
              <div 
                key={item._id} 
                onClick={() => router.push(`/watch/${video._id}`)}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm p-4 flex flex-col justify-between hover:shadow-md transition-shadow cursor-pointer group"
              >
                <div>
                  <div className="w-full aspect-video bg-gray-900 rounded-lg mb-3 overflow-hidden flex items-center justify-center relative">
                    {thumbnailUrl ? (
                      <img 
                        src={thumbnailUrl} 
                        alt={video.videotitle || "Video thumbnail"} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      // 🚀 Fallback: Agar thumbnail nahi hai toh video ka pehla frame dikhane ke liye video tag use karein
                      <video
                        src={getVideoSrc(video)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        preload="metadata"
                      />
                    )}
                  </div>

                  <h3 className="font-semibold text-base text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {video.videotitle || video.title || "Untitled Video"}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">Channel: {video.videochanel || video.channel || "Unknown"}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400">
                  <span className="font-medium bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {item.planAtDownload} Plan
                  </span>
                  <span>
                    {item.downloadDate ? formatDistanceToNow(new Date(item.downloadDate)) + " ago" : "Recently"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}