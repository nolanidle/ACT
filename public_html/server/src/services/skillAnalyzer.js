import { getAnswersBySession } from "../models/answerModel.js";
import { upsertSkillMastery } from "../models/skillModel.js";
import pool from "../config/db.js";

export const getMasteryLevel = (accuracy, totalQuestions) => {
  if (totalQuestions === 0) return "not_started";
  if (totalQuestions < 5) return "learning";
  if (accuracy >= 90) return "mastered";
  if (accuracy >= 75) return "proficient";
  if (accuracy >= 50) return "practicing";
  return "learning";
};

export const analyzeSession = async (sessionId, userId) => {
  // Get all answers with topic/section/test info joined
  const answers = await getAnswersBySession(sessionId);

  if (!answers || answers.length === 0) {
    return { weakTopics: [], improvedTopics: [], xpEarned: 0 };
  }

  // Group by topic
  const topicMap = {};
  for (const answer of answers) {
    const key = `${answer.test}|${answer.section}|${answer.topic}`;
    if (!topicMap[key]) {
      topicMap[key] = {
        test: answer.test,
        section: answer.section,
        topic: answer.topic,
        total: 0,
        correct: 0,
      };
    }
    topicMap[key].total++;
    if (answer.is_correct) topicMap[key].correct++;
  }

  // Get previous skill mastery for comparison
  const [previousSkills] = await pool.execute(
    `SELECT topic, section, test, accuracy, mastery_level FROM skill_mastery WHERE user_id = ?`,
    [userId]
  );
  const prevSkillMap = {};
  for (const s of previousSkills) {
    prevSkillMap[`${s.test}|${s.section}|${s.topic}`] = s;
  }

  const weakTopics = [];
  const improvedTopics = [];

  // Update skill mastery for each topic
  for (const [key, data] of Object.entries(topicMap)) {
    const prevSkill = prevSkillMap[key];
    const prevAccuracy = prevSkill ? parseFloat(prevSkill.accuracy) : 0;

    // Update each answer individually for the model
    for (const answer of answers) {
      if (`${answer.test}|${answer.section}|${answer.topic}` === key) {
        await upsertSkillMastery(userId, data.test, data.section, data.topic, answer.is_correct);
      }
    }

    const newAccuracy = (data.correct / data.total) * 100;

    if (newAccuracy < 60) {
      weakTopics.push({
        topic: data.topic,
        section: data.section,
        test: data.test,
        accuracy: Math.round(newAccuracy),
      });
    }

    if (prevSkill && newAccuracy > prevAccuracy + 10) {
      improvedTopics.push({
        topic: data.topic,
        section: data.section,
        test: data.test,
        previousAccuracy: Math.round(prevAccuracy),
        newAccuracy: Math.round(newAccuracy),
      });
    }
  }

  // Calculate XP: 5 XP per correct answer
  const totalCorrect = answers.filter((a) => a.is_correct).length;
  const xpEarned = totalCorrect * 5;

  return {
    weakTopics: weakTopics.sort((a, b) => a.accuracy - b.accuracy),
    improvedTopics,
    xpEarned,
    totalAnswers: answers.length,
    totalCorrect,
    accuracy: answers.length > 0 ? Math.round((totalCorrect / answers.length) * 100) : 0,
  };
};
