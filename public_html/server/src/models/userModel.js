import pool from "../config/db.js";

export const createUser = async (id, email, passwordHash, name) => {
  const [result] = await pool.execute(
    `INSERT INTO users (id, email, password_hash, name, created_at, updated_at)
     VALUES (?, ?, ?, ?, NOW(), NOW())`,
    [id, email, passwordHash, name]
  );
  return result;
};

export const findUserByEmail = async (email) => {
  const [rows] = await pool.execute(
    `SELECT id, email, password_hash, name, email_verified, subscription_tier, xp, streak_count, last_active_date, created_at, updated_at
     FROM users WHERE email = ? LIMIT 1`,
    [email]
  );
  return rows[0] || null;
};

export const findUserById = async (id) => {
  const [rows] = await pool.execute(
    `SELECT id, email, name, email_verified, subscription_tier, xp, streak_count, last_active_date, created_at, updated_at
     FROM users WHERE id = ? LIMIT 1`,
    [id]
  );
  return rows[0] || null;
};

export const updateUserXP = async (userId, xpAmount) => {
  const [result] = await pool.execute(
    `UPDATE users SET xp = xp + ?, updated_at = NOW() WHERE id = ?`,
    [xpAmount, userId]
  );
  return result;
};

export const updateUserStreak = async (userId, count, date) => {
  const [result] = await pool.execute(
    `UPDATE users SET streak_count = ?, last_active_date = ?, updated_at = NOW() WHERE id = ?`,
    [count, date, userId]
  );
  return result;
};

export const updateLastActive = async (userId, date) => {
  const [result] = await pool.execute(
    `UPDATE users SET last_active_date = ?, updated_at = NOW() WHERE id = ?`,
    [date, userId]
  );
  return result;
};

export const updatePassword = async (userId, passwordHash) => {
  const [result] = await pool.execute(
    `UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?`,
    [passwordHash, userId]
  );
  return result;
};

export const verifyEmail = async (userId) => {
  const [result] = await pool.execute(
    `UPDATE users SET email_verified = TRUE, updated_at = NOW() WHERE id = ?`,
    [userId]
  );
  return result;
};

export const updateUserName = async (userId, name) => {
  const [result] = await pool.execute(
    `UPDATE users SET name = ?, updated_at = NOW() WHERE id = ?`,
    [name, userId]
  );
  return result;
};
