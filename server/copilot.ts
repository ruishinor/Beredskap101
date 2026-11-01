import { isLocalHttpUrl } from '../src/utils/privateNetwork.ts';
import { postLocalModelJson } from './localModelTransport.ts';

type CopilotHandlerOptions = {
  allowLocalModel?: boolean;
};

type SanitizedDecision =
  | string
  | {
      choice?: string;
      text?: string;
      feedback?: string;
      decision?: string;
      result?: string;
      scoreChange?: number;
      responseTimeSec?: number;
    };

// Private-IP parsing lives in src/utils/privateNetwork.ts (module 5.3) — the
// single shared copy imported by server.js, this file, and localAiSettings.ts.
function isAllowedLocalEndpoint(input: string): boolean {
  return isLocalHttpUrl(input);
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function gradeForScore(score: number): string {
  if (score >= 88) return 'A';
  if (score >= 74) return 'B';
  if (score >= 60) return 'C';
  if (score >= 45) return 'D';
  return 'F';
}

function truncateText(value: unknown, maxLength = 700): string {
  return String(value ?? '').replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

function sanitizeDecisionEntry(entry: unknown): SanitizedDecision {
  if (typeof entry === 'string') return truncateText(entry);
  if (!entry || typeof entry !== 'object') return '';

  const source = entry as Record<string, unknown>;
  const sanitized: Exclude<SanitizedDecision, string> = {};
  for (const key of ['choice', 'text', 'feedback', 'decision', 'result'] as const) {
    if (typeof source[key] === 'string') {
      sanitized[key] = truncateText(source[key]);
    }
  }

  const scoreChange = Number(source.scoreChange);
  if (Number.isFinite(scoreChange)) sanitized.scoreChange = scoreChange;

  const responseTimeSec = Number(source.responseTimeSec ?? source.timeSec ?? source.durationSec);
  if (Number.isFinite(responseTimeSec) && responseTimeSec >= 0) {
    sanitized.responseTimeSec = Math.min(responseTimeSec, 3600);
  }

  return sanitized;
}

function sanitizeDecisionHistory(history: unknown): SanitizedDecision[] {
  if (!Array.isArray(history)) return [];
  return history.slice(-20).map((entry) => sanitizeDecisionEntry(entry));
}

function sanitizeContext(context: unknown): string {
  return truncateText(context || 'General Crisis Simulation', 180);
}

export function analyzeDecisionHistory(
  history: SanitizedDecision[],
  context = 'General Crisis Simulation'
) {
  const joined = history
    .map((entry) => {
      if (typeof entry === 'string') return entry;
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
    if (typeof entry === 'string') return total;
    const scoreChange = Number(entry.scoreChange ?? 0);
    return Number.isFinite(scoreChange) ? total + scoreChange : total;
  }, 0);

  const responseTimes = history
    .map((entry) => (typeof entry === 'string' ? Number.NaN : Number(entry.responseTimeSec)))
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

  const securityBlindspots: string[] = [];
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
    advisory: true,
    methodology: 'unvalidated-heuristic',
  };
}

async function tryLocalAiAnalysis({ history, context }: { history: SanitizedDecision[]; context: string }) {
  const enabled = process.env.LOCAL_AI_ENABLED === 'true';
  const baseUrl = (process.env.LOCAL_AI_BASE_URL || '').replace(/\/$/, '');
  const model = process.env.LOCAL_AI_MODEL || 'qwen2.5:3b';
  if (!enabled || !baseUrl) return null;
  if (!isAllowedLocalEndpoint(baseUrl)) {
    console.warn('Rejected non-local LOCAL_AI_BASE_URL.');
    return null;
  }

  const prompt = `Analyze this Beredskap101 tabletop history. Return only JSON with readinessGrade, resilienceScore, avgResponseTimeSec, securityBlindspots, operationalRecommendations.\nContext: ${context}\nHistory: ${JSON.stringify(history)}`;

  try {
    const payload = await postLocalModelJson(baseUrl, {
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
    });
    const content = (payload as any)?.choices?.[0]?.message?.content || '';
    if (typeof content !== 'string' || content.length > 100_000) return null;
    const jsonStart = content.indexOf('{');
    const jsonEnd = content.lastIndexOf('}');
    if (jsonStart === -1 || jsonEnd === -1) return null;
    const parsed = JSON.parse(content.slice(jsonStart, jsonEnd + 1));
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
    const blindspots = Array.isArray(parsed.securityBlindspots)
      ? parsed.securityBlindspots.filter((item: unknown) => typeof item === 'string').slice(0, 10).map((item: string) => item.slice(0, 500))
      : null;
    const recommendations = Array.isArray(parsed.operationalRecommendations)
      ? parsed.operationalRecommendations.filter((item: unknown) => typeof item === 'string').slice(0, 10).map((item: string) => item.slice(0, 500))
      : null;
    if (!blindspots || !recommendations) return null;
    const score = Number(parsed.resilienceScore);
    if (!Number.isFinite(score) || score < 0 || score > 100) return null;
    return {
      readinessGrade: typeof parsed.readinessGrade === 'string' && /^[A-F]$/.test(parsed.readinessGrade) ? parsed.readinessGrade : gradeForScore(score),
      resilienceScore: score,
      avgResponseTimeSec: Number.isFinite(Number(parsed.avgResponseTimeSec)) ? Math.max(0, Math.min(3600, Number(parsed.avgResponseTimeSec))) : 0,
      securityBlindspots: blindspots,
      operationalRecommendations: recommendations,
      provider: 'local-llm',
      advisory: true,
      methodology: 'unvalidated-heuristic',
    };
  } catch (error) {
    console.warn('Local AI analysis unavailable; using deterministic fallback.', error instanceof Error ? error.message : error);
    return null;
  }
}

export function createCopilotHandler({ allowLocalModel = false }: CopilotHandlerOptions = {}) {
  return async function copilotHandler(req: any, res: any) {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    try {
      const { history, context } = req.body || {};
      if (!Array.isArray(history)) {
        res.status(400).json({ error: 'Missing or invalid decision history.' });
        return;
      }

      const sanitizedHistory = sanitizeDecisionHistory(history);
      const sanitizedContext = sanitizeContext(context);
      const localAiResult = allowLocalModel
        ? await tryLocalAiAnalysis({ history: sanitizedHistory, context: sanitizedContext })
        : null;

      res.status(200).json(localAiResult || analyzeDecisionHistory(sanitizedHistory, sanitizedContext));
    } catch (error) {
      console.error('Local analysis failed:', error);
      res.status(500).json({
        error: 'Local analysis failed.',
        fallbackAvailable: false,
      });
    }
  };
}

export const deterministicCopilotHandler = createCopilotHandler();
export const localCopilotHandler = createCopilotHandler({ allowLocalModel: true });
