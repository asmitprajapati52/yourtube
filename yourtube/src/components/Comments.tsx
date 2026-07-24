"use client";

import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { formatDistanceToNow } from "date-fns";
import { useUser } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";
import { ThumbsUp, ThumbsDown, Flag, Globe, MapPin } from "lucide-react";

interface Comment {
  _id: string;
  videoid: string;
  userid: string;
  commentbody: string;
  usercommented: string;
  commentedon: string;
  userAvatar?: string;
  language?: string;
  location?: string;
  showLocation?: boolean;
  likes?: string[];
  dislikes?: string[];
  reportsCount?: number;
}

const Comments = ({ videoId }: { videoId: string }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 🚀 Real YouTube behavior: Focus state track karne ke liye
  const [isFocused, setIsFocused] = useState(false);
  
  const [targetLanguage, setTargetLanguage] = useState("en");
  const [translatedTexts, setTranslatedTexts] = useState<{ [key: string]: string }>({});
  const [translatingId, setTranslatingId] = useState<string | null>(null);
  
  const [showLocationToggle, setShowLocationToggle] = useState(false);
  const [userLocation, setUserLocation] = useState("India");

  const { user } = useUser();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadComments();
  }, [videoId]);

  const loadComments = async () => {
    try {
      const res = await axiosInstance.get(`/comment/${videoId}`);
      setComments(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error loading comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!user || !newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await axiosInstance.post("/comment/postcomment", {
        videoid: videoId,
        userid: user._id,
        commentbody: newComment,
        usercommented: user.name,
        showLocation: showLocationToggle,
        location: showLocationToggle ? userLocation : "",
        language: "en",
      });

      if (res.data.comment || res.data.newComment) {
        setComments([res.data.newComment || res.data.comment, ...comments]);
        setNewComment("");
        setIsFocused(false); // Reset focus after posting
        setShowLocationToggle(false);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to post comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (commentId: string) => {
    if (!user) return alert("Please log in to like comments");
    try {
      const res = await axiosInstance.patch(`/comment/like/${commentId}`, { userId: user._id });
      setComments(comments.map(c => c._id === commentId ? res.data : c));
    } catch (error) {
      console.error("Error liking comment:", error);
    }
  };

  const handleDislike = async (commentId: string) => {
    if (!user) return alert("Please log in to dislike comments");
    try {
      const res = await axiosInstance.patch(`/comment/dislike/${commentId}`, { userId: user._id });
      setComments(comments.map(c => c._id === commentId ? res.data : c));
    } catch (error) {
      console.error("Error disliking comment:", error);
    }
  };

  const handleReport = async (commentId: string) => {
    if (!user) return alert("Please log in to report comments");
    try {
      const res = await axiosInstance.patch(`/comment/report/${commentId}`, { userId: user._id });
      alert(res.data.message);
    } catch (error: any) {
      alert(error.response?.data?.message || "Error reporting comment");
    }
  };

  const handleTranslate = async (commentId: string, text: string) => {
    setTranslatingId(commentId);
    try {
      const res = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLanguage}`
      );
      const data = await res.json();
      if (data && data.responseData) {
        setTranslatedTexts(prev => ({ ...prev, [commentId]: data.responseData.translatedText }));
      }
    } catch (error) {
      console.error("Translation error:", error);
      alert("Translation failed.");
    } finally {
      setTranslatingId(null);
    }
  };

  if (loading) return <div className="text-sm text-gray-500">Loading comments...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{comments.length} Comments</h2>
        
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Globe className="w-4 h-4" />
          <span>Translate to:</span>
          <select 
            value={targetLanguage} 
            onChange={(e) => setTargetLanguage(e.target.value)}
            className="border rounded px-2 py-1 bg-white text-black"
          >
            <option value="en">English</option>
            <option value="hi">Hindi (हिन्दी)</option>
            <option value="es">Spanish (Español)</option>
            <option value="fr">French (Français)</option>
            <option value="de">German (Deutsch)</option>
          </select>
        </div>
      </div>

      {user && (
        <div className="flex gap-4">
          <Avatar className="w-10 h-10">
            <AvatarImage src={user.image || ""} />
            <AvatarFallback>{user.name?.[0]?.toUpperCase() || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <Textarea
              placeholder="Add a comment..."
              value={newComment}
              onFocus={() => setIsFocused(true)} // 🚀 Click/Focus hone par buttons show honge
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[60px] resize-none border-0 border-b-2 rounded-none focus-visible:ring-0 bg-transparent"
            />
            
            {/* 🚀 Only visible when focused */}
            {isFocused && (
              <div className="space-y-3 pt-2">
                <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer w-fit">
                  <input 
                    type="checkbox" 
                    checked={showLocationToggle} 
                    onChange={(e) => setShowLocationToggle(e.target.checked)} 
                    className="rounded border-gray-300"
                  />
                  <MapPin className="w-3.5 h-3.5 text-gray-500" />
                  <span>Show optional general location ({userLocation}) for privacy</span>
                </label>

                <div className="flex gap-2 justify-end">
                  <Button 
                    variant="ghost" 
                    onClick={() => {
                      setIsFocused(false);
                      setNewComment("");
                      setShowLocationToggle(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSubmitComment} 
                    disabled={!newComment.trim() || isSubmitting}
                  >
                    {isSubmitting ? "Posting..." : "Comment"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="space-y-6">
        {comments.map((comment) => {
          const isLikedByMe = comment.likes?.includes(user?._id || "");
          const isDislikedByMe = comment.dislikes?.includes(user?._id || "");
          const displayedText = translatedTexts[comment._id] || comment.commentbody;

          return (
            <div key={comment._id} className="flex gap-4 border-b border-gray-100 pb-4">
              <Avatar className="w-10 h-10">
                <AvatarImage src={comment.userAvatar || ""} />
                <AvatarFallback className="bg-gray-100 font-semibold">
                  {comment.usercommented?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm">{comment.usercommented}</span>
                  
                  {comment.showLocation && comment.location && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {comment.location}
                    </span>
                  )}

                  <span className="text-xs text-gray-500">
                    {comment.commentedon ? `${formatDistanceToNow(new Date(comment.commentedon))} ago` : "Recently"}
                  </span>
                </div>

                <p className="text-sm text-gray-800">{displayedText}</p>

                <div className="flex items-center gap-4 pt-2 text-xs text-gray-600">
                  <button 
                    onClick={() => handleLike(comment._id)} 
                    className={`flex items-center gap-1 hover:text-black ${isLikedByMe ? "font-bold text-black" : ""}`}
                  >
                    <ThumbsUp className={`w-4 h-4 ${isLikedByMe ? "fill-black" : ""}`} />
                    <span>{comment.likes?.length || 0}</span>
                  </button>

                  <button 
                    onClick={() => handleDislike(comment._id)} 
                    className={`flex items-center gap-1 hover:text-black ${isDislikedByMe ? "font-bold text-black" : ""}`}
                  >
                    <ThumbsDown className={`w-4 h-4 ${isDislikedByMe ? "fill-black" : ""}`} />
                    <span>{comment.dislikes?.length || 0}</span>
                  </button>

                  <button 
                    onClick={() => handleTranslate(comment._id, comment.commentbody)}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    {translatingId === comment._id ? "Translating..." : "Translate"}
                  </button>

                  <button 
                    onClick={() => handleReport(comment._id)}
                    className="flex items-center gap-1 text-red-500 hover:text-red-700 ml-auto"
                    title="Report comment for review"
                  >
                    <Flag className="w-3.5 h-3.5" />
                    <span>Report</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Comments;