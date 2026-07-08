import React, { useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar"; // Imported correctly now
import "@/styles/globals.css"; 
import type { AppProps } from "next/app";
import { UserProvider } from "@/lib/AuthContext"; 

export default function App({ Component, pageProps }: AppProps) {
  // 🚀 SIDEBAR INTEGRATION STATE WRITING: State trace hook for tracking layouts context
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <UserProvider> 
      <div className="min-h-screen bg-white text-black flex flex-col">
        
        {/* Header connected directly with the state mutation callback parameter */}
        <Header onMenuClick={() => setIsSidebarOpen((prev) => !prev)} />
        
        {/* Sidebar and content pipeline aligned on standard display inline grid layout */}
        <div className="flex flex-1 w-full relative">
          
          <Sidebar isOpen={isSidebarOpen} />
          
          <main className="flex-1 w-full bg-white overflow-x-hidden">
            <Component {...pageProps} />
          </main>
          
        </div>
      </div>
    </UserProvider>
  );
}