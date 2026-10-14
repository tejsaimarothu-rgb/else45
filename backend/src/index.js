const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ────────────────────────────────────────────────────────────────

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true, // allow cookies cross-origin (dev)
  })
);

// ─── Routes ───────────────────────────────────────────────────────────────────

app.use('/api/auth', authRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
