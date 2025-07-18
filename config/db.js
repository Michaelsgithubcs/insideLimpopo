const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

const DB_NAME = 'insidelimpopo';

// First, connect without specifying a database
async function ensureDatabaseExists() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
  });
  await connection.query('CREATE DATABASE IF NOT EXISTS `insidelimpopo`');
  await connection.end();
}

let pool;

async function getPool() {
  if (!pool) {
    await ensureDatabaseExists();
    pool = mysql.createPool({
      host: 'localhost',
      user: 'root',
      password: '',
      database: DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
  }
  return pool;
}

module.exports = getPool;