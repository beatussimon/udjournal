/**
 * Matomo Analytics Proxy Server
 * 
 * This backend proxy securely handles all Matomo API calls.
 * The Matomo token is stored server-side and never exposed to the frontend.
 * 
 * Environment Variables:
 * - MATOMO_BASE_URL: Base URL of Matomo installation (e.g., http://localhost:8085/index.php)
 * - MATOMO_TOKEN: Secure Matomo API token (server-side only)
 * - MATOMO_SITE_ID: Site ID for tracking
 * - PORT: Server port (default 3001)
 */

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3001;

// Matomo configuration - MUST be set server-side
const MATOMO_BASE_URL = process.env.MATOMO_BASE_URL || 'http://localhost:8085/index.php';
const MATOMO_TOKEN = process.env.MATOMO_TOKEN;
const MATOMO_SITE_ID = process.env.MATOMO_SITE_ID || '1';

// Allowed origins for CORS
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:8080'];

// CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (ALLOWED_ORIGINS.some(allowed => origin.startsWith(allowed))) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Validate that Matomo token is configured
if (!MATOMO_TOKEN) {
  console.error('ERROR: MATOMO_TOKEN environment variable is not set!');
  console.error('Please set MATOMO_TOKEN before starting the server.');
  process.exit(1);
}

// Rate limiting cache
const rateLimitCache = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_MINUTE = 60;

// Rate limiting middleware
const rateLimitMiddleware = (req, res, next) => {
  const clientId = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  
  if (!rateLimitCache.has(clientId)) {
    rateLimitCache.set(clientId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return next();
  }
  
  const clientData = rateLimitCache.get(clientId);
  
  if (now > clientData.resetTime) {
    rateLimitCache.set(clientId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return next();
  }
  
  if (clientData.count >= MAX_REQUESTS_PER_MINUTE) {
    return res.status(429).json({ 
      error: 'Too many requests', 
      message: 'Rate limit exceeded. Please try again later.' 
    });
  }
  
  clientData.count++;
  rateLimitCache.set(clientId, clientData);
  next();
};

app.use(rateLimitMiddleware);

// Generate a unique request ID for tracing
const generateRequestId = () => {
  return crypto.randomBytes(8).toString('hex');
};

// Proxy endpoint for Matomo API
app.post('/api/matomo', async (req, res) => {
  const requestId = generateRequestId();
  const { method, params = {} } = req.body;
  
  console.log(`[${requestId}] Proxying Matomo method: ${method}`);
  
  if (!method) {
    return res.status(400).json({ 
      error: 'Bad Request', 
      message: 'Matomo method is required' 
    });
  }
  
  // Build Matomo API parameters
  const matomoParams = new URLSearchParams({
    module: 'API',
    method: method,
    idSite: MATOMO_SITE_ID,
    format: 'JSON',
    token_auth: MATOMO_TOKEN,
    ...params
  });
  
  try {
    const response = await axios.post(
      MATOMO_BASE_URL,
      matomoParams.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 30000
      }
    );
    
    console.log(`[${requestId}] Success: ${method}`);
    res.json(response.data);
  } catch (error) {
    console.error(`[${requestId}] Error: ${error.message}`);
    
    if (error.response) {
      // Matomo returned an error
      res.status(error.response.status).json({
        error: 'Matomo API Error',
        message: error.response.data?.message || error.message,
        code: error.response.status
      });
    } else if (error.request) {
      // No response received
      res.status(503).json({
        error: 'Service Unavailable',
        message: 'Matomo server is not responding'
      });
    } else {
      // Other error
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message
      });
    }
  }
});

// Specific endpoints for common Matomo queries (cleaner API)

// KPI Summary
app.get('/api/matomo/kpi', async (req, res) => {
  const { period = 'day', date = 'today' } = req.query;
  
  const matomoParams = new URLSearchParams({
    module: 'API',
    method: 'VisitsSummary.get',
    idSite: MATOMO_SITE_ID,
    period: String(period),
    date: String(date),
    format: 'JSON',
    token_auth: MATOMO_TOKEN,
  });
  
  try {
    const response = await axios.post(MATOMO_BASE_URL, matomoParams.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 30000
    });
    res.json(response.data);
  } catch (error) {
    handleMatomoError(error, res);
  }
});

// Top Articles (Page Titles)
app.get('/api/matomo/top-articles', async (req, res) => {
  const { period = 'week', date = 'today' } = req.query;
  
  const matomoParams = new URLSearchParams({
    module: 'API',
    method: 'Actions.getPageTitles',
    idSite: MATOMO_SITE_ID,
    period: String(period),
    date: String(date),
    format: 'JSON',
    flat: '1',
    token_auth: MATOMO_TOKEN,
  });
  
  try {
    const response = await axios.post(MATOMO_BASE_URL, matomoParams.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 30000
    });
    res.json(response.data);
  } catch (error) {
    handleMatomoError(error, res);
  }
});

