/**
 * /api/contact — intentional compatibility stub (module 5.2, b-path).
 *
 * The contact FEATURE stays client-side: the UI composes a mailto handoff and
 * no message content is meant to transit our infrastructure. This endpoint
 * exists only for backwards compatibility and local-dev parity — it validates
 * the payload and returns a mailto URL. Do NOT wire it to a server-side mail
 * pipeline without an explicit owner decision: accepting PII server-side on
 * Vercel would make PII-in-logs a privacy-policy issue (recorded as a
 * decision gate in the remediation roadmap, phase 5.2).
 *
 * Rate limiting: same policy as the local server (server.js) — 5 requests per
 * 15 minutes per socket peer, keyed on `req.socket.remoteAddress`. NEVER key
 * on the spoofable `x-forwarded-for` header. On Vercel this in-memory store
 * is per-instance and best-effort (cold starts reset it); Vercel platform
 * protections remain the primary hosted mitigation. The local server applies
 * its own identical limiter before delegating here — keep both in sync.
 */

const EMAIL = 'info@holf.services';

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_MAX_KEYS = 10000;
const RATE_LIMIT_MESSAGE =
  'Too many contact messages sent from this IP. Please try again in 15 minutes.';

const rateLimitStore = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  let timestamps = rateLimitStore.get(ip);
  if (!timestamps) {
    // Cap the store: reject brand-new keys when full so a flood of distinct
    // peers cannot grow memory without bound.
    if (rateLimitStore.size >= RATE_LIMIT_MAX_KEYS) return true;
    timestamps = [];
    rateLimitStore.set(ip, timestamps);
  }
  const active = timestamps.filter((time) => now - time < RATE_LIMIT_WINDOW_MS);
  if (active.length >= RATE_LIMIT_MAX) {
    rateLimitStore.set(ip, active);
    return true;
  }
  active.push(now);
  rateLimitStore.set(ip, active);
  return false;
}

function clean(value: unknown, maxLength: number): string {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim().replace(/\s+/g, ' ');
  return trimmed.slice(0, maxLength);
}

export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (isRateLimited(String(req?.socket?.remoteAddress || 'unknown'))) {
    res.status(429).json({ error: RATE_LIMIT_MESSAGE });
    return;
  }

  try {
    const body = req.body || {};
    const name = clean(body.name, 120);
    const email = clean(body.email, 160);
    const subject = clean(body.subject, 180);
    const message = clean(body.message, 4000);

    if (!name || !email || !message) {
      res.status(400).json({
        error: 'Missing required fields',
        required: ['name', 'email', 'message']
      });
      return;
    }

    const safeSubject = subject || 'Beredskap101 contact request';
    const mailto = `mailto:${EMAIL}?subject=${encodeURIComponent(safeSubject)}&body=${encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
    )}`;

    res.status(200).json({
      ok: true,
      mailto
    });
  } catch {
    // Generic failure: never echo request data back — the payload is PII.
    res.status(500).json({ error: 'Internal server error' });
  }
}
