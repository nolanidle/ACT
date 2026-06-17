import { Ollama } from "ollama";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import pool from "../config/db.js";
import { diagnosticPrompt } from "../prompts/diagnosticPrompt.js";
import { quizPrompt } from "../prompts/quizPrompt.js";
import { lessonPrompt } from "../prompts/lessonPrompt.js";
import { explanationPrompt } from "../prompts/explanationPrompt.js";
import { studyPlanPrompt } from "../prompts/studyPlanPrompt.js";
import { validateBatch } from "./questionValidator.js";

dotenv.config();

// ─── Ollama client ─────────────────────────────────────────────────────────────
const ollama = new Ollama({
  host: process.env.OLLAMA_HOST || "https://ollama.com",
  headers: { Authorization: "Bearer " + process.env.OLLAMA_API_KEY },
});

const MODEL = process.env.AI_MODEL || "gemma4:31b";

// ─── Daily limits per tier ─────────────────────────────────────────────────────
const LIMITS = {
  free: {
    generation: 3,
    explanation: 5,
    diagnostic: 1, // per month
  },
  premium: {
    generation: 25,
    explanation: 50,
    diagnostic: 10,
  },
};

// ─── Enforce rate limits ───────────────────────────────────────────────────────
const enforceLimit = async (userId, actionType, tier = "free") => {
  const tierLimits = LIMITS[tier] || LIMITS.free;

  if (actionType === "diagnostic") {
    // Monthly limit for diagnostics
    const [rows] = await pool.execute(
      `SELECT COUNT(*) as count FROM ai_usage
       WHERE user_id = ? AND action_type = ?
         AND YEAR(created_at) = YEAR(NOW())
         AND MONTH(created_at) = MONTH(NOW())`,
      [userId, actionType]
    );
    const count = rows[0].count;
    const limit = tierLimits.diagnostic;
    if (count >= limit) {
      const err = new Error(
        `Monthly diagnostic limit reached (${limit}/month for ${tier} tier). Upgrade for more.`
      );
      err.status = 429;
      throw err;
    }
  } else {
    // Daily limit for all other actions
    const [rows] = await pool.execute(
      `SELECT COUNT(*) as count FROM ai_usage
       WHERE user_id = ? AND action_type = ? AND DATE(created_at) = CURDATE()`,
      [userId, actionType]
    );
    const count = rows[0].count;
    const limit = tierLimits[actionType] ?? tierLimits.generation;
    if (count >= limit) {
      const err = new Error(
        `Daily ${actionType} limit reached (${limit}/day for ${tier} tier). Try again tomorrow or upgrade.`
      );
      err.status = 429;
      throw err;
    }
  }
};

// ─── Log usage ─────────────────────────────────────────────────────────────────
const logUsage = async (userId, actionType, estimatedTokens = 0) => {
  const id = uuidv4();
  await pool.execute(
    `INSERT INTO ai_usage (id, user_id, action_type, estimated_tokens, created_at)
     VALUES (?, ?, ?, ?, NOW())`,
    [id, userId, actionType, estimatedTokens]
  );
};

// ─── Call Ollama ───────────────────────────────────────────────────────────────
const callOllama = async (messages, stream = false) => {
  const response = await ollama.chat({
    model: MODEL,
    messages,
    stream,
    options: {
      temperature: 0.7,
      num_predict: 8192,
    },
  });
  return response;
};

// ─── Parse JSON from model output ─────────────────────────────────────────────
const parseJSON = (raw) => {
  if (!raw || typeof raw !== "string") {
    throw new Error("AI returned empty response");
  }

  // Strip any accidental markdown fencing
  let cleaned = raw.trim();
  if (cleaned.startsWith("```json")) cleaned = cleaned.slice(7);
  else if (cleaned.startsWith("```")) cleaned = cleaned.slice(3);
  if (cleaned.endsWith("```")) cleaned = cleaned.slice(0, -3);
  cleaned = cleaned.trim();

  try {
    return JSON.parse(cleaned);
  } catch (e) {
    // Try to find JSON object in the response
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e2) {
        throw new Error(`Failed to parse AI JSON response: ${e2.message}`);
      }
    }
    throw new Error(`Failed to parse AI JSON response: ${e.message}`);
  }
};

// ─── Retry prompt — stricter ───────────────────────────────────────────────────
const buildRetryMessages = (originalMessages, parseError) => {
  return [
    ...originalMessages,
    {
      role: "assistant",
      content: "I apologize, my previous response was not valid JSON.",
    },
    {
      role: "user",
      content: `Your previous response caused a JSON parse error: "${parseError}".
Please respond with ONLY the raw JSON object. Absolutely no text before or after the JSON. No markdown. No backticks. No explanation. Just the JSON.`,
    },
  ];
};

// ─── Generate diagnostic questions ────────────────────────────────────────────
export const generateDiagnosticQuestions = async (
  userId,
  tier,
  test,
  sections,
  countPerSection
) => {
  await enforceLimit(userId, "diagnostic", tier);

  const messages = diagnosticPrompt(test, sections, countPerSection);

  let raw;
  try {
    const response = await callOllama(messages);
    raw = response.message.content;
  } catch (err) {
    throw new Error(`AI generation failed: ${err.message}`);
  }

  let parsed;
  try {
    parsed = parseJSON(raw);
  } catch (parseErr) {
    // Retry once with stricter prompt
    try {
      const retryMessages = buildRetryMessages(messages, parseErr.message);
      const retryResponse = await callOllama(retryMessages);
      parsed = parseJSON(retryResponse.message.content);
    } catch (retryErr) {
      throw new Error(`AI returned invalid JSON after retry: ${retryErr.message}`);
    }
  }

  if (!parsed.questions || !Array.isArray(parsed.questions)) {
    throw new Error("AI response missing questions array");
  }

  const estimatedTokens = Math.ceil(raw.length / 4);
  await logUsage(userId, "diagnostic", estimatedTokens);

  return parsed.questions;
};

// ─── Generate quiz ─────────────────────────────────────────────────────────────
export const generateQuiz = async (
  userId,
  tier,
  test,
  section,
  topic,
  difficulty,
  length,
  lessonContext = null
) => {
  await enforceLimit(userId, "generation", tier);

  const messages = quizPrompt(test, section, topic, difficulty, length, lessonContext);

  let raw;
  try {
    const response = await callOllama(messages);
    raw = response.message.content;
  } catch (err) {
    throw new Error(`AI generation failed: ${err.message}`);
  }

  let parsed;
  try {
    parsed = parseJSON(raw);
  } catch (parseErr) {
    try {
      const retryMessages = buildRetryMessages(messages, parseErr.message);
      const retryResponse = await callOllama(retryMessages);
      parsed = parseJSON(retryResponse.message.content);
    } catch (retryErr) {
      throw new Error(`AI returned invalid JSON after retry: ${retryErr.message}`);
    }
  }

  if (!parsed.questions || !Array.isArray(parsed.questions)) {
    throw new Error("AI response missing questions array");
  }

  const { valid, invalid } = validateBatch(parsed.questions, section);

  const estimatedTokens = Math.ceil(raw.length / 4);
  await logUsage(userId, "generation", estimatedTokens);

  return { questions: valid, invalidCount: invalid.length };
};

// ─── Generate lesson ───────────────────────────────────────────────────────────
export const generateLesson = async (userId, tier, test, section, topic, difficulty, length) => {
  await enforceLimit(userId, "generation", tier);

  const messages = lessonPrompt(test, section, topic, difficulty, length);

  let raw;
  try {
    const response = await callOllama(messages);
    raw = response.message.content;
  } catch (err) {
    throw new Error(`AI generation failed: ${err.message}`);
  }

  let parsed;
  try {
    parsed = parseJSON(raw);
  } catch (parseErr) {
    try {
      const retryMessages = buildRetryMessages(messages, parseErr.message);
      const retryResponse = await callOllama(retryMessages);
      parsed = parseJSON(retryResponse.message.content);
    } catch (retryErr) {
      throw new Error(`AI returned invalid JSON after retry: ${retryErr.message}`);
    }
  }

  if (!parsed.blocks || !Array.isArray(parsed.blocks)) {
    throw new Error("AI response missing blocks array");
  }

  const estimatedTokens = Math.ceil(raw.length / 4);
  await logUsage(userId, "generation", estimatedTokens);

  return parsed;
};

