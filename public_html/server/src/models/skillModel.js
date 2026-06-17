import pool from "../config/db.js";
import { v4 as uuidv4 } from "uuid";

const getMasteryLevel = (accuracy, totalQuestions) => {
  if (totalQuestions === 0) return "not_started";
  if (totalQuestions < 5) return "learning";
  if (accuracy >= 90) return "mastered";
  if (accuracy >= 75) return "proficient";
  if (accuracy >= 50) return "practicing";
  return "learning";
};

export const upsertSkillMastery = async (userId, test, section, topic, isCorrect) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Check if record exists
    const [existing] = await conn.execute(
      `SELECT id, total_questions, correct_questions FROM skill_mastery
       WHERE user_id = ? AND test = ? AND section = ? AND topic = ? LIMIT 1`,
      [userId, test, section, topic]
    );

    let total, correct;

    if (existing.length > 0) {
      total = existing[0].total_questions + 1;
      correct = existing[0].correct_questions + (isCorrect ? 1 : 0);
      const accuracy = (correct / total) * 100;
      const mastery = getMasteryLevel(accuracy, total);

      await conn.execute(
        `UPDATE skill_mastery
         SET total_questions = ?, correct_questions = ?, accuracy = ?, mastery_level = ?,
             last_practiced = NOW(), updated_at = NOW()
         WHERE user_id = ? AND test = ? AND section = ? AND topic = ?`,
        [total, correct, accuracy.toFixed(2), mastery, userId, test, section, topic]
      );
    } else {
      total = 1;
      correct = isCorrect ? 1 : 0;
      const accuracy = (correct / total) * 100;
      const mastery = getMasteryLevel(accuracy, total);
      const id = uuidv4();

      await conn.execute(
        `INSERT INTO skill_mastery
          (id, user_id, test, section, topic, total_questions, correct_questions, accuracy, mastery_level, last_practiced, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW())`,
        [id, userId, test, section, topic, total, correct, accuracy.toFixed(2), mastery]
      );
    }

    await conn.commit();
    return { total, correct };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

export const getUserSkills = async (userId) => {
  const [rows] = await pool.execute(
    `SELECT * FROM skill_mastery WHERE user_id = ? ORDER BY section, topic`,
    [userId]
  );
  return rows;
};

export const getWeakSkills = async (userId, limit = 5) => {
  const [rows] = await pool.execute(
    `SELECT * FROM skill_mastery
     WHERE user_id = ? AND total_questions > 0
     ORDER BY accuracy ASC, total_questions DESC
     LIMIT ?`,
    [userId, limit]
  );
  return rows;
};

export const getSkillByTopic = async (userId, test, section, topic) => {
  const [rows] = await pool.execute(
    `SELECT * FROM skill_mastery
     WHERE user_id = ? AND test = ? AND section = ? AND topic = ? LIMIT 1`,
    [userId, test, section, topic]
  );
  return rows[0] || null;
};

export const getMasteredTopicsCount = async (userId) => {
  const [rows] = await pool.execute(
    `SELECT COUNT(*) as count FROM skill_mastery
     WHERE user_id = ? AND mastery_level = 'mastered'`,
    [userId]
  );
  return rows[0].count;
};
