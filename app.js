const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const compression = require("compression");
const multer = require("multer");
const mysql = require("mysql2/promise");
require("dotenv").config();

const app = express();

// Creating database connection
const pool = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "insidelimpopo",
});

// (async () => {
//     try {
//       const connection = await pool.ge;
//       console.log('Successfully connected to the database');
//       connection.release();
//     } catch (err) {
//       console.error('Database connection failed:', err);
//       process.exit(1);
//     }
//   })();

// Template Engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Body Parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Static Files
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/", require("./routes/index"));

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
