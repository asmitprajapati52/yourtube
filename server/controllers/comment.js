import comment from "../Modals/comment.js";
import mongoose from "mongoose";

// 🚀 ADVANCED FILTERING: Gande words aur spammers ko block karne ke liye list
const badWordsBlacklist = ['abuse1', 'spamword', 'gali1', 'gali2', 'fakebot'];

// Path Helper: Validation logic reusable banane ke liye ek clean utility function
const validateCommentContent = (text) => {
  if (!text || typeof text !== 'string') return { isValid: true };

  // 1️⃣ Abusive Words Detection
  const hasBadWord = badWordsBlacklist.some(word => 
    text.toLowerCase().includes(word.toLowerCase())
  );
  if (hasBadWord) {
    return { isValid: false, reason: "Comment blocked! Abusive language or community guideline violation detected." };
  }

  // 2️⃣ Spam Protection (Checks if 4 or more duplicate special characters are chained together)
  const spamPattern = /([!@#$%^&*(),.?":{}|<>])\1{3,}/g;
  if (spamPattern.test(text)) {
    return { isValid: false, reason: "Comment blocked! Excessive special characters or spam patterns detected." };
  }

  return { isValid: true };
};

export const postcomment = async (req, res) => {
  const commentdata = req.body;
  
  // 🚀 TASK VALIDATION: Comment post hone se pehle check karo
  const validation = validateCommentContent(commentdata.commentbody);
  if (!validation.isValid) {
    return res.status(400).json({ message: validation.reason });
  }

  const postcomment = new comment(commentdata);
  try {
    await postcomment.save();
    return res.status(200).json({ comment: true });
  } catch (error) {
    console.error(" error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const getallcomment = async (req, res) => {
  const { videoid } = req.params;
  try {
    const commentvideo = await comment.find({ videoid: videoid });
    return res.status(200).json(commentvideo);
  } catch (error) {
    console.error(" error:", error);
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
    console.error(" error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const editcomment = async (req, res) => {
  const { id: _id } = req.params;
  const { commentbody } = req.body;
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).send("comment unavailable");
  }

  // 🚀 TASK VALIDATION: Comment edit/update hone se pehle bhi checks lagenge
  const validation = validateCommentContent(commentbody);
  if (!validation.isValid) {
    return res.status(400).json({ message: validation.reason });
  }

  try {
    const updatecomment = await comment.findByIdAndUpdate(
      _id, 
      { $set: { commentbody: commentbody } },
      { new: true } // Returns the modified doc instead of the old one
    );
    res.status(200).json(updatecomment);
  } catch (error) {
    console.error(" error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};