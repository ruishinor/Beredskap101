import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import contactHandler from './api/contact.ts';
import sourceFeedsHandler from './api/source-feeds.ts';
import norwayNewsHandler from './api/norway-news.ts';

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
app.all('/api/contact', (req, res) => delegateApiHandler(contactHandler, req, res));
app.all('/api/source-feeds', (req, res) => delegateApiHandler(sourceFeedsHandler, req, res));
app.all('/api/norway-news', (req, res) => delegateApiHandler(norwayNewsHandler, req, res));

function clampScore(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function gradeForScore(score) {
  if (score >= 88) return 'A';
  if (score >= 74) return 'B';
  if (score >= 60) return 'C';
  if (score >= 45) return 'D';
  return 'F';
}

function truncateText(value, maxLength = 700) {
  return String(value ?? '').replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

function sanitizeDecisionEntry(entry) {
  if (typeof entry === 'string') return truncateText(entry);
  if (!entry || typeof entry !== 'object') return '';

  const sanitized = {};
  for (const key of ['choice', 'text', 'feedback', 'decision', 'result']) {
    if (typeof entry[key] === 'string') {
      sanitized[key] = truncateText(entry[key]);
    }
  }
  const scoreChange = Number(entry.scoreChange);
  if (Number.isFinite(scoreChange)) sanitized.scoreChange = scoreChange;
  const responseTimeSec = Number(entry.responseTimeSec ?? entry.timeSec ?? entry.durationSec);
  if (Number.isFinite(responseTimeSec) && responseTimeSec >= 0) {
    sanitized.responseTimeSec = Math.min(responseTimeSec, 3600);
  }
  return sanitized;
}

function sanitizeDecisionHistory(history) {
  if (!Array.isArray(history)) return [];
  return history.slice(-20).map((entry) => sanitizeDecisionEntry(entry));
}

function sanitizeContext(context) {
  return truncateText(context || 'General Crisis Simulation', 180);
}

function analyzeDecisionHistory(history, context = 'General Crisis Simulation') {
  const joined = history
    .map((entry) => {
      if (typeof entry === 'string') return entry;
      if (!entry || typeof entry !== 'object') return '';
      return [
        entry.choice,
        entry.text,
        entry.feedback,
        entry.decision,
        entry.result,
        entry.scoreChange,
        entry.responseTimeSec,
      ]
        .filter((part) => part !== undefined && part !== null)
        .join(' ');
    })
    .join(' ')
    .toLowerCase();

  const explicitScore = history.reduce((total, entry) => {
    const scoreChange = Number(entry?.scoreChange ?? 0);
    return Number.isFinite(scoreChange) ? total + scoreChange : total;
  }, 0);

  const responseTimes = history
    .map((entry) => Number(entry?.responseTimeSec ?? entry?.timeSec ?? entry?.durationSec))
    .filter((value) => Number.isFinite(value) && value >= 0);

  const avgResponseTimeSec =
    responseTimes.length > 0
      ? Math.round(responseTimes.reduce((sum, value) => sum + value, 0) / responseTimes.length)
      : 0;

  const positiveSignals = [
    'call',
    '113',
    '112',
    '110',
    'evacuate',
    'assess',
    'pressure',
    'tourniquet',
    'offline',
    'shelter',
    'radio',
    'backup',
    'coordinate',
    'calm',
    'check',
    'water',
  ];
  const riskSignals = [
    'panic',
    'ignore',
    'wait',
    'alone',
    'public wi-fi',
    'wifi',
    'unsafe',
    'delay',
    'bypass',
    'forgot',
    'no backup',
    'unprepared',
  ];

  const positiveHits = positiveSignals.filter((term) => joined.includes(term)).length;
  const riskHits = riskSignals.filter((term) => joined.includes(term)).length;
  const baseScore = 64 + explicitScore + positiveHits * 4 - riskHits * 6 - Math.max(0, avgResponseTimeSec - 45) * 0.2;
  const resilienceScore = clampScore(baseScore);

  const securityBlindspots = [];
  if (!joined.includes('backup') && !joined.includes('offline')) {
    securityBlindspots.push('Offline fallback and backup references were not clearly used.');
  }
  if (!joined.includes('coordinate') && !joined.includes('contact') && !joined.includes('call')) {
    securityBlindspots.push('Communication and role coordination could be more explicit.');
  }
  if (riskHits > positiveHits) {
    securityBlindspots.push('Several decisions suggest avoidable delay or unsafe exposure under stress.');
  }
  if (securityBlindspots.length === 0) {
    securityBlindspots.push('No major blindspots detected from the available decision history.');
  }

  const operationalRecommendations = [
    `Run the "${context}" scenario again with one constraint removed and one constraint worsened.`,
    'Write down the first three actions before relying on memory or live services.',
    'Keep a paper or offline copy of contacts, meeting points, and critical procedures.',
  ];
  if (resilienceScore < 70) {
    operationalRecommendations.unshift('Practice the scenario as a two-minute drill until the first response is automatic.');
  }

  return {
    readinessGrade: gradeForScore(resilienceScore),
    resilienceScore,
    avgResponseTimeSec,
    securityBlindspots,
    operationalRecommendations,
    provider: 'deterministic-local',
  };
}

async function tryLocalAiAnalysis({ history, context }) {
  const enabled = process.env.LOCAL_AI_ENABLED === 'true';
  const baseUrl = (process.env.LOCAL_AI_BASE_URL || '').replace(/\/$/, '');
  const model = process.env.LOCAL_AI_MODEL || 'qwen2.5:3b';
  if (!enabled || !baseUrl) return null;
  if (!isAllowedLocalOrigin(baseUrl)) {
    console.warn('Rejected non-local LOCAL_AI_BASE_URL.');
    return null;
  }

  const prompt = `Analyze this Beredskap101 tabletop history. Return only JSON with readinessGrade, resilienceScore, avgResponseTimeSec, securityBlindspots, operationalRecommendations.\nContext: ${context || 'General Crisis Simulation'}\nHistory: ${JSON.stringify(history)}`;

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content:
              'You are an offline crisis-readiness assistant. Never claim live data access. Return strict JSON only.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.2,
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) return null;
    const payload = await response.json();
    const content = payload?.choices?.[0]?.message?.content || '';
    const jsonStart = content.indexOf('{');
    const jsonEnd = content.lastIndexOf('}');
    if (jsonStart === -1 || jsonEnd === -1) return null;
    const parsed = JSON.parse(content.slice(jsonStart, jsonEnd + 1));
    return { ...parsed, provider: 'local-llm' };
  } catch (error) {
    console.warn('Local AI analysis unavailable; using deterministic fallback.', error?.message || error);
    return null;
  }
}

// Local-only crisis analysis endpoint. Cloud AI is intentionally not used.
app.post('/api/copilot/analyze', async (req, res) => {
  try {
    const { history, context } = req.body;
    if (!history || !Array.isArray(history)) {
      return res.status(400).json({ error: 'Missing or invalid decision history.' });
    }

    const sanitizedHistory = sanitizeDecisionHistory(history);
    const sanitizedContext = sanitizeContext(context);
    const localAiResult = await tryLocalAiAnalysis({ history: sanitizedHistory, context: sanitizedContext });
    return res.json(localAiResult || analyzeDecisionHistory(sanitizedHistory, sanitizedContext));
  } catch (error) {
    console.error('Local analysis failed:', error);
    return res.status(500).json({
      error: 'Local analysis failed.',
      fallbackAvailable: false,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Beredskap101 API Server running on port ${PORT}`);
});
