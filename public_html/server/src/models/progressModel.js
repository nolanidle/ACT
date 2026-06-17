import pool from "../config/db.js";

export const getScoreTrend = async (userId) => {
  const [rows] = await pool.execute(
    `SELECT
       DATE(completed_at) as date,
       section,
       AVG(score) as score
     FROM practice_sessions
     WHERE user_id = ? AND status = 'completed' AND score IS NOT NULL
     GROUP BY DATE(completed_at), section
     ORDER BY date ASC`,
    [userId]
  );
  return rows.map((r) => ({
    date: r.date,
    section: r.section,
    score: Math.round(r.score),
  }));
};

export const getStudyStats = async (userId) => {
  // Total questions answered
  const [qStats] = await pool.execute(
    `SELECT
       COUNT(*) as totalQuestions,
       SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correctQuestions
     FROM user_answers WHERE user_id = ?`,
    [userId]
  );

  // Lessons completed
  const [lStats] = await pool.execute(
    `SELECT COUNT(*) as lessonsCompleted
     FROM lesson_progress WHERE user_id = ? AND completed = TRUE`,
    [userId]
  );

  // Total time spent
  const [tStats] = await pool.execute(
    `SELECT COALESCE(SUM(time_spent_seconds), 0) as timeSpent
     FROM practice_sessions WHERE user_id = ? AND status = 'completed'`,
    [userId]
  );

  // Streak
  const [sStats] = await pool.execute(
    `SELECT current_streak, longest_streak FROM streaks WHERE user_id = ? LIMIT 1`,
    [userId]
  );

  return {
    totalQuestions: qStats[0].totalQuestions || 0,
    correctQuestions: qStats[0].correctQuestions || 0,
    lessonsCompleted: lStats[0].lessonsCompleted || 0,
    timeSpent: tStats[0].timeSpent || 0,
    streak: sStats.length > 0 ? sStats[0].current_streak : 0,
    longestStreak: sStats.length > 0 ? sStats[0].longest_streak : 0,
  };
};

export const getSkillBreakdown = async (userId) => {
  const [rows] = await pool.execute(
    `SELECT test, section, topic, accuracy, mastery_level, total_questions, correct_questions, last_practiced
     FROM skill_mastery
     WHERE user_id = ?
     ORDER BY section, accuracy ASC`,
    [userId]
  );
  return rows;
};

export const getRecentActivity = async (userId, limit = 10) => {
  const [rows] = await pool.execute(
    `SELECT
       ps.id,
       ps.session_type,
       ps.test,
       ps.section,
       ps.score,
       ps.scale_score,
       ps.status,
       ps.completed_at,
       ps.created_at,
       COUNT(ua.id) as question_count,
       SUM(CASE WHEN ua.is_correct = 1 THEN 1 ELSE 0 END) as correct_count
     FROM practice_sessions ps
     LEFT JOIN user_answers ua ON ps.id = ua.practice_session_id
     WHERE ps.user_id = ?
     GROUP BY ps.id
     ORDER BY ps.created_at DESC
     LIMIT ?`,
    [userId, limit]
  );
  return rows;
};

export const getCompositeScore = async (userId) => {
  // Get the most recent completed diagnostic or exam sessions per section
  const [rows] = await pool.execute(
    `SELECT section, scale_score, completed_at
     FROM practice_sessions
     WHERE user_id = ?
       AND status = 'completed'
       AND scale_score IS NOT NULL
       AND session_type IN ('diagnostic','exam')
     ORDER BY completed_at DESC`,
    [userId]
  );

  if (rows.length === 0) return null;

  // Get latest scale score per section
  const sectionScores = {};
  for (const row of rows) {
    if (!sectionScores[row.section]) {
      sectionScores[row.section] = row.scale_score;
    }
  }

  const scores = Object.values(sectionScores);
  if (scores.length === 0) return null;

  const composite = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  return { composite, sectionScores };
};