// ─── Generate exam section with SSE streaming ──────────────────────────────────
export const generateExamSection = async (userId, tier, test, section, res) => {
  await enforceLimit(userId, "generation", tier);

  const sectionConfig = {
    english: { count: 50, time: 35 },
    math: { count: 45, time: 50 },
    reading: { count: 36, time: 40 },
    science: { count: 40, time: 40 },
  };

  const config = sectionConfig[section.toLowerCase()] || { count: 40, time: 40 };

  const messages = diagnosticPrompt(test, [section], config.count);

  // Send SSE progress update
  const sendSSE = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  sendSSE({
    status: "generating",
    section,
    progress: 0.1,
    message: `Starting generation of ${config.count} ${section} questions...`,
  });

  let fullContent = "";

  try {
    const streamResponse = await callOllama(messages, true);

    let chunkCount = 0;
    for await (const chunk of streamResponse) {
      if (chunk.message && chunk.message.content) {
        fullContent += chunk.message.content;
        chunkCount++;

        // Send progress every 10 chunks
        if (chunkCount % 10 === 0) {
          const progress = Math.min(0.9, 0.1 + chunkCount * 0.005);
          sendSSE({
            status: "generating",
            section,
            progress,
            message: `Generating ${section} questions...`,
          });
        }
      }

      if (chunk.done) break;
    }
  } catch (streamErr) {
    // Fall back to non-streaming
    sendSSE({ status: "generating", section, progress: 0.5, message: "Processing..." });
    const response = await callOllama(messages, false);
    fullContent = response.message.content;
  }

  sendSSE({ status: "parsing", section, progress: 0.92, message: "Parsing questions..." });

  let parsed;
  try {
    parsed = parseJSON(fullContent);
  } catch (parseErr) {
    sendSSE({ status: "retrying", section, progress: 0.94, message: "Refining output..." });
    try {
      const retryMessages = buildRetryMessages(messages, parseErr.message);
      const retryResponse = await callOllama(retryMessages, false);
      parsed = parseJSON(retryResponse.message.content);
    } catch (retryErr) {
      throw new Error(`Failed to parse ${section} questions: ${retryErr.message}`);
    }
  }

  if (!parsed.questions || !Array.isArray(parsed.questions)) {
    throw new Error(`AI response for ${section} missing questions array`);
  }

  const { valid } = validateBatch(parsed.questions, section);

  const estimatedTokens = Math.ceil(fullContent.length / 4);
  await logUsage(userId, "generation", estimatedTokens);

  sendSSE({
    status: "complete",
    section,
    progress: 1.0,
    message: `Generated ${valid.length} ${section} questions`,
    questionCount: valid.length,
  });

  return valid;
};

// ─── Generate explanation ──────────────────────────────────────────────────────
export const generateExplanation = async (
  userId,
  tier,
  questionText,
  selectedAnswer,
  correctAnswer,
  choices
) => {
  await enforceLimit(userId, "explanation", tier);

  const messages = explanationPrompt(questionText, selectedAnswer, correctAnswer, choices);

  let raw;
  try {
    const response = await callOllama(messages);
    raw = response.message.content;
  } catch (err) {
    throw new Error(`AI generation failed: ${err.message}`);
  }

  let parsed;
  try {
    parsed = parseJSON(raw);
  } catch (parseErr) {
    try {
      const retryMessages = buildRetryMessages(messages, parseErr.message);
      const retryResponse = await callOllama(retryMessages);
      parsed = parseJSON(retryResponse.message.content);
    } catch (retryErr) {
      throw new Error(`AI returned invalid JSON after retry: ${retryErr.message}`);
    }
  }

  const estimatedTokens = Math.ceil(raw.length / 4);
  await logUsage(userId, "explanation", estimatedTokens);

  return parsed;
};

// ─── Analyze weak skills ───────────────────────────────────────────────────────
export const analyzeWeakSkills = async (userId, userAnswers) => {
  // Group answers by topic and calculate accuracy
  const topicMap = {};

  for (const answer of userAnswers) {
    const key = `${answer.test || "act"}|${answer.section}|${answer.topic}`;
    if (!topicMap[key]) {
      topicMap[key] = {
        test: answer.test || "act",
        section: answer.section,
        topic: answer.topic,
        total: 0,
        correct: 0,
      };
    }
    topicMap[key].total++;
    if (answer.is_correct) topicMap[key].correct++;
  }

  const skills = Object.values(topicMap).map((t) => ({
    ...t,
    accuracy: t.total > 0 ? Math.round((t.correct / t.total) * 100) : 0,
  }));

  const weakSkills = skills
    .filter((s) => s.accuracy < 70)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 10);

  return weakSkills;
};

// ─── Generate study plan ───────────────────────────────────────────────────────
export const generateStudyPlan = async (userId, tier, weakSkills, targetDate) => {
  await enforceLimit(userId, "generation", tier);

  const messages = studyPlanPrompt(weakSkills, targetDate);

  let raw;
  try {
    const response = await callOllama(messages);
    raw = response.message.content;
  } catch (err) {
    throw new Error(`AI generation failed: ${err.message}`);
  }

  let parsed;
  try {
    parsed = parseJSON(raw);
  } catch (parseErr) {
    try {
      const retryMessages = buildRetryMessages(messages, parseErr.message);
      const retryResponse = await callOllama(retryMessages);
      parsed = parseJSON(retryResponse.message.content);
    } catch (retryErr) {
      throw new Error(`AI returned invalid JSON after retry: ${retryErr.message}`);
    }
  }

  if (!parsed.weeks || !Array.isArray(parsed.weeks)) {
    throw new Error("AI response missing weeks array");
  }

  const estimatedTokens = Math.ceil(raw.length / 4);
  await logUsage(userId, "generation", estimatedTokens);

  return parsed;
};
