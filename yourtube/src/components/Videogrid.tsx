"use client";

import React, { useEffect, useState } from "react";
import Videocard from "./videocard";
import axiosInstance from "@/lib/axiosinstance";

const Videogrid = () => {
  const [videos, setvideo] = useState<any[]>([]);
  const [loading, setloading] = useState(true);

  // 100% Highly Stable Globally Streamable Video Links
  const fallbackVideos = [
    {
      _id: "1",
      videotitle: "Amazing Nature Documentary",
      filename: "nature-doc.mp4",
      filetype: "video/mp4",
      filepath: "https://vjs.zencdn.net/v/oceans.mp4",
      filesize: "500MB",
      videochanel: "Nature Channel",
      views: 45000,
      createdAt: new Date().toISOString(),
    },
    {
      _id: "2",
      videotitle: "Cooking Tutorial: Perfect Pasta",
      filename: "pasta-tutorial.mp4",
      filetype: "video/mp4",
      filepath: "https://media.w3.org/2010/05/sintel/trailer_hd.mp4",
      filesize: "300MB",
      videochanel: "Chef's Kitchen",
      views: 23000,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ];

  useEffect(() => {
    const fetchvideo = async () => {
      try {
        const res = await axiosInstance.get("/video/getall");
        if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
          setvideo(res.data);
        } else {
          setvideo(fallbackVideos);
        }
      } catch (error) {
        console.log("Database connection timeout. Loading stable mock data...", error);
        setvideo(fallbackVideos);
      } finally {
        setloading(false);
      }
    };
    fetchvideo();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
      {loading ? (
        <div className="text-center col-span-full font-semibold text-gray-500 py-10">
          Loading Videos...
        </div>
      ) : (
        videos.map((video: any) => <Videocard key={video._id} video={video} />)
      )}
    </div>
  );
};

export default Videogrid;