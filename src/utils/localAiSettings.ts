import type { LocalAiSettings } from '../types/offline';

const LOCAL_AI_SETTINGS_KEY = 'beredskap101_local_ai_settings_v1';

export const DEFAULT_LOCAL_AI_SETTINGS: LocalAiSettings = {
  enabled: false,
  baseUrl: 'http://localhost:11434/v1',
  model: 'qwen2.5:3b',
  mode: 'disabled',
};

function sanitizeBaseUrl(input: string): string {
  return input.trim().replace(/\/+$/, '');
}

function parseIpv4(hostname: string): number[] | null {
  const parts = hostname.split('.');
  if (parts.length !== 4) return null;
  const octets = parts.map((part) => Number.parseInt(part, 10));
  if (octets.some((octet) => Number.isNaN(octet) || octet < 0 || octet > 255)) return null;
  return octets;
}

function isPrivateOrLoopbackIpv4(hostname: string): boolean {
  const octets = parseIpv4(hostname);
  if (!octets) return false;
  const [a, b] = octets;
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 192 && b === 168) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 169 && b === 254) return true;
  return false;
}

export function isLocalOnlyBaseUrl(input: string): boolean {
  const candidate = sanitizeBaseUrl(input);
  if (!candidate) return false;

  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;
    const hostname = parsed.hostname.toLowerCase();

    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') return true;
    if (hostname.endsWith('.local')) return true;
    if (isPrivateOrLoopbackIpv4(hostname)) return true;
    return false;
  } catch {
    return false;
  }
}

export function normalizeLocalAiSettings(raw: unknown): LocalAiSettings {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_LOCAL_AI_SETTINGS };
  const value = raw as Partial<LocalAiSettings>;
  const enabled = Boolean(value.enabled);
  const mode = enabled ? 'local-openai-compatible' : 'disabled';
  const candidateBaseUrl = typeof value.baseUrl === 'string' && value.baseUrl.trim()
    ? sanitizeBaseUrl(value.baseUrl)
    : DEFAULT_LOCAL_AI_SETTINGS.baseUrl;
  const baseUrl = isLocalOnlyBaseUrl(candidateBaseUrl)
    ? candidateBaseUrl
    : DEFAULT_LOCAL_AI_SETTINGS.baseUrl;
  const model = typeof value.model === 'string' && value.model.trim() ? value.model.trim() : DEFAULT_LOCAL_AI_SETTINGS.model;
  return {
    enabled,
    baseUrl,
    model,
    mode,
  };
}

export function readLocalAiSettings(): LocalAiSettings {
  if (typeof window === 'undefined') return { ...DEFAULT_LOCAL_AI_SETTINGS };
  try {
    const raw = window.localStorage.getItem(LOCAL_AI_SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_LOCAL_AI_SETTINGS };
    return normalizeLocalAiSettings(JSON.parse(raw));
  } catch {
    return { ...DEFAULT_LOCAL_AI_SETTINGS };
  }
}

export function saveLocalAiSettings(settings: LocalAiSettings): LocalAiSettings {
  const normalized = normalizeLocalAiSettings(settings);
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(LOCAL_AI_SETTINGS_KEY, JSON.stringify(normalized));
    } catch {
      // Local storage can be unavailable; return normalized settings regardless.
    }
  }
  return normalized;
}

export function clearLocalAiSettings(): LocalAiSettings {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem(LOCAL_AI_SETTINGS_KEY);
    } catch {
      // Ignore storage errors.
    }
  }
  return { ...DEFAULT_LOCAL_AI_SETTINGS };
}

export { LOCAL_AI_SETTINGS_KEY };
