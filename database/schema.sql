-- ============================================================
-- schema.sql — Flower Perfumes MySQL Database Schema
-- Database: u265225504_flowers
-- Run this in Hostinger phpMyAdmin or via SSH mysql client
-- ============================================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- ── Products Table ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `products` (
    `id`                    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `title_en`              VARCHAR(255)   NOT NULL DEFAULT '',
    `title_ar`              VARCHAR(255)            DEFAULT '',
    `type_en`               VARCHAR(120)            DEFAULT 'Extrait De Parfum',
    `type_ar`               VARCHAR(120)            DEFAULT 'عطر مركز',
    `desc_en`               TEXT,
    `desc_ar`               TEXT,
    `price`                 DECIMAL(10,2)  NOT NULL DEFAULT 0.00,
    `badge_en`              VARCHAR(120)            DEFAULT '',
    `badge_ar`              VARCHAR(120)            DEFAULT '',
    `image`                 VARCHAR(500)            DEFAULT 'images/perfume-placeholder.svg',
    `sizes`                 JSON,
    `emi_en`                VARCHAR(120)            DEFAULT '',
    `emi_ar`                VARCHAR(120)            DEFAULT '',
    `category`              VARCHAR(100)            DEFAULT 'Perfume',
    `featured`              TINYINT(1)     NOT NULL DEFAULT 0,
    `is_placeholder_image`  TINYINT(1)     NOT NULL DEFAULT 0,
    `image_note_en`         VARCHAR(255)            DEFAULT '',
    `image_note_ar`         VARCHAR(255)            DEFAULT '',
    `created_at`            TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`            TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX `idx_category`  (`category`),
    INDEX `idx_featured`  (`featured`),
    INDEX `idx_price`     (`price`),
    FULLTEXT INDEX `ft_search` (`title_en`, `title_ar`, `category`, `type_en`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ── Admin Users Table ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS `admin_users` (
    `id`            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `email`         VARCHAR(255) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `name`          VARCHAR(100) NOT NULL DEFAULT 'Admin',
    `created_at`    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY `uq_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ── Seed Admin User ─────────────────────────────────────────
-- Admin credentials are set in the database using password_hash().
-- To update the password, generate a new hash in PHP:
--   echo password_hash('YourNewPassword', PASSWORD_DEFAULT);
-- Then UPDATE admin_users SET password_hash='<new_hash>' WHERE email='Flowerperfumes1989@gmail.com';
INSERT IGNORE INTO `admin_users` (`email`, `password_hash`, `name`) VALUES
(
    'Flowerperfumes1989@gmail.com',
    '$2y$12$WJFyMAofG7A0ljBFPOF4A.AOiq33v5dx/Rayf8lz0ZKW/Y65Zl/cG',
    'Admin'
);

-- ============================================================
-- After running this schema, run database/import_products.php
-- to populate the products table from products.json
-- ============================================================
