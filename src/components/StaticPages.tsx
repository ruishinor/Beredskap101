import { useMemo, useState, type ReactNode } from 'react';
import {
  BookOpen,
  Copy,
  Database,
  ExternalLink,
  FileText,
  Info,
  Mail,
  MessageSquare,
  Scale,
  Shield,
  ShieldCheck,
  Moon,
  Sun,
  AlertTriangle,
  Sliders,
  Eye,
  Trash2,
  Lock,
} from 'lucide-react';
import { glossaryData } from '../data/glossaryData';
import { saveCookiePrefs } from './CookiePreferences';
import SecureSaveManager from './SecureSaveManager';
import LocalDocumentVault from './LocalDocumentVault';

type AboutPageProps = {
  currentLang: string;
  onStartLearning: () => void;
  onBeginTraining: () => void;
};

export type SupportRouteTarget =
  | 'about'
  | 'contact'
  | 'faq'
  | 'privacy'
  | 'legal'
  | 'terms'
  | 'cookies';

type ThemeType = 'light' | 'dark' | 'signal';

type SupportHubPageProps = {
  currentLang: string;
  contactEmail: string;
  copiedContactEmail: boolean;
  onCopyContactEmail: () => void;
  onNavigate?: (target: any) => void;
  onOpenVault: () => void;
  onOpenBackup: () => void;
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  subTab: 'about' | 'faq' | 'contact' | 'privacy' | 'legal' | 'terms' | 'cookies' | 'data' | 'accessibility' | 'appearance';
  setSubTab: (tab: 'about' | 'faq' | 'contact' | 'privacy' | 'legal' | 'terms' | 'cookies' | 'data' | 'accessibility' | 'appearance') => void;
};

type ContactPageProps = {
  currentLang: string;
  contactEmail: string;
  copiedContactEmail: boolean;
  onCopyContactEmail: () => void;
};

type ReadingItem = {
  id: string;
  title: string;
  author: string;
  categoryEn: string;
  categoryNo: string;
  reasonEn: string;
  reasonNo: string;
  url?: string;
  cover?: string;
  seriesBooks?: Array<{
    title: string;
    url: string;
  }>;
};

const LOCAL_RUNNER_LINKS = {
  ollama: 'https://ollama.com/download',
  lmStudio: 'https://lmstudio.ai/download',
  jan: 'https://jan.ai/',
  qwen: 'https://huggingface.co/Qwen',
  llama: 'https://huggingface.co/meta-llama',
  mistral: 'https://huggingface.co/mistralai',
};

const readingItems: ReadingItem[] = [
  {
    id: 'the-unthinkable',
    title: 'The Unthinkable',
    author: 'Amanda Ripley',
    categoryEn: 'Crisis behavior',
    categoryNo: 'Kriseatferd',
    reasonEn: 'A clear look at how people actually react under pressure and why training before an event matters.',
    reasonNo: 'En tydelig gjennomgang av hvordan mennesker faktisk reagerer under press, og hvorfor øving før en hendelse betyr noe.',
    url: 'https://openlibrary.org/works/OL9389857W',
  },
  {
    id: 'deep-survival',
    title: 'Deep Survival',
    author: 'Laurence Gonzales',
    categoryEn: 'Situational awareness',
    categoryNo: 'Vurderingsevne og situasjonsbevissthet',
    reasonEn: 'Useful for understanding your immediate environment, attention, decision-making, and the small choices that separate trouble from recovery.',
    reasonNo: 'Nyttig for å forstå omgivelsene dine, oppmerksomheten din, beslutningstaking og de små valgene som skiller problemer fra kontroll.',
    url: 'https://openlibrary.org/works/OL3458633W',
  },
  {
    id: 'nols-wilderness-medicine',
    title: 'NOLS Wilderness Medicine',
    author: 'Tod Schimelpfenig',
    categoryEn: 'First aid',
    categoryNo: 'Førstehjelp',
    reasonEn: 'A practical reference for medical decisions when help is delayed or conditions are difficult.',
    reasonNo: 'Et praktisk oppslagsverk for medisinske valg når hjelp tar tid eller forholdene er krevende.',
    url: 'https://openlibrary.org/works/OL21295121W',
  },
  {
    id: 'where-there-is-no-doctor',
    title: 'Where There Is No Doctor',
    author: 'David Werner',
    categoryEn: 'Health',
    categoryNo: 'Helse',
    reasonEn: 'A plain-language health manual that is strongest when used as background knowledge, not as emergency replacement care.',
    reasonNo: 'En enkel helsehåndbok som er mest nyttig som bakgrunnskunnskap, ikke som erstatning for akutt helsehjelp.',
    url: 'https://openlibrary.org/works/OL2891264W',
  },
  {
    id: 'gift-of-fear',
    title: 'The Gift of Fear',
    author: 'Gavin de Becker',
    categoryEn: 'Personal safety',
    categoryNo: 'Egensikkerhet',
    reasonEn: 'Good for sharpening threat recognition while keeping the focus on practical boundaries and early action.',
    reasonNo: 'God for å skjerpe evnen til å kjenne igjen fare, med vekt på praktiske grenser og tidlig handling.',
    url: 'https://openlibrary.org/works/OL3355180W',
  },
  {
    id: 'dsb-egenberedskap',
    title: 'DSB self-preparedness guidance',
    author: 'Directorate for Civil Protection',
    categoryEn: 'Official guidance',
    categoryNo: 'Offisiell veiledning',
    reasonEn: 'The baseline Norwegian guidance for household preparedness, supplies, and planning.',
    reasonNo: 'Grunnlaget for norske råd om egenberedskap, utstyr og planlegging i hjemmet.',
    url: 'https://www.dsb.no/sikkerhverdag/egenberedskap/',
  },
  {
    id: 'helsenorge-first-aid',
    title: 'Helsenorge first-aid guidance',
    author: 'Helsenorge',
    categoryEn: 'Official guidance',
    categoryNo: 'Offisiell veiledning',
    reasonEn: 'Norwegian public health guidance for common first-aid and emergency situations.',
    reasonNo: 'Norsk offentlig helseinformasjon for vanlige førstehjelps- og nødsituasjoner.',
    url: 'https://www.helsenorge.no/forstehjelp/',
  },
  {
    id: 'met-warning-guidance',
    title: 'MET Norway weather warning guidance',
    author: 'Meteorologisk institutt',
    categoryEn: 'Official guidance',
    categoryNo: 'Offisiell veiledning',
    reasonEn: 'Explains Norwegian weather warnings and helps turn forecasts into concrete preparation decisions.',
    reasonNo: 'Forklarer norske farevarsler og gjør det lettere å omsette værmeldinger til konkrete forberedelser.',
    url: 'https://www.met.no/vaer-og-klima/ekstremvaervarsler-og-andre-farevarsler',
  },
  {
    id: 'lights-out',
    title: 'Lights Out',
    author: 'Ted Koppel',
    categoryEn: 'Disaster resilience',
    categoryNo: 'Katastroferesiliens',
    reasonEn: 'A practical look at how dependent everyday life is on electricity, communications, and recovery planning.',
    reasonNo: 'En praktisk gjennomgang av hvor avhengig hverdagen er av strøm, kommunikasjon og gjenopprettingsplaner.',
    url: 'https://openlibrary.org/works/OL20008564W/Lights_out',
  },
  {
    id: 'after-series',
    title: 'The After series',
    author: 'William R. Forstchen',
    categoryEn: 'Disaster resilience',
    categoryNo: 'Katastroferesiliens',
    reasonEn: 'Three closely related novels that make long-duration disruption, recovery, and household planning easier to think through in sequence.',
    reasonNo: 'Tre nært beslektede romaner som gjør det lettere å tenke gjennom langvarig svikt, gjenoppretting og husstandsplanlegging i rekkefølge.',
    seriesBooks: [
      {
        title: 'One Second After',
        url: 'https://openlibrary.org/works/OL5947682W/One_second_after',
      },
      {
        title: 'One Year After',
        url: 'https://openlibrary.org/books/OL26605017M/One_Year_After',
      },
      {
        title: 'The Final Day',
        url: 'https://openlibrary.org/books/OL27223563M/The_final_day',
      },
    ],
  },
  {
    id: 'sandworm',
    title: 'Sandworm',
    author: 'Andy Greenberg',
    categoryEn: 'Disaster resilience',
    categoryNo: 'Katastroferesiliens',
    reasonEn: 'A useful book for understanding cyber disruption, infrastructure fragility, and the real-world consequences of digital attacks.',
    reasonNo: 'En nyttig bok for å forstå digital forstyrrelse, sårbar infrastruktur og de reelle konsekvensene av digitale angrep.',
    url: 'https://openlibrary.org/books/OL29815270M/Sandworm',
  },
  {
    id: 'once-a-warrior',
    title: 'Once a Warrior',
    author: 'Jake Wood',
    categoryEn: 'Crisis behavior',
    categoryNo: 'Kriseatferd',
    reasonEn: 'A grounded account of service, trauma, and how people carry responsibility through chaos.',
    reasonNo: 'En jordnær fortelling om tjeneste, traumer og hvordan mennesker bærer ansvar gjennom kaos.',
    url: 'https://openlibrary.org/books/OL30192431M/Once_a_Warrior',
  },
  {
    id: 'tribe',
    title: 'Tribe',
    author: 'Sebastian Junger',
    categoryEn: 'Crisis behavior',
    categoryNo: 'Kriseatferd',
    reasonEn: 'Explains belonging, cohesion, and why recovery often works better when people act together instead of alone.',
    reasonNo: 'Forklarer tilhørighet, samhold og hvorfor gjenoppretting ofte fungerer bedre når mennesker handler sammen i stedet for alene.',
    url: 'https://openlibrary.org/books/OL27207580M/Tribe',
  },
  {
    id: 'six-minute-x-ray',
    title: 'Six Minute X-Ray',
    author: 'Chase Hughes',
    categoryEn: 'Situational awareness',
    categoryNo: 'Situasjonsbevissthet',
    reasonEn: 'Focuses on fast observation habits that help you read a room without turning every interaction into a drama.',
    reasonNo: 'Handler om raske observasjonsvaner som hjelper deg å lese et rom uten å gjøre hver samtale dramatisk.',
    url: 'https://openlibrary.org/books/OL33516338M/Six_Minute_X-Ray',
  },
  {
    id: 'left-of-bang',
    title: 'Left of Bang',
    author: 'Patrick Van Horne and Jason A. Riley',
    categoryEn: 'Situational awareness',
    categoryNo: 'Situasjonsbevissthet',
    reasonEn: 'A practical guide to noticing early signs before a situation becomes a problem.',
    reasonNo: 'En praktisk guide til å legge merke til tidlige tegn før en situasjon blir et problem.',
    url: 'https://openlibrary.org/books/OL30552834M/Left_of_Bang',
  },
  {
    id: 'what-every-body-is-saying',
    title: 'What Every BODY Is Saying',
    author: 'Joe Navarro',
    categoryEn: 'Situational awareness',
    categoryNo: 'Situasjonsbevissthet',
    reasonEn: 'Useful for reading nonverbal cues without assuming more than the evidence supports.',
    reasonNo: 'Nyttig for å lese ikke-verbale signaler uten å anta mer enn det som faktisk vises.',
    url: 'https://openlibrary.org/books/OL19904132M/What_every_BODY_is_saying',
  },
];

