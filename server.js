// server.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const fileRoutes = require('./routes/fileRoutes');
const TelegramBot = require('node-telegram-bot-api');

dotenv.config();
const app = express();
// Configure CORS
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(express.json());

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something went wrong!',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Initialize Telegram bot
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: false });
global.bot = bot;

// Routes
// Serve Swagger documentation
app.use('/swagger.json', express.static(path.join(__dirname, 'swagger.json')));
app.use('/api-docs', express.static(path.join(__dirname, 'swagger-ui.html')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/file', fileRoutes);

// Connect DB and start server
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        const port = process.env.PORT || 5000;
        app.listen(port, () => {
            console.log(`Connected to MongoDB and server running on port ${port}`);
        });
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });
