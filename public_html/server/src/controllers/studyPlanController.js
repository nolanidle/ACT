import { v4 as uuidv4 } from "uuid";
import pool from "../config/db.js";
import { getWeakSkills } from "../models/skillModel.js";
import * as aiService from "../services/aiService.js";

// POST /api/study-plan/generate
export const generate = async (req, res, next) => {
  try {
    const { targetDate = null, planType = "follow" } = req.body;
    const userId = req.user.id;
    const tier = req.user.subscription_tier;

    // Get user's weak skills to personalize the plan
    const weakSkills = await getWeakSkills(userId, 10);

    const planData = await aiService.generateStudyPlan(userId, tier, weakSkills, targetDate);

    // Deactivate existing plans
    await pool.execute(
      `UPDATE study_plans SET active = FALSE WHERE user_id = ?`,
      [userId]
    );

    const planId = uuidv4();
    await pool.execute(
      `INSERT INTO study_plans (id, user_id, plan_type, content, target_date, active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, TRUE, NOW(), NOW())`,
      [planId, userId, planType, JSON.stringify(planData), targetDate || null]
    );

    return res.status(200).json({
      success: true,
      data: {
        planId,
        planType,
        targetDate,
        plan: planData,
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

// GET /api/study-plan/active
export const getActivePlan = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [rows] = await pool.execute(
      `SELECT * FROM study_plans WHERE user_id = ? AND active = TRUE ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, data: null, error: "No active study plan found." });
    }

    const plan = rows[0];
    let content;
    try {
      content = typeof plan.content === "string" ? JSON.parse(plan.content) : plan.content;
    } catch {
      content = plan.content;
    }

    return res.status(200).json({
      success: true,
      data: {
        planId: plan.id,
        planType: plan.plan_type,
        targetDate: plan.target_date,
        active: plan.active,
        createdAt: plan.created_at,
        updatedAt: plan.updated_at,
        plan: content,
      },
      error: null,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/study-plan/progress
export const updateProgress = async (req, res, next) => {
  try {
    const { planId, weekNumber, day, taskIndex, completed } = req.body;
    const userId = req.user.id;

    if (!planId || weekNumber === undefined || !day || taskIndex === undefined) {
      return res.status(400).json({
        success: false,
        data: null,
        error: "planId, weekNumber, day, and taskIndex are required.",
      });
    }

    const [rows] = await pool.execute(
      `SELECT * FROM study_plans WHERE id = ? AND user_id = ? LIMIT 1`,
      [planId, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, data: null, error: "Study plan not found." });
    }

    const plan = rows[0];
    let content;
    try {
      content = typeof plan.content === "string" ? JSON.parse(plan.content) : plan.content;
    } catch {
      return res.status(500).json({ success: false, data: null, error: "Failed to parse study plan content." });
    }

    // Navigate to the task and mark it
    const week = content.weeks && content.weeks[weekNumber - 1];
    if (!week) {
      return res.status(400).json({ success: false, data: null, error: "Week not found in plan." });
    }

    const dayData = week.days && week.days[day.toLowerCase()];
    if (!dayData) {
      return res.status(400).json({ success: false, data: null, error: `Day '${day}' not found in week ${weekNumber}.` });
    }

    if (!dayData.tasks || taskIndex >= dayData.tasks.length) {
      return res.status(400).json({ success: false, data: null, error: "Task index out of range." });
    }

    dayData.tasks[taskIndex].completed = completed !== false;
    dayData.tasks[taskIndex].completedAt = completed !== false ? new Date().toISOString() : null;

    // Save updated content
    await pool.execute(
      `UPDATE study_plans SET content = ?, updated_at = NOW() WHERE id = ?`,
      [JSON.stringify(content), planId]
    );

    return res.status(200).json({
      success: true,
      data: {
        message: `Task ${completed !== false ? "completed" : "uncompleted"} successfully.`,
        weekNumber,
        day,
        taskIndex,
        completed: completed !== false,
      },
      error: null,
    });
  } catch (err) {
    next(err);
  }
};
