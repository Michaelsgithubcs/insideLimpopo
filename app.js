const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

require('dotenv').config();

const app = express();

// Template Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Body Parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));


// Static Files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/css', express.static(path.join(__dirname, 'public/css')));
app.use('/home', express.static(path.join(__dirname, 'public/assets/home')));
app.use('/logo', express.static(path.join(__dirname, 'public/assets/logo')));
app.use('/opinionimages', express.static(path.join(__dirname, 'public/assets/opinionimages')));
app.use('/podcast', express.static(path.join(__dirname, 'public/assets/podcast')));
app.use('/sportsimages', express.static(path.join(__dirname, 'public/assets/sportsimages')));

// Routes
app.use('/', require('./routes/index'));

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});