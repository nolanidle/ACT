import { v4 as uuidv4 } from "uuid";
import pool from "../config/db.js";
import { createSession, getSessionById, updateSessionStatus } from "../models/sessionModel.js";
import { saveQuestions, getQuestionsBySession } from "../models/questionModel.js";
import { bulkSaveAnswers, getAnswersBySession } from "../models/answerModel.js";
import { updateUserXP } from "../models/userModel.js";
import { checkAndAwardBadges } from "../models/badgeModel.js";
import { analyzeSession } from "../services/skillAnalyzer.js";
import * as aiService from "../services/aiService.js";

// Scale score calculation for ACT (1-36 scale)
const calculateScaleScore = (rawScore, totalQuestions) => {
  if (totalQuestions === 0) return 1;
  const percentage = rawScore / totalQuestions;
  // ACT scale: roughly linear, 1-36
  const scaled = Math.round(1 + percentage * 35);
  return Math.min(36, Math.max(1, scaled));
};

// POST /api/diagnostic/generate
export const generate = async (req, res, next) => {
  try {
    const { test = "ACT", sections = ["english", "math", "reading", "science"], countPerSection = 10 } = req.body;
    const userId = req.user.id;
    const tier = req.user.subscription_tier;

    if (!Array.isArray(sections) || sections.length === 0) {
      return res.status(400).json({ success: false, data: null, error: "sections must be a non-empty array." });
    }

    const count = Math.min(Math.max(1, parseInt(countPerSection) || 10), 20);

    // Generate questions via AI
    const aiQuestions = await aiService.generateDiagnosticQuestions(
      userId,
      tier,
      test,
      sections,
      count
    );

    // Create one session per section (or one combined session for multi-section)
    const sessionId = uuidv4();
    const sectionString = sections.join(",");
    await createSession(sessionId, userId, test.toLowerCase(), sectionString, "diagnostic");

    // Prepare questions for insertion
    const questionsToSave = aiQuestions.map((q) => ({
      id: uuidv4(),
      practice_session_id: sessionId,
      passage_id: null,
      test: test.toLowerCase(),
      section: (q.section || sections[0]).toLowerCase(),
      topic: q.topic || "General",
      difficulty: q.difficulty || "medium",
      question_text: q.question_text,
      question_latex: q.question_latex || null,
      choices: q.choices,
      correct_answer: q.correct_answer,
      explanation: q.explanation,
      visual_json: q.visual_json || null,
    }));

    await saveQuestions(questionsToSave);

    // Return questions without correct answers
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
        sections,
        totalQuestions: clientQuestions.length,
        questions: clientQuestions,
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

// POST /api/diagnostic/submit
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

    // Get questions for this session
    const questions = await getQuestionsBySession(sessionId);
    const questionMap = {};
    for (const q of questions) {
      questionMap[q.id] = q;
    }

    // Score the answers
    let correct = 0;
    const answersToSave = [];
    const topicBreakdown = {};

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

      // Build topic breakdown
      const topicKey = `${question.section}|${question.topic}`;
      if (!topicBreakdown[topicKey]) {
        topicBreakdown[topicKey] = {
          section: question.section,
          topic: question.topic,
          total: 0,
          correct: 0,
        };
      }
      topicBreakdown[topicKey].total++;
      if (isCorrect) topicBreakdown[topicKey].correct++;
    }

    // Bulk save answers
    await bulkSaveAnswers(answersToSave);

    const totalAnswered = answersToSave.length;
    const scorePercent = totalAnswered > 0 ? Math.round((correct / totalAnswered) * 100) : 0;
    const scaleScore = calculateScaleScore(correct, totalAnswered);

    // Update session
    await updateSessionStatus(sessionId, "completed", scorePercent, scaleScore, timeSpentSeconds);

    // Analyze session for skill updates
    const analysis = await analyzeSession(sessionId, userId);

    // Award XP
    const XP_DIAGNOSTIC = 100;
    const totalXp = XP_DIAGNOSTIC + (analysis.xpEarned || 0);
    await updateUserXP(userId, totalXp);

    // Log XP event
    await pool.execute(
      `INSERT INTO xp_events (id, user_id, action, xp_amount, created_at) VALUES (?, ?, ?, ?, NOW())`,
      [uuidv4(), userId, "diagnostic_completed", totalXp]
    );

    // Check and award badges
    const newBadges = await checkAndAwardBadges(userId, {
      scoreImprovement: scaleScore > 20 ? 2 : 0,
    });

    // Format topic breakdown
    const topicResults = Object.values(topicBreakdown).map((t) => ({
      section: t.section,
      topic: t.topic,
      correct: t.correct,
      total: t.total,
      accuracy: t.total > 0 ? Math.round((t.correct / t.total) * 100) : 0,
    }));

    return res.status(200).json({
      success: true,
      data: {
        sessionId,
        score: scorePercent,
        scaleScore,
        correct,
        total: totalAnswered,
        topicBreakdown: topicResults,
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

// GET /api/diagnostic/:sessionId
export const getSession = async (req, res, next) => {
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

    return res.status(200).json({
      success: true,
      data: { session, questions, answers },
      error: null,
    });
  } catch (err) {
    next(err);
  }
};
