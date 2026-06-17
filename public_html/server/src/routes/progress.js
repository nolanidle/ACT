import { Router } from "express";
import auth from "../middleware/auth.js";
import {
  getDashboard,
  getScoreTrendRoute,
  getStudyStatsRoute,
  getSkillBreakdownRoute,
} from "../controllers/progressController.js";

const router = Router();

// GET /api/progress/dashboard
router.get("/dashboard", auth, getDashboard);

// GET /api/progress/score-trend
router.get("/score-trend", auth, getScoreTrendRoute);

// GET /api/progress/stats
router.get("/stats", auth, getStudyStatsRoute);

// GET /api/progress/skills
router.get("/skills", auth, getSkillBreakdownRoute);

export default router;
