import Header from "@/components/Header";
import "@/styles/globals.css"; // Sahi path yahan hai
import type { AppProps } from "next/app";
import { UserProvider } from "@/lib/AuthContext"; 

export default function App({ Component, pageProps }: AppProps) {
  return (
    <UserProvider> 
      <div className="min-h-screen bg-white text-black">
        <Header />
        <main className="w-full">
          <Component {...pageProps} />
        </main>
      </div>
    </UserProvider>
  );
}