import { v4 as uuidv4 } from "uuid";
import pool from "../config/db.js";
import {
  createLesson,
  getLessonByIdForUser,
  getUserLessons,
  markLessonComplete,
} from "../models/lessonModel.js";
import { updateUserXP } from "../models/userModel.js";
import { upsertSkillMastery } from "../models/skillModel.js";
import { checkAndAwardBadges } from "../models/badgeModel.js";
import * as aiService from "../services/aiService.js";

// POST /api/lesson/generate
export const generate = async (req, res, next) => {
  try {
    const {
      test = "ACT",
      section,
      topic,
      difficulty = "medium",
      length = 6,
    } = req.body;

    const userId = req.user.id;
    const tier = req.user.subscription_tier;

    if (!section) {
      return res.status(400).json({ success: false, data: null, error: "section is required." });
    }
    if (!topic) {
      return res.status(400).json({ success: false, data: null, error: "topic is required." });
    }

    const blockLength = Math.min(Math.max(3, parseInt(length) || 6), 12);

    const lessonData = await aiService.generateLesson(
      userId,
      tier,
      test,
      section,
      topic,
      difficulty,
      blockLength
    );

    const lessonId = uuidv4();
    await createLesson(
      lessonId,
      userId,
      test.toLowerCase(),
      section.toLowerCase(),
      topic,
      difficulty,
      lessonData.blocks
    );

    return res.status(200).json({
      success: true,
      data: {
        lessonId,
        title: lessonData.title,
        topic: lessonData.topic || topic,
        test: test.toLowerCase(),
        section: section.toLowerCase(),
        difficulty,
        blocks: lessonData.blocks,
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

// POST /api/lesson/:lessonId/complete
export const complete = async (req, res, next) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user.id;

    const lesson = await getLessonByIdForUser(lessonId, userId);
    if (!lesson) {
      return res.status(404).json({ success: false, data: null, error: "Lesson not found." });
    }
    if (lesson.user_id !== userId) {
      return res.status(403).json({ success: false, data: null, error: "Forbidden." });
    }
    if (lesson.completed) {
      return res.status(200).json({
        success: true,
        data: { message: "Lesson already completed.", xpEarned: 0, newBadges: [] },
        error: null,
      });
    }

    await markLessonComplete(userId, lessonId);

    // Update skill mastery — lesson completion counts as getting it right
    await upsertSkillMastery(userId, lesson.test, lesson.section, lesson.topic, true);

    // Award XP
    const XP_LESSON = 25;
    await updateUserXP(userId, XP_LESSON);
    await pool.execute(
      `INSERT INTO xp_events (id, user_id, action, xp_amount, created_at) VALUES (?, ?, ?, ?, NOW())`,
      [uuidv4(), userId, "lesson_completed", XP_LESSON]
    );

    // Check badges
    const newBadges = await checkAndAwardBadges(userId, {});

    return res.status(200).json({
      success: true,
      data: {
        message: "Lesson completed!",
        xpEarned: XP_LESSON,
        newBadges,
      },
      error: null,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/lesson/:lessonId
export const getLesson = async (req, res, next) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user.id;

    const lesson = await getLessonByIdForUser(lessonId, userId);
    if (!lesson) {
      return res.status(404).json({ success: false, data: null, error: "Lesson not found." });
    }
    if (lesson.user_id !== userId) {
      return res.status(403).json({ success: false, data: null, error: "Forbidden." });
    }

    return res.status(200).json({
      success: true,
      data: lesson,
      error: null,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/lesson
export const getLessons = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const pageSize = Math.min(parseInt(req.query.pageSize) || 20, 50);

    const result = await getUserLessons(userId, page, pageSize);

    return res.status(200).json({
      success: true,
      data: result,
      error: null,
    });
  } catch (err) {
    next(err);
  }
};
