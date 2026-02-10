const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/authRoutes');
const driveRoutes = require('./routes/driveRoutes');
const shareRoutes = require('./routes/shareRoutes');
const HttpError = require('./utils/httpError');

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 5000);
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

app.use(helmet());
app.use(morgan('combined'));

app.use(
  cors({
    origin: [FRONTEND_URL, 'http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Upload-Id']
  })
);

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 800,
    standardHeaders: true,
    legacyHeaders: false
  })
);

app.use('/api', express.json({ limit: '5mb' }));

app.get('/api/health', async (_req, res) => {
  const dbState = mongoose.connection.readyState;
  const status = dbState === 1 ? 'ok' : 'degraded';
  return res.status(status === 'ok' ? 200 : 503).json({
    status,
    dbState,
    timestamp: new Date().toISOString()
  });
});

app.use('/swagger.json', express.static(path.join(__dirname, 'swagger.json')));
app.use('/api-docs', express.static(path.join(__dirname, 'swagger-ui.html')));
app.use('/api/auth', authRoutes);
app.use('/api/drive', driveRoutes);
app.use('/api/share', shareRoutes);

app.use((_req, _res, next) => {
  next(new HttpError(404, 'Endpoint not found'));
});

app.use((err, _req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const response = {
    error: err.message || 'Internal server error'
  };

  if (err.details) response.details = err.details;
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
});

async function bootstrap() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is required');
  }
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is required');
  }
  await mongoose.connect(process.env.MONGODB_URI, {
    maxPoolSize: 20,
    minPoolSize: 3,
    autoIndex: true
  });

  app.listen(PORT, () => {
    console.log(`DataVault backend listening on :${PORT}`);
  });
}

bootstrap().catch((error) => {
  console.error('Failed to start backend:', error);
  process.exit(1);
});
