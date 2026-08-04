# 🎥 YourTube - Full-Stack Video Sharing Platform

YourTube is a full-stack, responsive video-sharing web application built to emulate core features of modern video platforms like YouTube. It enables users to register and authenticate, upload videos securely via cloud streams, manage channels, interact with content through likes, dislikes, and watch later lists, and experience real-time features like watch parties.

## 🛠️ Tech Stack Architecture
- **Frontend:** Next.js (React), Tailwind CSS, Lucide React, Axios.
- **Backend:** Node.js, Express.js REST API.
- **Database & ODM:** MongoDB Atlas, Mongoose.
- **Media Storage:** Cloudinary (via memory storage streams and signature verification).
- **Deployment:** Vercel (Frontend), Render (Backend).

## 🚀 Key Features & Modules
- **Authentication & User Management:** Secure session handling, user sign-ups, and profile identification.
- **Cloud Video Pipeline:** Multi-part video uploads processed via memory storage streams directly to Cloudinary.
- **Robust API & Routing:** Dual-mapped endpoints supporting global feeds and channel-specific fetching to prevent 404 client-side errors.
- **Custom Responsive Video Player:** Touch-optimized mobile controls, tap-to-seek, duration scaling, fullscreen toggling, and automatic play-next/replay overlays.
- **User Engagement:** Real-time like/dislike tracking, Watch Later lists, view counts, history tracking, and Watch Party room synchronization.

## 📁 Project Structure
yourtube/
├── backend/
│   ├── controllers/     # Business logic for videos, users, interactions
│   ├── models/          # Mongoose schemas (Video, User, etc.)
│   ├── routes/          # Express route definitions (video.js, etc.)
│   └── filehelper/      # Multer configuration for memory storage
└── frontend/
    ├── components/      # Reusable UI elements (VideoPlayer, VideoInfo, etc.)
    ├── lib/             # Context providers and Axios instances
    └── pages/           # Next.js page routers

## ⚙️ Environment Variables

### Backend (.env)
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

### Frontend (.env.local)
NEXT_PUBLIC_BACKEND_URL=https://yourtube-07v0.onrender.com

## 🏃‍♂️ Running Locally
1. Clone the repository: git clone https://github.com/your-username/yourtube.git
2. Setup Backend: cd backend && npm install && npm start
3. Setup Frontend: cd frontend && npm install && npm run dev

## 📄 License
This project is open-source and developed for educational and portfolio evaluation purposes.
