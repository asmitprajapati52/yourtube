import Download from "../modals/download.js";
import User from "../modals/auth.js"; // Aapka existing user model

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
      return 20; // Gold ke liye high ya unlimited
    default:
      return 1; // Default free limit
  }
};

// 1. Video Download Check & Record karne ka API
export const downloadVideo = async (req, res) => {
  const { userId, videoId } = req.body;

  try {
    // User ka current plan fetch karein
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const userPlan = user.subscriptionPlan || "free";
    const allowedLimit = getDownloadLimit(userPlan);

    // Aaj ki date ki shuruat (Start of the day: 00:00:00) nikalna taaki daily count track ho sake
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

    // Agar limit ke andar hai, toh record save karein
    const newDownload = await Download.create({
      userId,
      videoId,
      planAtDownload: userPlan,
    });

    res.status(200).json({
      message: "Video download authorized successfully!",
      download: newDownload,
      remainingDownloads: allowedLimit - (todayDownloadsCount + 1),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. User ke profile ke liye downloaded videos ki list fetch karne ka API
export const getUserDownloads = async (req, res) => {
  const { userId } = req.params;

  try {
    const downloads = await Download.find({ userId })
      .populate("videoId") // Video ki saari details (title, thumbnail, etc.) sath mein mil jayengi
      .sort({ downloadDate: -1 }); // Latest downloads sabse upar

    res.status(200).json(downloads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};