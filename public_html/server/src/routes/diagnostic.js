import { Router } from "express";
import { body } from "express-validator";
import auth from "../middleware/auth.js";
import { aiLimiter } from "../middleware/rateLimiter.js";
import validate from "../middleware/validate.js";
import { generate, submit, getSession } from "../controllers/diagnosticController.js";

const router = Router();

// POST /api/diagnostic/generate
router.post(
  "/generate",
  auth,
  aiLimiter,
  [
    body("test").optional().isString().withMessage("test must be a string"),
    body("sections").optional().isArray().withMessage("sections must be an array"),
    body("countPerSection").optional().isInt({ min: 1, max: 20 }).withMessage("countPerSection must be between 1 and 20"),
  ],
  validate,
  generate
);

// POST /api/diagnostic/submit
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

// GET /api/diagnostic/:sessionId
router.get("/:sessionId", auth, getSession);

export default router;
