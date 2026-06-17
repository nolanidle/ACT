import { v4 as uuidv4 } from "uuid";
import pool from "../config/db.js";
import { createSession, getSessionById, updateSessionStatus } from "../models/sessionModel.js";
import { saveQuestions, getQuestionsBySession } from "../models/questionModel.js";
import { bulkSaveAnswers, getAnswersBySession } from "../models/answerModel.js";
import { updateUserXP } from "../models/userModel.js";
import { checkAndAwardBadges } from "../models/badgeModel.js";
import { analyzeSession } from "../services/skillAnalyzer.js";
import * as aiService from "../services/aiService.js";

// POST /api/quiz/generate
export const generate = async (req, res, next) => {
  try {
    const {
      test = "ACT",
      section,
      topic,
      difficulty = "medium",
      length = 10,
      lessonContext = null,
    } = req.body;

    const userId = req.user.id;
    const tier = req.user.subscription_tier;

    if (!section) {
      return res.status(400).json({ success: false, data: null, error: "section is required." });
    }
    if (!topic) {
      return res.status(400).json({ success: false, data: null, error: "topic is required." });
    }

    const questionCount = Math.min(Math.max(1, parseInt(length) || 10), 30);

    const result = await aiService.generateQuiz(
      userId,
      tier,
      test,
      section,
      topic,
      difficulty,
      questionCount,
      lessonContext
    );

    const sessionId = uuidv4();
    await createSession(sessionId, userId, test.toLowerCase(), section.toLowerCase(), "quiz");

    const questionsToSave = result.questions.map((q) => ({
      id: uuidv4(),
      practice_session_id: sessionId,
      passage_id: null,
      test: test.toLowerCase(),
      section: section.toLowerCase(),
      topic: q.topic || topic,
      difficulty: q.difficulty || difficulty,
      question_text: q.question_text,
      question_latex: q.question_latex || null,
      choices: q.choices,
      correct_answer: q.correct_answer,
      explanation: q.explanation,
      visual_json: q.visual_json || null,
    }));

    await saveQuestions(questionsToSave);

    const clientQuestions = questionsToSave.map((q) => ({
      id: q.id,
      section: q.section,
      topic: q.topic,
      difficulty: q.difficulty,
      question_text: q.question_text,
      question_latex: q.question_latex,
      choices: q.choices,
      visual_json: q.visual_json,
    }));

    return res.status(200).json({
      success: true,
      data: {
        sessionId,
        test: test.toLowerCase(),
        section: section.toLowerCase(),
        topic,
        difficulty,
        totalQuestions: clientQuestions.length,
        questions: clientQuestions,
        invalidCount: result.invalidCount,
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

// POST /api/quiz/submit
export const submit = async (req, res, next) => {
  try {
    const { sessionId, answers, timeSpentSeconds = 0 } = req.body;
    const userId = req.user.id;

    if (!sessionId || !answers || !Array.isArray(answers)) {
      return res.status(400).json({ success: false, data: null, error: "sessionId and answers array are required." });
    }

    const session = await getSessionById(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, data: null, error: "Session not found." });
    }
    if (session.user_id !== userId) {
      return res.status(403).json({ success: false, data: null, error: "Forbidden." });
    }
    if (session.status === "completed") {
      return res.status(400).json({ success: false, data: null, error: "Session already submitted." });
    }

    const questions = await getQuestionsBySession(sessionId);
    const questionMap = {};
    for (const q of questions) {
      questionMap[q.id] = q;
    }

    let correct = 0;
    const answersToSave = [];
    const answersWithResults = [];

    for (const answer of answers) {
      const question = questionMap[answer.questionId];
      if (!question) continue;

      const isCorrect = answer.selectedAnswer === question.correct_answer;
      if (isCorrect) correct++;

      answersToSave.push({
        id: uuidv4(),
        userId,
        sessionId,
        questionId: answer.questionId,
        selectedAnswer: answer.selectedAnswer,
        isCorrect,
        timeSpent: answer.timeSpentSeconds || 0,
      });

      answersWithResults.push({
        questionId: answer.questionId,
        selectedAnswer: answer.selectedAnswer,
        correctAnswer: question.correct_answer,
        isCorrect,
        explanation: question.explanation,
        topic: question.topic,
        section: question.section,
      });
    }

    await bulkSaveAnswers(answersToSave);

    const totalAnswered = answersToSave.length;
    const scorePercent = totalAnswered > 0 ? Math.round((correct / totalAnswered) * 100) : 0;
    const isPerfect = totalAnswered > 0 && correct === totalAnswered;

    await updateSessionStatus(sessionId, "completed", scorePercent, null, timeSpentSeconds);

    const analysis = await analyzeSession(sessionId, userId);

    const XP_QUIZ = 20;
    const totalXp = XP_QUIZ + (analysis.xpEarned || 0);
    await updateUserXP(userId, totalXp);

    await pool.execute(
      `INSERT INTO xp_events (id, user_id, action, xp_amount, created_at) VALUES (?, ?, ?, ?, NOW())`,
      [uuidv4(), userId, "quiz_completed", totalXp]
    );

    const newBadges = await checkAndAwardBadges(userId, {
      perfectQuiz: isPerfect,
    });

    return res.status(200).json({
      success: true,
      data: {
        sessionId,
        score: scorePercent,
        correct,
        total: totalAnswered,
        isPerfect,
        answers: answersWithResults,
        weakTopics: analysis.weakTopics,
        improvedTopics: analysis.improvedTopics,
        xpEarned: totalXp,
        newBadges,
      },
      error: null,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/quiz/autosave
export const autosave = async (req, res, next) => {
  try {
    const { sessionId, answers } = req.body;
    const userId = req.user.id;

    if (!sessionId || !answers || !Array.isArray(answers)) {
      return res.status(400).json({ success: false, data: null, error: "sessionId and answers array are required." });
    }

    const session = await getSessionById(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, data: null, error: "Session not found." });
    }
    if (session.user_id !== userId) {
      return res.status(403).json({ success: false, data: null, error: "Forbidden." });
    }
    if (session.status === "completed") {
      return res.status(400).json({ success: false, data: null, error: "Session already completed." });
    }

    const questions = await getQuestionsBySession(sessionId);
    const questionMap = {};
    for (const q of questions) {
      questionMap[q.id] = q;
    }

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      for (const answer of answers) {
        const question = questionMap[answer.questionId];
        if (!question) continue;

        const isCorrect = answer.selectedAnswer === question.correct_answer;
        const answerId = uuidv4();

        await conn.execute(
          `INSERT INTO user_answers
            (id, user_id, practice_session_id, question_id, selected_answer, is_correct, time_spent_seconds, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
           ON DUPLICATE KEY UPDATE
             selected_answer = VALUES(selected_answer),
             is_correct = VALUES(is_correct),
             time_spent_seconds = VALUES(time_spent_seconds)`,
          [answerId, userId, sessionId, answer.questionId, answer.selectedAnswer, isCorrect ? 1 : 0, answer.timeSpentSeconds || 0]
        );
      }

      await conn.commit();
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }

    return res.status(200).json({
      success: true,
      data: { saved: answers.length, message: "Progress autosaved." },
      error: null,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/quiz/:sessionId
export const getQuizSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    const session = await getSessionById(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, data: null, error: "Session not found." });
    }
    if (session.user_id !== userId) {
      return res.status(403).json({ success: false, data: null, error: "Forbidden." });
    }

    const questions = await getQuestionsBySession(sessionId);
    const answers = session.status === "completed" ? await getAnswersBySession(sessionId) : [];

    // If not completed, strip correct answers from questions
    const clientQuestions =
      session.status === "completed"
        ? questions
        : questions.map(({ correct_answer, explanation, ...q }) => q);

    return res.status(200).json({
      success: true,
      data: { session, questions: clientQuestions, answers },
      error: null,
    });
  } catch (err) {
    next(err);
  }
};
