import { useMemo, useState } from 'react';
import { AlertTriangle, Bot, CheckCircle2, Eraser, RefreshCw, Search, ServerCrash, ShieldAlert } from 'lucide-react';
import type { LocalAiSettings, SearchDocument } from '../types/offline';
import type { ThemeType } from '../types';
import {
  DEFAULT_LOCAL_AI_SETTINGS,
  clearLocalAiSettings,
  isLocalOnlyBaseUrl,
  readLocalAiSettings,
  saveLocalAiSettings,
} from '../utils/localAiSettings';

type AssistantTask = 'checklist-explainer' | 'content-summary' | 'household-drill' | 'scenario-analysis';

type AssistantResult = {
  provider: 'deterministic-local' | 'local-llm';
  title: string;
  body: string;
  contextDocIds: string[];
};

const TASK_LABELS: Record<AssistantTask, { en: string; no: string }> = {
  'checklist-explainer': { en: 'Explain checklist', no: 'Forklar sjekkliste' },
  'content-summary': { en: 'Summarize local content', no: 'Oppsummer lokalt innhold' },
  'household-drill': { en: 'Generate household drill', no: 'Lag scenarioøvelse for hjemmet' },
  'scenario-analysis': { en: 'Analyze scenario history', no: 'Analyser scenariohistorikk' },
};

function clampText(input: string, max = 1400): string {
  const trimmed = input.trim();
  return trimmed.length > max ? `${trimmed.slice(0, max)}...` : trimmed;
}

function toLocalAiMode(enabled: boolean): LocalAiSettings['mode'] {
  return enabled ? 'local-openai-compatible' : 'disabled';
}

function pickContextDocuments(query: string, documents: SearchDocument[], max = 6): SearchDocument[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const tokens = q.split(/\s+/).filter(Boolean);
  const scored = documents
    .map((doc) => {
      const haystack = `${doc.title} ${doc.body} ${doc.tags.join(' ')}`.toLowerCase();
      let score = 0;
      for (const token of tokens) {
        if (haystack.includes(token)) score += 1;
      }
      if (score === 0) return null;
      if (doc.offlineCriticality === 'high') score += 0.4;
      return { doc, score };
    })
    .filter((row): row is { doc: SearchDocument; score: number } => Boolean(row))
    .sort((a, b) => b.score - a.score)
    .slice(0, max)
    .map((row) => row.doc);
  return scored;
}

function deterministicChecklistExplanation(input: string, currentLang: 'en' | 'no'): string {
  const lines = input
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 10);
  if (lines.length === 0) {
    return currentLang === 'no'
      ? 'Legg inn minst ett sjekklistepunkt for forklaring.'
      : 'Add at least one checklist line to generate an explanation.';
  }

  const header = currentLang === 'no' ? 'Forslag til handlingsrekkefølge:' : 'Suggested action sequence:';
  const explained = lines.map((line, idx) => {
    if (currentLang === 'no') {
      return `${idx + 1}. ${line} -> Bekreft ansvar, tidspunkt og reserveplan.`;
    }
    return `${idx + 1}. ${line} -> Confirm owner, timing, and backup option.`;
  });
  const caution =
    currentLang === 'no'
      ? 'Kontroller utstyr og datoer fysisk. Ikke stol kun på hukommelsen.'
      : 'Physically verify equipment and dates. Do not rely on memory alone.';
  return [header, ...explained, '', caution].join('\n');
}

