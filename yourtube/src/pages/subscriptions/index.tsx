import React, { useEffect, useState } from "react";
import axios from "axios";
import SubscribedChannelsBar from "@/components/SubscribedChannelsBar";
import SubscriptionDenseGrid from "@/components/SubscriptionDenseGrid";

export default function SubscriptionsPage() {
  const [videos, setVideos] = useState([]);
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
    <div className="p-6 max-w-7xl mx-auto text-black bg-white min-h-screen">
      <SubscribedChannelsBar />
      
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b pb-2 mb-4">
          <h2 className="text-xl font-bold tracking-tight">Latest Feed</h2>
        </div>
        
        {loading ? (
          <p className="text-sm text-gray-400 animate-pulse">Streaming subscription node layers...</p>
        ) : (
          <SubscriptionDenseGrid videos={videos} />
        )}
      </div>
    </div>
  );
}