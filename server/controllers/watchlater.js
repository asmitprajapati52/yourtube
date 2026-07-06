import watchlater from "../Modals/watchlater.js"; // Adjust this import name/path to match your schema

// 1. Fetch all watch later videos for a specific user
export const getallwatchlater = async (req, res) => {
  const { userId } = req.params;

  try {
    const watchLaterVideos = await watchlater
      .find({ viewer: userId }) // adjust 'viewer' to match your schema field name
      .populate({
        path: "videoid",
        model: "videofiles",
      })
      .exec();

    return res.status(200).json(watchLaterVideos);
  } catch (error) {
    console.error("Error in getallwatchlater:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// 2. Add or remove a video from watch later (Toggle functionality)
export const handlewatchlater = async (req, res) => {
  const { userId } = req.body; // Expecting userId in the body, videoId in params
  const { videoId } = req.params;

  try {
    // Check if it already exists to avoid duplicates
    const existing = await watchlater.findOne({ viewer: userId, videoid: videoId });

    if (existing) {
      // If it exists, remove it (acts as a toggle)
      await watchlater.findByIdAndDelete(existing._id);
      return res.status(200).json({ added: false, message: "Removed from Watch Later" });
    } else {
      // If it doesn't exist, add it
      await watchlater.create({ viewer: userId, videoid: videoId });
      return res.status(200).json({ added: true, message: "Added to Watch Later" });
    }
  } catch (error) {
    console.error("Error in handlewatchlater:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};