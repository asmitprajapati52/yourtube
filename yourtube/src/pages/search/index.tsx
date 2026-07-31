import SearchResult from "@/components/SearchResult";
import { useRouter } from "next/router";
import React, { Suspense } from "react";

const index = () => {
  const router = useRouter();
  const { q } = router.query;
  return (
    <div className="flex-1 p-4 md:p-6 lg:p-8 w-full min-w-0">
      <div className="max-w-6xl lg:max-w-7xl xl:max-w-[1600px] 2xl:max-w-[1920px] mx-auto w-full">
        {q && (
          <div className="mb-6">
            <h1 className="text-xl font-medium mb-4">
              Search results for "{q}"
            </h1>
          </div>
        )}
        <Suspense fallback={<div>Loading search results...</div>}>
          <SearchResult query={q || ""} />
        </Suspense>
      </div>
    </div>
  );
};

export default index;