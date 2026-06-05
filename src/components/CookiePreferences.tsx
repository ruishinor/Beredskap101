import { useSyncExternalStore } from 'react';

export type CookiePrefs = {
  essential: true;
  optionalEnabled: boolean;
};

const COOKIE_PREFS_KEY = 'beredskap101_cookie_prefs_v1';
const COOKIE_PREFS_CHANGE_EVENT = 'beredskap101:cookie-prefs-change';

let inMemoryCookiePrefs: CookiePrefs | null = null;
let inMemoryCookiePrefsRaw: string | null = null;
let shouldPreferInMemoryCookiePrefs = false;
let lastCookiePrefsRaw: string | null = null;

function getStorage(): Storage | null {
  if (typeof window === 'undefined') return null;

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function normalizeCookiePrefs(raw: unknown): CookiePrefs | null {
  if (!raw || typeof raw !== 'object') return null;

  const parsed = raw as Partial<CookiePrefs> & { optionalEnabled?: unknown };
  if (typeof parsed.optionalEnabled !== 'boolean') return null;

  return {
    essential: true,
    optionalEnabled: parsed.optionalEnabled
  };
}

function serializeCookiePrefs(value: CookiePrefs | null): string | null {
  return value ? JSON.stringify(value) : null;
}

function cacheCookiePrefs(value: CookiePrefs | null, raw: string | null) {
  inMemoryCookiePrefs = value;
  inMemoryCookiePrefsRaw = raw;
  lastCookiePrefsRaw = raw;
}

function parseCookiePrefsRaw(raw: string | null): CookiePrefs | null {
  if (!raw) return null;

  try {
    return normalizeCookiePrefs(JSON.parse(raw));
  } catch {
    return null;
  }
}

function readCookiePrefsSnapshot(): string | null {
  const storage = getStorage();
  if (!storage) return inMemoryCookiePrefsRaw;

  try {
    const raw = storage.getItem(COOKIE_PREFS_KEY);
    if (!raw) return shouldPreferInMemoryCookiePrefs ? inMemoryCookiePrefsRaw : null;

    if (raw === lastCookiePrefsRaw) return raw;

    const parsed = parseCookiePrefsRaw(raw);
    if (!parsed) {
      storage.removeItem(COOKIE_PREFS_KEY);
      cacheCookiePrefs(null, null);
      return shouldPreferInMemoryCookiePrefs ? inMemoryCookiePrefsRaw : null;
    }

    const normalizedRaw = serializeCookiePrefs(parsed);
    cacheCookiePrefs(parsed, normalizedRaw);
    shouldPreferInMemoryCookiePrefs = false;
    return normalizedRaw;
  } catch {
    try {
      storage.removeItem(COOKIE_PREFS_KEY);
    } catch {
      // Ignore storage cleanup failures.
    }
    return inMemoryCookiePrefsRaw;
  }
}

export function readCookiePrefs(): CookiePrefs | null {
  return parseCookiePrefsRaw(readCookiePrefsSnapshot());
}

function notifyCookiePrefsChanged() {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(new Event(COOKIE_PREFS_CHANGE_EVENT));
}

export function subscribeCookiePrefs(listener: () => void) {
  if (typeof window === 'undefined') return () => {};

  const handleStorage = (event: StorageEvent) => {
    if (event.key === COOKIE_PREFS_KEY || event.key === null) {
      listener();
    }
  };

  window.addEventListener(COOKIE_PREFS_CHANGE_EVENT, listener as EventListener);
  window.addEventListener('storage', handleStorage);

  return () => {
    window.removeEventListener(COOKIE_PREFS_CHANGE_EVENT, listener as EventListener);
    window.removeEventListener('storage', handleStorage);
  };
}

export function saveCookiePrefs(optionalEnabled: boolean) {
  const value: CookiePrefs = {
    essential: true,
    optionalEnabled
  };

  const raw = serializeCookiePrefs(value);
  cacheCookiePrefs(value, raw);

  const storage = getStorage();
  try {
    storage?.setItem(COOKIE_PREFS_KEY, raw ?? '');
    shouldPreferInMemoryCookiePrefs = false;
  } catch {
    // Storage may be unavailable or blocked. The in-memory fallback keeps the
    // choice consistent for the current session.
    shouldPreferInMemoryCookiePrefs = true;
  }

  notifyCookiePrefsChanged();
  return value;
}

export function clearCookiePrefs() {
  cacheCookiePrefs(null, null);

  const storage = getStorage();
  try {
    storage?.removeItem(COOKIE_PREFS_KEY);
    shouldPreferInMemoryCookiePrefs = false;
  } catch {
    // Ignore storage failures.
    shouldPreferInMemoryCookiePrefs = true;
  }

  notifyCookiePrefsChanged();
}

export function useCookiePrefs(): CookiePrefs | null {
  const snapshot = useSyncExternalStore(subscribeCookiePrefs, readCookiePrefsSnapshot, () => null);
  return parseCookiePrefsRaw(snapshot);
}

export default function CookieBanner({
  currentLang,
  onOpenSettings
}: {
  currentLang: string;
  onOpenSettings: () => void;
}) {
  const cookiePrefs = useCookiePrefs();

  if (cookiePrefs) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:right-auto md:max-w-xl z-50 bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 shadow-xl">
      <p className="text-xs text-[var(--muted)] mb-3">
        {currentLang === 'no'
          ? 'Vi bruker bare nødvendige funksjonsinnstillinger lokalt i nettleseren. Ingen analyse- eller markedsføringskapsler.'
          : 'We only use required functional settings stored locally in your browser. No analytics or advertising cookies.'}
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => {
            saveCookiePrefs(false);
          }}
          className="px-3 py-2 rounded-lg border border-[var(--border)] text-xs font-bold"
        >
          {currentLang === 'no' ? 'Avvis valgfrie funksjoner' : 'Reject optional features'}
        </button>
        <button
          onClick={() => {
            saveCookiePrefs(true);
          }}
          className="px-3 py-2 rounded-lg bg-[var(--accent-solid)] text-[var(--accent-on-solid)] text-xs font-bold"
        >
          {currentLang === 'no' ? 'Godta valgfrie funksjoner' : 'Accept optional features'}
        </button>
        <button onClick={onOpenSettings} className="px-3 py-2 rounded-lg border border-[var(--border)] text-xs font-bold">
          {currentLang === 'no' ? 'Innstillinger' : 'Settings'}
        </button>
      </div>
    </div>
  );
}
