import comment from "../Modals/comment.js";
import mongoose from "mongoose";

const badWordsBlacklist = ['abuse1', 'spamword', 'gali1', 'gali2', 'fakebot'];

const validateCommentContent = (text) => {
  if (!text || typeof text !== 'string') return { isValid: true };

  const hasBadWord = badWordsBlacklist.some(word => 
    text.toLowerCase().includes(word.toLowerCase())
  );
  if (hasBadWord) {
    return { isValid: false, reason: "Comment blocked! Abusive language or community guideline violation detected." };
  }

  const spamPattern = /([!@#$%^&*(),.?":{}|<>])\1{3,}/g;
  if (spamPattern.test(text)) {
    return { isValid: false, reason: "Comment blocked! Excessive special characters or spam patterns detected." };
  }

  return { isValid: true };
};

export const postcomment = async (req, res) => {
  const { userid, videoid, commentbody, usercommented, location, showLocation, language } = req.body;
  
  const validation = validateCommentContent(commentbody);
  if (!validation.isValid) {
    return res.status(400).json({ message: validation.reason });
  }

  try {
    const newComment = new comment({
      userid,
      videoid,
      commentbody,
      usercommented,
      location: showLocation ? location : "",
      showLocation,
      language: language || "en"
    });

    await newComment.save();
    return res.status(200).json({ comment: true, newComment });
  } catch (error) {
    console.error("error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const getallcomment = async (req, res) => {
  const { videoid } = req.params;
  try {
    const commentvideo = await comment.find({ videoid: videoid }).sort({ createdAt: -1 });
    return res.status(200).json(commentvideo);
  } catch (error) {
    console.error("error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const deletecomment = async (req, res) => {
  const { id: _id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).send("comment unavailable");
  }
  try {
    await comment.findByIdAndDelete(_id);
    return res.status(200).json({ comment: true });
  } catch (error) {
    console.error("error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const editcomment = async (req, res) => {
  const { id: _id } = req.params;
  const { commentbody } = req.body;
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).send("comment unavailable");
  }

  const validation = validateCommentContent(commentbody);
  if (!validation.isValid) {
    return res.status(400).json({ message: validation.reason });
  }

  try {
    const updatecomment = await comment.findByIdAndUpdate(
      _id, 
      { $set: { commentbody: commentbody } },
      { new: true }
    );
    res.status(200).json(updatecomment);
  } catch (error) {
    console.error("error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// 🚀 Like / Unlike Comment Endpoint
export const likeComment = async (req, res) => {
  const { id: _id } = req.params;
  const { userId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(_id)) return res.status(404).send("Comment unavailable");

  try {
    const comm = await comment.findById(_id);
    if (!comm) return res.status(404).send("Comment not found");

    const hasLiked = comm.likes.includes(userId);
    const hasDisliked = comm.dislikes.includes(userId);

    if (hasLiked) {
      comm.likes = comm.likes.filter(id => id.toString() !== userId);
    } else {
      comm.likes.push(userId);
      if (hasDisliked) {
        comm.dislikes = comm.dislikes.filter(id => id.toString() !== userId);
      }
    }

    await comm.save();
    res.status(200).json(comm);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🚀 Dislike Comment Endpoint
export const dislikeComment = async (req, res) => {
  const { id: _id } = req.params;
  const { userId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(_id)) return res.status(404).send("Comment unavailable");

  try {
    const comm = await comment.findById(_id);
    if (!comm) return res.status(404).send("Comment not found");

    const hasLiked = comm.likes.includes(userId);
    const hasDisliked = comm.dislikes.includes(userId);

    if (hasDisliked) {
      comm.dislikes = comm.dislikes.filter(id => id.toString() !== userId);
    } else {
      comm.dislikes.push(userId);
      if (hasLiked) {
        comm.likes = comm.likes.filter(id => id.toString() !== userId);
      }
    }

    await comm.save();
    res.status(200).json(comm);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🚀 Report Comment Endpoint (Flags for admin review instead of auto deletion)
export const reportComment = async (req, res) => {
  const { id: _id } = req.params;
  const { userId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(_id)) return res.status(404).send("Comment unavailable");

  try {
    const comm = await comment.findById(_id);
    if (!comm) return res.status(404).send("Comment not found");

    if (comm.reportedBy.includes(userId)) {
      return res.status(400).json({ message: "You have already reported this comment." });
    }

    comm.reportedBy.push(userId);
    comm.reportsCount += 1;
    comm.isFlagged = true; // Flagged for review

    await comm.save();
    res.status(200).json({ message: "Comment reported successfully. Flagged for review." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};