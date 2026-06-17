import pool from "../config/db.js";

export const createSession = async (id, userId, test, section, sessionType) => {
  const [result] = await pool.execute(
    `INSERT INTO practice_sessions (id, user_id, test, section, session_type, status, created_at)
     VALUES (?, ?, ?, ?, ?, 'active', NOW())`,
    [id, userId, test, section, sessionType]
  );
  return result;
};

export const getSessionById = async (id) => {
  const [rows] = await pool.execute(
    `SELECT * FROM practice_sessions WHERE id = ? LIMIT 1`,
    [id]
  );
  return rows[0] || null;
};

export const updateSessionStatus = async (id, status, score, scaleScore, timeSpent) => {
  const completedAt = status === "completed" ? "NOW()" : "NULL";
  const [result] = await pool.execute(
    `UPDATE practice_sessions
     SET status = ?, score = ?, scale_score = ?, time_spent_seconds = ?,
         completed_at = ${completedAt === "NOW()" ? "NOW()" : "NULL"}
     WHERE id = ?`,
    [status, score, scaleScore, timeSpent, id]
  );
  return result;
};

export const getUserSessions = async (userId, limit = 20) => {
  const [rows] = await pool.execute(
    `SELECT * FROM practice_sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT ?`,
    [userId, limit]
  );
  return rows;
};

export const getSessionsByType = async (userId, sessionType) => {
  const [rows] = await pool.execute(
    `SELECT * FROM practice_sessions WHERE user_id = ? AND session_type = ? ORDER BY created_at DESC`,
    [userId, sessionType]
  );
  return rows;
};

export const getCompletedSessions = async (userId) => {
  const [rows] = await pool.execute(
    `SELECT * FROM practice_sessions WHERE user_id = ? AND status = 'completed' ORDER BY completed_at DESC`,
    [userId]
  );
  return rows;
};
