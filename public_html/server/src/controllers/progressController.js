import pool from "../config/db.js";
import { getScoreTrend, getStudyStats, getSkillBreakdown, getRecentActivity, getCompositeScore } from "../models/progressModel.js";
import { getWeakSkills } from "../models/skillModel.js";
import { getUserBadges } from "../models/badgeModel.js";
import { findUserById } from "../models/userModel.js";

// GET /api/progress/dashboard
export const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Fetch all dashboard data in parallel
    const [
      user,
      compositeData,
      studyStats,
      recentActivity,
      badges,
      weakSkills,
      streakData,
    ] = await Promise.all([
      findUserById(userId),
      getCompositeScore(userId),
      getStudyStats(userId),
      getRecentActivity(userId, 5),
      getUserBadges(userId),
      getWeakSkills(userId, 3),
      pool.execute(
        `SELECT current_streak, longest_streak, last_activity_date FROM streaks WHERE user_id = ? LIMIT 1`,
        [userId]
      ),
    ]);

    const streakRow = streakData[0][0] || { current_streak: 0, longest_streak: 0, last_activity_date: null };

    // Determine today's best move
    let todaysBestMove = null;
    if (weakSkills.length > 0) {
      const worst = weakSkills[0];
      todaysBestMove = {
        type: "lesson",
        message: `Generate a lesson on "${worst.topic}" in ${worst.section} — your accuracy is ${worst.accuracy || 0}%`,
        topic: worst.topic,
        section: worst.section,
        test: worst.test,
      };
    } else {
      todaysBestMove = {
        type: "quiz",
        message: "Take a practice quiz to keep your skills sharp!",
        topic: null,
        section: null,
        test: null,
      };
    }

    // Section scores from composite data
    const sectionScores = compositeData ? compositeData.sectionScores : {};

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          subscription_tier: user.subscription_tier,
          xp: user.xp,
          streak_count: streakRow.current_streak,
          longest_streak: streakRow.longest_streak,
          last_active_date: user.last_active_date,
        },
        compositeScore: compositeData ? compositeData.composite : null,
        sectionScores,
        studyStats,
        recentActivity,
        badges: badges.slice(0, 5),
        weakSkills,
        todaysBestMove,
        streak: streakRow.current_streak,
        longestStreak: streakRow.longest_streak,
      },
      error: null,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/progress/score-trend
export const getScoreTrendRoute = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const trend = await getScoreTrend(userId);

    return res.status(200).json({
      success: true,
      data: { trend },
      error: null,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/progress/stats
export const getStudyStatsRoute = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const stats = await getStudyStats(userId);

    return res.status(200).json({
      success: true,
      data: stats,
      error: null,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/progress/skills
export const getSkillBreakdownRoute = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const skills = await getSkillBreakdown(userId);

    // Group by section for easier consumption
    const grouped = {};
    for (const skill of skills) {
      if (!grouped[skill.section]) grouped[skill.section] = [];
      grouped[skill.section].push(skill);
    }

    return res.status(200).json({
      success: true,
      data: { skills, grouped },
      error: null,
    });
  } catch (err) {
    next(err);
  }
};
