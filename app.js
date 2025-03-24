const express = require('express');
const path = require('path');

const app = express();

// Template Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static Files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/css', express.static(path.join(__dirname, 'public/css')));
app.use('/home', express.static(path.join(__dirname, 'public/assets/home')));
app.use('/logo', express.static(path.join(__dirname, 'public/assets/logo')));
app.use('/opinionimages', express.static(path.join(__dirname, 'public/assets/opinionimages')));
app.use('/podcast', express.static(path.join(__dirname, 'public/assets/podcast')));
app.use('/sportsimages', express.static(path.join(__dirname, 'public/assets/sportsimages')));

// Routes
app.get('/', (req, res) => {
    res.render('home', { title: 'Home' });
});

app.get('/events', (req, res) => {
    res.render('events', { title: 'Events' });
});

app.get('/sports', (req, res) => {
    res.render('sports', { title: 'Sports' });
});

app.get('/opinion', (req, res) => {
    res.render('opinion', { title: 'Opinion' });
});

app.get('/podcast', (req, res) => {
    res.render('podcast', { title: 'Podcast' });
});

app.get('/vacancies', (req, res) => {
    res.render('vacancies', { title: 'Vacancies' });
});

app.get('/contacts', (req, res) => {
    res.render('contact', { title: 'Contacts' });
});

app.get('/about', (req, res) => {
    res.render('about', { title: 'About' });
});

app.use((req, res) => {
    res.status(404).render('404', { title: '404' });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', { title: 'Error' });
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});