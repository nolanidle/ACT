import pool from "../config/db.js";

export const saveQuestions = async (questions) => {
  if (!questions || questions.length === 0) return [];

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const insertedIds = [];
    for (const q of questions) {
      await conn.execute(
        `INSERT INTO questions
          (id, practice_session_id, passage_id, test, section, topic, difficulty,
           question_text, question_latex, choices, correct_answer, explanation, visual_json,
           flagged, invalid, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, FALSE, FALSE, NOW())`,
        [
          q.id,
          q.practice_session_id,
          q.passage_id || null,
          q.test,
          q.section,
          q.topic,
          q.difficulty,
          q.question_text,
          q.question_latex || null,
          JSON.stringify(q.choices),
          q.correct_answer,
          q.explanation,
          q.visual_json ? JSON.stringify(q.visual_json) : null,
        ]
      );
      insertedIds.push(q.id);
    }

    await conn.commit();
    return insertedIds;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

export const getQuestionsBySession = async (sessionId) => {
  const [rows] = await pool.execute(
    `SELECT * FROM questions WHERE practice_session_id = ? ORDER BY created_at ASC`,
    [sessionId]
  );
  return rows;
};

export const getQuestionById = async (id) => {
  const [rows] = await pool.execute(
    `SELECT * FROM questions WHERE id = ? LIMIT 1`,
    [id]
  );
  return rows[0] || null;
};

export const flagQuestion = async (id, flagged) => {
  const [result] = await pool.execute(
    `UPDATE questions SET flagged = ? WHERE id = ?`,
    [flagged ? 1 : 0, id]
  );
  return result;
};

export const markQuestionInvalid = async (id) => {
  const [result] = await pool.execute(
    `UPDATE questions SET invalid = TRUE WHERE id = ?`,
    [id]
  );
  return result;
};
