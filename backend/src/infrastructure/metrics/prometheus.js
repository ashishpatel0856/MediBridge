const client = require('prom-client');

// Create a Registry which registers the metrics
const register = new client.Registry();

// Add a default label which is added to all metrics
register.setDefaultLabels({
  app: 'amrutam-telemedicine-backend'
});

// Enable the collection of default metrics
client.collectDefaultMetrics({ register });

// Custom Application Metrics
const httpRequestDurationHistogram = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.2, 0.5, 1, 2, 5]
});
register.registerMetric(httpRequestDurationHistogram);

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests processed',
  labelNames: ['method', 'route', 'status_code']
});
register.registerMetric(httpRequestsTotal);

const activeConsultationsGauge = new client.Gauge({
  name: 'active_consultations_total',
  help: 'Total number of currently active telemedicine consultations'
});
register.registerMetric(activeConsultationsGauge);

const bookingConflictsCounter = new client.Counter({
  name: 'booking_conflicts_total',
  help: 'Total number of slot booking concurrency conflicts detected and safely blocked'
});
register.registerMetric(bookingConflictsCounter);

const idempotencyReplaysCounter = new client.Counter({
  name: 'idempotency_replays_total',
  help: 'Total count of duplicate write requests intercepted by idempotency middleware'
});
register.registerMetric(idempotencyReplaysCounter);

module.exports = {
  register,
  httpRequestDurationHistogram,
  httpRequestsTotal,
  activeConsultationsGauge,
  bookingConflictsCounter,
  idempotencyReplaysCounter
};
