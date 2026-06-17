import { Router } from "express";
import { body } from "express-validator";
import auth from "../middleware/auth.js";
import { aiLimiter } from "../middleware/rateLimiter.js";
import validate from "../middleware/validate.js";
import { generate, getActivePlan, updateProgress } from "../controllers/studyPlanController.js";

const router = Router();

// POST /api/study-plan/generate
router.post(
  "/generate",
  auth,
  aiLimiter,
  [
    body("targetDate")
      .optional()
      .isISO8601()
      .withMessage("targetDate must be a valid ISO date"),
    body("planType")
      .optional()
      .isIn(["follow", "self"])
      .withMessage("planType must be 'follow' or 'self'"),
  ],
  validate,
  generate
);

// GET /api/study-plan/active
router.get("/active", auth, getActivePlan);

// POST /api/study-plan/progress
router.post(
  "/progress",
  auth,
  [
    body("planId").trim().notEmpty().withMessage("planId is required"),
    body("weekNumber").isInt({ min: 1 }).withMessage("weekNumber must be a positive integer"),
    body("day").trim().notEmpty().withMessage("day is required"),
    body("taskIndex").isInt({ min: 0 }).withMessage("taskIndex must be a non-negative integer"),
  ],
  validate,
  updateProgress
);

export default router;
