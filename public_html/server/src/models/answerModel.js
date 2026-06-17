import pool from "../config/db.js";

export const saveAnswer = async (id, userId, sessionId, questionId, selectedAnswer, isCorrect, timeSpent) => {
  const [result] = await pool.execute(
    `INSERT INTO user_answers
      (id, user_id, practice_session_id, question_id, selected_answer, is_correct, time_spent_seconds, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
    [id, userId, sessionId, questionId, selectedAnswer, isCorrect ? 1 : 0, timeSpent || 0]
  );
  return result;
};

export const getAnswersBySession = async (sessionId) => {
  const [rows] = await pool.execute(
    `SELECT ua.*, q.topic, q.section, q.test, q.difficulty
     FROM user_answers ua
     JOIN questions q ON ua.question_id = q.id
     WHERE ua.practice_session_id = ?
     ORDER BY ua.created_at ASC`,
    [sessionId]
  );
  return rows;
};

export const getAnswersByUser = async (userId) => {
  const [rows] = await pool.execute(
    `SELECT ua.*, q.topic, q.section, q.test, q.difficulty
     FROM user_answers ua
     JOIN questions q ON ua.question_id = q.id
     WHERE ua.user_id = ?
     ORDER BY ua.created_at DESC`,
    [userId]
  );
  return rows;
};

export const getAnswerBySessionAndQuestion = async (sessionId, questionId) => {
  const [rows] = await pool.execute(
    `SELECT * FROM user_answers WHERE practice_session_id = ? AND question_id = ? LIMIT 1`,
    [sessionId, questionId]
  );
  return rows[0] || null;
};

export const bulkSaveAnswers = async (answers) => {
  if (!answers || answers.length === 0) return [];

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    for (const a of answers) {
      await conn.execute(
        `INSERT INTO user_answers
          (id, user_id, practice_session_id, question_id, selected_answer, is_correct, time_spent_seconds, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
         ON DUPLICATE KEY UPDATE
           selected_answer = VALUES(selected_answer),
           is_correct = VALUES(is_correct),
           time_spent_seconds = VALUES(time_spent_seconds)`,
        [a.id, a.userId, a.sessionId, a.questionId, a.selectedAnswer, a.isCorrect ? 1 : 0, a.timeSpent || 0]
      );
    }

    await conn.commit();
    return true;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};