function deterministicContentSummary(
  query: string,
  contextDocs: SearchDocument[],
  currentLang: 'en' | 'no'
): string {
  if (!query.trim()) {
    return currentLang === 'no'
      ? 'Skriv inn et tema for oppsummering.'
      : 'Enter a topic to summarize.';
  }
  if (contextDocs.length === 0) {
    return currentLang === 'no'
      ? 'Ingen lokale treff funnet. Prøv bredere søk eller fjern spesifikke filtre.'
      : 'No local matches found. Try broader terms or fewer filters.';
  }

  const headline =
    currentLang === 'no'
      ? `Lokale funn for "${query.trim()}":`
      : `Local findings for "${query.trim()}":`;
  const bullets = contextDocs.slice(0, 5).map((doc, idx) => {
    const summary = doc.body.split('.').slice(0, 1).join('.').trim();
    if (currentLang === 'no') {
      return `${idx + 1}. ${doc.title} (${doc.type}) - ${summary || 'Les modulen for detaljer.'}`;
    }
    return `${idx + 1}. ${doc.title} (${doc.type}) - ${summary || 'Open the module for details.'}`;
  });
  const footer =
    currentLang === 'no'
      ? 'Bruk disse som grunnlag for manuell verifisering mot offisielle kilder ved behov.'
      : 'Use these as a base and verify against official sources when needed.';
  return [headline, ...bullets, '', footer].join('\n');
}

function deterministicHouseholdDrill(profile: string, currentLang: 'en' | 'no'): string {
  const normalized = profile.trim();
  const profileLabel = normalized || (currentLang === 'no' ? 'standard husstand' : 'standard household');
  if (currentLang === 'no') {
    return [
      `Scenarioøvelse for hjemmet (${profileLabel})`,
      '1. Varsling (2 min): Simuler mobilbrudd. Alle finner avtalt motepunkt.',
      '2. Ressurssjekk (5 min): Vann, varme, lys, radio, medisiner, kontanter.',
      '3. Kommunikasjon (5 min): Test reservekanal (SMS, PMR, fysisk lapp).',
      '4. Beslutning (8 min): Øv på scenario med evakuering versus å bli hjemme.',
      '5. Retrospektiv (5 min): Hva sviktet? Hva må oppdateres innen 24 timer?',
    ].join('\n');
  }

  return [
    `Household drill (${profileLabel})`,
    '1. Alerting (2 min): Simulate mobile outage. Everyone finds meeting point.',
    '2. Resource check (5 min): Water, heat, lights, radio, medication, cash.',
    '3. Communication (5 min): Test backup channel (SMS, PMR, paper note).',
    '4. Decision step (8 min): Practice evacuate vs shelter-in-place scenario.',
    '5. Retrospective (5 min): What failed? What must be updated within 24h?',
  ].join('\n');
}

function deterministicScenarioAnalysis(input: string, currentLang: 'en' | 'no'): string {
  const normalized = input.toLowerCase();
  const positiveSignals = ['call', '112', '113', '110', 'backup', 'water', 'shelter', 'coordinate', 'offline'];
  const riskSignals = ['wait', 'panic', 'ignore', 'delay', 'no backup', 'unsafe'];
  const positiveHits = positiveSignals.filter((token) => normalized.includes(token)).length;
  const riskHits = riskSignals.filter((token) => normalized.includes(token)).length;
  const score = Math.max(0, Math.min(100, 60 + positiveHits * 6 - riskHits * 8));
  const grade = score >= 88 ? 'A' : score >= 74 ? 'B' : score >= 60 ? 'C' : score >= 45 ? 'D' : 'F';

  if (currentLang === 'no') {
    return [
      `Readiness grade: ${grade}`,
      `Resiliensscore: ${score}/100`,
      `Positive signaler: ${positiveHits}, risikosignaler: ${riskHits}`,
      'Anbefaling 1: Kutt tid til første handling til under 2 minutter.',
      'Anbefaling 2: Forankre kontakt- og rolleplan skriftlig offline.',
      'Anbefaling 3: Kjør en ny øvelse med strengere begrensninger og evaluer igjen.',
    ].join('\n');
  }

  return [
    `Readiness grade: ${grade}`,
    `Resilience score: ${score}/100`,
    `Positive signals: ${positiveHits}, risk signals: ${riskHits}`,
    'Recommendation 1: Cut time-to-first-action below two minutes.',
    'Recommendation 2: Keep contact roles and escalation path offline in writing.',
    'Recommendation 3: Re-run with a tougher constraint and re-evaluate.',
  ].join('\n');
}

