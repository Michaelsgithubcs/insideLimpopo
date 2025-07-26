const mysql = require('mysql2/promise');

const DB_NAME = 'insidelimpopo';

async function createDatabaseAndTables() {
  // 1. Create the database if it doesn't exist
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
  });
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`insidelimpopo\``);
  await connection.end();

  // 2. Create a pool for the new database
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  // 3. Create tables as before, using this pool
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
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS categories (
      category_id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL UNIQUE
    )
  `);

  // Seed default categories if not present
  const defaultCategories = ['sports', 'news', 'opinion', 'events', 'podcast'];
  for (const name of defaultCategories) {
    await pool.query('INSERT IGNORE INTO categories (name) VALUES (?)', [name]);
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS articles (
      article_id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      author_id INT,
      category_id INT,
      featured_img VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NULL DEFAULT NULL,
      FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE SET NULL
    )
  `);

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
    )
  `);

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
      cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_category (category),
      INDEX idx_cached_at (cached_at),
      INDEX idx_published_at (published_at)
    )
  `);

  console.log('Checked/created all main tables including cached_news.');
}

module.exports = createDatabaseAndTables; 