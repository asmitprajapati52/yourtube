import express from "express";
import { login, updateprofile, updateThemePreference } from "../controllers/auth.js";

const routes = express.Router();

// 1️⃣ Login route
routes.post("/login", login);

// 2️⃣ Profile update route (params channel integration)
routes.patch("/update/:id", updateprofile);

// 3️⃣ Theme Preference Update Route ✅
// Ye wahi route hai jo frontend Header.tsx se http://localhost:5000/api/update-theme par hit hoga
routes.patch("/update-theme", updateThemePreference);

export default routes;