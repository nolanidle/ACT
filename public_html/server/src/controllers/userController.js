import { v4 as uuidv4 } from "uuid";
import pool from "../config/db.js";
import { findUserById, updateUserName } from "../models/userModel.js";
import { getUserBadges } from "../models/badgeModel.js";
import { getTodayUsageSummary } from "../models/aiUsageModel.js";

// GET /api/user/profile
export const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [user, badges, streakData] = await Promise.all([
      findUserById(userId),
      getUserBadges(userId),
      pool.execute(
        `SELECT current_streak, longest_streak, last_activity_date FROM streaks WHERE user_id = ? LIMIT 1`,
        [userId]
      ),
    ]);

    if (!user) {
      return res.status(404).json({ success: false, data: null, error: "User not found." });
    }

    const streak = streakData[0][0] || { current_streak: 0, longest_streak: 0, last_activity_date: null };

    return res.status(200).json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        email_verified: user.email_verified,
        subscription_tier: user.subscription_tier,
        xp: user.xp,
        streak_count: streak.current_streak,
        longest_streak: streak.longest_streak,
        last_active_date: user.last_active_date,
        created_at: user.created_at,
        badges,
      },
      error: null,
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/user/profile
export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ success: false, data: null, error: "Name is required." });
    }
    if (name.trim().length > 100) {
      return res.status(400).json({ success: false, data: null, error: "Name must be under 100 characters." });
    }

    await updateUserName(userId, name.trim());

    const user = await findUserById(userId);

    return res.status(200).json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        subscription_tier: user.subscription_tier,
        xp: user.xp,
      },
      error: null,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/user/report-question
export const reportQuestion = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { questionId, reason } = req.body;

    if (!questionId) {
      return res.status(400).json({ success: false, data: null, error: "questionId is required." });
    }
    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({ success: false, data: null, error: "reason is required." });
    }

    // Verify question exists
    const [questionRows] = await pool.execute(
      `SELECT id FROM questions WHERE id = ? LIMIT 1`,
      [questionId]
    );
    if (questionRows.length === 0) {
      return res.status(404).json({ success: false, data: null, error: "Question not found." });
    }

    // Check if already reported by this user
    const [existingReport] = await pool.execute(
      `SELECT id FROM question_reports WHERE user_id = ? AND question_id = ? LIMIT 1`,
      [userId, questionId]
    );
    if (existingReport.length > 0) {
      return res.status(409).json({ success: false, data: null, error: "You have already reported this question." });
    }

    const reportId = uuidv4();
    await pool.execute(
      `INSERT INTO question_reports (id, user_id, question_id, reason, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [reportId, userId, questionId, reason.trim()]
    );

    return res.status(200).json({
      success: true,
      data: { reportId, message: "Question reported successfully. Thank you for your feedback." },
      error: null,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/user/usage
export const getUsageStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const tier = req.user.subscription_tier;

    const todayUsage = await getTodayUsageSummary(userId);

    // Build a usage summary with limits
    const LIMITS = {
      free: { generation: 3, explanation: 5, diagnostic: 1 },
      premium: { generation: 25, explanation: 50, diagnostic: 10 },
    };

    const userLimits = LIMITS[tier] || LIMITS.free;
    const usageMap = {};
    for (const row of todayUsage) {
      usageMap[row.action_type] = parseInt(row.count);
    }

    return res.status(200).json({
      success: true,
      data: {
        tier,
        today: {
          generation: {
            used: usageMap.generation || 0,
            limit: userLimits.generation,
            remaining: Math.max(0, userLimits.generation - (usageMap.generation || 0)),
          },
          explanation: {
            used: usageMap.explanation || 0,
            limit: userLimits.explanation,
            remaining: Math.max(0, userLimits.explanation - (usageMap.explanation || 0)),
          },
          diagnostic: {
            used: usageMap.diagnostic || 0,
            limit: userLimits.diagnostic,
            remaining: Math.max(0, userLimits.diagnostic - (usageMap.diagnostic || 0)),
            period: "monthly",
          },
        },
        raw: todayUsage,
      },
      error: null,
    });
  } catch (err) {
    next(err);
  }
};
