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

const poolPromise = (async () => {
  await ensureDatabaseExists();
  return mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
})();

module.exports = poolPromise;