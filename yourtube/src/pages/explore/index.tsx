import React, { useEffect, useState } from "react";
import axios from "axios";
import CategoryChips from "@/components/CategoryChips";
import TrendingVideoRow from "@/components/TrendingVideoRow";

export default function ExplorePage() {
  const [videos, setVideos] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  
  // Production-ready fallback URL
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://youtube-07v0.onrender.com";

  useEffect(() => {
    axios
      .get(`${backendUrl}/video/getall`)
      .then((res) => {
        setVideos(res.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [backendUrl]);

  // Filter videos based on active category selection
  const filteredVideos = activeCategory === "All" 
    ? videos 
    : videos.filter((v: any) => 
        v.category?.toLowerCase() === activeCategory.toLowerCase() ||
        v.tags?.some((tag: string) => tag.toLowerCase().includes(activeCategory.toLowerCase()))
      );

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 text-black bg-white min-h-screen">
      <CategoryChips activeCategory={activeCategory} setActiveCategory={setActiveCategory} />
      
      <div className="space-y-4 pt-2">
        <h2 className="text-xl font-bold tracking-tight px-2">Trending Content ({activeCategory})</h2>
        {loading ? (
          <p className="text-sm text-gray-400 px-2 animate-pulse">Loading trending feed updates...</p>
        ) : filteredVideos.length === 0 ? (
          <p className="text-sm text-gray-500 px-2">No videos found for {activeCategory}.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredVideos.map((v: any) => (
              <TrendingVideoRow key={v._id} video={v} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}