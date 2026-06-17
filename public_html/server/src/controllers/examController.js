import { v4 as uuidv4 } from "uuid";
import pool from "../config/db.js";
import { createSession, getSessionById, updateSessionStatus } from "../models/sessionModel.js";
import { saveQuestions, getQuestionsBySession } from "../models/questionModel.js";
import { bulkSaveAnswers, getAnswersBySession } from "../models/answerModel.js";
import { updateUserXP } from "../models/userModel.js";
import { checkAndAwardBadges } from "../models/badgeModel.js";
import { analyzeSession } from "../services/skillAnalyzer.js";
import * as aiService from "../services/aiService.js";

const calculateScaleScore = (rawScore, totalQuestions) => {
  if (totalQuestions === 0) return 1;
  const percentage = rawScore / totalQuestions;
  const scaled = Math.round(1 + percentage * 35);
  return Math.min(36, Math.max(1, scaled));
};

// GET /api/exam/generate  (SSE endpoint)
export const generate = async (req, res, next) => {
  const userId = req.user.id;
  const tier = req.user.subscription_tier;

  const requestedSections = req.query.sections
    ? req.query.sections.split(",").map((s) => s.toLowerCase().trim())
    : ["english", "math", "reading", "science"];

  const test = req.query.test || "ACT";

  // Set SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  const sendSSE = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  // Create a single exam session
  const sessionId = uuidv4();
  const sectionString = requestedSections.join(",");

  try {
    await createSession(sessionId, userId, test.toLowerCase(), sectionString, "exam");

    sendSSE({
      status: "started",
      sessionId,
      sections: requestedSections,
      totalSections: requestedSections.length,
      message: "Exam generation started",
    });

    const allQuestions = [];

    for (let i = 0; i < requestedSections.length; i++) {
      const section = requestedSections[i];

      sendSSE({
        status: "section_start",
        section,
        sectionIndex: i,
        totalSections: requestedSections.length,
        progress: i / requestedSections.length,
        message: `Generating ${section} section...`,
      });

      try {
        const sectionQuestions = await aiService.generateExamSection(
          userId,
          tier,
          test,
          section,
          res
        );

        // Prepare questions with session info
        const questionsToSave = sectionQuestions.map((q) => ({
          id: uuidv4(),
          practice_session_id: sessionId,
          passage_id: null,
          test: test.toLowerCase(),
          section: section.toLowerCase(),
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
        allQuestions.push(...questionsToSave);

        sendSSE({
          status: "section_complete",
          section,
          sectionIndex: i,
          totalSections: requestedSections.length,
          questionCount: questionsToSave.length,
          progress: (i + 1) / requestedSections.length,
          message: `${section} section complete: ${questionsToSave.length} questions`,
        });
      } catch (sectionErr) {
        sendSSE({
          status: "section_error",
          section,
          error: sectionErr.message,
          message: `Failed to generate ${section} section: ${sectionErr.message}`,
        });
      }
    }

    sendSSE({
      status: "complete",
      sessionId,
      totalQuestions: allQuestions.length,
      sections: requestedSections,
      message: "All sections generated. Exam is ready.",
    });

    res.end();
  } catch (err) {
    sendSSE({
      status: "error",
      error: err.message,
      message: `Exam generation failed: ${err.message}`,
    });
    res.end();
  }
};

// POST /api/exam/submit
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

    // Score by section
    const sectionScores = {};
    let totalCorrect = 0;
    const answersToSave = [];

    for (const answer of answers) {
      const question = questionMap[answer.questionId];
      if (!question) continue;

      const isCorrect = answer.selectedAnswer === question.correct_answer;
      if (isCorrect) totalCorrect++;

      if (!sectionScores[question.section]) {
        sectionScores[question.section] = { correct: 0, total: 0 };
      }
      sectionScores[question.section].total++;
      if (isCorrect) sectionScores[question.section].correct++;

      answersToSave.push({
        id: uuidv4(),
        userId,
        sessionId,
        questionId: answer.questionId,
        selectedAnswer: answer.selectedAnswer,
        isCorrect,
        timeSpent: answer.timeSpentSeconds || 0,
      });
    }

    await bulkSaveAnswers(answersToSave);

    const totalAnswered = answersToSave.length;
    const overallScore = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
    const overallScaleScore = calculateScaleScore(totalCorrect, totalAnswered);

    await updateSessionStatus(sessionId, "completed", overallScore, overallScaleScore, timeSpentSeconds);

    const analysis = await analyzeSession(sessionId, userId);

    // Calculate per-section scale scores
    const sectionResults = {};
    for (const [section, data] of Object.entries(sectionScores)) {
      sectionResults[section] = {
        correct: data.correct,
        total: data.total,
        score: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
        scaleScore: calculateScaleScore(data.correct, data.total),
      };
    }

    const XP_EXAM = 100;
    const totalXp = XP_EXAM + (analysis.xpEarned || 0);
    await updateUserXP(userId, totalXp);

    await pool.execute(
      `INSERT INTO xp_events (id, user_id, action, xp_amount, created_at) VALUES (?, ?, ?, ?, NOW())`,
      [uuidv4(), userId, "exam_completed", totalXp]
    );

    const newBadges = await checkAndAwardBadges(userId, {
      scoreImprovement: overallScaleScore > 20 ? 2 : 0,
    });

    return res.status(200).json({
      success: true,
      data: {
        sessionId,
        overallScore,
        overallScaleScore,
        totalCorrect,
        totalAnswered,
        sectionResults,
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

// GET /api/exam/:sessionId
export const getExamSession = async (req, res, next) => {
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
