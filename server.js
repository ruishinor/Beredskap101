import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import contactHandler from './api/contact.ts';
import healthzHandler from './api/healthz.ts';
import sourceFeedsHandler from './api/source-feeds.ts';
import norwayNewsHandler from './api/norway-news.ts';
import { localCopilotHandler } from './server/copilot.ts';
import { isLocalHostname } from './src/utils/privateNetwork.ts';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;
const JSON_BODY_LIMIT = '128kb';

// Private-IP parsing lives in src/utils/privateNetwork.ts (module 5.3) — the
// single shared copy imported by this server, server/copilot.ts, and
// src/utils/localAiSettings.ts. Do not re-add a local copy here.

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
    return isLocalHostname(parsed.hostname);
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
  // NOTE (module 5.3): the localhost / 127.0.0.1 / *.local connect-src entries
  // below exist ONLY in this dev/local-server header set. They allow the
  // optional local-AI feature (browser → user-run OpenAI-compatible server on
  // the LAN) during local development. Production (vercel.json) scopes
  // connect-src to 'self' only. That tightening is safe because the local-AI
  // feature is local-server-only by design: on hosted deployments there is no
  // local model to reach, and every API call (feeds, contact, copilot,
  // healthz) is a same-origin serverless route. Do NOT copy these entries
  // into vercel.json to "fix" CSP blocks on hosted deployments — that would
  // silently re-open the production connect-src surface for zero gain.
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://tile.openstreetmap.org; connect-src 'self' http://localhost:* http://127.0.0.1:* https://localhost:* https://127.0.0.1:* http://*.local:* https://*.local:*; font-src 'self' data:; worker-src 'self' blob:; manifest-src 'self'; media-src 'self'; frame-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none';"
  );
  next();
});

// ---------------------------------------------------------------------------
// Rate limiting (module 5.1) — LOCAL server only.
//
// On Vercel, these routes are served by the separate serverless handlers under
// api/ (see the local-vs-serverless note at the bottom of this file). Vercel's
// platform-level protections plus the handlers' `s-maxage` caching are the
// hosted mitigation; this in-memory machinery is intentionally not ported to
// serverless, except for the documented contact-stub limiter in
// api/contact.ts. Keep the two sides in sync manually when changing policy.
// ---------------------------------------------------------------------------
const RATE_LIMIT_MAX_KEYS = 10000;
const rateLimitStores = [];

// Periodic cleanup of all limiter stores (every 5 minutes)
setInterval(() => {
  const now = Date.now();
  for (const store of rateLimitStores) {
    for (const [ip, timestamps] of store.entries()) {
      const active = timestamps.filter((time) => now - time < 60000 * 15);
      if (active.length === 0) {
        store.delete(ip);
      } else {
        store.set(ip, active);
      }
    }
  }
}, 300000);

