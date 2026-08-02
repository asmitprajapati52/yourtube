import Download from "../modals/download.js";
import User from "../modals/Auth.js";

// Plan ke hisaab se daily limit define karne ka function
const getDownloadLimit = (plan) => {
  switch (plan?.toLowerCase()) {
    case "free":
      return 1;
    case "bronze":
      return 3;
    case "silver":
      return 5;
    case "gold":
      return 20;
    default:
      return 1;
  }
};

// 1. Video Download Check & Record karne ka API
export const downloadVideo = async (req, res) => {
  const { userId, videoId } = req.body;

  // 🚀 Safety check: Fields check karein
  if (!userId || !videoId) {
    return res.status(400).json({ message: "userId and videoId are required!" });
  }

  try {
    // User ka current plan fetch karein
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const userPlan = user.subscriptionPlan || "free";
    const allowedLimit = getDownloadLimit(userPlan);

    // Aaj ki date ki shuruat (Start of the day: 00:00:00)
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    // Check karein ki user ne aaj kitni videos download ki hain
    const todayDownloadsCount = await Download.countDocuments({
      userId,
      downloadDate: { $gte: startOfDay },
    });

    if (todayDownloadsCount >= allowedLimit) {
      return res.status(403).json({
        message: `Daily download limit reached for your ${userPlan.toUpperCase()} plan. Upgrade your plan for more downloads!`,
        limitExceeded: true,
      });
    }

    // Record save karein
    const newDownload = await Download.create({
      userId,
      videoId,
      planAtDownload: userPlan,
    });

    return res.status(200).json({
      message: "Video download authorized successfully!",
      download: newDownload,
      remainingDownloads: allowedLimit - (todayDownloadsCount + 1),
    });
  } catch (error) {
    // 🚀 Server console par error print karega taaki Render logs mein dikhe
    console.error("Error in downloadVideo controller:", error);
    return res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

// 2. User ke profile ke liye downloaded videos ki list fetch karne ka API
export const getUserDownloads = async (req, res) => {
  const { userId } = req.params;

  try {
    const downloads = await Download.find({ userId })
      .populate("videoId") 
      .sort({ downloadDate: -1 });

    return res.status(200).json(downloads || []);
  } catch (error) {
    console.error("Error in getUserDownloads controller:", error);
    return res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};