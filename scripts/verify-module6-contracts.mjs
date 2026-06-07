import fs from 'node:fs';
import path from 'node:path';
import {
  DEFAULT_LOCAL_AI_SETTINGS,
  clearLocalAiSettings,
  isLocalOnlyBaseUrl,
  readLocalAiSettings,
  saveLocalAiSettings,
} from '../src/utils/localAiSettings.ts';

const ROOT = process.cwd();

function readText(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function pass(message) {
  console.log(`[PASS] ${message}`);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
  pass(message);
}

function createMemoryStorage() {
  const store = new Map();
  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
    removeItem(key) {
      store.delete(key);
    },
    clear() {
      store.clear();
    },
  };
}

function runLocalSettingsScenarios() {
  const storage = createMemoryStorage();
  globalThis.localStorage = storage;
  globalThis.window = {
    localStorage: storage,
    indexedDB: undefined,
  };

  const defaults = readLocalAiSettings();
  assert(defaults.enabled === false, 'Local AI is disabled by default.');
  assert(defaults.mode === 'disabled', 'Local AI default mode is disabled.');
  assert(defaults.baseUrl === 'http://localhost:11434/v1', 'Local AI default endpoint is localhost.');

  assert(isLocalOnlyBaseUrl('http://localhost:11434/v1'), 'Local endpoint validator accepts localhost URL.');
  assert(isLocalOnlyBaseUrl('http://127.0.0.1:1234/v1'), 'Local endpoint validator accepts loopback IPv4 URL.');
  assert(isLocalOnlyBaseUrl('http://192.168.1.25:8080/v1'), 'Local endpoint validator accepts private LAN IPv4 URL.');
  assert(isLocalOnlyBaseUrl('http://lab-box.local:8080/v1'), 'Local endpoint validator accepts .local hostnames.');
  assert(!isLocalOnlyBaseUrl('https://api.openai.com/v1'), 'Local endpoint validator rejects cloud API hosts.');
  assert(!isLocalOnlyBaseUrl('https://example.com/v1'), 'Local endpoint validator rejects non-local domains.');

  const normalizedRemote = saveLocalAiSettings({
    enabled: true,
    baseUrl: 'https://api.openai.com/v1',
    model: 'remote-model',
    mode: 'local-openai-compatible',
  });
  assert(normalizedRemote.baseUrl === DEFAULT_LOCAL_AI_SETTINGS.baseUrl, 'Remote base URLs are normalized back to local default.');

  const savedLocal = saveLocalAiSettings({
    enabled: true,
    baseUrl: 'http://localhost:11434/v1',
    model: 'qwen2.5:3b',
    mode: 'local-openai-compatible',
  });
  assert(savedLocal.enabled === true && savedLocal.mode === 'local-openai-compatible', 'Local settings can be enabled in local-openai-compatible mode.');
  const reloaded = readLocalAiSettings();
  assert(reloaded.baseUrl === 'http://localhost:11434/v1', 'Local settings persist after save/read cycle.');

  const cleared = clearLocalAiSettings();
  assert(cleared.enabled === false && cleared.mode === 'disabled', 'Clear settings resets local AI config to defaults.');
}

function runStaticContractChecks() {
  const assistantTsx = readText('src/components/LocalAiAssistant.tsx');
  const requiredTasks = ['checklist-explainer', 'content-summary', 'household-drill', 'scenario-analysis'];
  for (const task of requiredTasks) {
    assert(assistantTsx.includes(task), `Assistant includes task: ${task}.`);
  }

  assert(assistantTsx.includes('deterministicAssistiveResponse'), 'Assistant has deterministic fallback response pipeline.');
  assert(assistantTsx.includes('tryLocalModel'), 'Assistant includes optional local model routing.');
  assert(assistantTsx.includes('RAG-lite local context') || assistantTsx.includes('RAG-lite lokal kontekst'), 'Assistant exposes RAG-lite context usage.');
  assert(assistantTsx.includes('Settings for local AI') || assistantTsx.includes('Innstillinger for lokal KI'), 'Assistant exposes local settings panel.');
  assert(assistantTsx.includes('Test connection') || assistantTsx.includes('Test tilkobling'), 'Assistant exposes test connection action.');
  assert(assistantTsx.includes('Clear settings') || assistantTsx.includes('Nullstill'), 'Assistant exposes clear-settings action.');
  assert(assistantTsx.includes('advisory only') || assistantTsx.includes('kun veiledende'), 'Assistant shows advisory-only safety disclaimer.');
  assert(assistantTsx.includes('only local AI endpoints are allowed') || assistantTsx.includes('kun lokale KI-endepunkt tillatt'), 'Assistant blocks non-local endpoint usage.');
  assert(assistantTsx.includes('qwen2.5:3b') && assistantTsx.includes('llama3.2:3b'), 'Assistant recommends local small-model options.');
  assert(assistantTsx.includes('No cloud fallback is used') || assistantTsx.includes('Ingen skylokal fallback brukes'), 'Assistant states no cloud fallback behavior.');

  const bannedTokens = ['openai.com', 'gemini', 'generativelanguage', '@google/generative-ai'];
  for (const token of bannedTokens) {
    assert(!assistantTsx.toLowerCase().includes(token.toLowerCase()), `Assistant source excludes cloud token: ${token}.`);
  }

  const appTsx = readText('src/App.tsx');
  assert(appTsx.includes("checklistSubTab === 'ai'"), 'App exposes Local AI tab in checklist section.');
  assert(appTsx.includes('<LocalAiAssistant'), 'App mounts LocalAiAssistant component.');
}

function run() {
  runLocalSettingsScenarios();
  runStaticContractChecks();
  console.log('\n[SUCCESS] Module 6 contract verification completed with no errors or flags.');
}

run();