function rateLimit({ windowMs, max, message }) {
  // Each limiter instance gets its OWN store. Sharing one Map across limiters
  // would let a burst against a generous route (e.g. healthz 60/min) exhaust
  // the budget of a stricter route (e.g. copilot 15/min) for the same peer.
  const store = new Map();
  rateLimitStores.push(store);
  return (req, res, next) => {
    // SECURITY (module 5.1): key on the real socket peer. Never key on the
    // spoofable x-forwarded-for header — a client rotating XFF values would
    // otherwise mint unlimited limiter keys (limiter bypass + unbounded
    // memory growth). This server sets no `trust proxy`; it is only ever
    // exposed directly on localhost/LAN, so the socket peer is authoritative.
    const ip = req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    let timestamps = store.get(ip);
    if (!timestamps) {
      // Cap the store: reject brand-new keys once the map is full so a flood
      // of distinct peers cannot grow memory without bound.
      if (store.size >= RATE_LIMIT_MAX_KEYS) {
        return res.status(429).json({ error: message || 'Too many requests, please try again later.' });
      }
      timestamps = [];
      store.set(ip, timestamps);
    }
    const active = timestamps.filter((time) => now - time < windowMs);
    if (active.length >= max) {
      return res.status(429).json({ error: message || 'Too many requests, please try again later.' });
    }
    active.push(now);
    store.set(ip, active);
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

const healthzRateLimiter = rateLimit({
  windowMs: 60000, // 1 min
  max: 60,
  message: 'Too many health check requests from this IP. Please wait a minute.'
});

// Generous limiter for the live-feed routes: closes the LAN amplification
// path (each request fans out to multiple upstream fetches) while preserving
// the feature for genuine clients.
const feedRateLimiter = rateLimit({
  windowMs: 60000, // 1 min
  max: 30,
  message: 'Too many feed requests from this IP. Please wait a minute before refreshing.'
});

// In-memory TTL cache for the feed routes (module 5.1). In-memory only by
// design: on cold start the first requests per cache key pass through to the
// upstreams — acceptable and documented. X-B101-Feed-Cache / X-B101-Upstream-
// Fetches headers make the behavior observable to contract tests.
const FEED_CACHE_TTL_MS = 60000;
const FEED_CACHE_MAX_KEYS = 100;
const feedCache = new Map();
const feedUpstreamFetches = new Map();

function feedTtlCache(req, res, next) {
  if (req.method !== 'GET') {
    next();
    return;
  }
  const key = req.originalUrl || req.url;
  const now = Date.now();
  const cached = feedCache.get(key);
  if (cached && cached.expiresAt > now) {
    res.setHeader('X-B101-Feed-Cache', 'HIT');
    res.setHeader('X-B101-Upstream-Fetches', String(cached.upstreamFetches));
    if (cached.cacheControl) {
      res.setHeader('Cache-Control', cached.cacheControl);
    }
    res.status(cached.status).json(cached.body);
    return;
  }

  res.setHeader('X-B101-Feed-Cache', 'MISS');
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    if (res.statusCode === 200) {
      const upstreamFetches = (feedUpstreamFetches.get(key) || 0) + 1;
      feedUpstreamFetches.set(key, upstreamFetches);
      res.setHeader('X-B101-Upstream-Fetches', String(upstreamFetches));
      if (!feedCache.has(key) && feedCache.size >= FEED_CACHE_MAX_KEYS) {
        // Bound memory: evict expired entries first, then the oldest.
        for (const [entryKey, entry] of feedCache.entries()) {
          if (entry.expiresAt <= now) feedCache.delete(entryKey);
        }
        if (feedCache.size >= FEED_CACHE_MAX_KEYS) {
          feedCache.delete(feedCache.keys().next().value);
        }
      }
      feedCache.set(key, {
        expiresAt: now + FEED_CACHE_TTL_MS,
        status: res.statusCode,
        cacheControl: res.getHeader('Cache-Control'),
        body,
        upstreamFetches,
      });
    }
    return originalJson(body);
  };
  next();
}

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

// ---------------------------------------------------------------------------
// Local server vs Vercel serverless — READ BEFORE EDITING (module 5.1/5.3).
// This Express app is the LOCAL/self-hosted API only. In production the same
// routes run as separate serverless functions under api/ (contact.ts,
// healthz.ts, source-feeds.ts, norway-news.ts, copilot/analyze.ts). Rate
// limiting, the feed TTL cache, and the security headers above exist only
// here; the hosted mitigation is Vercel platform protection + the handlers'
// `s-maxage` cache headers. When changing a route's contract, change BOTH
// sides — the local server deliberately delegates to the api/ handlers so
// response shapes cannot drift.
// ---------------------------------------------------------------------------

// Keep local dev API behavior aligned with deployed serverless handlers.
app.all('/api/contact', contactRateLimiter, (req, res) => delegateApiHandler(contactHandler, req, res));
app.all('/api/source-feeds', feedRateLimiter, feedTtlCache, (req, res) =>
  delegateApiHandler(sourceFeedsHandler, req, res)
);
app.all('/api/norway-news', feedRateLimiter, feedTtlCache, (req, res) =>
  delegateApiHandler(norwayNewsHandler, req, res)
);

// Module 5.3: ONE healthz implementation. The local server delegates to the
// same handler as the Vercel serverless function (api/healthz.ts) so the two
// cannot drift — both return an ISO timestamp with `Cache-Control: no-store`.
app.all('/api/healthz', healthzRateLimiter, (req, res) => delegateApiHandler(healthzHandler, req, res));

// Local-only crisis analysis endpoint. Cloud AI is intentionally not used.
app.all('/api/copilot/analyze', copilotRateLimiter, (req, res) =>
  delegateApiHandler(localCopilotHandler, req, res)
);

app.listen(PORT, () => {
  console.log(`Beredskap101 API Server running on port ${PORT}`);
});
