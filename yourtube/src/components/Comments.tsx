"use client";

import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { formatDistanceToNow } from "date-fns";
import { useUser } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";

interface Comment {
  _id: string;
  videoid: string;
  userid: string;
  commentbody: string;
  usercommented: string;
  commentedon: string;
  userAvatar?: string; // Optional field for avatar
}

const Comments = ({ videoId }: { videoId: string }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
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
      });

      if (res.data.comment) {
        setComments([res.data.comment, ...comments]);
        setNewComment("");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axiosInstance.delete(`/comment/deletecomment/${id}`);
      setComments((prev) => prev.filter((c) => c._id !== id));
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  if (loading) return <div className="text-sm text-gray-500">Loading comments...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">{comments.length} Comments</h2>

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
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[80px] resize-none border-0 border-b-2 rounded-none focus-visible:ring-0"
            />
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setNewComment("")}>Cancel</Button>
              <Button onClick={handleSubmitComment} disabled={!newComment.trim() || isSubmitting}>
                {isSubmitting ? "Posting..." : "Comment"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment._id} className="flex gap-4">
            <Avatar className="w-10 h-10">
              {/* FIXED: Removed hardcoded placeholder.svg */}
              <AvatarImage src={comment.userAvatar || ""} />
              <AvatarFallback className="bg-gray-100 font-semibold">
                {comment.usercommented?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm">{comment.usercommented}</span>
                <span className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(comment.commentedon))} ago
                </span>
              </div>

              {editingCommentId === comment._id ? (
                // (Edit mode logic remains same as yours)
                <div className="space-y-2">
                  <Textarea value={editText} onChange={(e) => setEditText(e.target.value)} />
                  <Button onClick={() => { /* add your update logic */ }}>Save</Button>
                </div>
              ) : (
                <p className="text-sm text-gray-800">{comment.commentbody}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Comments;