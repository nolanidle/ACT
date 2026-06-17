import { Router } from "express";
import { body } from "express-validator";
import auth from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import { getProfile, updateProfile, reportQuestion, getUsageStats } from "../controllers/userController.js";

const router = Router();

// GET /api/user/profile
router.get("/profile", auth, getProfile);

// PATCH /api/user/profile
router.patch(
  "/profile",
  auth,
  [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Name is required")
      .isLength({ max: 100 })
      .withMessage("Name must be under 100 characters"),
  ],
  validate,
  updateProfile
);

// POST /api/user/report-question
router.post(
  "/report-question",
  auth,
  [
    body("questionId").trim().notEmpty().withMessage("questionId is required"),
    body("reason").trim().notEmpty().withMessage("reason is required"),
  ],
  validate,
  reportQuestion
);

// GET /api/user/usage
router.get("/usage", auth, getUsageStats);

export default router;
