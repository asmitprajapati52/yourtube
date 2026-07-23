import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { io, Socket } from "socket.io-client";
import { useUser } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Copy, Users, Check, MessageSquare, Video as VideoIcon, Mic, MicOff, VideoOff, MonitorUp, PhoneOff } from "lucide-react";

let socket: Socket;

export default function WatchPartyContent() {
  const router = useRouter();
  const { roomId, videoUrl } = router.query;
  const { user } = useUser();

  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [participants, setParticipants] = useState<{ id: string; username: string }[]>([]);
  const [copied, setCopied] = useState(false);
  
  // Call Controls State
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  // Screen/Session Recording States
  const [isRecording, setIsRecording] = useState(false);
  const screenRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  const [guestName, setGuestName] = useState("");

  useEffect(() => {
    setMounted(true);
    setGuestName(`Guest_${Math.floor(Math.random() * 1000)}`);
  }, []);

  const username = user?.channelname || user?.name || guestName;

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      })
      .catch((err) => {
        console.warn("Media devices permission dismissed or unavailable:", err);
      });

    return () => {
      localStream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  useEffect(() => {
    if (!roomId || !mounted) return;

    socket = io("http://localhost:5000");
    socket.emit("join-room", { roomId, username });

    socket.on("user-connected", ({ userId, username }) => {
      setParticipants((prev) => [...prev, { id: userId, username }]);
    });

    socket.on("receive-message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on("sync-video-action", ({ action, currentTime }) => {
      if (!videoRef.current) return;
      if (action === "play") {
        videoRef.current.currentTime = currentTime;
        videoRef.current.play();
      } else if (action === "pause") {
        videoRef.current.currentTime = currentTime;
        videoRef.current.pause();
      } else if (action === "seek") {
        videoRef.current.currentTime = currentTime;
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId, username, mounted]);

  if (!mounted) return null;

  const toggleAudio = () => {
    if (!localStream) {
      alert("Microphone stream not available. Please allow camera/mic permissions.");
      return;
    }
    const audioTrack = localStream.getAudioTracks()[0];
    if (audioTrack) {
      const newAudioState = !isMuted;
      audioTrack.enabled = !newAudioState;
      setIsMuted(newAudioState);
    }
  };

  const toggleVideo = () => {
    if (!localStream) {
      alert("Camera stream not available. Please allow camera/mic permissions.");
      return;
    }
    const videoTrack = localStream.getVideoTracks()[0];
    if (videoTrack) {
      const newVideoState = !isVideoOff;
      videoTrack.enabled = !newVideoState;
      setIsVideoOff(newVideoState);
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = screenStream.getVideoTracks()[0];
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }

        screenTrack.onended = () => {
          if (localStream && localVideoRef.current) {
            localVideoRef.current.srcObject = localStream;
          }
          setIsScreenSharing(false);
        };

        setIsScreenSharing(true);
      } else {
        if (localStream && localVideoRef.current) {
          localVideoRef.current.srcObject = localStream;
        }
        setIsScreenSharing(false);
      }
    } catch (error) {
      console.error("Error sharing screen:", error);
    }
  };

  const startRecording = async () => {
    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      recordedChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(displayStream, { mimeType: "video/webm; codecs=vp9" });
      screenRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = `watch-party-screen-recording-${roomId}.webm`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        displayStream.getTracks().forEach(track => track.stop());
      };

      displayStream.getVideoTracks()[0].onended = () => {
        stopRecording();
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting screen recording:", error);
    }
  };

  const stopRecording = () => {
    if (screenRecorderRef.current && screenRecorderRef.current.state !== "inactive") {
      screenRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const leaveCall = () => {
    if (isRecording) stopRecording();
    localStream?.getTracks().forEach((track) => track.stop());
    router.push("/");
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    socket.emit("send-message", { roomId, message: inputMessage, username });
    setInputMessage("");
  };

  // Handle video source mapping correctly (fallback to /video/ if /uploads/ gives 416 range error)
  let activeVideoSource = typeof videoUrl === "string" && videoUrl.trim() !== "" ? videoUrl : "";
  // Optional adjustment if backend serves via /video/ route instead of /uploads/
  // activeVideoSource = activeVideoSource.replace('/uploads/', '/video/');

  return (
    <div className="p-4 md:p-6 flex flex-col lg:flex-row gap-6 max-w-[1700px] mx-auto">
      {/* Left Section: Main Video & Controls */}
      <div className="flex-1 flex flex-col space-y-4">
        <div className="flex justify-between items-center bg-zinc-900 px-4 py-3 rounded-xl border border-zinc-800 flex-wrap gap-3">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2 text-white">
              <VideoIcon className="w-5 h-5 text-blue-500" /> Watch Party Room: <span className="text-blue-400">{roomId}</span>
            </h2>
            <span className="text-xs text-zinc-400">User: <strong className="text-zinc-200">{username}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={copyInviteLink} className="bg-blue-600 hover:bg-blue-700 text-white text-sm">
              {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
              {copied ? "Copied!" : "Invite Friends"}
            </Button>
            <Button onClick={leaveCall} variant="destructive" className="text-sm flex items-center gap-1">
              <PhoneOff className="w-4 h-4" /> Leave
            </Button>
          </div>
        </div>

        {/* Sync Video Player */}
        <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-zinc-800 shadow-2xl flex items-center justify-center">
          {activeVideoSource ? (
            <video
              ref={videoRef}
              src={activeVideoSource}
              controls
              playsInline
              preload="auto"
              onError={(e) => console.error("Video loading error for source:", activeVideoSource, e)}
              onPlay={() => socket.emit("video-action", { roomId, action: "play", currentTime: videoRef.current?.currentTime })}
              onPause={() => socket.emit("video-action", { roomId, action: "pause", currentTime: videoRef.current?.currentTime })}
              onSeeked={() => socket.emit("video-action", { roomId, action: "seek", currentTime: videoRef.current?.currentTime })}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="text-zinc-400 text-sm p-4 text-center">
              No video selected. Please click &quot;Watch Party&quot; from a video page.
            </div>
          )}
        </div>

        {/* Call Controls & WebRTC Video Grid Preview */}
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="relative w-28 h-16 bg-black rounded-lg overflow-hidden border border-zinc-700">
              <video 
                ref={localVideoRef} 
                autoPlay 
                muted 
                playsInline 
                className={`w-full h-full object-cover ${isVideoOff ? "hidden" : "block"}`} 
              />
              {isVideoOff && (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 text-zinc-400 text-xs">
                  Camera Off
                </div>
              )}
              <span className="absolute bottom-1 left-1 text-[10px] bg-black/70 text-white px-1 rounded z-10">You</span>
            </div>
            <span className="text-xs text-zinc-400">Your Video Stream</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button onClick={toggleAudio} variant="outline" className={`border-zinc-700 ${isMuted ? "bg-red-600 text-white" : "bg-zinc-800 text-zinc-200"}`}>
              {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
            <Button onClick={toggleVideo} variant="outline" className={`border-zinc-700 ${isVideoOff ? "bg-red-600 text-white" : "bg-zinc-800 text-zinc-200"}`}>
              {isVideoOff ? <VideoOff className="w-4 h-4" /> : <VideoIcon className="w-4 h-4" />}
            </Button>
            <Button onClick={toggleScreenShare} variant="outline" className={`border-zinc-700 ${isScreenSharing ? "bg-green-600 text-white" : "bg-zinc-800 text-zinc-200"}`}>
              <MonitorUp className="w-4 h-4 mr-1" /> {isScreenSharing ? "Stop Share" : "Share Screen"}
            </Button>
            <Button 
              onClick={isRecording ? stopRecording : startRecording} 
              variant="outline" 
              className={`border-zinc-700 ${isRecording ? "bg-red-700 text-white animate-pulse" : "bg-zinc-800 text-zinc-200"}`}
            >
              {isRecording ? "⏹ Stop Screen Rec" : "⏺ Record Screen"}
            </Button>
          </div>
        </div>
      </div>

      {/* Right Section: Participants & Chat */}
      <div className="w-full lg:w-[400px] bg-zinc-900 border border-zinc-800 rounded-xl flex flex-col h-[600px] lg:h-[calc(100vh-100px)]">
        <div className="p-3 border-b border-zinc-800 flex items-center gap-2 text-sm font-semibold text-zinc-300">
          <Users className="w-4 h-4 text-blue-400" /> Participants ({participants.length + 1})
        </div>
        
        <div className="px-4 py-2 border-b border-zinc-800 flex gap-2 overflow-x-auto">
          <span className="bg-blue-950 text-blue-300 border border-blue-800 px-2.5 py-1 rounded-full text-xs font-medium">
            {username} (You)
          </span>
          {participants.map((p, idx) => (
            <span key={idx} className="bg-zinc-800 text-zinc-300 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap">
              {p.username}
            </span>
          ))}
        </div>

        <div className="p-3 border-b border-zinc-800 font-semibold text-zinc-200 flex items-center gap-2 text-sm">
          <MessageSquare className="w-4 h-4 text-green-400" /> Live Chat
        </div>

        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {messages.length === 0 ? (
            <p className="text-zinc-500 text-center text-xs mt-10">No messages yet. Say hello! 👋</p>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className="bg-zinc-800/80 p-2.5 rounded-lg text-sm border border-zinc-700/50">
                <span className="font-bold text-blue-400 mr-2">{msg.username}:</span>
                <span className="text-zinc-200">{msg.message}</span>
              </div>
            ))
          )}
        </div>

        <form onSubmit={sendMessage} className="p-3 border-t border-zinc-800 flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
          />
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">Send</Button>
        </form>
      </div>
    </div>
  );
}