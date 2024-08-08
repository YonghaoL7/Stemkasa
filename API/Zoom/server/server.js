// server/server.js

const express = require('express');
require('dotenv').config();
const path = require('path');
const bodyParser = require('body-parser');
const app = express();

app.use(express.static(path.join(__dirname, '../client/build')));
app.use(bodyParser.json());

const meetingsRoutes = require('./routes/meetings');
app.use('/api', meetingsRoutes);

// Serve React frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

module.exports = app;
