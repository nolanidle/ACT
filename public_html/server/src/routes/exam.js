import { Router } from "express";
import { body } from "express-validator";
import auth from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import { generate, submit, getExamSession } from "../controllers/examController.js";

const router = Router();

// GET /api/exam/generate — SSE endpoint
router.get("/generate", auth, generate);

// POST /api/exam/submit
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

// GET /api/exam/:sessionId
router.get("/:sessionId", auth, getExamSession);

export default router;
