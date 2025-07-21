require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const multer = require('multer');
const mysql = require('mysql2/promise');
const flash = require('connect-flash');
const { v4: uuidv4 } = require('uuid');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const articleRoutes = require('./routes/admin/articles');
const app = express();
const createTablesIfNotExist = require('./config/initDb');

// Database connection pool configuration
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'insidelimpopo',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Session store configuration
const sessionStore = new MySQLStore({
  clearExpired: true,
  checkExpirationInterval: 900000, // 15 minutes
  expiration: 86400000, // 24 hours
  createDatabaseTable: true,
  schema: {
    tableName: 'sessions',
    columnNames: {
      session_id: 'session_id',
      expires: 'expires',
      data: 'data'
    }
  }
}, pool);

sessionStore.on('error', error => {
  console.error('SESSION STORE ERROR:', error);
});

// Security middleware
app.use(helmet());

// Allow FontAwesome CDN and inline scripts for CSP
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "script-src 'self' 'unsafe-inline' https://kit.fontawesome.com;");
  next();
});

app.use(compression());

// Request logging
app.use(morgan('dev'));

// Cookie parser
app.use(cookieParser());

// Session middleware - MUST come before CSRF
app.use(session({
  genid: () => uuidv4(),
  store: sessionStore,
  secret: process.env.SESSION_SECRET || '0dec3b722797d87cf69a12414164b43bc635937c586abbfcb7a49d5fce3234b0578ff70da326c80fb0d50462c199b0b59b0b16411f7f96289ed83a0dd81f4568',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Not secure for localhost
    sameSite: 'lax' // Lax is safe for most local dev
  }
}));

// Flash messages
app.use(flash());

// Template Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log all POST requests and their paths
app.use((req, res, next) => {
  if (req.method === 'POST') {
    console.log('POST request to:', req.path);
  }
  next();
});

// Debug: log req.body for POST /login
app.use((req, res, next) => {
  if (req.path === '/login' && req.method === 'POST') {
    console.log('BODY AT APP LEVEL:', req.body);
  }
  next();
});

app.use('/api/articles', articleRoutes); // ✅ After session

// Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// Make database pool available in requests
app.use((req, res, next) => {
  req.pool = pool;
  next();
});

// File upload route with error handling
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, 'public/uploads'));
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

app.post('/upload', upload.single('file'), (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Please upload a file' });
  }
  res.json({
    success: true,
    message: 'File uploaded successfully',
    filePath: `/uploads/${req.file.filename}`
  });
}, (err, req, res, next) => {
  res.status(400).json({ error: err.message });
});

// Argon2 funtion for password encryption
// Login code: (//New code)
// app.post('/login', async (req, res) => {
//   const { email, password } = req.body;

//   if (!email || !password) {
//       return res.render('login', { error: "Please provide both email and password" });
//   }

//   try {
//       // Find user by email
//       const user = await findUserByEmail(email);
//       if (!user) {
//           return res.render('login', { error: "This email is not registered" });
//       }

//       // Verify password using argon2 helps with password
//       const isPasswordValid = await argon2.verify(user.password, password);
//       if (!isPasswordValid) {
//           return res.render('login', { error: "Incorrect email or password" });
//       }

//       // Set session variables
//       // req.session.userId = user.unique_id;
//       req.session.username = user.username;
//       req.session.email = user.email;

//       // Redirect based on role
//       if (user.Role === "Admin") {
//           return res.redirect('/profile1');
//       } else if (user.Role === "User") {
//           return res.redirect('/profile2');
//       } else {
//           return res.render('login', { error: "Access Denied, you are not an Admin or User" });
//       }
//   } catch (err) {
//       console.error('Error during login:', err); // Logs the error for debugging
//       return res.render('login', { error: "Server error, please try again later" });
//   }
// });

//Server error, please try again later code(Helps you to login with your updated)
// async function updateUser(email, updatedData) {
//     try {
//         await connection.query('UPDATE user SET username = ?, email = ?, password = ?, Role = ? WHERE email = ?',
//             [updatedData.username, updatedData.email, updatedData.password, updatedData.Role, email]);
//         console.log('User updated successfully');
//     } catch (err) {
//         console.error('Error updating user:', err);
//         throw err;
//     }
// }


// Middleware to check if the user is logged in
// function isAuthenticated(req, res, next) {
//     if (req.session && req.session.userId) {
//         return next();
//     } else {
//         res.redirect('/login');
//     }
// }

// Rate limiting for API routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});

app.use('/api/', apiLimiter);

// Apply CSRF protection to routes AFTER all middleware
// app.use(csrfProtection);

// Routes
app.use('/articles', require('./routes/content/articles'));
app.use('/', require('./routes/index'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);

  // Handle CSRF token errors specifically
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).render('error', {
      message: 'Invalid CSRF token',
      error: process.env.NODE_ENV === 'development' ? err : {}
    });
  }

  res.status(500).render('error', {
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).render('error', {
    message: 'Page not found'
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

createTablesIfNotExist(); 