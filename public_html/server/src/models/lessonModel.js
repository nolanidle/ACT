import pool from "../config/db.js";
import { v4 as uuidv4 } from "uuid";

export const createLesson = async (id, userId, test, section, topic, difficulty, blocks) => {
  const [result] = await pool.execute(
    `INSERT INTO lessons (id, user_id, test, section, topic, difficulty, blocks, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
    [id, userId, test, section, topic, difficulty, JSON.stringify(blocks)]
  );
  return result;
};

export const getLessonById = async (id) => {
  const [rows] = await pool.execute(
    `SELECT l.*, lp.completed, lp.completed_at
     FROM lessons l
     LEFT JOIN lesson_progress lp ON l.id = lp.lesson_id AND lp.user_id = l.user_id
     WHERE l.id = ? LIMIT 1`,
    [id]
  );
  return rows[0] || null;
};

export const getLessonByIdForUser = async (id, userId) => {
  const [rows] = await pool.execute(
    `SELECT l.*, lp.completed, lp.completed_at
     FROM lessons l
     LEFT JOIN lesson_progress lp ON l.id = lp.lesson_id AND lp.user_id = ?
     WHERE l.id = ? LIMIT 1`,
    [userId, id]
  );
  return rows[0] || null;
};

export const getUserLessons = async (userId, page = 1, pageSize = 20) => {
  const offset = (page - 1) * pageSize;
  const [rows] = await pool.execute(
    `SELECT l.*, lp.completed, lp.completed_at
     FROM lessons l
     LEFT JOIN lesson_progress lp ON l.id = lp.lesson_id AND lp.user_id = ?
     WHERE l.user_id = ?
     ORDER BY l.created_at DESC
     LIMIT ? OFFSET ?`,
    [userId, userId, pageSize, offset]
  );

  const [countRows] = await pool.execute(
    `SELECT COUNT(*) as total FROM lessons WHERE user_id = ?`,
    [userId]
  );

  return {
    lessons: rows,
    total: countRows[0].total,
    page,
    pageSize,
  };
};

export const markLessonComplete = async (userId, lessonId) => {
  // Check if progress record exists
  const [existing] = await pool.execute(
    `SELECT id FROM lesson_progress WHERE user_id = ? AND lesson_id = ? LIMIT 1`,
    [userId, lessonId]
  );

  if (existing.length > 0) {
    const [result] = await pool.execute(
      `UPDATE lesson_progress SET completed = TRUE, completed_at = NOW() WHERE user_id = ? AND lesson_id = ?`,
      [userId, lessonId]
    );
    return result;
  } else {
    const progressId = uuidv4();
    const [result] = await pool.execute(
      `INSERT INTO lesson_progress (id, user_id, lesson_id, completed, completed_at, created_at)
       VALUES (?, ?, ?, TRUE, NOW(), NOW())`,
      [progressId, userId, lessonId]
    );
    return result;
  }
};

export const getLessonProgress = async (userId) => {
  const [rows] = await pool.execute(
    `SELECT lp.*, l.topic, l.section, l.test
     FROM lesson_progress lp
     JOIN lessons l ON lp.lesson_id = l.id
     WHERE lp.user_id = ? AND lp.completed = TRUE
     ORDER BY lp.completed_at DESC`,
    [userId]
  );
  return rows;
};
