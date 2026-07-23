import mongoose from "mongoose";

const downloadSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  videoId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "videofiles", 
    required: true 
  },
  downloadDate: { 
    type: Date, 
    default: Date.now 
  },
  planAtDownload: { 
    type: String, 
    enum: ["free", "bronze", "Bronze", "silver", "gold", "platinum"], 
    default: "free" 
  }
});

export default mongoose.model("Download", downloadSchema);