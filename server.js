import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import contactHandler from './api/contact.ts';
import sourceFeedsHandler from './api/source-feeds.ts';
import norwayNewsHandler from './api/norway-news.ts';
import { localCopilotHandler } from './server/copilot.ts';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;
const JSON_BODY_LIMIT = '128kb';

function parseIpv4(hostname) {
  const parts = hostname.split('.');
  if (parts.length !== 4) return null;
  const octets = parts.map((part) => Number.parseInt(part, 10));
  if (octets.some((octet) => Number.isNaN(octet) || octet < 0 || octet > 255)) return null;
  return octets;
}

function isPrivateOrLoopbackIpv4(hostname) {
  const octets = parseIpv4(hostname);
  if (!octets) return false;
  const [a, b] = octets;
  if (a === 10 || a === 127) return true;
  if (a === 192 && b === 168) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 169 && b === 254) return true;
  return false;
}

function normalizeOriginList(value) {
  return String(value || '')
    .split(',')
    .map((item) => item.trim().replace(/\/+$/, ''))
    .filter(Boolean);
}

const configuredAllowedOrigins = new Set(normalizeOriginList(process.env.APP_URL));

function isAllowedLocalOrigin(origin) {
  if (!origin) return true;
  const normalizedOrigin = origin.replace(/\/+$/, '');
  if (configuredAllowedOrigins.has(normalizedOrigin)) return true;

  try {
    const parsed = new URL(normalizedOrigin);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;
    const hostname = parsed.hostname.toLowerCase();
    return (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '::1' ||
      hostname === '[::1]' ||
      hostname.endsWith('.local') ||
      isPrivateOrLoopbackIpv4(hostname)
    );
  } catch {
    return false;
  }
}


app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.setHeader('Permissions-Policy', 'camera=(self), microphone=(), geolocation=(), payment=(), usb=()');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://tile.openstreetmap.org; connect-src 'self' http://localhost:* http://127.0.0.1:* https://localhost:* https://127.0.0.1:* http://*.local:* https://*.local:*; font-src 'self' data:; worker-src 'self' blob:; manifest-src 'self'; media-src 'self'; frame-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none';"
  );
  next();
});

const rateLimitStore = new Map();

// Periodic cleanup of rate limit store (every 5 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [ip, timestamps] of rateLimitStore.entries()) {
    const active = timestamps.filter((time) => now - time < 60000 * 15);
    if (active.length === 0) {
      rateLimitStore.delete(ip);
    } else {
      rateLimitStore.set(ip, active);
    }
  }
}, 300000);

function rateLimit({ windowMs, max, message }) {
  return (req, res, next) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    if (!rateLimitStore.has(ip)) {
      rateLimitStore.set(ip, []);
    }
    const timestamps = rateLimitStore.get(ip);
    const active = timestamps.filter((time) => now - time < windowMs);
    if (active.length >= max) {
      return res.status(429).json({ error: message || 'Too many requests, please try again later.' });
    }
    active.push(now);
    rateLimitStore.set(ip, active);
    next();
  };
}

const contactRateLimiter = rateLimit({
  windowMs: 900000, // 15 mins
  max: 5,
  message: 'Too many contact messages sent from this IP. Please try again in 15 minutes.'
});

const copilotRateLimiter = rateLimit({
  windowMs: 60000, // 1 min
  max: 15,
  message: 'Too many copilot requests from this IP. Please wait a minute before trying again.'
});

app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedLocalOrigin(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error('CORS origin is not allowed for Beredskap101 local API.'));
    },
    methods: ['GET', 'POST', 'HEAD', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
    maxAge: 600,
  })
);
app.use(express.json({ limit: JSON_BODY_LIMIT }));

// Heartbeat endpoints
app.head('/api/healthz', (req, res) => {
  res.status(200).end();
});

app.get('/api/healthz', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: Date.now() });
});

async function delegateApiHandler(handler, req, res) {
  try {
    await handler(req, res);
  } catch (error) {
    console.error('Delegated API handler failed:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

// Keep local dev API behavior aligned with deployed serverless handlers.
app.all('/api/contact', contactRateLimiter, (req, res) => delegateApiHandler(contactHandler, req, res));
app.all('/api/source-feeds', (req, res) => delegateApiHandler(sourceFeedsHandler, req, res));
app.all('/api/norway-news', (req, res) => delegateApiHandler(norwayNewsHandler, req, res));

// Local-only crisis analysis endpoint. Cloud AI is intentionally not used.
app.all('/api/copilot/analyze', copilotRateLimiter, (req, res) =>
  delegateApiHandler(localCopilotHandler, req, res)
);

app.listen(PORT, () => {
  console.log(`Beredskap101 API Server running on port ${PORT}`);
});
