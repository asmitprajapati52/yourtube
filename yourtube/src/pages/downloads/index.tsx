import DownloadsContent from "@/components/DownloadsContent";
import React, { Suspense } from "react";

const DownloadsPage = () => {
  return (
    <main className="flex-1 p-6">
      <div className="max-w-6xl">
        <h1 className="text-2xl font-bold mb-6">Downloaded Videos</h1>
        <Suspense fallback={<div>Loading...</div>}>
          <DownloadsContent />
        </Suspense>
      </div>
    </main>
  );
};

export default DownloadsPage;