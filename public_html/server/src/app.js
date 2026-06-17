import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import cron from "node-cron";
import { readFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

import pool from "./config/db.js";

import authRoutes from "./routes/auth.js";
import diagnosticRoutes from "./routes/diagnostic.js";
import quizRoutes from "./routes/quiz.js";
import lessonRoutes from "./routes/lesson.js";
import examRoutes from "./routes/exam.js";
import explanationRoutes from "./routes/explanation.js";
import progressRoutes from "./routes/progress.js";
import studyPlanRoutes from "./routes/studyPlan.js";
import userRoutes from "./routes/user.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/diagnostic", diagnosticRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/lesson", lessonRoutes);
app.use("/api/exam", examRoutes);
app.use("/api/explanation", explanationRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/study-plan", studyPlanRoutes);
app.use("/api/user", userRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ success: true, data: { status: "ok", timestamp: new Date().toISOString() }, error: null });
});

// ─── Static client (production) ───────────────────────────────────────────────
if (process.env.NODE_ENV === "production") {
  const clientDist = join(__dirname, "../../dist");
  app.use(express.static(clientDist));
  app.get("*", (req, res) => {
    res.sendFile(join(clientDist, "index.html"));
  });
}

// ─── Global error handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("[ERROR]", err.message);
  if (process.env.NODE_ENV === "development") {
    console.error(err.stack);
  }

  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal server error";

  res.status(status).json({
    success: false,
    data: null,
    error: message,
  });
});

// ─── Migration runner ──────────────────────────────────────────────────────────
const runMigrations = async () => {
  try {
    const migrationsDir = join(__dirname, "../migrations");
    const files = readdirSync(migrationsDir)
      .filter((f) => f.endsWith(".sql"))
      .sort();

    for (const file of files) {
      const filePath = join(migrationsDir, file);
      const sql = readFileSync(filePath, "utf8");

      // Split on semicolons and run each statement individually
      const statements = sql
        .split(";")
        .map((s) => s.trim())
        .filter((s) => s.length > 0 && !s.startsWith("--"));

      console.log(`[Migration] Running ${file} (${statements.length} statements)...`);

      const conn = await pool.getConnection();
      try {
        for (const statement of statements) {
          if (statement.trim().length === 0) continue;
          try {
            await conn.query(statement);
          } catch (stmtErr) {
            // Log but don't abort — some statements like CREATE TABLE IF NOT EXISTS
            // or INSERT IGNORE may be safely skipped
            if (
              stmtErr.code !== "ER_TABLE_EXISTS_ERROR" &&
              stmtErr.code !== "ER_DUP_ENTRY" &&
              stmtErr.code !== "ER_DUP_KEYNAME"
            ) {
              console.warn(`[Migration] Warning in ${file}: ${stmtErr.message}`);
            }
          }
        }
        console.log(`[Migration] ${file} completed.`);
      } finally {
        conn.release();
      }
    }

    console.log("[Migration] All migrations complete.");
  } catch (err) {
    console.error("[Migration] Error running migrations:", err.message);
    // Don't crash server — DB might already be set up
  }
};

// ─── Cron jobs ─────────────────────────────────────────────────────────────────

// Midnight: clean up old AI usage records (older than 30 days)
cron.schedule("0 0 * * *", async () => {
  try {
    const [result] = await pool.execute(
      `DELETE FROM ai_usage WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)`
    );
    console.log(`[Cron] Cleaned ${result.affectedRows} old AI usage records.`);
  } catch (err) {
    console.error("[Cron] Failed to clean AI usage:", err.message);
  }
});

// 1am: reset streaks for users who missed yesterday
cron.schedule("0 1 * * *", async () => {
  try {
    // Find users whose last_activity_date is before yesterday (i.e., they missed yesterday)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    const [result] = await pool.execute(
      `UPDATE streaks
       SET current_streak = 0, updated_at = NOW()
       WHERE last_activity_date IS NOT NULL
         AND last_activity_date < ?
         AND current_streak > 0`,
      [yesterdayStr]
    );

    // Also update the streak_count in users table
    await pool.execute(
      `UPDATE users u
       JOIN streaks s ON u.id = s.user_id
       SET u.streak_count = s.current_streak, u.updated_at = NOW()
       WHERE s.current_streak = 0`
    );

    console.log(`[Cron] Reset streaks for ${result.affectedRows} users who missed yesterday.`);
  } catch (err) {
    console.error("[Cron] Failed to reset streaks:", err.message);
  }
});

// ─── Start server ──────────────────────────────────────────────────────────────
const start = async () => {
  // Run migrations on startup
  await runMigrations();

  app.listen(PORT, () => {
    console.log(`[Server] ACTstroyds API running on port ${PORT}`);
    console.log(`[Server] Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`[Server] Client URL: ${process.env.CLIENT_URL || "http://localhost:5173"}`);
  });
};

start().catch((err) => {
  console.error("[Server] Fatal startup error:", err.message);
  process.exit(1);
});

export default app;
