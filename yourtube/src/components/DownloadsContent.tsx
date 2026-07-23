import React, { useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosinstance";
import { useUser } from "@/lib/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation"; // 👈 Next.js router import karein

export default function DownloadsContent() {
  const [downloads, setDownloads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const router = useRouter(); // 👈 Router initialize karein

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

            return (
              <div 
                key={item._id} 
                onClick={() => router.push(`/watch/${video._id}`)} // 👈 Click karne par watch page par redirect karega
                className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm p-4 flex flex-col justify-between hover:shadow-md transition-shadow cursor-pointer group"
              >
                <div>
                  {/* Agar aapke paas thumbnail field hai toh yahan image dikha sakte hain */}
                  <div className="w-full aspect-video bg-gray-100 rounded-lg mb-3 overflow-hidden flex items-center justify-center">
                    {video.thumbnail || video.videoThumbnail ? (
                      <img 
                        src={video.thumbnail || video.videoThumbnail} 
                        alt={video.videotitle} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <span className="text-xs text-gray-400">No Thumbnail</span>
                    )}
                  </div>

                  <h3 className="font-semibold text-base text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {video.videotitle}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">Channel: {video.videochanel || "Unknown"}</p>
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