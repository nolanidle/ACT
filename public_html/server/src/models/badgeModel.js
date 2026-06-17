import pool from "../config/db.js";
import { v4 as uuidv4 } from "uuid";
import { getMasteredTopicsCount } from "./skillModel.js";

export const getAllBadges = async () => {
  const [rows] = await pool.execute(`SELECT * FROM badges ORDER BY condition_value ASC`);
  return rows;
};

export const getUserBadges = async (userId) => {
  const [rows] = await pool.execute(
    `SELECT b.*, ub.earned_at
     FROM user_badges ub
     JOIN badges b ON ub.badge_id = b.id
     WHERE ub.user_id = ?
     ORDER BY ub.earned_at DESC`,
    [userId]
  );
  return rows;
};

export const awardBadge = async (userId, badgeId) => {
  const id = uuidv4();
  try {
    const [result] = await pool.execute(
      `INSERT IGNORE INTO user_badges (id, user_id, badge_id, earned_at)
       VALUES (?, ?, ?, NOW())`,
      [id, userId, badgeId]
    );
    return result.affectedRows > 0;
  } catch (err) {
    // Duplicate key — badge already earned
    return false;
  }
};

export const checkAndAwardBadges = async (userId, context = {}) => {
  // context: { quizzesCompleted, lessonsCompleted, streakDays, xp, scoreImprovement, perfectQuiz, masteredTopics }
  const newBadges = [];

  // Fetch all badges and what the user already has
  const [allBadges] = await pool.execute(`SELECT * FROM badges`);
  const [earnedRows] = await pool.execute(
    `SELECT badge_id FROM user_badges WHERE user_id = ?`,
    [userId]
  );
  const earnedIds = new Set(earnedRows.map((r) => r.badge_id));

  // Fetch live stats if not provided
  let {
    quizzesCompleted,
    lessonsCompleted,
    streakDays,
    xp,
    scoreImprovement,
    perfectQuiz,
    masteredTopics,
  } = context;

  if (quizzesCompleted === undefined) {
    const [qRows] = await pool.execute(
      `SELECT COUNT(*) as cnt FROM practice_sessions WHERE user_id = ? AND session_type IN ('quiz','lesson_quiz') AND status = 'completed'`,
      [userId]
    );
    quizzesCompleted = qRows[0].cnt;
  }

  if (lessonsCompleted === undefined) {
    const [lRows] = await pool.execute(
      `SELECT COUNT(*) as cnt FROM lesson_progress WHERE user_id = ? AND completed = TRUE`,
      [userId]
    );
    lessonsCompleted = lRows[0].cnt;
  }

  if (streakDays === undefined) {
    const [sRows] = await pool.execute(
      `SELECT current_streak FROM streaks WHERE user_id = ? LIMIT 1`,
      [userId]
    );
    streakDays = sRows.length > 0 ? sRows[0].current_streak : 0;
  }

  if (xp === undefined) {
    const [xRows] = await pool.execute(
      `SELECT xp FROM users WHERE id = ? LIMIT 1`,
      [userId]
    );
    xp = xRows.length > 0 ? xRows[0].xp : 0;
  }

  if (masteredTopics === undefined) {
    masteredTopics = await getMasteredTopicsCount(userId);
  }

  // Check each badge condition
  for (const badge of allBadges) {
    if (earnedIds.has(badge.id)) continue;

    let conditionMet = false;

    switch (badge.condition_type) {
      case "quiz_completed":
        conditionMet = quizzesCompleted >= badge.condition_value;
        break;
      case "lesson_completed":
        conditionMet = lessonsCompleted >= badge.condition_value;
        break;
      case "streak_days":
        conditionMet = streakDays >= badge.condition_value;
        break;
      case "total_xp":
        conditionMet = xp >= badge.condition_value;
        break;
      case "score_improvement":
        conditionMet = (scoreImprovement || 0) >= badge.condition_value;
        break;
      case "mastered_topics":
        conditionMet = masteredTopics >= badge.condition_value;
        break;
      case "perfect_quiz":
        conditionMet = perfectQuiz === true;
        break;
      default:
        conditionMet = false;
    }

    if (conditionMet) {
      const awarded = await awardBadge(userId, badge.id);
      if (awarded) {
        newBadges.push(badge);
      }
    }
  }

  return newBadges;
};
