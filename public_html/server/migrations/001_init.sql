-- ACTstroyds Database Schema
-- Migration 001: Initial Setup

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  subscription_tier ENUM('free','premium') NOT NULL DEFAULT 'free',
  xp INT NOT NULL DEFAULT 0,
  streak_count INT NOT NULL DEFAULT 0,
  last_active_date DATE NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Email verification codes
CREATE TABLE IF NOT EXISTS email_verification_codes (
  id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_evc_user_id (user_id),
  INDEX idx_evc_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Password reset codes
CREATE TABLE IF NOT EXISTS password_reset_codes (
  id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  token VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_prc_token (token),
  INDEX idx_prc_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tests
CREATE TABLE IF NOT EXISTS tests (
  id CHAR(36) NOT NULL,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(50) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_tests_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Test sections
CREATE TABLE IF NOT EXISTS test_sections (
  id CHAR(36) NOT NULL,
  test_id CHAR(36) NOT NULL,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(50) NOT NULL,
  time_minutes INT NOT NULL,
  question_count INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_ts_test_id (test_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Passages
CREATE TABLE IF NOT EXISTS passages (
  id CHAR(36) NOT NULL,
  test_id CHAR(36) NOT NULL,
  section VARCHAR(50) NOT NULL,
  content LONGTEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_passages_test_id (test_id),
  INDEX idx_passages_section (section)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Practice sessions
CREATE TABLE IF NOT EXISTS practice_sessions (
  id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  test VARCHAR(50) NOT NULL,
  section VARCHAR(50) NOT NULL,
  session_type ENUM('diagnostic','quiz','lesson_quiz','exam') NOT NULL,
  status ENUM('active','completed','abandoned') NOT NULL DEFAULT 'active',
  score INT NULL,
  scale_score INT NULL,
  time_spent_seconds INT NOT NULL DEFAULT 0,
  completed_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_ps_user_id (user_id),
  INDEX idx_ps_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Questions
CREATE TABLE IF NOT EXISTS questions (
  id CHAR(36) NOT NULL,
  practice_session_id CHAR(36) NOT NULL,
  passage_id CHAR(36) NULL,
  test VARCHAR(50) NOT NULL,
  section VARCHAR(50) NOT NULL,
  topic VARCHAR(255) NOT NULL,
  difficulty ENUM('easy','medium','hard') NOT NULL,
  question_text LONGTEXT NOT NULL,
  question_latex TEXT NULL,
  choices JSON NOT NULL,
  correct_answer VARCHAR(10) NOT NULL,
  explanation TEXT NOT NULL,
  visual_json JSON NULL,
  flagged BOOLEAN NOT NULL DEFAULT FALSE,
  invalid BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_q_session_id (practice_session_id),
  INDEX idx_q_passage_id (passage_id),
  INDEX idx_q_section (section),
  INDEX idx_q_topic (topic)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User answers
CREATE TABLE IF NOT EXISTS user_answers (
  id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  practice_session_id CHAR(36) NOT NULL,
  question_id CHAR(36) NOT NULL,
  selected_answer VARCHAR(10) NOT NULL,
  is_correct BOOLEAN NOT NULL,
  time_spent_seconds INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_ua_user_id (user_id),
  INDEX idx_ua_session_id (practice_session_id),
  INDEX idx_ua_question_id (question_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- AI-generated explanations
CREATE TABLE IF NOT EXISTS explanations (
  id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  question_id CHAR(36) NOT NULL,
  explanation_text LONGTEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_exp_user_id (user_id),
  INDEX idx_exp_question_id (question_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Lessons
CREATE TABLE IF NOT EXISTS lessons (
  id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  test VARCHAR(50) NOT NULL,
  section VARCHAR(50) NOT NULL,
  topic VARCHAR(255) NOT NULL,
  difficulty ENUM('easy','medium','hard') NOT NULL,
  blocks JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_lessons_user_id (user_id),
  INDEX idx_lessons_topic (topic)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Lesson progress
CREATE TABLE IF NOT EXISTS lesson_progress (
  id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  lesson_id CHAR(36) NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_lp_user_id (user_id),
  INDEX idx_lp_lesson_id (lesson_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Study plans
CREATE TABLE IF NOT EXISTS study_plans (
  id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  plan_type ENUM('follow','self') NOT NULL,
  content JSON NOT NULL,
  target_date DATE NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_sp_user_id (user_id),
  INDEX idx_sp_active (active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Skill mastery
CREATE TABLE IF NOT EXISTS skill_mastery (
  id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  test VARCHAR(50) NOT NULL,
  section VARCHAR(50) NOT NULL,
  topic VARCHAR(255) NOT NULL,
  total_questions INT NOT NULL DEFAULT 0,
  correct_questions INT NOT NULL DEFAULT 0,
  accuracy DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  mastery_level ENUM('not_started','learning','practicing','proficient','mastered') NOT NULL DEFAULT 'not_started',
  last_practiced TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_user_topic (user_id, test, section, topic),
  INDEX idx_sm_user_id (user_id),
  INDEX idx_sm_section (section)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  tier ENUM('free','premium') NOT NULL,
  started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_sub_user_id (user_id),
  INDEX idx_sub_tier (tier)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- AI usage tracking
CREATE TABLE IF NOT EXISTS ai_usage (
  id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  action_type VARCHAR(100) NOT NULL,
  estimated_tokens INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_aiu_user_id (user_id),
  INDEX idx_aiu_action_type (action_type),
  INDEX idx_aiu_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Badges
CREATE TABLE IF NOT EXISTS badges (
  id CHAR(36) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(100) NOT NULL,
  condition_type VARCHAR(100) NOT NULL,
  condition_value INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_badges_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User badges
CREATE TABLE IF NOT EXISTS user_badges (
  id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  badge_id CHAR(36) NOT NULL,
  earned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_user_badge (user_id, badge_id),
  INDEX idx_ub_user_id (user_id),
  INDEX idx_ub_badge_id (badge_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- XP events
CREATE TABLE IF NOT EXISTS xp_events (
  id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  action VARCHAR(100) NOT NULL,
  xp_amount INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_xp_user_id (user_id),
  INDEX idx_xp_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Question reports
CREATE TABLE IF NOT EXISTS question_reports (
  id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  question_id CHAR(36) NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_qr_user_id (user_id),
  INDEX idx_qr_question_id (question_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Streaks
CREATE TABLE IF NOT EXISTS streaks (
  id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  current_streak INT NOT NULL DEFAULT 0,
  longest_streak INT NOT NULL DEFAULT 0,
  last_activity_date DATE NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_streaks_user_id (user_id),
  INDEX idx_streaks_last_activity (last_activity_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Seed Data
-- ============================================================

INSERT IGNORE INTO tests (id, name, slug, created_at) VALUES
  (UUID(), 'ACT', 'act', NOW()),
  (UUID(), 'PreACT', 'preact', NOW());

SET @act_id = (SELECT id FROM tests WHERE slug='act');
SET @preact_id = (SELECT id FROM tests WHERE slug='preact');

INSERT IGNORE INTO test_sections (id, test_id, name, slug, time_minutes, question_count, created_at) VALUES
  (UUID(), @act_id, 'English', 'english', 35, 50, NOW()),
  (UUID(), @act_id, 'Mathematics', 'math', 50, 45, NOW()),
  (UUID(), @act_id, 'Reading', 'reading', 40, 36, NOW()),
  (UUID(), @act_id, 'Science', 'science', 40, 40, NOW()),
  (UUID(), @preact_id, 'English', 'english', 25, 35, NOW()),
  (UUID(), @preact_id, 'Mathematics', 'math', 40, 36, NOW()),
  (UUID(), @preact_id, 'Reading', 'reading', 30, 25, NOW()),
  (UUID(), @preact_id, 'Science', 'science', 30, 30, NOW());

INSERT IGNORE INTO badges (id, slug, name, description, icon, condition_type, condition_value, created_at) VALUES
  (UUID(), 'first_quiz', 'Quiz Starter', 'Completed your first quiz', 'quiz-star', 'quiz_completed', 1, NOW()),
  (UUID(), 'first_lesson', 'Eager Learner', 'Completed your first lesson', 'book-open', 'lesson_completed', 1, NOW()),
  (UUID(), 'streak_3', '3-Day Streak', 'Maintained a 3-day study streak', 'fire-3', 'streak_days', 3, NOW()),
  (UUID(), 'streak_7', 'Week Warrior', 'Maintained a 7-day study streak', 'fire-7', 'streak_days', 7, NOW()),
  (UUID(), 'streak_30', 'Monthly Master', 'Maintained a 30-day study streak', 'fire-30', 'streak_days', 30, NOW()),
  (UUID(), 'score_improvement', 'On the Rise', 'Improved your score by 2+ points', 'trending-up', 'score_improvement', 2, NOW()),
  (UUID(), 'mastered_topic', 'Topic Master', 'Achieved mastery on any topic', 'trophy', 'mastered_topics', 1, NOW()),
  (UUID(), 'perfect_quiz', 'Perfect Score', 'Got 100% on a quiz', 'star-perfect', 'perfect_quiz', 100, NOW()),
  (UUID(), 'xp_1000', 'XP Hunter', 'Earned 1000 total XP', 'gem-1000', 'total_xp', 1000, NOW()),
  (UUID(), 'xp_5000', 'XP Legend', 'Earned 5000 total XP', 'gem-5000', 'total_xp', 5000, NOW());