// Get specific article metrics by URL
app.get('/api/matomo/article/:encodedUrl(*)', async (req, res) => {
  const { encodedUrl } = req.params;
  const { period = 'month', date = 'today' } = req.query;
  
  try {
    const decodedUrl = decodeURIComponent(encodedUrl);
    
    const matomoParams = new URLSearchParams({
      module: 'API',
      method: 'Actions.getPageUrl',
      idSite: MATOMO_SITE_ID,
      period: String(period),
      date: String(date),
      format: 'JSON',
      flat: '1',
      pageUrl: decodedUrl,
      token_auth: MATOMO_TOKEN,
    });
    
    const response = await axios.post(MATOMO_BASE_URL, matomoParams.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 30000
    });
    res.json(response.data);
  } catch (error) {
    handleMatomoError(error, res);
  }
});

// Downloads
app.get('/api/matomo/downloads', async (req, res) => {
  const { period = 'month', date = 'today' } = req.query;
  
  const matomoParams = new URLSearchParams({
    module: 'API',
    method: 'Actions.getDownloads',
    idSite: MATOMO_SITE_ID,
    period: String(period),
    date: String(date),
    format: 'JSON',
    expanded: '1',
    token_auth: MATOMO_TOKEN,
  });
  
  try {
    const response = await axios.post(MATOMO_BASE_URL, matomoParams.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 30000
    });
    res.json(response.data);
  } catch (error) {
    handleMatomoError(error, res);
  }
});

// Real-time visits
app.get('/api/matomo/live', async (req, res) => {
  const { maxRows = '10' } = req.query;
  
  const matomoParams = new URLSearchParams({
    module: 'API',
    method: 'Live.getLastVisitsDetails',
    idSite: MATOMO_SITE_ID,
    maxRows: String(maxRows),
    format: 'JSON',
    token_auth: MATOMO_TOKEN,
  });
  
  try {
    const response = await axios.post(MATOMO_BASE_URL, matomoParams.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 30000
    });
    res.json(response.data);
  } catch (error) {
    handleMatomoError(error, res);
  }
});

// Country data
app.get('/api/matomo/countries', async (req, res) => {
  const { period = 'month', date = 'today' } = req.query;
  
  const matomoParams = new URLSearchParams({
    module: 'API',
    method: 'UserCountry.getCountry',
    idSite: MATOMO_SITE_ID,
    period: String(period),
    date: String(date),
    format: 'JSON',
    token_auth: MATOMO_TOKEN,
  });
  
  try {
    const response = await axios.post(MATOMO_BASE_URL, matomoParams.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 30000
    });
    res.json(response.data);
  } catch (error) {
    handleMatomoError(error, res);
  }
});

// Devices
app.get('/api/matomo/devices', async (req, res) => {
  const { period = 'month', date = 'today' } = req.query;
  
  const matomoParams = new URLSearchParams({
    module: 'API',
    method: 'DevicesDetection.getType',
    idSite: MATOMO_SITE_ID,
    period: String(period),
    date: String(date),
    format: 'JSON',
    token_auth: MATOMO_TOKEN,
  });
  
  try {
    const response = await axios.post(MATOMO_BASE_URL, matomoParams.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 30000
    });
    res.json(response.data);
  } catch (error) {
    handleMatomoError(error, res);
  }
});

// Referrers
app.get('/api/matomo/referrers', async (req, res) => {
  const { period = 'month', date = 'today' } = req.query;
  
  const matomoParams = new URLSearchParams({
    module: 'API',
    method: 'Referrers.getReferrerType',
    idSite: MATOMO_SITE_ID,
    period: String(period),
    date: String(date),
    format: 'JSON',
    token_auth: MATOMO_TOKEN,
  });
  
  try {
    const response = await axios.post(MATOMO_BASE_URL, matomoParams.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 30000
    });
    res.json(response.data);
  } catch (error) {
    handleMatomoError(error, res);
  }
});

// Trend over time
app.get('/api/matomo/trends', async (req, res) => {
  const { date = 'last30' } = req.query;
  
  const matomoParams = new URLSearchParams({
    module: 'API',
    method: 'VisitsSummary.get',
    idSite: MATOMO_SITE_ID,
    period: 'day',
    date: String(date),
    format: 'JSON',
    token_auth: MATOMO_TOKEN,
  });
  
  try {
    const response = await axios.post(MATOMO_BASE_URL, matomoParams.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 30000
    });
    res.json(response.data);
  } catch (error) {
    handleMatomoError(error, res);
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    matomoConfigured: !!MATOMO_TOKEN
  });
});

// Helper function to handle Matomo errors
function handleMatomoError(error, res) {
  console.error('Matomo API Error:', error.message);
  
  if (error.response) {
    res.status(error.response.status).json({
      error: 'Matomo API Error',
      message: error.response.data?.message || error.message,
      code: error.response.status
    });
  } else if (error.request) {
    res.status(503).json({
      error: 'Service Unavailable',
      message: 'Matomo server is not responding'
    });
  } else {
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
}

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║         Matomo Analytics Proxy Server                   ║
╠═══════════════════════════════════════════════════════════╣
║  Server running on port: ${PORT}                            ║
║  Matomo Base URL: ${MATOMO_BASE_URL}              ║
║  Matomo Site ID: ${MATOMO_SITE_ID}                                   ║
║  Token configured: ${MATOMO_TOKEN ? 'YES' : 'NO'}                             ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

module.exports = app;
