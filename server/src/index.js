require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { migrate } = require('./db/migrate');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3001;

// CORS — allow dev client + any Vercel frontend URL set via ALLOWED_ORIGINS
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()) : []),
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Railway health checks)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // Allow any vercel.app subdomain automatically
    if (/^https:\/\/.*\.vercel\.app$/.test(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

app.use(express.json());

// Health check — Railway uses this to confirm the app is up
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// One-time reseed endpoint — protected by RESEED_SECRET env var
app.post('/admin/reseed', async (req, res) => {
  const secret = process.env.RESEED_SECRET;
  if (!secret || req.headers['x-reseed-secret'] !== secret) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const { seedIfEmpty } = require('./db/seed');
    await seedIfEmpty({ force: true });
    res.json({ ok: true, message: 'Database reseeded with demo data.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Routes
app.use('/api/invoices', require('./routes/invoices'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/vendors', require('./routes/vendors'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/payment-requests', require('./routes/paymentRequests'));

app.use(errorHandler);

migrate();

app.listen(PORT, () => {
  console.log(`AP Automation server running on http://localhost:${PORT}`);
});
