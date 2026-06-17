import pool from "../config/db.js";

export const logUsage = async (id, userId, actionType, estimatedTokens) => {
  const [result] = await pool.execute(
    `INSERT INTO ai_usage (id, user_id, action_type, estimated_tokens, created_at)
     VALUES (?, ?, ?, ?, NOW())`,
    [id, userId, actionType, estimatedTokens || 0]
  );
  return result;
};

export const getDailyUsage = async (userId, actionType) => {
  const [rows] = await pool.execute(
    `SELECT COUNT(*) as count
     FROM ai_usage
     WHERE user_id = ? AND action_type = ? AND DATE(created_at) = CURDATE()`,
    [userId, actionType]
  );
  return rows[0].count;
};

export const getMonthlyUsage = async (userId, actionType) => {
  const [rows] = await pool.execute(
    `SELECT COUNT(*) as count
     FROM ai_usage
     WHERE user_id = ? AND action_type = ?
       AND YEAR(created_at) = YEAR(NOW())
       AND MONTH(created_at) = MONTH(NOW())`,
    [userId, actionType]
  );
  return rows[0].count;
};

export const getTodayUsageSummary = async (userId) => {
  const [rows] = await pool.execute(
    `SELECT action_type, COUNT(*) as count, SUM(estimated_tokens) as total_tokens
     FROM ai_usage
     WHERE user_id = ? AND DATE(created_at) = CURDATE()
     GROUP BY action_type`,
    [userId]
  );
  return rows;
};

export const resetDailyUsage = async () => {
  // Delete usage records older than today (they've been accounted for, daily counts reset naturally via DATE filter)
  // This actually deletes records older than 30 days to keep the table clean
  const [result] = await pool.execute(
    `DELETE FROM ai_usage WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)`
  );
  return result;
};

export const getAllTimeUsageByUser = async (userId) => {
  const [rows] = await pool.execute(
    `SELECT action_type, COUNT(*) as count, SUM(estimated_tokens) as total_tokens
     FROM ai_usage
     WHERE user_id = ?
     GROUP BY action_type`,
    [userId]
  );
  return rows;
};