function deterministicAssistiveResponse(
  task: AssistantTask,
  payload: string,
  contextDocs: SearchDocument[],
  currentLang: 'en' | 'no'
): AssistantResult {
  if (task === 'checklist-explainer') {
    return {
      provider: 'deterministic-local',
      title: currentLang === 'no' ? 'Forklaring av sjekkliste' : 'Checklist explanation',
      body: deterministicChecklistExplanation(payload, currentLang),
      contextDocIds: contextDocs.map((doc) => doc.id),
    };
  }
  if (task === 'content-summary') {
    return {
      provider: 'deterministic-local',
      title: currentLang === 'no' ? 'Lokal oppsummering' : 'Local summary',
      body: deterministicContentSummary(payload, contextDocs, currentLang),
      contextDocIds: contextDocs.map((doc) => doc.id),
    };
  }
  if (task === 'household-drill') {
    return {
      provider: 'deterministic-local',
      title: currentLang === 'no' ? 'Scenarioøvelse for hjemmet' : 'Household drill',
      body: deterministicHouseholdDrill(payload, currentLang),
      contextDocIds: contextDocs.map((doc) => doc.id),
    };
  }
  return {
    provider: 'deterministic-local',
    title: currentLang === 'no' ? 'Scenarioanalyse' : 'Scenario analysis',
    body: deterministicScenarioAnalysis(payload, currentLang),
    contextDocIds: contextDocs.map((doc) => doc.id),
  };
}

async function tryLocalModel(
  settings: LocalAiSettings,
  task: AssistantTask,
  payload: string,
  contextDocs: SearchDocument[],
  currentLang: 'en' | 'no'
): Promise<string | null> {
  if (!settings.enabled) return null;
  if (!isLocalOnlyBaseUrl(settings.baseUrl)) return null;
  const baseUrl = settings.baseUrl.replace(/\/+$/, '');
  const endpoint = `${baseUrl}/chat/completions`;
  const contextBlock = contextDocs
    .map((doc, idx) => `Context ${idx + 1}:\nTitle: ${doc.title}\nType: ${doc.type}\nBody: ${clampText(doc.body, 420)}`)
    .join('\n\n');

  const systemPrompt =
    currentLang === 'no'
      ? 'Du er en lokal beredskapsassistent. Svar kun med praktiske, konservative tiltak. Ingen skydata, ingen spekulasjon.'
      : 'You are a local preparedness assistant. Respond with practical, conservative guidance. No cloud claims, no speculation.';

  const userPrompt = [
    `Task: ${task}`,
    `Input: ${clampText(payload, 1800)}`,
    contextBlock ? `Local context:\n${contextBlock}` : 'Local context: none matched.',
    currentLang === 'no'
      ? 'Ta med tydelige advarsler for medisinske, juridiske og akuttsituasjoner.'
      : 'Include explicit caution for medical, legal, and emergency decisions.',
  ].join('\n\n');

  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 9000);
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: settings.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.2,
      }),
      signal: controller.signal,
    });
    if (!response.ok) return null;
    const payloadJson = await response.json();
    const text = payloadJson?.choices?.[0]?.message?.content;
    return typeof text === 'string' && text.trim() ? text.trim() : null;
  } catch {
    return null;
  } finally {
    window.clearTimeout(timer);
  }
}

