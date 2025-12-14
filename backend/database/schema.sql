-- Modex Academy Competition Platform Database Schema
-- DO NOT use auto-sync in production. Import this file manually.

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

-- --------------------------------------------------------
-- Table structure for `users`
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `users` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(255) NOT NULL,
  `role` ENUM('ADMIN', 'JUDGE', 'TEAM_LEADER', 'TEAM_MEMBER') NOT NULL DEFAULT 'TEAM_MEMBER',
  `is_qualified` TINYINT(1) DEFAULT 0,
  `is_approved` TINYINT(1) DEFAULT 0,
  `qualification_score` INT(11) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_email` (`email`),
  INDEX `idx_role` (`role`),
  INDEX `idx_qualified` (`is_qualified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `competitions`
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `competitions` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `start_date` DATETIME NOT NULL,
  `end_date` DATETIME NOT NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `current_stage_id` INT(11) UNSIGNED DEFAULT NULL,
  `sponsor_banner_url` VARCHAR(500) DEFAULT NULL,
  `created_by` INT(11) UNSIGNED NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_active` (`is_active`),
  INDEX `idx_created_by` (`created_by`),
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `stages`
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `stages` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `competition_id` INT(11) UNSIGNED NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `order` INT(11) NOT NULL,
  `start_date` DATETIME NOT NULL,
  `end_date` DATETIME NOT NULL,
  `is_active` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_competition` (`competition_id`),
  INDEX `idx_order` (`competition_id`, `order`),
  FOREIGN KEY (`competition_id`) REFERENCES `competitions`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `teams`
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `teams` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `competition_id` INT(11) UNSIGNED NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `invite_code` VARCHAR(50) NOT NULL UNIQUE,
  `leader_id` INT(11) UNSIGNED NOT NULL,
  `is_locked` TINYINT(1) DEFAULT 0,
  `is_complete` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_competition` (`competition_id`),
  INDEX `idx_leader` (`leader_id`),
  INDEX `idx_invite_code` (`invite_code`),
  FOREIGN KEY (`competition_id`) REFERENCES `competitions`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`leader_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `team_members`
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `team_members` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `team_id` INT(11) UNSIGNED NOT NULL,
  `user_id` INT(11) UNSIGNED NOT NULL,
  `joined_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_team_user` (`team_id`, `user_id`),
  INDEX `idx_team` (`team_id`),
  INDEX `idx_user` (`user_id`),
  FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `qualification_questions`
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `qualification_questions` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `competition_id` INT(11) UNSIGNED NOT NULL,
  `question_text` TEXT NOT NULL,
  `question_type` ENUM('TEXT', 'MULTIPLE_CHOICE', 'NUMBER') DEFAULT 'TEXT',
  `options` JSON DEFAULT NULL,
  `order` INT(11) NOT NULL,
  `is_required` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_competition` (`competition_id`),
  INDEX `idx_order` (`competition_id`, `order`),
  FOREIGN KEY (`competition_id`) REFERENCES `competitions`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `qualification_answers`
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `qualification_answers` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `question_id` INT(11) UNSIGNED NOT NULL,
  `user_id` INT(11) UNSIGNED NOT NULL,
  `answer_text` TEXT,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_question_user` (`question_id`, `user_id`),
  INDEX `idx_question` (`question_id`),
  INDEX `idx_user` (`user_id`),
  FOREIGN KEY (`question_id`) REFERENCES `qualification_questions`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `judges`
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `judges` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `competition_id` INT(11) UNSIGNED NOT NULL,
  `user_id` INT(11) UNSIGNED NOT NULL,
  `assigned_teams` JSON DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_competition_judge` (`competition_id`, `user_id`),
  INDEX `idx_competition` (`competition_id`),
  INDEX `idx_user` (`user_id`),
  FOREIGN KEY (`competition_id`) REFERENCES `competitions`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `scores`
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `scores` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `competition_id` INT(11) UNSIGNED NOT NULL,
  `stage_id` INT(11) UNSIGNED NOT NULL,
  `team_id` INT(11) UNSIGNED NOT NULL,
  `judge_id` INT(11) UNSIGNED NOT NULL,
  `score` DECIMAL(10,2) NOT NULL,
  `notes` TEXT,
  `is_published` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_stage_team_judge` (`stage_id`, `team_id`, `judge_id`),
  INDEX `idx_competition` (`competition_id`),
  INDEX `idx_stage` (`stage_id`),
  INDEX `idx_team` (`team_id`),
  INDEX `idx_judge` (`judge_id`),
  FOREIGN KEY (`competition_id`) REFERENCES `competitions`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`stage_id`) REFERENCES `stages`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`judge_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `uploaded_files`
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `uploaded_files` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `team_id` INT(11) UNSIGNED NOT NULL,
  `user_id` INT(11) UNSIGNED NOT NULL,
  `room_id` INT(11) UNSIGNED DEFAULT NULL,
  `file_name` VARCHAR(255) NOT NULL,
  `file_path` VARCHAR(500) NOT NULL,
  `file_type` VARCHAR(100) NOT NULL,
  `file_size` INT(11) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_team` (`team_id`),
  INDEX `idx_user` (`user_id`),
  INDEX `idx_room` (`room_id`),
  FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `sponsors`
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `sponsors` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `competition_id` INT(11) UNSIGNED DEFAULT NULL,
  `name` VARCHAR(255) NOT NULL,
  `logo_url` VARCHAR(500) DEFAULT NULL,
  `website_url` VARCHAR(500) DEFAULT NULL,
  `is_global` TINYINT(1) DEFAULT 0,
  `order` INT(11) DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_competition` (`competition_id`),
  INDEX `idx_global` (`is_global`),
  FOREIGN KEY (`competition_id`) REFERENCES `competitions`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `messages`
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `messages` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `room_id` INT(11) UNSIGNED DEFAULT NULL,
  `user_id` INT(11) UNSIGNED NOT NULL,
  `message_text` TEXT NOT NULL,
  `is_global` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_room` (`room_id`),
  INDEX `idx_user` (`user_id`),
  INDEX `idx_global` (`is_global`),
  INDEX `idx_created` (`created_at`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `rooms`
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `rooms` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `team_id` INT(11) UNSIGNED NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_team_room` (`team_id`),
  INDEX `idx_team` (`team_id`),
  FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

