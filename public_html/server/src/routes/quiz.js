import { Router } from "express";
import { body } from "express-validator";
import auth from "../middleware/auth.js";
import { aiLimiter } from "../middleware/rateLimiter.js";
import validate from "../middleware/validate.js";
import { generate, submit, autosave, getQuizSession } from "../controllers/quizController.js";

const router = Router();

// POST /api/quiz/generate
router.post(
  "/generate",
  auth,
  aiLimiter,
  [
    body("section").trim().notEmpty().withMessage("section is required"),
    body("topic").trim().notEmpty().withMessage("topic is required"),
    body("test").optional().isString(),
    body("difficulty")
      .optional()
      .isIn(["easy", "medium", "hard"])
      .withMessage("difficulty must be easy, medium, or hard"),
    body("length")
      .optional()
      .isInt({ min: 1, max: 30 })
      .withMessage("length must be between 1 and 30"),
  ],
  validate,
  generate
);

// POST /api/quiz/submit
router.post(
  "/submit",
  auth,
  [
    body("sessionId").trim().notEmpty().withMessage("sessionId is required"),
    body("answers").isArray().withMessage("answers must be an array"),
  ],
  validate,
  submit
);

// POST /api/quiz/autosave
router.post(
  "/autosave",
  auth,
  [
    body("sessionId").trim().notEmpty().withMessage("sessionId is required"),
    body("answers").isArray().withMessage("answers must be an array"),
  ],
  validate,
  autosave
);

// GET /api/quiz/:sessionId
router.get("/:sessionId", auth, getQuizSession);

export default router;
