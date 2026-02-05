// config/initDb.js
const mysql = require('mysql2/promise');

const DB_NAME = process.env.DB_NAME;

async function createDatabaseAndTables() {
  // 1) Create the database if it doesn't exist
  
    const root = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER ,
    password: process.env.DB_PASSWORD,
    multipleStatements: true,
  });

  await root.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await root.end();

  // 2) Connect to that DB
  const pool = await mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER ,
    password: process.env.DB_PASSWORD ,
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true,
  });

  // 3) Tables

  // Users
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255) NOT NULL UNIQUE,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'user',
      first_name VARCHAR(255),
      last_name VARCHAR(255),
      profile_picture VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NULL DEFAULT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // Categories
  await pool.query(`
    CREATE TABLE IF NOT EXISTS categories (
      category_id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL UNIQUE,
      visible TINYINT(1) DEFAULT 1
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // Seed default categories (add or tweak as you like)
  const defaultCategories = ['sports', 'opinion', 'events', 'podcast', 'general', 'technology', 'business', 'entertainment', 'health', 'science', 'politics'];
  for (const name of defaultCategories) {
    await pool.query('INSERT IGNORE INTO categories (name, visible) VALUES (?, 1)', [name]);
  }

  // Articles
  await pool.query(`
    CREATE TABLE IF NOT EXISTS articles (
      article_id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      author_id INT,
      category_id INT,
      featured_img VARCHAR(255),
      social_links JSON DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NULL DEFAULT NULL,
      FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE SET NULL,
      INDEX idx_category (category_id),
      INDEX idx_created_at (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // Comments
  await pool.query(`
    CREATE TABLE IF NOT EXISTS comments (
      comment_id INT AUTO_INCREMENT PRIMARY KEY,
      article_id INT NOT NULL,
      parent_comment_id INT NULL,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      comment TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (article_id) REFERENCES articles(article_id) ON DELETE CASCADE,
      FOREIGN KEY (parent_comment_id) REFERENCES comments(comment_id) ON DELETE CASCADE,
      INDEX idx_article_id (article_id),
      INDEX idx_parent_comment_id (parent_comment_id),
      INDEX idx_created_at (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // Add email column to existing comments table if it doesn't exist
  await pool.query(`
    ALTER TABLE comments 
    ADD COLUMN IF NOT EXISTS email VARCHAR(255) NOT NULL DEFAULT '' 
    AFTER name;
  `);

  // Add parent_comment_id column to existing comments table if it doesn't exist
  try {
    await pool.query(`
      ALTER TABLE comments 
      ADD COLUMN IF NOT EXISTS parent_comment_id INT DEFAULT NULL 
      AFTER comment_id;
    `);
  } catch (error) {
    // Column already exists, ignore error
    if (error.code !== 'ER_DUP_FIELDNAME') {
      console.log('Note: parent_comment_id column may already exist');
    }
  }
  
  // Add foreign key constraint if it doesn't exist
  try {
    // Check if constraint already exists
    const [constraints] = await pool.query(`
      SELECT CONSTRAINT_NAME 
      FROM information_schema.TABLE_CONSTRAINTS 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME = 'comments' 
      AND CONSTRAINT_NAME = 'fk_parent_comment'
    `, [process.env.DB_NAME || 'insidelimpopo']);
    
    if (constraints.length === 0) {
      await pool.query(`
        ALTER TABLE comments 
        ADD CONSTRAINT fk_parent_comment 
        FOREIGN KEY (parent_comment_id) REFERENCES comments(comment_id) ON DELETE CASCADE;
      `);
    }
  } catch (error) {
    console.log('Note: Foreign key constraint may already exist or there was an issue adding it:', error.message);
  }  // Podcasts (separate table)
  // NOTE: Using "description" to match your controller/model expectations.
  await pool.query(`
    CREATE TABLE IF NOT EXISTS podcasts (
      podcast_id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      author_id INT,
      category_id INT,
      episode_link VARCHAR(500),
      episode_date DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE SET NULL,
      INDEX idx_category (category_id),
      INDEX idx_created_at (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // Stories
  await pool.query(`
    CREATE TABLE IF NOT EXISTS stories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      content TEXT NOT NULL,
      author_id INT,
      category VARCHAR(100),
      image_url VARCHAR(255),
      published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NULL DEFAULT NULL,
      FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // Cached News
  await pool.query(`
    CREATE TABLE IF NOT EXISTS cached_news (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(500) NOT NULL,
      description TEXT,
      url VARCHAR(1000) NOT NULL,
      url_to_image VARCHAR(1000),
      published_at DATETIME,
      source JSON,
      category VARCHAR(100) DEFAULT 'general',
      sport VARCHAR(50),
      match_status VARCHAR(100),
      is_external TINYINT(1) DEFAULT 0,
      cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_category (category),
      INDEX idx_cached_at (cached_at),
      INDEX idx_published_at (published_at),
      INDEX idx_sport (sport)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // Add new columns to existing cached_news table if they don't exist
  await pool.query(`
    ALTER TABLE cached_news 
    ADD COLUMN IF NOT EXISTS sport VARCHAR(50),
    ADD COLUMN IF NOT EXISTS match_status VARCHAR(100),
    ADD COLUMN IF NOT EXISTS is_external TINYINT(1) DEFAULT 0
  `);
  
  await pool.query(`
    ALTER TABLE cached_news 
    ADD INDEX IF NOT EXISTS idx_sport (sport)
  `);

  // Newsletter Subscribers
  await pool.query(`
    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // Sessions (for express-mysql-session)
  // Safe to create here so session middleware never hits a missing table.
  await pool.query(`
    CREATE TABLE IF NOT EXISTS sessions (
      session_id VARCHAR(128) NOT NULL PRIMARY KEY,
      expires INT(11) UNSIGNED NOT NULL,
      data MEDIUMTEXT
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  console.log('✅ Checked/created all tables including separate articles and podcasts, and the sessions table.');
}

module.exports = createDatabaseAndTables;