function ContactEmailBar({
  currentLang,
  contactEmail,
  copiedContactEmail,
  onCopyContactEmail,
}: ContactPageProps) {
  const copyLabel = copiedContactEmail
    ? currentLang === 'no'
      ? 'Kopiert'
      : 'Copied'
    : currentLang === 'no'
      ? 'Kopier e-postadresse'
      : 'Copy email address';

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 flex flex-wrap items-center justify-between gap-3">
      <a
        href={`mailto:${contactEmail}`}
        className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[var(--text)] hover:text-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/70 rounded-lg"
      >
        <Mail className="w-4 h-4 shrink-0" />
        <span>{currentLang === 'no' ? 'Kontakt' : 'Contact'}</span>
        <span className="text-[var(--accent)]">{contactEmail}</span>
      </a>
      <button
        type="button"
        onClick={onCopyContactEmail}
        aria-label={copyLabel}
        className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[var(--border)] px-3 py-2 text-[var(--text)] hover:bg-[var(--bg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/70"
      >
        <Copy className="w-4 h-4" />
      </button>
    </div>
  );
}

function SupportActionCard({
  title,
  description,
  icon,
  onClick,
}: {
  title: string;
  description: string;
  icon: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 text-left hover:bg-[var(--bg-alt)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/70"
    >
      <div className="flex items-start gap-3">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--bg)] p-2 text-[var(--accent)]">
          {icon}
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-[var(--text)]">{title}</h3>
          <p className="text-xs text-[var(--muted)] leading-relaxed">{description}</p>
        </div>
      </div>
    </button>
  );
}

