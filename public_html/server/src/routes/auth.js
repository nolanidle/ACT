import { Router } from "express";
import { body } from "express-validator";
import { authLimiter } from "../middleware/rateLimiter.js";
import validate from "../middleware/validate.js";
import {
  register,
  verifyEmail,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";

const router = Router();

// POST /api/auth/register
router.post(
  "/register",
  authLimiter,
  [
    body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
    body("name").trim().notEmpty().withMessage("Name is required").isLength({ max: 100 }).withMessage("Name must be under 100 characters"),
  ],
  validate,
  register
);

// POST /api/auth/verify-email
router.post(
  "/verify-email",
  authLimiter,
  [
    body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
    body("code").trim().notEmpty().withMessage("Verification code is required").isLength({ min: 6, max: 6 }).withMessage("Code must be 6 digits"),
  ],
  validate,
  verifyEmail
);

// POST /api/auth/login
router.post(
  "/login",
  authLimiter,
  [
    body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validate,
  login
);

// POST /api/auth/refresh
router.post("/refresh", refresh);

// POST /api/auth/logout
router.post("/logout", logout);

// POST /api/auth/forgot-password
router.post(
  "/forgot-password",
  authLimiter,
  [
    body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
  ],
  validate,
  forgotPassword
);

// POST /api/auth/reset-password
router.post(
  "/reset-password",
  authLimiter,
  [
    body("token").trim().notEmpty().withMessage("Reset token is required"),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
  ],
  validate,
  resetPassword
);

export default router;
