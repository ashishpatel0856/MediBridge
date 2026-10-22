const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

const { config } = require('./config/env');
const { correlationMiddleware } = require('./middleware/correlation.middleware');
const { standardRateLimiter } = require('./middleware/rate-limit.middleware');
const { errorHandler } = require('./middleware/error.middleware');
const { register, httpRequestDurationHistogram, httpRequestsTotal } = require('./infrastructure/metrics/prometheus');
const { getDb } = require('./infrastructure/database/connection');
const { NotFoundError } = require('./domain/errors/app-errors');

const authRoutes = require('./modules/auth/auth.routes');
const doctorRoutes = require('./modules/doctor/doctor.routes');
const slotRoutes = require('./modules/slot/slot.routes');
const bookingRoutes = require('./modules/booking/booking.routes');
const prescriptionRoutes = require('./modules/prescription/prescription.routes');
const analyticsRoutes = require('./modules/analytics/analytics.routes');
const auditRoutes = require('./modules/audit/audit.routes');

const app = express();

app.use(helmet());
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(correlationMiddleware);

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.baseUrl || req.path || 'unknown';
    httpRequestDurationHistogram.observe(
      { method: req.method, route, status_code: res.statusCode },
      duration
    );
    httpRequestsTotal.inc({ method: req.method, route, status_code: res.statusCode });
  });
  next();
});

// Rate Limiting
app.use(standardRateLimiter);

// Interactive OpenAPI Documentation (Swagger UI)
try {
  const openapiPath = path.resolve(process.cwd(), 'docs/openapi.yaml');
  const swaggerDocument = YAML.load(openapiPath);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch {
  // Gracefully skip swagger doc load if yaml isn't present
}

// Health Checks 
app.get('/health', async (req, res) => {
  const dbOk = await getDb().ping();
  const status = dbOk ? 'UP' : 'DEGRADED';
  const statusCode = dbOk ? 200 : 503;

  res.status(statusCode).json({
    status,
    timestamp: new Date().toISOString(),
    service: 'amrutam-telemedicine-backend',
    version: '1.0.0',
    dependencies: {
      database: dbOk ? 'CONNECTED' : 'DISCONNECTED'
    }
  });
});

app.get('/health/live', (req, res) => {
  res.status(200).json({ status: 'ALIVE' });
});

app.get('/health/ready', async (req, res) => {
  const isReady = await getDb().ping();
  if (isReady) {
    res.status(200).json({ status: 'READY' });
  } else {
    res.status(503).json({ status: 'NOT_READY' });
  }
});

// Prometheus Metrics Scraper Endpoint
app.get('/metrics', async (req, res) => {
  res.setHeader('Content-Type', register.contentType);
  res.send(await register.metrics());
});

// Mount Feature API Routes
const prefix = config.apiPrefix;
app.use(`${prefix}/auth`, authRoutes);
app.use(`${prefix}/doctors`, doctorRoutes);
app.use(`${prefix}/slots`, slotRoutes);
app.use(`${prefix}/bookings`, bookingRoutes);
app.use(`${prefix}/prescriptions`, prescriptionRoutes);
app.use(`${prefix}/analytics`, analyticsRoutes);
app.use(`${prefix}/audit`, auditRoutes);

app.use((req, res, next) => {
  next(new NotFoundError(`Route not found: ${req.method} ${req.originalUrl}`));
});

app.use(errorHandler);

module.exports = { app };