export default function LocalAiAssistant({
  theme,
  currentLang,
  searchDocuments,
}: {
  theme: ThemeType;
  currentLang: string;
  searchDocuments: SearchDocument[];
}) {
  const lang = currentLang === 'no' ? 'no' : 'en';
  const [settings, setSettings] = useState<LocalAiSettings>(() => readLocalAiSettings());
  const [task, setTask] = useState<AssistantTask>('checklist-explainer');
  const [taskInput, setTaskInput] = useState('');
  const [result, setResult] = useState<AssistantResult | null>(null);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const styles = {
    cardBg: theme !== 'light' ? 'bg-neutral-900 border-neutral-800 text-neutral-200' : 'bg-white border-slate-200 text-slate-800',
    titleText: theme !== 'light' ? 'text-[var(--accent)] font-mono' : 'text-slate-900 font-display',
    bodyText: theme !== 'light' ? 'text-neutral-300 font-mono' : 'text-slate-700 font-sans',
    btnPrimary: theme !== 'light' ? 'bg-[var(--accent-solid)] text-[var(--accent-on-solid)] hover:brightness-105' : 'bg-[var(--accent-solid)] text-[var(--accent-on-solid)] hover:brightness-105',
    btnSecondary: theme !== 'light' ? 'bg-neutral-950 text-neutral-300 border-neutral-700 hover:border-neutral-500' : 'bg-slate-50 text-slate-700 border-slate-300 hover:border-slate-400',
    inputField: theme !== 'light' ? 'bg-black border-neutral-700 text-[var(--accent)]' : 'bg-slate-50 border-slate-300 text-slate-800',
  };

  const contextDocs = useMemo(() => pickContextDocuments(taskInput, searchDocuments, 6), [searchDocuments, taskInput]);

  const setSettingsField = <K extends keyof LocalAiSettings>(field: K, value: LocalAiSettings[K]) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
      mode: field === 'enabled' ? toLocalAiMode(Boolean(value)) : prev.mode,
    }));
  };

  const persistSettings = () => {
    if (!isLocalOnlyBaseUrl(settings.baseUrl)) {
      setStatus({
        type: 'error',
        text:
          lang === 'no'
            ? 'Base URL må være lokal (localhost, privat IP eller .local).'
            : 'Base URL must be local-only (localhost, private IP, or .local domain).',
      });
      return;
    }

    const normalized = saveLocalAiSettings({
      ...settings,
      mode: toLocalAiMode(settings.enabled),
    });
    setSettings(normalized);
    setStatus({
      type: 'success',
      text: lang === 'no' ? 'Lokale AI-innstillinger lagret.' : 'Local AI settings saved.',
    });
  };

  const clearSettings = () => {
    const reset = clearLocalAiSettings();
    setSettings(reset);
    setStatus({
      type: 'info',
      text: lang === 'no' ? 'Lokale AI-innstillinger nullstilt.' : 'Local AI settings cleared.',
    });
  };

  const testConnection = async () => {
    if (!settings.baseUrl.trim()) {
      setStatus({
        type: 'error',
        text: lang === 'no' ? 'Base URL mangler.' : 'Base URL is required.',
      });
      return;
    }
    if (!isLocalOnlyBaseUrl(settings.baseUrl)) {
      setStatus({
        type: 'error',
        text:
          lang === 'no'
            ? 'Av sikkerhetshensyn er kun lokale AI-endepunkt tillatt.'
            : 'For security, only local AI endpoints are allowed.',
      });
      return;
    }

    setBusy(true);
    const endpoint = `${settings.baseUrl.replace(/\/+$/, '')}/models`;
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 7000);
    try {
      const response = await fetch(endpoint, { method: 'GET', signal: controller.signal });
      if (response.ok) {
        setStatus({
          type: 'success',
          text:
            lang === 'no'
              ? 'Lokal AI-endepunkt svarte OK.'
              : 'Local AI endpoint responded successfully.',
        });
      } else {
        setStatus({
          type: 'error',
          text:
            lang === 'no'
              ? `Lokal KI-endepunkt svarte med status ${response.status}.`
              : `Local AI endpoint returned status ${response.status}.`,
        });
      }
    } catch {
      setStatus({
        type: 'error',
        text:
          lang === 'no'
            ? 'Ingen kontakt med lokal AI. Ved HTTPS-hosting kan nettleseren blokkere http://localhost.'
            : 'Could not reach local AI. On HTTPS hosting, browsers may block http://localhost.',
      });
    } finally {
      window.clearTimeout(timer);
      setBusy(false);
    }
  };

  const runAssistiveTask = async () => {
    setBusy(true);
    const deterministic = deterministicAssistiveResponse(task, taskInput, contextDocs, lang);
    const localModelAnswer = await tryLocalModel(settings, task, taskInput, contextDocs, lang);

    if (localModelAnswer) {
      setResult({
        provider: 'local-llm',
        title: deterministic.title,
        body: localModelAnswer,
        contextDocIds: deterministic.contextDocIds,
      });
      setStatus({
        type: 'success',
        text: lang === 'no' ? 'Svar fra lokal modell.' : 'Response generated by local model.',
      });
    } else {
      setResult(deterministic);
      setStatus({
        type: 'info',
        text:
          lang === 'no'
            ? 'Lokal modell utilgjengelig. Ved feil returneres et bestemt lokalt svar.'
            : 'Local model unavailable. Showing specific local response as fallback.',
      });
    }
    setBusy(false);
  };

  return (
    <div className="space-y-6" id="local-ai-assistant">
      <section className={`p-4 rounded-xl border ${theme !== 'light' ? 'border-amber-500/30 bg-amber-500/5' : 'border-amber-300 bg-amber-50'}`}>
        <div className="flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p className="text-xs leading-relaxed">
            {lang === 'no'
              ? 'AI-svar er kun veiledende. Ved medisinske, juridiske eller akutte situasjoner: kontakt 110/112/113 eller relevante myndigheter.'
              : 'AI output is advisory only. For medical, legal, or emergency decisions, contact 110/112/113 or relevant authorities.'}
          </p>
        </div>
      </section>

      <section className={`p-6 rounded-xl border-2 shadow-sm ${styles.cardBg}`}>
        <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${styles.titleText}`}>
          <Bot className="w-5 h-5" />
          {lang === 'no' ? 'Innstillinger for lokal KI' : 'Settings for local AI'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="inline-flex items-center gap-2 text-xs font-semibold">
            <input
              type="checkbox"
              checked={settings.enabled}
              onChange={(event) => setSettingsField('enabled', event.target.checked)}
            />
            {lang === 'no' ? 'Aktiver lokal AI (av som standard)' : 'Enable local AI (disabled by default)'}
          </label>

          <div className="text-xs opacity-80">
            {lang === 'no'
              ? `Modus: ${settings.mode}`
              : `Mode: ${settings.mode}`}
          </div>

          <div>
            <label className="text-xs font-mono uppercase tracking-widest opacity-70">Base URL</label>
            <input
              value={settings.baseUrl}
              onChange={(event) => setSettingsField('baseUrl', event.target.value)}
              placeholder="http://localhost:11434/v1"
              className={`mt-1 w-full border rounded-lg px-3 py-2 text-sm ${styles.inputField}`}
            />
          </div>

          <div>
            <label className="text-xs font-mono uppercase tracking-widest opacity-70">
              {lang === 'no' ? 'Modellnavn' : 'Model name'}
            </label>
            <input
              value={settings.model}
              onChange={(event) => setSettingsField('model', event.target.value)}
              placeholder="qwen2.5:3b"
              className={`mt-1 w-full border rounded-lg px-3 py-2 text-sm ${styles.inputField}`}
            />
            <p className="mt-1 text-[10px] opacity-75">
              {lang === 'no'
                ? 'Anbefalt: qwen2.5:3b, llama3.2:3b, mistral:7b-instruct (lokale modeller).'
                : 'Recommended: qwen2.5:3b, llama3.2:3b, mistral:7b-instruct (local models).'}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={persistSettings} className={`px-3 py-2 rounded-lg text-xs font-bold cursor-pointer ${styles.btnPrimary}`}>
            <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />
            {lang === 'no' ? 'Lagre innstillinger' : 'Save settings'}
          </button>
          <button type="button" onClick={testConnection} className={`px-3 py-2 rounded-lg border text-xs font-bold cursor-pointer ${styles.btnSecondary}`} disabled={busy}>
            <ServerCrash className="w-3.5 h-3.5 inline mr-1" />
            {lang === 'no' ? 'Test tilkobling' : 'Test connection'}
          </button>
          <button type="button" onClick={clearSettings} className={`px-3 py-2 rounded-lg border text-xs font-bold cursor-pointer ${styles.btnSecondary}`}>
            <Eraser className="w-3.5 h-3.5 inline mr-1" />
            {lang === 'no' ? 'Nullstill' : 'Clear settings'}
          </button>
        </div>
      </section>

      <section className={`p-6 rounded-xl border ${theme !== 'light' ? 'border-neutral-800 bg-neutral-950/60' : 'border-slate-200 bg-slate-50/90'}`}>
        <h3 className={`text-lg font-bold mb-3 ${styles.titleText}`}>
          {lang === 'no' ? 'Slik kobler du til lokal KI' : 'How to connect local AI'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <article className="rounded-lg border border-[var(--border)] bg-[var(--bg-alt)] p-3">
            <p className="text-xs font-bold mb-1">
              {lang === 'no' ? '1. Kjør modellen utenfor appen' : '1. Run the model outside the app'}
            </p>
            <p className={`text-xs leading-relaxed ${styles.bodyText}`}>
              {lang === 'no'
                ? 'Bruk en lokal kjører som Ollama, LM Studio, Jan, vLLM eller annen OpenAI-kompatibel server på egen enhet eller hjemmenettverk.'
                : 'Use a local runner such as Ollama, LM Studio, Jan, vLLM, or another OpenAI-compatible server on your own device or home network.'}
            </p>
          </article>
          <article className="rounded-lg border border-[var(--border)] bg-[var(--bg-alt)] p-3">
            <p className="text-xs font-bold mb-1">
              {lang === 'no' ? '2. Importer eller hent inn en liten modell der' : '2. Import or pull a small model there'}
            </p>
            <p className={`text-xs leading-relaxed ${styles.bodyText}`}>
              {lang === 'no'
                ? 'Selve appen laster ikke ned modellfiler. Det gjør du i den lokale kjøreren først, for eksempel qwen2.5:3b eller llama3.2:3b.'
                : 'This app does not download model files. Do that in the local runner first, for example qwen2.5:3b or llama3.2:3b.'}
            </p>
          </article>
          <article className="rounded-lg border border-[var(--border)] bg-[var(--bg-alt)] p-3">
            <p className="text-xs font-bold mb-1">
              {lang === 'no' ? '3. Lim inn lokal adresse og modellnavn' : '3. Paste the local address and model name'}
            </p>
            <p className={`text-xs leading-relaxed ${styles.bodyText}`}>
              {lang === 'no'
                ? 'Vanlig adresse er http://localhost:11434/v1. Lim inn samme modellnavn som kjøreren viser, test tilkoblingen, og lagre.'
                : 'A common address is http://localhost:11434/v1. Paste the same model name shown by your runner, test the connection, and save.'}
            </p>
          </article>
          <article className="rounded-lg border border-[var(--border)] bg-[var(--bg-alt)] p-3">
            <p className="text-xs font-bold mb-1">
              {lang === 'no' ? '4. Appen lagrer bare innstillinger lokalt' : '4. The app stores settings locally only'}
            </p>
            <p className={`text-xs leading-relaxed ${styles.bodyText}`}>
              {lang === 'no'
                ? 'Bare på/av-valget, lokal URL og modellnavn lagres i nettleseren. Modellfilene blir i den lokale kjøreren. Ved feil returneres et bestemt lokalt svar.'
                : 'Only the on/off toggle, local URL, and model name are stored in your browser. The model files stay in the local runner. If it fails, a specific local response is returned with no cloud call.'}
            </p>
          </article>
        </div>
        <p className="mt-3 text-xs opacity-80 leading-relaxed">
          {lang === 'no'
            ? 'Dataminimering: appen sender bare teksten du limer inn, oppgaven du velger, og opptil seks korte lokale kontekstutdrag til ditt lokale AI-endepunkt.'
            : 'Data minimization: the app sends only the text you paste, the task you choose, and up to six short local context excerpts to your local AI endpoint.'}
        </p>
      </section>

      <section className={`p-6 rounded-xl border-2 shadow-sm ${styles.cardBg}`}>
        <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${styles.titleText}`}>
          <Search className="w-5 h-5" />
          {lang === 'no' ? 'Local AI Assistant' : 'Lokal KI-Assistent'}
        </h3>

        <div className="flex flex-wrap gap-2 mb-4">
          {(Object.keys(TASK_LABELS) as AssistantTask[]).map((taskId) => (
            <button
              key={taskId}
              type="button"
              onClick={() => setTask(taskId)}
              className={`px-3 py-2 rounded-full border text-xs font-bold cursor-pointer ${
                task === taskId
                  ? 'bg-[var(--accent-solid)] text-[var(--accent-on-solid)] border-transparent'
                  : `${styles.btnSecondary}`
              }`}
            >
              {TASK_LABELS[taskId][lang]}
            </button>
          ))}
        </div>

        <textarea
          rows={6}
          value={taskInput}
          onChange={(event) => setTaskInput(event.target.value)}
          placeholder={
            lang === 'no'
              ? 'Lim inn sjekkliste, tema, husstandsprofil eller scenariohistorikk her.'
              : 'Paste checklist lines, topic, household profile, or scenario history here.'
          }
          className={`w-full border rounded-lg px-3 py-2 text-sm resize-y ${styles.inputField}`}
        />

        <div className="mt-3 text-xs opacity-80">
          {lang === 'no'
            ? `RAG-lite lokal kontekst: ${contextDocs.length} treff`
            : `RAG-lite local context: ${contextDocs.length} matches`}
        </div>

        <div className="mt-4 flex gap-2">
          <button type="button" onClick={runAssistiveTask} className={`px-4 py-2 rounded-lg text-xs font-bold cursor-pointer ${styles.btnPrimary}`} disabled={busy}>
            {busy ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 inline mr-1 animate-spin" />
                {lang === 'no' ? 'Kjører...' : 'Running...'}
              </>
            ) : (
              <>
                <Bot className="w-3.5 h-3.5 inline mr-1" />
                {lang === 'no' ? 'Kjør assistanse' : 'Run assistance'}
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              setTaskInput('');
              setResult(null);
            }}
            className={`px-4 py-2 rounded-lg border text-xs font-bold cursor-pointer ${styles.btnSecondary}`}
          >
            {lang === 'no' ? 'Tøm svar' : 'Clear response'}
          </button>
        </div>

        {status && (
          <div
            className={`mt-4 rounded-lg border px-3 py-2 text-xs ${
              status.type === 'success'
                ? 'border-green-500/40 text-green-500'
                : status.type === 'error'
                  ? 'border-red-500/40 text-red-500'
                  : 'border-blue-500/40 text-blue-500'
            }`}
          >
            {status.text}
          </div>
        )}

        {result && (
          <article className="mt-4 rounded-lg border border-[var(--border)] p-4 bg-[var(--bg-alt)]">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h4 className={`text-base font-bold ${styles.titleText}`}>{result.title}</h4>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded border border-[var(--border)]">
                {result.provider}
              </span>
            </div>

            <pre className={`text-sm whitespace-pre-wrap break-words ${styles.bodyText}`}>{result.body}</pre>

            {result.contextDocIds.length > 0 && (
              <p className="mt-3 text-[10px] opacity-75">
                {lang === 'no' ? 'Brukte lokale dokument-IDer:' : 'Local context document IDs:'}{' '}
                {result.contextDocIds.join(', ')}
              </p>
            )}
          </article>
        )}

        <div className="mt-4 rounded-lg border border-dashed border-[var(--border)] p-3 text-xs opacity-80 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>
            {lang === 'no'
              ? 'Det benyttes ingen skybasert reserve. Ved feil returneres et bestemt lokalt svar.'
              : 'No cloud fallback is used. If the local model fails, a deterministic local response is returned.'}
          </span>
        </div>
      </section>
    </div>
  );
}