export function GlossaryPage({ currentLang }: { currentLang: string }) {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return glossaryData;
    return glossaryData.filter((item) => {
      const text = `${item.term} ${item.termNo} ${item.explanationEn} ${item.explanationNo}`.toLowerCase();
      return text.includes(q);
    });
  }, [query]);

  return (
    <section className="section py-10 px-4 sm:px-8 max-w-[1000px] mx-auto space-y-6">
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 space-y-3">
        <h2 className="text-3xl font-bold text-[var(--text)]">{currentLang === 'no' ? 'Begrepsliste' : 'Glossary'}</h2>
        <p className="text-sm text-[var(--muted)] leading-relaxed max-w-[70ch]">
          {currentLang === 'no'
            ? 'Søk i begreper fra beredskap, førstehjelp, tilfluktsrom, personvern og lokal KI.'
            : 'Search terms from preparedness, first aid, shelters, privacy, and local AI.'}
        </p>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={currentLang === 'no' ? 'Søk i begreper...' : 'Search terms...'}
          className="w-full border border-[var(--border)] bg-[var(--bg)] rounded-xl px-4 py-3 text-sm text-[var(--text)] placeholder-[var(--muted)]/60 focus:outline-none focus:border-[var(--accent)]"
        />
      </div>
      <div className="space-y-3">
        {filtered.map((item) => (
          <article key={item.term} className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
            <h3 className="text-sm md:text-base font-bold text-[var(--text)]">
              {currentLang === 'no' ? item.termNo : item.term}
            </h3>
            <p className="text-xs md:text-sm text-[var(--muted)] mt-1 leading-relaxed">
              {currentLang === 'no' ? item.explanationNo : item.explanationEn}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function SupportHubPage({
  currentLang,
  contactEmail,
  copiedContactEmail,
  onCopyContactEmail,
  theme,
  setTheme,
  subTab,
  setSubTab,
  onOpenVault,
  onOpenBackup,
}: SupportHubPageProps) {
  const settingsItems = [
    { id: 'about', labelEn: 'About Beredskap101', labelNo: 'Om Beredskap101', icon: <Info className="w-4 h-4 shrink-0" /> },
    { id: 'faq', labelEn: 'FAQ', labelNo: 'Vanlige spørsmål', icon: <MessageSquare className="w-4 h-4 shrink-0" /> },
    { id: 'appearance', labelEn: 'Appearance & Themes', labelNo: 'Utseende & Tema', icon: <Sliders className="w-4 h-4 shrink-0" /> },
    { id: 'contact', labelEn: 'Contact Us', labelNo: 'Kontakt oss', icon: <Mail className="w-4 h-4 shrink-0" /> },
    { id: 'privacy', labelEn: 'Privacy Policy', labelNo: 'Personvern', icon: <ShieldCheck className="w-4 h-4 shrink-0" /> },
    { id: 'terms', labelEn: 'Terms of Service', labelNo: 'Bruksvilkår', icon: <Scale className="w-4 h-4 shrink-0" /> },
    { id: 'legal', labelEn: 'Legal Notice', labelNo: 'Juridisk informasjon', icon: <AlertTriangle className="w-4 h-4 shrink-0" /> },
    { id: 'cookies', labelEn: 'Cookie Choices', labelNo: 'Cookie-valg', icon: <Shield className="w-4 h-4 shrink-0" /> },
    { id: 'data', labelEn: 'Data Management & Rights', labelNo: 'Databehandling', icon: <Database className="w-4 h-4 shrink-0" /> },
    { id: 'accessibility', labelEn: 'Typography & Accessibility', labelNo: 'Typografi & Tilgjengelighet', icon: <Eye className="w-4 h-4 shrink-0" /> },
  ] as const;

  return (
    <section className="section py-10 px-4 sm:px-8 max-w-[1300px] mx-auto space-y-6">
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 space-y-2">
        <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--accent)]">
          {currentLang === 'no' ? 'Systeminnstillinger og compliance' : 'System settings and compliance'}
        </span>
        <h2 className="text-2xl md:text-3xl font-bold text-[var(--text)]">
          {currentLang === 'no' ? 'Innstillinger & Dokumentasjon' : 'Settings & Documentation'}
        </h2>
        <p className="text-xs md:text-sm text-[var(--muted)] leading-relaxed max-w-[80ch]">
          {currentLang === 'no'
            ? 'Her finner du all juridisk dokumentasjon, FAQ, kontaktinfo, temainnstillinger og verktøy for å eksportere eller slette dine lokale nettleserdata.'
            : 'Access all legal documents, FAQ, contact methods, theme configurations, and tools to export or erase local browser data.'}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <nav className="w-full lg:w-[320px] flex-shrink-0 flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 border-b lg:border-b-0 lg:border-r border-[var(--border)] select-none whitespace-nowrap scrollbar-none">
          {settingsItems.map((item) => {
            const isActive = subTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setSubTab(item.id as any);
                  if (typeof window !== 'undefined') {
                    window.location.hash = `#${item.id}`;
                  }
                }}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-lg text-xs font-bold transition-all cursor-pointer text-left shrink-0 ${
                  isActive
                    ? 'bg-[var(--accent-solid)] text-[var(--accent-on-solid)]'
                    : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--bg-panel-soft)]'
                }`}
              >
                {item.icon}
                <span>{currentLang === 'no' ? item.labelNo : item.labelEn}</span>
              </button>
            );
          })}
        </nav>

        <div className="flex-grow w-full min-w-0 animate-fade-in space-y-6">
          
          {subTab === 'about' && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-[var(--text)]">{currentLang === 'no' ? 'Om Beredskap101' : 'About Beredskap101'}</h3>
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 space-y-4 leading-relaxed text-sm">
                {currentLang === 'no' ? (
                  <>
                    <p>
                      <strong>Beredskap101</strong> er en kunnskapsplattform basert på operativ erfaring fra sikkerhet og beredskap, samfunnssikkerhet, førstehjelp og overlevelse.
                    </p>
                    <p>
                      Målet er å gjøre egenberedskap enkelt, saklig og praktisk. Appen fokuserer på de reelle behovene til norske husholdninger i kriser (som strømbrudd eller vannmangel) uten å skape unødvendig frykt eller drama.
                    </p>
                    <p>
                      Siden er bygget som en 100% lokal-først Progressive Web App (PWA). Alt kjerneinnhold, offline-kart, sjekklister og backup fungerer helt uten sky eller sentral sporing.
                    </p>
                  </>
                ) : (
                  <>
                    <p>
                      <strong>Beredskap101</strong> is a knowledge platform grounded in security, societal safety, first aid, and survival experience.
                    </p>
                    <p>
                      Our goal is to keep preparedness simple, sober, and practical. We target the true emergency requirements of households (such as blackouts or water disruptions) without inducing fear or drama.
                    </p>
                    <p>
                      This site operates as a 100% local-first Progressive Web App (PWA). All primary articles, offline maps, checklist trackers, and backups operate completely free from cloud sync or central telemetry.
                    </p>
                  </>
                )}
              </div>
            </div>
          )}

          {subTab === 'faq' && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-[var(--text)]">{currentLang === 'no' ? 'Vanlige spørsmål' : 'FAQ'}</h3>
              <div className="space-y-3">
                {(currentLang === 'no'
                  ? [
                      ['Lagrer dere persondata?', 'Nei. Sjekklister, preferanser, lokale dokumenter, vedlegg, cookievalg og lokal KI-konfigurasjon lagres lokalt i nettleseren på denne enheten. Det brukes ingen automatisk skysynk eller tredjeparts analyse.'],
                      ['Hva betyr lokal-first og air-gapped i denne appen?', 'Det betyr at kjerneinnhold, søk, sjekklister, backup, dokumentlager og lokal KI er laget for å fungere uten å sende data til Beredskap101 sine servere. Lokal KI er begrenset til localhost, privat IP eller .local-domene.'],
                      ['Hvordan fungerer eksport og sletting?', 'Artikkel 20 eksport ligger i Databehandling. Artikkel 17 sletting ligger også i Databehandling under "Slett alle appdata". Du må selv eksportere før sletting hvis du vil beholde en kopi.'],
                      ['Hvordan tar jeg i bruk lokal KI her?', '1. Installer en lokal kjører som Ollama (ollama.com/download), LM Studio (lmstudio.ai/download), Jan (jan.ai) eller en annen OpenAI-kompatibel lokal server. 2. Last ned en liten modell, for eksempel Qwen 2.5 3B Instruct eller Llama 3.2 3B Instruct. 3. I appen under Checklists > Local AI: aktiver Lokal KI, lim inn lokal URL (ofte http://localhost:11434/v1), og angi modellnavnet. 4. Test tilkoblingen. Ved feil brukes en lokal reserve.'],
                      ['Hvordan fungerer kartpakken nå?', 'Nettilkoblet gatekart er førstevalg når nett finnes. Den innebygde offline-kartpakken følger med som orienteringsbakgrunn uten nett, ikke som autoritativ ruting eller kartografi. Hvis begge feiler, faller appen tilbake til en enkel reservevisning uten å miste tilfluktsromlisten, romnummer eller søk.'],
                      ['Er dette en erstatning for nødetater?', 'Nei. Ring alltid 110, 112 eller 113 ved akutte hendelser. Innholdet er veiledende og skal brukes med menneskelig vurdering.'],
                    ]
                  : [
                      ['Do you store personal data?', 'No. Checklists, preferences, local documents, attachments, cookie choices, and local AI configuration stay in the browser on this device. There is no automatic cloud sync or third-party analytics.'],
                      ['What does local-first and air-gapped mean here?', 'It means core content, search, checklists, backups, the document vault, and local AI are designed to work without sending data to Beredskap101 servers. Local AI is restricted to localhost, private IP ranges, or .local domains.'],
                      ['How do export and deletion work?', 'Article 20 export lives in Data Management. Article 17 deletion lives in Data Management under "Delete all app data". Export first if you want to keep a copy before deletion.'],
                      ['How do I start using a local AI model here?', '1. Install a local runner such as Ollama, LM Studio, or Jan. 2. Pull a small model, for example Qwen 2.5 3B Instruct or Llama 3.2 3B Instruct. 3. In the app under Checklists > Local AI: enable Local AI, paste the local URL (often http://localhost:11434/v1), and the model name. 4. Test connection. If it fails, the app uses local fallback.'],
                      ['How does the map package work now?', 'Online street map is preferred when internet is available. A bundled offline package ships with the app as an orientation backdrop without internet, not as authoritative routing or cartography.'],
                      ['Is this a replacement for emergency services?', 'No. Always call 110, 112 or 113 in acute emergencies. The content is advisory and should be used with human judgment.'],
                    ]
                ).map(([q, a]) => (
                  <article key={q} className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
                    <h4 className="font-bold text-sm text-[var(--text)] inline-flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 shrink-0" />
                      {q}
                    </h4>
                    <p className="text-xs md:text-sm text-[var(--muted)] mt-2 leading-relaxed">{a}</p>
                  </article>
                ))}
              </div>
            </div>
          )}

          {subTab === 'appearance' && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-[var(--text)]">{currentLang === 'no' ? 'Utseende & Tema' : 'Appearance & Themes'}</h3>
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 space-y-4">
                <p className="text-sm text-[var(--muted)] leading-relaxed">
                  {currentLang === 'no'
                    ? 'Velg fargetemaet som passer best for din skjerm og omgivelsene. Signal-temaet bruker farger med ekstra høy kontrast for krevende lysforhold.'
                    : 'Choose the color theme that best suits your screen and environment. The Signal theme uses extra high contrast colors optimized for difficult lighting conditions.'}
                </p>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setTheme('dark')}
                    className={`inline-flex items-center gap-2 text-xs font-bold rounded-lg px-4 py-2 border cursor-pointer transition-all ${
                      theme === 'dark'
                        ? 'bg-[var(--accent-solid)] border-transparent text-[var(--accent-on-solid)]'
                        : 'bg-[var(--card)] border-[var(--border)] text-[var(--text)] hover:border-[var(--accent)]/55'
                    }`}
                  >
                    <Moon className="w-4 h-4" />
                    <span>{currentLang === 'no' ? 'Mørkt tema' : 'Dark Theme'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTheme('light')}
                    className={`inline-flex items-center gap-2 text-xs font-bold rounded-lg px-4 py-2 border cursor-pointer transition-all ${
                      theme === 'light'
                        ? 'bg-[var(--accent-solid)] border-transparent text-[var(--accent-on-solid)]'
                        : 'bg-[var(--card)] border-[var(--border)] text-[var(--text)] hover:border-[var(--accent)]/55'
                    }`}
                  >
                    <Sun className="w-4 h-4" />
                    <span>{currentLang === 'no' ? 'Lyst tema' : 'Light Theme'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTheme('signal')}
                    className={`inline-flex items-center gap-2 text-xs font-bold rounded-lg px-4 py-2 border cursor-pointer transition-all ${
                      theme === 'signal'
                        ? 'bg-[var(--accent-solid)] border-transparent text-[var(--accent-on-solid)]'
                        : 'bg-[var(--card)] border-[var(--border)] text-[var(--text)] hover:border-[var(--accent)]/55'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span>{currentLang === 'no' ? 'Signal-tema' : 'Signal Theme'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {subTab === 'contact' && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-[var(--text)]">{currentLang === 'no' ? 'Kontakt oss' : 'Contact Us'}</h3>
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 space-y-4">
                <p className="text-sm text-[var(--muted)] leading-relaxed">
                  {currentLang === 'no'
                    ? 'For spørsmål om Beredskap101, forslag til innhold eller tilbakemeldinger om universell utforming, kan du kontakte oss på e-post. Handoff skjer direkte til din e-postklient uten serverlagring.'
                    : 'For questions about Beredskap101, content feedback, or accessibility issues, contact us via email. The action redirects directly to your email client without server logs.'}
                </p>
                <ContactEmailBar
                  currentLang={currentLang}
                  contactEmail={contactEmail}
                  copiedContactEmail={copiedContactEmail}
                  onCopyContactEmail={onCopyContactEmail}
                />
              </div>
            </div>
          )}

          {subTab === 'privacy' && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-[var(--text)]">{currentLang === 'no' ? 'Personvernserklæring' : 'Privacy Policy'}</h3>
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 space-y-3 text-sm text-[var(--muted)] leading-relaxed">
                {(currentLang === 'no'
                  ? [
                      'Beredskap101 samler ikke inn personopplysninger for analyse, profilering eller annonsering.',
                      'Sjekklistedata, lokale dokumenter, vedlegg, cookievalg og innstillinger for lokal KI lagres lokalt i nettleseren på din enhet. Ingen automatisk skysynk brukes.',
                      'Hvis du sletter nettleserdata eller bytter enhet, forsvinner dataene med mindre du har brukt eksportfunksjonen.',
                      'Valgfri lokal KI (Ollama/LM Studio etc.) sender bare forespørsler til ditt eget angitte lokale endepunkt på localhost eller privat IP-område. Data sendes aldri til Beredskap101 sine servere.',
                      'Artikkel 17 sletting og Artikkel 20 dataeksport er lett tilgjengelig lokalt under Databehandling.',
                    ]
                  : [
                      'Beredskap101 does not collect personal data for tracking, profiling, or ads.',
                      'Checklist state, local documents, attachments, cookie choices, and local AI configs are stored locally in the browser on your device. No automatic cloud sync is used.',
                      'If you clear browser cookies or switch devices, data is lost unless you have exported it manually.',
                      'Optional local AI (Ollama/LM Studio) sends requests only to your specified local endpoint on localhost or a private IP. No data is sent to Beredskap101 servers.',
                      'Article 17 deletion and Article 20 data export are easily accessible locally under Data Management.',
                    ]
                ).map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>
            </div>
          )}

          {subTab === 'terms' && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-[var(--text)]">{currentLang === 'no' ? 'Bruksvilkår' : 'Terms of Service'}</h3>
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 space-y-3 text-sm text-[var(--muted)] leading-relaxed">
                {(currentLang === 'no'
                  ? [
                      'Ved bruk av denne tjenesten godtar du at all informasjon brukes på eget ansvar og risiko.',
                      'Beredskap101 tilbyr kun informasjon og verktøy for egenberedskap og skal ikke erstatte offisiell kriseinformasjon eller nødnummer.',
                      'Innholdet eller appen skal ikke brukestil ulovlige formål eller til å forstyrre andres sikkerhet.',
                    ]
                  : [
                      'By using this service, you agree that all preparedness information is used at your own risk.',
                      'Beredskap101 provides only advisory content and local tools. It does not replace official emergency advisories.',
                      'This content or application is not to be used for unlawful actions or to disrupt safety.',
                    ]
                ).map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>
            </div>
          )}

          {subTab === 'legal' && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-[var(--text)]">{currentLang === 'no' ? 'Juridisk informasjon og ansvarsfraskrivelse' : 'Legal Notice & Disclaimers'}</h3>
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 space-y-3 text-sm text-[var(--muted)] leading-relaxed">
                {(currentLang === 'no'
                  ? [
                      'Innholdet på Beredskap101 er kun veiledende og kan inneholde mangler eller foreldet informasjon.',
                      'Appen erstatter ikke nødnummer eller profesjonell rådgivning fra helsepersonell, politi eller brannvesen.',
                      'Ved akutt eller livstruende fare må offisielle nødetater kontaktes umiddelbart på 110, 112 eller 113.',
                    ]
                  : [
                      'The content on Beredskap101 is strictly advisory and may contain omissions or outdated details.',
                      'This application does not replace emergency dispatch or professional instructions from clinicians or emergency personnel.',
                      'In acute danger, contact public emergency services immediately at 110, 112 or 113.',
                    ]
                ).map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>
            </div>
          )}

          {subTab === 'cookies' && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-[var(--text)]">{currentLang === 'no' ? 'Cookie-innstillinger' : 'Cookie Preferences'}</h3>
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 space-y-4">
                <p className="text-sm text-[var(--muted)] leading-relaxed">
                  {currentLang === 'no'
                    ? 'Beredskap101 bruker ikke analyse- eller markedsføringskapsler. Du kan velge om du vil tillate informasjonskapsler som trengs for å huske innstillingene dine.'
                    : 'Beredskap101 does not use analytics or marketing cookies. You can manage whether optional cookies used to store configuration are accepted.'}
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    onClick={() => {
                      saveCookiePrefs(false);
                    }}
                    className="px-3 py-2 rounded-lg border border-[var(--border)] text-xs font-bold cursor-pointer hover:bg-[var(--bg)]"
                  >
                    {currentLang === 'no' ? 'Avvis valgfri' : 'Reject optional'}
                  </button>
                  <button
                    onClick={() => {
                      saveCookiePrefs(true);
                    }}
                    className="px-3 py-2 rounded-lg bg-[var(--accent-solid)] text-[var(--accent-on-solid)] text-xs font-bold cursor-pointer hover:opacity-90"
                  >
                    {currentLang === 'no' ? 'Godta valgfri' : 'Accept optional'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {subTab === 'data' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-[var(--text)]">{currentLang === 'no' ? 'Databehandling og brukerrettigheter (GDPR)' : 'Data Management & User Rights (GDPR)'}</h3>
              
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 space-y-4">
                <h4 className="text-sm font-bold flex items-center gap-2 text-[var(--text)]">
                  <Database className="w-4 h-4 text-[var(--accent)] shrink-0" />
                  {currentLang === 'no' ? 'Artikkel 20 Dataportabilitet (Eksport / Import)' : 'Article 20 Data Portability (Export / Import)'}
                </h4>
                <p className="text-xs text-[var(--muted)] leading-relaxed">
                  {currentLang === 'no'
                    ? 'Eksporter eller gjenopprett dine lokale sjekklister, dokumenter, notater og KI-innstillinger. Dataene krypteres med ditt eget passord før eksport.'
                    : 'Export or restore your local checklists, documents, notes, and AI settings. The data is encrypted with your own passkey before export.'}
                </p>
                <div className="border-t border-[var(--border)] pt-4">
                  <SecureSaveManager theme={theme} />
                </div>
              </div>

              <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 space-y-4">
                <h4 className="text-sm font-bold flex items-center gap-2 text-[var(--text)]">
                  <Trash2 className="w-4 h-4 text-red-500 shrink-0" />
                  {currentLang === 'no' ? 'Artikkel 17 Retten til å bli glemt (Lokalt dokumentlager / Sletting)' : 'Article 17 Right to be Forgotten (Local Document Vault / Erasure)'}
                </h4>
                <p className="text-xs text-[var(--muted)] leading-relaxed">
                  {currentLang === 'no'
                    ? 'Administrer dine lagrede dokumenter eller slett alle lokale appdata og innstillinger permanent fra denne enheten.'
                    : 'Manage your stored documents or permanently erase all local application data and settings from this device.'}
                </p>
                <div className="border-t border-[var(--border)] pt-4">
                  <LocalDocumentVault theme={theme} />
                </div>
              </div>
            </div>
          )}

          {subTab === 'accessibility' && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-[var(--text)]">
                {currentLang === 'no' ? 'Universell utforming og typografistandard' : 'Universal Design & Typography Standards'}
              </h3>
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 space-y-4 text-sm leading-relaxed text-[var(--muted)]">
                <p>
                  {currentLang === 'no'
                    ? 'Beredskap101 følger strenge standarder for universell utforming og kontrast for å sikre maksimal tilgjengelighet for alle brukere under krevende forhold.'
                    : 'Beredskap101 adheres to high-readability standards to make critical crisis checklists easily digestible for all users under pressure.'}
                </p>

                <div className="border-t border-[var(--border)] pt-4 space-y-3">
                  <h4 className="font-bold text-[var(--text)] text-sm">
                    {currentLang === 'no' ? 'Anbefalt lesbarhet og typografispesifikasjoner:' : 'Readability and Inclusivity Specifications:'}
                  </h4>
                  <ul className="text-xs space-y-3 list-disc pl-5">
                    <li>
                      <strong>{currentLang === 'no' ? 'Unngå karakterforveksling:' : 'Distinct Letterforms:'}</strong>{' '}
                      {currentLang === 'no'
                        ? 'Skrifttyper må ha distinkte former for like tegn. For eksempel skal tallene 1 og 7, store I og lille l ikke kunne forveksles. Vi prioriterer Atkinson Hyperlegible (utviklet av Braille Institute) og Inter.'
                        : 'Typefaces should prioritize clear letter differentiation. For instance, the uppercase I, lowercase l, and number 1 must feature distinct designs to avoid character confusion.'}
                    </li>
                    <li>
                      <strong>{currentLang === 'no' ? 'Store bokstavåpninger (Apertures):' : 'Open Apertures:'}</strong>{' '}
                      {currentLang === 'no'
                        ? 'Bokstaver som c, e, o må ha store, åpne buer for å forhindre at de smelter sammen ved nedsatt syn eller lav oppløsning.'
                        : 'Characters like c, e, and o should feature wide, open aperture spaces. This prevents shapes from appearing closed or illegible at smaller sizes.'}
                    </li>
                    <li>
                      <strong>{currentLang === 'no' ? 'Optimal strekvekt:' : 'Solid Stroke Weights:'}</strong>{' '}
                      {currentLang === 'no'
                        ? 'For løpende tekst bør strekvekten være tilstrekkelig tykk (Regular eller Medium). Tynne (Light) vekter unngås da de reduserer lesbarheten på skjermer med gjenskinn.'
                        : 'Thin font weights are avoided for body texts. Solid Regular/Medium stroke weights keep character strokes clearly visible under difficult light conditions.'}
                    </li>
                    <li>
                      <strong>{currentLang === 'no' ? 'Tegnavstand (Spacing):' : 'Expanded Character Spacing:'}</strong>{' '}
                      {currentLang === 'no'
                        ? 'En litt romsligere avstand mellom bokstaver bidrar til å skille tegnene fra hverandre, noe som er spesielt gunstig for lesere med dysleksi.'
                        : 'Slightly expanded tracking helps separate neighboring letters, reducing cognitive load and helping dyslexic readers significantly.'}
                    </li>
                    <li>
                      <strong>{currentLang === 'no' ? 'Bruk av Monospace:' : 'Monospace for data:'}</strong>{' '}
                      {currentLang === 'no'
                        ? 'For numeriske koder, telefonnumre og tabeller bruker vi JetBrains Mono for å sikre fullstendig entydighet og nøyaktig kolonnejustering.'
                        : 'For numbers, coordinates, and emergency phone listings, we use JetBrains Mono to guarantee alignment and prevent character ambiguity.'}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </section>
  );
}

export function AboutPage({ currentLang, onStartLearning, onBeginTraining }: AboutPageProps) {
  return (
    <section className="section py-10 px-4 sm:px-8 max-w-[920px] mx-auto space-y-6">
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 space-y-3">
        <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--accent)]">
          {currentLang === 'no' ? 'Om prosjektet' : 'About the project'}
        </span>
        <h2 className="text-2xl md:text-3xl font-bold text-[var(--text)]">
          {currentLang === 'no' ? 'Om Beredskap101' : 'About Beredskap101'}
        </h2>
        <p className="text-sm md:text-base text-[var(--muted)] leading-relaxed max-w-[72ch]">
          {currentLang === 'no'
            ? 'Beredskap101 gjør beredskap lettere å forstå og bruke. Siden samler guider, artikler, sjekklister og scenarioøvelser for folk som vil være bedre forberedt i hverdagen.'
            : 'Beredskap101 makes preparedness easier to understand and use. The site brings together guides, articles, checklists, and scenario training for people who want to be better prepared in everyday life.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-4">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
          <h3 className="font-bold text-sm mb-2 text-[var(--text)]">{currentLang === 'no' ? 'Hva vi tilbyr' : 'What we provide'}</h3>
          <ul className="text-sm text-[var(--muted)] space-y-2 list-disc list-inside marker:text-[var(--accent)]">
            <li>{currentLang === 'no' ? 'Kunnskapsartikler og fordypning' : 'Knowledge articles and deeper guidance'}</li>
            <li>{currentLang === 'no' ? 'Interaktive flytskjema og scenarioer' : 'Interactive flowcharts and scenarios'}</li>
            <li>{currentLang === 'no' ? 'Sjekklister, backup og lokalt dokumentlager' : 'Checklists, backups, and local document storage'}</li>
            <li>{currentLang === 'no' ? 'Lokal-first søk, tilfluktsrom og støtteinformasjon' : 'Local-first search, shelters, and support information'}</li>
          </ul>
        </div>

        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
          <h3 className="font-bold text-sm mb-2 text-[var(--text)]">{currentLang === 'no' ? 'Bakgrunn' : 'Background'}</h3>
          <div className="text-sm text-[var(--muted)] leading-relaxed space-y-4">
            {currentLang === 'no' ? (
              <>
                <p>
                  <span className="font-bold text-[var(--text)]">Beredskap101</span> er en kunnskapsplattform basert på operativ erfaring fra sikkerhet og beredskap, akademisk arbeid innen samfunnssikkerhet, og praksisnær opplæring i førstehjelp, søk og redning, friluftsliv og personlig sikkerhet.
                </p>
                <p>
                  Målet er ikke å gjøre beredskap dramatisk. Målet er å gjøre det lettere for vanlige mennesker å ta roligere, tryggere og mer praktiske valg før, under og etter hendelser.
                </p>
                <p>
                  Produktet er utformet som en lokal-first PWA med offline-bruk, tydelig språk, manuell eksport, lokal sletting, og frivillig lokal KI i stedet for skyavhengighet.
                </p>
              </>
            ) : (
              <>
                <p>
                  <span className="font-bold text-[var(--text)]">Beredskap101</span> is a knowledge platform grounded in operational preparedness work, academic work in societal safety, and practical training in first aid, search and rescue, outdoor decision-making, and personal security.
                </p>
                <p>
                  The goal is not to dramatize preparedness. The goal is to help ordinary people make calmer, safer, and more practical decisions before, during, and after disruptive events.
                </p>
                <p>
                  The product is designed as a local-first PWA with offline use, clear language, manual export, local deletion, and optional local AI instead of cloud dependency.
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
          <h3 className="font-bold text-sm mb-2 text-[var(--text)]">{currentLang === 'no' ? 'Lokal lagring, ikke sky' : 'Local storage, not cloud'}</h3>
          <p className="text-sm text-[var(--muted)] leading-relaxed">
            {currentLang === 'no'
              ? 'Sjekklister, lokale dokumenter, vedlegg, cookievalg og lokale KI-innstillinger lagres i nettleseren på enheten du bruker. Det finnes ingen automatisk skysynk. Hvis du bytter enhet eller sletter nettleserdata, må du bruke egen eksport for å gjenopprette innholdet.'
              : 'Checklists, local documents, attachments, cookie choices, and local AI settings are stored in the browser on the device you use. There is no automatic cloud sync. If you change device or clear browser data, you must use your own export to restore the content.'}
          </p>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
          <h3 className="font-bold text-sm mb-2 text-[var(--text)]">{currentLang === 'no' ? 'Valgfri lokal KI' : 'Optional local AI'}</h3>
          <p className="text-sm text-[var(--muted)] leading-relaxed">
            {currentLang === 'no'
              ? 'Hvis du aktiverer lokal KI, kobles appen bare til ditt eget program som kjører KI lokalt, som Ollama, LM Studio, Jan eller vLLM. Appen lagrer bare lokal URL og modellnavn. Modellfilene blir i den lokale kjøreren, og appen bruker  ingen skybasert reserve hvis tilkoblingen feiler.'
              : 'If you enable local AI, the app connects only to your own local AI runner, such as Ollama, LM Studio, Jan, or vLLM. The app stores only the local URL and model name. The model files stay in the local runner, and the app uses deterministic local fallback if the connection fails.'}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        <button
          type="button"
          onClick={onStartLearning}
          className="px-4 py-2 rounded-lg bg-[var(--accent-solid)] text-[var(--accent-on-solid)] text-sm font-bold inline-flex items-center gap-2 cursor-pointer transition-colors hover:opacity-90"
        >
          <BookOpen className="w-4 h-4" />
          {currentLang === 'no' ? 'Start læring' : 'Start learning'}
        </button>
        <button
          type="button"
          onClick={onBeginTraining}
          className="px-4 py-2 rounded-lg border border-[var(--border)] text-sm font-bold text-[var(--text)] inline-flex items-center gap-2 cursor-pointer transition-colors hover:bg-[var(--border)]/30"
        >
          <Shield className="w-4 h-4" />
          {currentLang === 'no' ? 'Start trening' : 'Begin training'}
        </button>
      </div>
    </section>
  );
}

export function RecommendedReadingPage({ currentLang }: { currentLang: string }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const categoryOptions = useMemo(() => {
    const categories = new Map<string, string>();
    for (const item of readingItems) {
      categories.set(item.categoryEn, currentLang === 'no' ? item.categoryNo : item.categoryEn);
    }
    return [['all', currentLang === 'no' ? 'Alle' : 'All'], ...Array.from(categories.entries())];
  }, [currentLang]);

  const filteredItems = useMemo(() => {
    if (selectedCategory === 'all') return readingItems;
    return readingItems.filter((item) => item.categoryEn === selectedCategory);
  }, [selectedCategory]);

  return (
    <section className="section py-10 px-4 sm:px-8 max-w-[1100px] mx-auto space-y-6">
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 space-y-3">
        <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--accent)]">
          {currentLang === 'no' ? 'Lesetips' : 'Recommended reading'}
        </span>
        <h2 className="text-2xl md:text-3xl font-bold text-[var(--text)]">
          {currentLang === 'no' ? 'Anbefalt lesning' : 'Recommended reading'}
        </h2>
        <p className="text-sm md:text-base text-[var(--muted)] leading-relaxed">
          {currentLang === 'no'
            ? 'Et kort, praktisk bibliotek for deg som vil forstå kriser, førstehjelp, egensikkerhet og norske beredskapsråd bedre.'
            : 'A short, practical shelf for understanding crisis behavior, first aid, personal safety, and Norwegian preparedness guidance.'}
        </p>
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label={currentLang === 'no' ? 'Filtrer lesetips' : 'Filter reading recommendations'}>
        {categoryOptions.map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setSelectedCategory(key)}
            className={`px-3 py-2 rounded-full border text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === key
                ? 'bg-[var(--accent-solid)] border-transparent text-[var(--accent-on-solid)]'
                : 'bg-[var(--card)] border-[var(--border)] text-[var(--text)] hover:border-[var(--accent)]/60'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.map((item) => (
          <article key={item.id} className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 flex gap-4">
            {item.cover ? (
              <img
                src={item.cover}
                alt=""
                loading="lazy"
                className="w-20 h-28 rounded-md object-cover border border-[var(--border)] bg-[var(--bg)] flex-shrink-0"
              />
            ) : (
              <div className="w-20 h-28 rounded-md border border-[var(--border)] bg-[var(--bg)] flex-shrink-0 flex items-center justify-center text-[var(--accent)]">
                <FileText className="w-7 h-7" />
              </div>
            )}
            <div className="min-w-0 space-y-2">
              <span className="text-[10px] font-mono uppercase text-[var(--accent)]">
                {currentLang === 'no' ? item.categoryNo : item.categoryEn}
              </span>
              <div>
                <h3 className="text-base font-bold text-[var(--text)] leading-snug">{item.title}</h3>
                <p className="text-xs text-[var(--muted)]">{item.author}</p>
              </div>
              <p className="text-sm text-[var(--muted)] leading-relaxed">
                {currentLang === 'no' ? item.reasonNo : item.reasonEn}
              </p>
              {item.seriesBooks ? (
                <div className="space-y-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] p-3">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted)]">
                    {currentLang === 'no' ? 'Bøker i serien' : 'Books in the series'}
                  </p>
                  <div className="space-y-1.5">
                    {item.seriesBooks.map((book) => (
                      <a
                        key={book.title}
                        href={book.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between gap-2 rounded-md border border-[var(--border)] px-3 py-2 text-sm font-semibold text-[var(--text)] hover:border-[var(--accent)]/60 hover:text-[var(--accent)]"
                      >
                        <span>{book.title}</span>
                        <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              ) : item.url ? (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-[var(--accent)] hover:underline"
                >
                  {currentLang === 'no' ? 'Åpne kilde' : 'Open source'}
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function ContactPage({
  currentLang,
  contactEmail,
  copiedContactEmail,
  onCopyContactEmail,
}: ContactPageProps) {
  return (
    <section className="section py-10 px-4 sm:px-8 max-w-[900px] mx-auto space-y-6">
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 space-y-3">
        <h2 className="text-3xl font-bold text-[var(--text)]">{currentLang === 'no' ? 'Kontakt' : 'Contact'}</h2>
        <p className="text-sm text-[var(--muted)] leading-relaxed">
          {currentLang === 'no'
            ? 'Kontakt skjer som e-post-handoff til samme adresse. Det finnes ikke noe serverlagret kontaktskjema i appen.'
            : 'Contact is handled as an email handoff to the same address. There is no server-stored contact form in the app.'}
        </p>
      </div>

      <ContactEmailBar
        currentLang={currentLang}
        contactEmail={contactEmail}
        copiedContactEmail={copiedContactEmail}
        onCopyContactEmail={onCopyContactEmail}
      />
    </section>
  );
}

export function PolicyPage({ title, body }: { title: string; body: string[] }) {
  return (
    <section className="section py-10 px-4 sm:px-8 max-w-[900px] mx-auto space-y-4">
      <h2 className="text-3xl font-bold text-[var(--text)]">{title}</h2>
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 space-y-3">
        {body.map((paragraph, idx) => (
          <p key={idx} className="text-sm text-[var(--muted)] leading-relaxed">
            {paragraph}
          </p>
        ))}
      </div>
    </section>
  );
}

export function FAQPage({ currentLang }: { currentLang: string }) {
  const faqs = currentLang === 'no'
    ? [
        ['Lagrer dere persondata?', 'Nei. Sjekklister, preferanser, lokale dokumenter, vedlegg, cookievalg og lokal KI-konfigurasjon lagres lokalt i nettleseren på denne enheten. Det brukes ingen automatisk skysynk eller tredjeparts analyse.'],
        ['Hva betyr lokal-first og air-gapped i denne appen?', 'Det betyr at kjerneinnhold, søk, sjekklister, backup, dokumentlager og lokal KI er laget for å fungere uten å sende data til Beredskap101 sine servere. Lokal KI er begrenset til localhost, privat IP eller .local-domene.'],
        ['Hvordan fungerer eksport og sletting?', 'Artikkel 20 eksport ligger i Checklists > Backup. Artikkel 17 sletting ligger i Checklists > Local Document Vault. Du må selv eksportere før sletting hvis du vil beholde en kopi.'],
        ['Hvordan tar jeg i bruk lokal KI her? Forklar enkelt.', '1. Installer en lokal kjører som Ollama (ollama.com/download), LM Studio (lmstudio.ai/download), Jan (jan.ai) eller en annen OpenAI-kompatibel lokal server. 2. Last ned eller importer en liten modell i den kjøreren, for eksempel Qwen 2.5 3B Instruct, Llama 3.2 3B Instruct eller Mistral 7B Instruct fra den lokale kjøreren eller modellkataloger som Hugging Face. 3. I appen: aktiver Lokal KI, lim inn lokal URL, ofte http://localhost:11434/v1, og samme modellnavn. 4. Test tilkoblingen. 5. Ved feil returneres et bestemt lokalt svar.'],
        ['Hvor laster jeg ned modeller?', `Appen laster ikke ned modellfiler selv. Bruk den lokale kjøreren først. Offisielle utgangspunkt: Ollama ${LOCAL_RUNNER_LINKS.ollama}, LM Studio ${LOCAL_RUNNER_LINKS.lmStudio}, Jan ${LOCAL_RUNNER_LINKS.jan}, Qwen-katalog ${LOCAL_RUNNER_LINKS.qwen}, Llama-katalog ${LOCAL_RUNNER_LINKS.llama}, Mistral-katalog ${LOCAL_RUNNER_LINKS.mistral}.`],
        ['Hvilke norske nyhetskilder brukes?', 'Nyhetsfeeden er kildebasert, ikke nøkkelordstyrt. Den henter innhold fra NRK, Digi.no, Politiet / Politiloggen, MET Norway farevarsler og DSB. Hvis live-feeden ikke er tilgjengelig, brukes cache og lokale reservekort.'],
        ['Hvilke nøkkelord er nyttige for norske nyheter og søk?', 'Bruk ord som egenberedskap, nødvarsel, strømbrudd, vannforsyning, ekstremvær, evakuering, tilfluktsrom, Politiloggen, skred, flom, førstehjelp, kommuneinfo, DSB og Sivilforsvaret. Disse nøkkelordene dokumenteres for å hjelpe deg å søke bedre, men de styrer ikke hvilke kilder som hentes.'],
        ['Hvordan fungerer kartpakken nå?', 'Nettilkoblet gatekart er førstevalg når nett finnes. Den innebygde offline-kartpakken følger med som orienteringsbakgrunn uten nett, ikke som autoritativ ruting eller kartografi. Hvis begge feiler, faller appen tilbake til en enkel reservevisning uten å miste tilfluktsromlisten, romnummer eller søk.'],
        ['Hvordan bytter jeg mellom online og offline modus?', '1. Åpne appen med nett minst én gang slik at offline-skallet caches. 2. For online: koble til nett og last inn siden på nytt. 3. For offline-test: sett nettleseren til Offline i DevTools og oppdater siden. 4. Se statusbrikken øverst: ONLINE, DEGRADED eller OFFLINE.'],
        ['Er dette en erstatning for nødetater?', 'Nei. Ring alltid 110, 112 eller 113 ved akutte hendelser. Innholdet er veiledende og skal brukes med menneskelig vurdering.'],
      ]
    : [
        ['Do you store personal data?', 'No. Checklists, preferences, local documents, attachments, cookie choices, and local AI configuration stay in the browser on this device. There is no automatic cloud sync or third-party analytics.'],
        ['What does local-first and air-gapped mean here?', 'It means core content, search, checklists, backups, the document vault, and local AI are designed to work without sending data to Beredskap101 servers. Local AI is restricted to localhost, private IP ranges, or .local domains.'],
        ['How do export and deletion work?', 'Article 20 export lives in Checklists > Backup. Article 17 deletion lives in Checklists > Local Document Vault. Export first if you want to keep a copy before deletion.'],
        ['How do I start using a local AI model here? ELI5.', '1. Install a local runner such as Ollama (ollama.com/download), LM Studio (lmstudio.ai/download), Jan (jan.ai), or another OpenAI-compatible local server. 2. Pull or import a small model there, for example Qwen 2.5 3B Instruct, Llama 3.2 3B Instruct, or Mistral 7B Instruct from the runner or model catalogs such as Hugging Face. 3. In the app: enable Local AI, paste the local URL, often http://localhost:11434/v1, and the same model name. 4. Test the connection. 5. If it fails, the app uses deterministic local fallback with no cloud call.'],
        ['Where do I download models?', `The app does not download model files itself. Use the local runner first. Good starting points: Ollama ${LOCAL_RUNNER_LINKS.ollama}, LM Studio ${LOCAL_RUNNER_LINKS.lmStudio}, Jan ${LOCAL_RUNNER_LINKS.jan}, Qwen catalog ${LOCAL_RUNNER_LINKS.qwen}, Llama catalog ${LOCAL_RUNNER_LINKS.llama}, Mistral catalog ${LOCAL_RUNNER_LINKS.mistral}.`],
        ['Which Norwegian news inputs are used?', 'The news feed is source-based, not keyword-filtered. It pulls from NRK, Digi.no, Politiet / Politiloggen, MET Norway alerts, and DSB. If the live feed is unavailable, cached items and bundled official cards remain available.'],
        ['Which keywords are useful for Norwegian news and search?', 'Try terms such as household preparedness, emergency alert, blackout, water supply, extreme weather, evacuation, shelter, police log, landslide, flood, first aid, municipal information, DSB, and Civil Defence. These keywords are documented for search transparency only; they do not decide which live sources are fetched.'],
        ['How does the map package work now?', 'Online street map is preferred when internet is available. A bundled offline package ships with the app as an orientation backdrop without internet, not as authoritative routing or cartography. If both fail, the app falls back to a simple reserve view without losing the shelter list, shelter ID, or search.'],
        ['How do I switch between online and offline mode?', '1. Open the app online at least once so the offline shell is cached. 2. For online mode: reconnect and refresh. 3. For offline testing: set the browser to Offline in DevTools and refresh. 4. Check the status chip at the top: ONLINE, DEGRADED, or OFFLINE.'],
        ['Is this a replacement for emergency services?', 'No. Always call 110, 112, or 113 in acute emergencies. The content is advisory and should be used with human judgment.'],
      ];

  return (
    <section className="section py-10 px-4 sm:px-8 max-w-[900px] mx-auto space-y-5">
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 space-y-2">
        <h2 className="text-3xl font-bold text-[var(--text)]">{currentLang === 'no' ? 'Vanlige spørsmål' : 'FAQ'}</h2>
        <p className="text-sm text-[var(--muted)] leading-relaxed">
          {currentLang === 'no'
            ? 'Forklaringer om lokal lagring, lokal KI, nyhetskilder, kartpakker og datarettigheter.'
            : 'Answers about local storage, local AI, news sources, map packages, and data rights.'}
        </p>
      </div>
      {faqs.map(([question, answer]) => (
        <article key={question} className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
          <h3 className="font-bold text-sm text-[var(--text)] inline-flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            {question}
          </h3>
          <p className="text-sm text-[var(--muted)] mt-2 leading-relaxed">{answer}</p>
        </article>
      ))}
    </section>
  );
}
