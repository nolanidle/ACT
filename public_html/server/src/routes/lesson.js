import { Router } from "express";
import { body } from "express-validator";
import auth from "../middleware/auth.js";
import { aiLimiter } from "../middleware/rateLimiter.js";
import validate from "../middleware/validate.js";
import { generate, complete, getLesson, getLessons } from "../controllers/lessonController.js";

const router = Router();

// POST /api/lesson/generate
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
      .isInt({ min: 3, max: 12 })
      .withMessage("length must be between 3 and 12"),
  ],
  validate,
  generate
);

// POST /api/lesson/:lessonId/complete
router.post("/:lessonId/complete", auth, complete);

// GET /api/lesson/:lessonId — must come before GET /
router.get("/:lessonId", auth, getLesson);

// GET /api/lesson
router.get("/", auth, getLessons);

export default router;
