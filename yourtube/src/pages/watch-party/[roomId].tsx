import WatchPartyContent from "@/components/WatchPartyContent";
import { Suspense } from "react";

export default function WatchPartyPage() {
  return (
    <main className="flex-1 bg-black text-white min-h-screen">
      <Suspense fallback={<div className="flex justify-center items-center h-screen">Loading watch party room...</div>}>
        <WatchPartyContent />
      </Suspense>
    </main>
  );
}