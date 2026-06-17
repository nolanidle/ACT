import { Router } from "express";
import { body } from "express-validator";
import auth from "../middleware/auth.js";
import { aiLimiter } from "../middleware/rateLimiter.js";
import validate from "../middleware/validate.js";
import { explain, getExplanation } from "../controllers/explanationController.js";

const router = Router();

// POST /api/explanation/question/:questionId
router.post(
  "/question/:questionId",
  auth,
  aiLimiter,
  [
    body("selectedAnswer").trim().notEmpty().withMessage("selectedAnswer is required"),
  ],
  validate,
  explain
);

// GET /api/explanation/question/:questionId
router.get("/question/:questionId", auth, getExplanation);

export default router;
