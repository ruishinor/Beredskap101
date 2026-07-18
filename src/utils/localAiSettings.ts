import type { LocalAiSettings } from '../types/offline';
import { isLocalHttpUrl } from './privateNetwork';

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

// Private-IP parsing lives in the shared util (module 5.3) — do not re-add a
// local copy here; keep server.js, server/copilot.ts, and this file aligned.

export function isLocalOnlyBaseUrl(input: string): boolean {
  const candidate = sanitizeBaseUrl(input);
  if (!candidate) return false;
  return isLocalHttpUrl(candidate);
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
