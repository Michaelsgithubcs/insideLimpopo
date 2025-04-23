const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

// Creating a connection pool
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "", 
  database: "insidelimpopo",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Testing the connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Successfully connected to the database');
    connection.release();
  } catch (err) {
    console.error('Error connecting to the database:', err);
  }
}

testConnection();

module.exports = pool;