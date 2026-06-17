import { v4 as uuidv4 } from "uuid";
import pool from "../config/db.js";
import { getQuestionById } from "../models/questionModel.js";
import * as aiService from "../services/aiService.js";

// POST /api/explanation/question/:questionId
export const explain = async (req, res, next) => {
  try {
    const { questionId } = req.params;
    const { selectedAnswer } = req.body;
    const userId = req.user.id;
    const tier = req.user.subscription_tier;

    if (!selectedAnswer) {
      return res.status(400).json({ success: false, data: null, error: "selectedAnswer is required." });
    }

    const question = await getQuestionById(questionId);
    if (!question) {
      return res.status(404).json({ success: false, data: null, error: "Question not found." });
    }

    // Check if explanation already exists for this user+question
    const [existing] = await pool.execute(
      `SELECT * FROM explanations WHERE user_id = ? AND question_id = ? ORDER BY created_at DESC LIMIT 1`,
      [userId, questionId]
    );

    // If same answer was used before, return cached explanation
    if (existing.length > 0) {
      return res.status(200).json({
        success: true,
        data: {
          explanationId: existing[0].id,
          questionId,
          explanation: JSON.parse(existing[0].explanation_text),
          cached: true,
        },
        error: null,
      });
    }

    // Parse choices
    let choices = question.choices;
    if (typeof choices === "string") {
      try {
        choices = JSON.parse(choices);
      } catch {
        choices = [];
      }
    }

    const explanationData = await aiService.generateExplanation(
      userId,
      tier,
      question.question_text,
      selectedAnswer,
      question.correct_answer,
      choices
    );

    const explanationId = uuidv4();
    await pool.execute(
      `INSERT INTO explanations (id, user_id, question_id, explanation_text, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [explanationId, userId, questionId, JSON.stringify(explanationData)]
    );

    return res.status(200).json({
      success: true,
      data: {
        explanationId,
        questionId,
        explanation: explanationData,
        cached: false,
      },
      error: null,
    });
  } catch (err) {
    if (err.status === 429) {
      return res.status(429).json({ success: false, data: null, error: err.message });
    }
    next(err);
  }
};

// GET /api/explanation/question/:questionId
export const getExplanation = async (req, res, next) => {
  try {
    const { questionId } = req.params;
    const userId = req.user.id;

    const [rows] = await pool.execute(
      `SELECT * FROM explanations WHERE user_id = ? AND question_id = ? ORDER BY created_at DESC LIMIT 1`,
      [userId, questionId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, data: null, error: "No explanation found for this question." });
    }

    let explanationData;
    try {
      explanationData = JSON.parse(rows[0].explanation_text);
    } catch {
      explanationData = { text: rows[0].explanation_text };
    }

    return res.status(200).json({
      success: true,
      data: {
        explanationId: rows[0].id,
        questionId,
        explanation: explanationData,
        createdAt: rows[0].created_at,
      },
      error: null,
    });
  } catch (err) {
    next(err);
  }
};
