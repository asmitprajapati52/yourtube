import mongoose from "mongoose";

const commentschema = mongoose.Schema(
  {
    userid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    videoid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "videofiles",
      required: true,
    },
    commentbody: { type: String, required: true },
    usercommented: { type: String, required: true },
    
    // 🚀 Naye Fields (Multilingual, Privacy Location, Likes, Dislikes, Reports)
    language: { type: String, default: "en" },
    location: { type: String, default: "" }, // Optional general location (e.g., State/Country)
    showLocation: { type: Boolean, default: false }, // Privacy toggle
    
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    
    // Moderation & Review Flag System
    isFlagged: { type: Boolean, default: false },
    reportsCount: { type: Number, default: 0 },
    reportedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    
    commentedon: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("comment", commentschema);