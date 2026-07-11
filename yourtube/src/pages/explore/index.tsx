import React, { useEffect, useState } from "react";
import axios from "axios";
import CategoryChips from "@/components/CategoryChips";
import TrendingVideoRow from "@/components/TrendingVideoRow";

export default function ExplorePage() {
  const [videos, setVideos] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

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

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 text-black bg-white min-h-screen">
      <CategoryChips activeCategory={activeCategory} setActiveCategory={setActiveCategory} />
      
      <div className="space-y-4 pt-2">
        <h2 className="text-xl font-bold tracking-tight px-2">Trending Content ({activeCategory})</h2>
        {loading ? (
          <p className="text-sm text-gray-400 px-2 animate-pulse">Loading trending feed updates...</p>
        ) : (
          <div className="flex flex-col gap-4">
            {videos.map((v: any) => (
              <TrendingVideoRow key={v._id} video={v} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}