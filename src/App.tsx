/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Suspense, lazy, startTransition, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import MiniSearch from 'minisearch';
import {
  BookOpen,
  Activity,
  Award,
  AlertTriangle,
  ArrowRight,
  BookmarkCheck,
  CheckSquare,
  Database,
  FileText,
  ListChecks,
  LifeBuoy,
  Search,
  ShieldCheck,
  BarChart3,
  Info,
  Map as MapIcon,
  Moon,
  ExternalLink,
  Copy,
  Sun
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LANGUAGE_STORAGE_KEY } from './i18n';
import { checklistsDataEn, checklistsDataNo, pillarsDataEn, pillarsDataNo } from './data/pillarsData';
import { PillarId, ThemeType } from './types';
import { optimizeTitle } from './utils/titleOptimizer';
import { localizeCategory } from './utils/localizationHelper';
import { localizeProcessedAsset } from './utils/localizeProcessedAsset';
import { isDisplayWorthyAsset } from './utils/assetQualityGate';
import { telemetryInstance, ConnectivityState } from './utils/connectivityTelemetry';
import CookieBanner, { saveCookiePrefs, useCookiePrefs } from './components/CookiePreferences';
import { glossaryData } from './data/glossaryData';
import { editorialArticles } from './data/editorialArticles';
import sheltersData from './data/shelters.json';
import { sourceRegistry } from './data/sourceRegistry';
import { buildOfflineKnowledgeArtifacts } from './utils/offlineKnowledge';
import { formatOsloDateTime } from './utils/dateTime';
import type { ContentPack, SearchDocument } from './types/offline';

type AppTab =
  'manual' | 'library' | 'reference-library' | 'glossary' | 'recommended-reading' | 'support' | 'scenarios' | 'flowcharts' | 'checklists' | 'about' | 'contact' | 'privacy' | 'legal' | 'terms' | 'faq' | 'cookies' | 'shelters' | 'appearance' | 'data' | 'accessibility';

const hashToTab: Record<string, AppTab> = {
  knowledge: 'manual',
  library: 'library',
  'reference-library': 'reference-library',
  glossary: 'glossary',
  'recommended-reading': 'recommended-reading',
  support: 'support',
  scenarios: 'scenarios',
  flowcharts: 'flowcharts',
  checklists: 'checklists',
  about: 'about',
  contact: 'contact',
  privacy: 'privacy',
  legal: 'legal',
  terms: 'terms',
  faq: 'faq',
  cookies: 'cookies',
  shelters: 'shelters',
  'shelter-map': 'shelters',
  appearance: 'appearance',
  data: 'data',
  accessibility: 'accessibility',
};

const tabToHash: Record<AppTab, string> = {
  manual: 'knowledge',
  library: 'library',
  'reference-library': 'reference-library',
  glossary: 'glossary',
  'recommended-reading': 'recommended-reading',
  support: 'support',
  scenarios: 'scenarios',
  flowcharts: 'flowcharts',
  checklists: 'checklists',
  about: 'about',
  contact: 'contact',
  privacy: 'privacy',
  legal: 'legal',
  terms: 'terms',
  faq: 'faq',
  cookies: 'cookies',
  shelters: 'shelters',
  appearance: 'appearance',
  data: 'data',
  accessibility: 'accessibility',
};

type SearchLanguageFilter = 'all' | 'en' | 'no';
type SearchCriticalityFilter = 'all' | 'high' | 'medium' | 'low';
type SearchTypeFilter = 'all' | SearchDocument['type'];

type IndexedSearchDocument = SearchDocument & {
  tagsText: string;
};

type LocalSearchResult = SearchDocument & {
  score: number;
};

const SafetyChecklists = lazy(() => import('./components/SafetyChecklists'));
const InteractiveFlowcharts = lazy(() => import('./components/InteractiveFlowcharts'));
const TrainingScenarios = lazy(() => import('./components/TrainingScenarios'));
const ExtendedAssetViewer = lazy(() => import('./components/ExtendedAssetViewer'));
const EditorialArticlesViewer = lazy(() => import('./components/EditorialArticlesViewer'));
const DynamicGearListBuilder = lazy(() => import('./components/DynamicGearListBuilder'));
const SecureSaveManager = lazy(() => import('./components/SecureSaveManager'));
const LocalDocumentVault = lazy(() => import('./components/LocalDocumentVault'));
const LocalAiAssistant = lazy(() => import('./components/LocalAiAssistant'));
const KnowledgeMap = lazy(() => import('./components/KnowledgeMap'));
const SourceLinksSection = lazy(() => import('./components/SourceLinksSection'));
const NorwegianNewsFeed = lazy(() => import('./components/NorwegianNewsFeed'));
const ShelterMap = lazy(() => import('./components/ShelterMap'));
const AboutPage = lazy(() => import('./components/StaticPages').then((mod) => ({ default: mod.AboutPage })));
const ContactPage = lazy(() => import('./components/StaticPages').then((mod) => ({ default: mod.ContactPage })));
const FAQPage = lazy(() => import('./components/StaticPages').then((mod) => ({ default: mod.FAQPage })));
const GlossaryPage = lazy(() => import('./components/StaticPages').then((mod) => ({ default: mod.GlossaryPage })));
const PolicyPage = lazy(() => import('./components/StaticPages').then((mod) => ({ default: mod.PolicyPage })));
const RecommendedReadingPage = lazy(() => import('./components/StaticPages').then((mod) => ({ default: mod.RecommendedReadingPage })));
const SupportHubPage = lazy(() => import('./components/StaticPages').then((mod) => ({ default: mod.SupportHubPage })));

const SEARCH_TYPE_ORDER: SearchDocument['type'][] = [
  'manual-topic',
  'processed-asset',
  'checklist-item',
  'shelter',
  'glossary-term',
  'editorial-article',
  'source-link',
  'content-pack',
];

const SEARCH_RESULT_LIMIT = 20;
const THEME_STORAGE_KEY = 'beredskap101_theme_v1';
const PACK_TYPE_ORDER: Array<Exclude<SearchDocument['type'], 'content-pack'>> = [
  'processed-asset',
  'manual-topic',
  'checklist-item',
  'shelter',
  'glossary-term',
  'editorial-article',
  'source-link',
];

const SEARCH_TYPE_LABELS_EN: Record<SearchDocument['type'], string> = {
  'manual-topic': 'Manual topic',
  'processed-asset': 'Reference asset',
  'checklist-item': 'Checklist',
  shelter: 'Shelter',
  'glossary-term': 'Glossary',
  'editorial-article': 'Editorial',
  'source-link': 'Official source',
  'content-pack': 'Content pack',
};

const SEARCH_TYPE_LABELS_NO: Record<SearchDocument['type'], string> = {
  'manual-topic': 'Manualtema',
  'processed-asset': 'Referansemodul',
  'checklist-item': 'Sjekkliste',
  shelter: 'Tilfluktsrom',
  'glossary-term': 'Begrep',
  'editorial-article': 'Fordypningsartikkel',
  'source-link': 'Offisiell kilde',
  'content-pack': 'Innholdspakke',
};

function readTabFromHash(): AppTab {
  if (typeof window === 'undefined') return 'manual';
  const hash = window.location.hash.replace('#', '').trim();
  return hashToTab[hash] || 'manual';
}

function readUiSubStateFromLocation(): {
  selectedAssetId: string | null;
  selectedPillarId: PillarId | null;
  activeArticleId: string | null;
} {
  if (typeof window === 'undefined') {
    return {
      selectedAssetId: null,
      selectedPillarId: null,
      activeArticleId: null,
    };
  }

  const params = new URLSearchParams(window.location.search);
  const selectedAssetId = params.get('asset');
  const selectedPillarId = params.get('pillar');
  const activeArticleId = params.get('topic');

  return {
    selectedAssetId: selectedAssetId || null,
    selectedPillarId: (selectedPillarId as PillarId | null) || null,
    activeArticleId: activeArticleId || null,
  };
}

function readStoredTheme(): ThemeType | null {
  if (typeof window === 'undefined') return null;

  try {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (storedTheme === 'dark' || storedTheme === 'light' || storedTheme === 'signal') {
      return storedTheme;
    }
  } catch {
    // Ignore storage failures and fall back to system preference.
  }

  return null;
}

function readPreferredTheme(): ThemeType {
  const storedTheme = readStoredTheme();
  if (storedTheme) {
    return storedTheme;
  }

  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  return 'dark';
}

function LazySectionFallback({
  currentLang,
  label,
}: {
  currentLang: string;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-5 text-xs text-[var(--muted)]">
      {currentLang === 'no' ? `Laster ${label.toLowerCase()}...` : `Loading ${label.toLowerCase()}...`}
    </div>
  );
}

type ProcessedAssetsLoadState = 'idle' | 'loading' | 'ready' | 'error';

export default function App() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.resolvedLanguage === 'no' ? 'no' : 'en';
  const [activeTab, setActiveTab] = useState<AppTab>(() => {
    const initialTab = readTabFromHash();
    if (initialTab === 'about' || initialTab === 'contact' || initialTab === 'privacy' || initialTab === 'legal' || initialTab === 'terms' || initialTab === 'faq' || initialTab === 'cookies') {
      return 'support';
    }
    return initialTab;
  });
  const hasInitializedHistoryRef = useRef(false);
  const [referenceTimestamp, setReferenceTimestamp] = useState<number>(() => Date.now());
  const [copiedContactEmail, setCopiedContactEmail] = useState(false);
  const cookiePrefs = useCookiePrefs();
  const contactEmail = 'info@holf.services';

  const pillarsData = useMemo(() => {
    return currentLang === 'no' ? pillarsDataNo : pillarsDataEn;
  }, [currentLang]);

  // Global theme
  const [theme, setTheme] = useState<ThemeType>(() => readPreferredTheme());
  
  // SOP and topic completion tracking
  const [completedTopics, setCompletedTopics] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('beredskap101_map_progress_v2');
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
    } catch {
      return [];
    }
  });

  const toggleTopicCompleted = (topicId: string) => {
    setCompletedTopics(prev => {
      const next = prev.includes(topicId) ? prev.filter(id => id !== topicId) : [...prev, topicId];
      try {
        localStorage.setItem('beredskap101_map_progress_v2', JSON.stringify(next));
      } catch {
        // Keep the in-memory state usable when browser storage is unavailable or full.
      }
      return next;
    });
  };

  // Connectivity state
  const [connState, setConnState] = useState<ConnectivityState>('ONLINE');

  // Checklist sub-tab
  const [checklistSubTab, setChecklistSubTab] = useState<'standard' | 'custom' | 'backup' | 'vault' | 'ai'>('standard');

  // Settings sub-tab state
  const [settingsSubTab, setSettingsSubTab] = useState<'about' | 'faq' | 'contact' | 'privacy' | 'legal' | 'terms' | 'cookies' | 'data' | 'accessibility' | 'appearance'>(() => {
    const initialTab = readTabFromHash();
    if (
      initialTab === 'about' ||
      initialTab === 'contact' ||
      initialTab === 'privacy' ||
      initialTab === 'legal' ||
      initialTab === 'terms' ||
      initialTab === 'faq' ||
      initialTab === 'cookies' ||
      initialTab === 'appearance' ||
      initialTab === 'data' ||
      initialTab === 'accessibility'
    ) {
      return initialTab as any;
    }
    return 'about';
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, currentLang);
    } catch {
      // Ignore storage failures and keep the in-memory language state.
    }

    if (typeof document !== 'undefined') {
      document.documentElement.lang = currentLang === 'no' ? 'nb' : 'en';
    }
  }, [currentLang]);

  useEffect(() => {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore storage failures and keep the in-memory theme state.
    }

    if (typeof document !== 'undefined') {
      const themeMeta = document.querySelector('meta[name="theme-color"]');
      const themeColor = theme === 'light' ? '#eef3f1' : theme === 'signal' ? '#16120d' : '#101614';
      themeMeta?.setAttribute('content', themeColor);

      // Force theme class propagation to root HTML and body elements for absolute parity/reliability.
      const themeClass = theme === 'dark' ? 'theme-dark' : theme === 'signal' ? 'theme-signal' : 'theme-light';
      const root = document.documentElement;
      root.classList.remove('theme-dark', 'theme-light', 'theme-signal');
      root.classList.add(themeClass);
      
      const body = document.body;
      body.classList.remove('theme-dark', 'theme-light', 'theme-signal');
      body.classList.add(themeClass);
    }
  }, [theme]);

  useEffect(() => {
    setConnState(telemetryInstance.getStatus());
    const handler = (e: any) => {
      setConnState(e.detail.current);
    };
    telemetryInstance.addEventListener('statechange', handler);
    return () => {
      telemetryInstance.removeEventListener('statechange', handler);
    };
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setReferenceTimestamp(Date.now());
    }, 60000);
    return () => window.clearInterval(timer);
  }, []);

  const referenceTimeLabel = useMemo(() => {
    return formatOsloDateTime(referenceTimestamp, currentLang === 'no' ? 'nb-NO' : 'en-GB');
  }, [currentLang, referenceTimestamp]);

  const handleCopyContactEmail = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(contactEmail);
      } else if (typeof document !== 'undefined') {
        const temp = document.createElement('textarea');
        temp.value = contactEmail;
        temp.setAttribute('readonly', 'true');
        temp.style.position = 'fixed';
        temp.style.opacity = '0';
        document.body.appendChild(temp);
        temp.select();
        document.execCommand('copy');
        document.body.removeChild(temp);
      }
      setCopiedContactEmail(true);
      window.setTimeout(() => setCopiedContactEmail(false), 1800);
    } catch {
      window.prompt(currentLang === 'no' ? 'Kopier e-postadressen:' : 'Copy the email address:', contactEmail);
    }
  };

  useEffect(() => {
    const handleRouteStateChange = () => {
      const tab = readTabFromHash();
      if (
        tab === 'about' ||
        tab === 'faq' ||
        tab === 'contact' ||
        tab === 'privacy' ||
        tab === 'legal' ||
        tab === 'terms' ||
        tab === 'cookies' ||
        tab === 'appearance' ||
        tab === 'data' ||
        tab === 'accessibility' ||
        tab === 'support'
      ) {
        setActiveTab('support');
        if (tab !== 'support') {
          setSettingsSubTab(tab as any);
        }
      } else {
        setActiveTab(tab);
      }
      const uiState = readUiSubStateFromLocation();
      setSelectedAssetId(uiState.selectedAssetId);
      setSelectedPillarId(uiState.selectedPillarId);
      setActiveArticleId(uiState.activeArticleId);
    };

    window.addEventListener('hashchange', handleRouteStateChange);
    window.addEventListener('popstate', handleRouteStateChange);
    return () => {
      window.removeEventListener('hashchange', handleRouteStateChange);
      window.removeEventListener('popstate', handleRouteStateChange);
    };
  }, []);

  // Local offline search parameters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchTypeFilter, setSearchTypeFilter] = useState<SearchTypeFilter>('all');
  const [searchPillarFilter, setSearchPillarFilter] = useState<string>('all');
  const [searchLanguageFilter, setSearchLanguageFilter] = useState<SearchLanguageFilter>('all');
  const [searchCriticalityFilter, setSearchCriticalityFilter] = useState<SearchCriticalityFilter>('all');
  const deferredSearchQuery = useDeferredValue(searchQuery);
  
  // Pillar Selection state (null means overview)
  const [selectedPillarId, setSelectedPillarId] = useState<PillarId | null>(() => readUiSubStateFromLocation().selectedPillarId);
  
  // Single active article zoom state
  const [activeArticleId, setActiveArticleId] = useState<string | null>(() => readUiSubStateFromLocation().activeArticleId);

  // Single active processed asset state
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(() => readUiSubStateFromLocation().selectedAssetId);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hash = activeTab === 'support' ? `#${settingsSubTab}` : `#${tabToHash[activeTab]}`;

    const assetForUrl =
      activeTab === 'manual' || activeTab === 'library' || activeTab === 'reference-library'
        ? selectedAssetId
        : null;
    const pillarForUrl = activeTab === 'manual' ? selectedPillarId : null;
    const topicForUrl = activeTab === 'manual' ? activeArticleId : null;

    if (assetForUrl) params.set('asset', assetForUrl);
    else params.delete('asset');

    if (pillarForUrl) params.set('pillar', pillarForUrl);
    else params.delete('pillar');

    if (topicForUrl) params.set('topic', topicForUrl);
    else params.delete('topic');

    const nextSearch = params.toString();
    const nextUrl = `${nextSearch ? `?${nextSearch}` : ''}${hash}`;
    const currentUrl = `${window.location.search}${window.location.hash}`;

    if (!hasInitializedHistoryRef.current) {
      hasInitializedHistoryRef.current = true;
      if (nextUrl !== currentUrl) {
        window.history.replaceState(window.history.state, '', nextUrl);
      }
      return;
    }

    if (nextUrl !== currentUrl) {
      window.history.pushState(window.history.state, '', nextUrl);
    }
  }, [activeTab, activeArticleId, selectedAssetId, selectedPillarId, settingsSubTab]);
  
  // Track initial active sub-module tab selected from external preview
  const [selectedAssetInitialTab, setSelectedAssetInitialTab] = useState<'article' | 'guide' | 'checklist' | 'protocol' | 'module' | 'stats'>('article');

  // Pagination for Extended Reference Library
  const [libraryPageSize, setLibraryPageSize] = useState<number>(9);

  // Mapped Pillar Filter for Extended Reference Library
  const [libraryPillarFilter, setLibraryPillarFilter] = useState<string>('all');

  // Filtered assets query inside Extended Reference Library section
  const [librarySearchQuery, setLibrarySearchQuery] = useState<string>('');
  const [libraryPackFilter, setLibraryPackFilter] = useState<string>('all');
  const deferredLibrarySearchQuery = useDeferredValue(librarySearchQuery);

  type ProcessedAssetsPayload = {
    schemaVersion?: string;
    generatedAt?: string;
    sourceRepo?: string;
    sourceRevision?: string;
    assets?: any[];
  } | any[];
  const [processedAssetsPayload, setProcessedAssetsPayload] = useState<ProcessedAssetsPayload | null>(null);
  const [processedAssetsLoadState, setProcessedAssetsLoadState] = useState<ProcessedAssetsLoadState>('idle');

  useEffect(() => {
    let cancelled = false;

    setProcessedAssetsLoadState('loading');
    import('./data/processedAssets.json')
      .then((module) => {
        if (cancelled) return;
        const payload = ((module as { default?: ProcessedAssetsPayload }).default ?? module) as ProcessedAssetsPayload;
        startTransition(() => {
          setProcessedAssetsPayload(payload);
          setProcessedAssetsLoadState('ready');
        });
      })
      .catch((error) => {
        console.error('Failed to load processed asset bundle', error);
        if (!cancelled) {
          setProcessedAssetsLoadState('error');
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const rawProcessedAssets = useMemo<any[]>(() => {
    if (!processedAssetsPayload) return [];
    if (Array.isArray(processedAssetsPayload)) return processedAssetsPayload;
    return Array.isArray(processedAssetsPayload.assets) ? processedAssetsPayload.assets : [];
  }, [processedAssetsPayload]);
  const processedAssetsGeneratedAt = useMemo(() => {
    if (!processedAssetsPayload) return '';
    if (Array.isArray(processedAssetsPayload)) return '';
    return processedAssetsPayload.generatedAt || '';
  }, [processedAssetsPayload]);

  const processedAssets = useMemo(() => {
    return rawProcessedAssets
      .filter((asset) => isDisplayWorthyAsset(asset, currentLang))
      .map((asset) => localizeProcessedAsset(asset, currentLang));
  }, [rawProcessedAssets, currentLang]);
  const selectedProcessedAsset = useMemo(
    () => (selectedAssetId ? processedAssets.find((asset) => asset.id === selectedAssetId) || null : null),
    [processedAssets, selectedAssetId]
  );
  const processedAssetsReady = processedAssetsLoadState === 'ready';

  // Filtered topics/articles flatten helper
  const allTopics = useMemo(() => {
    return pillarsData.flatMap(p => 
      p.topics.map(t => ({
        ...t,
        pillarId: p.id,
        pillarTitle: p.title
      }))
    );
  }, [pillarsData]);
  const referenceCount = processedAssets.length;
  const allGuidesCount = allTopics.length;
  const processedAssetsLoading = processedAssetsLoadState === 'idle' || processedAssetsLoadState === 'loading';
  const processedAssetsFailed = processedAssetsLoadState === 'error';

  const offlineKnowledge = useMemo(() => {
    return buildOfflineKnowledgeArtifacts({
      bundledAt: '2026-06-01',
      lastSourceReview: '2026-06-01',
      processedAssetsGeneratedAt,
      pillarsEn: pillarsDataEn as any[],
      pillarsNo: pillarsDataNo as any[],
      processedAssets: rawProcessedAssets as any[],
      checklistsEn: checklistsDataEn as any[],
      checklistsNo: checklistsDataNo as any[],
      glossary: glossaryData as any[],
      editorialArticles: editorialArticles as any[],
      shelters: sheltersData as any[],
      sourceRegistry: sourceRegistry as any[],
    });
  }, [processedAssetsGeneratedAt, rawProcessedAssets]);

  const contentPacks = offlineKnowledge.contentPacks;
  const searchDocuments = offlineKnowledge.searchDocuments;
  const contentPackAssetsById = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const pack of contentPacks) {
      map.set(
        pack.id,
        new Set(
          pack.assets
            .filter((asset) => asset.type === 'processed-asset')
            .map((asset) => asset.id.replace(/^asset-/, ''))
        )
      );
    }
    return map;
  }, [contentPacks]);
  const selectedContentPack = useMemo<ContentPack | null>(() => {
    if (libraryPackFilter === 'all') return null;
    return contentPacks.find((pack) => pack.id === libraryPackFilter) || null;
  }, [contentPacks, libraryPackFilter]);
  const filteredReferenceAssets = useMemo(() => {
    return (processedAssets as any[]).filter((asset) => {
      if (libraryPackFilter !== 'all') {
        const selectedPackAssets = contentPackAssetsById.get(libraryPackFilter);
        if (!selectedPackAssets || !selectedPackAssets.has(asset.id)) {
          return false;
        }
      }
      const matchesPillar = libraryPillarFilter === 'all' || asset.pillarId === libraryPillarFilter;
      const optTitle = optimizeTitle(asset.title, currentLang).toLowerCase();
      const query = deferredLibrarySearchQuery.toLowerCase();
      const matchesQuery =
        !deferredLibrarySearchQuery.trim() ||
        optTitle.includes(query) ||
        asset.title.toLowerCase().includes(query) ||
        asset.category.toLowerCase().includes(query) ||
        asset.article.overview.toLowerCase().includes(query);

      return matchesPillar && matchesQuery;
    });
  }, [contentPackAssetsById, currentLang, deferredLibrarySearchQuery, libraryPackFilter, libraryPillarFilter, processedAssets]);
  const visibleReferenceAssets = useMemo(() => {
    return filteredReferenceAssets.slice(0, libraryPageSize);
  }, [filteredReferenceAssets, libraryPageSize]);
  const selectedContentPackTypeSummaries = useMemo(() => {
    if (!selectedContentPack) return [];

    const counts = new Map<Exclude<SearchDocument['type'], 'content-pack'>, { count: number; samples: string[] }>();
    for (const asset of selectedContentPack.assets) {
      const type = asset.type as Exclude<SearchDocument['type'], 'content-pack'>;
      const existing = counts.get(type) || { count: 0, samples: [] };
      existing.count += 1;
      if (existing.samples.length < 3) {
        existing.samples.push(asset.title);
      }
      counts.set(type, existing);
    }

    return PACK_TYPE_ORDER
      .filter((type) => counts.has(type))
      .map((type) => ({
        type,
        count: counts.get(type)?.count || 0,
        samples: counts.get(type)?.samples || [],
      }));
  }, [selectedContentPack]);

  const indexedSearchDocuments = useMemo<IndexedSearchDocument[]>(() => {
    return searchDocuments.map((doc) => ({
      ...doc,
      tagsText: doc.tags.join(' '),
    }));
  }, [searchDocuments]);

  const localSearchIndex = useMemo(() => {
    const miniSearch = new MiniSearch({
      idField: 'id',
      fields: ['title', 'body', 'tagsText'],
      storeFields: ['id', 'type', 'title', 'body', 'tags', 'pillarId', 'urlHash', 'sourceId', 'language', 'offlineCriticality'],
      searchOptions: {
        prefix: true,
        fuzzy: 0.2,
        boost: {
          title: 3,
          tagsText: 2,
        },
      },
    });
    miniSearch.addAll(indexedSearchDocuments as any[]);
    return miniSearch;
  }, [indexedSearchDocuments]);

  const searchTypeOptions = useMemo<SearchDocument['type'][]>(() => {
    const seen = new Set<SearchDocument['type']>();
    for (const doc of searchDocuments) {
      seen.add(doc.type);
    }
    return SEARCH_TYPE_ORDER.filter((type) => seen.has(type));
  }, [searchDocuments]);

  const searchPillarOptions = useMemo(() => {
    return pillarsData.map((pillar) => ({ id: pillar.id, label: pillar.title }));
  }, [pillarsData]);

  const sourceRegistryById = useMemo(() => {
    return new Map(sourceRegistry.map((source) => [source.id, source]));
  }, []);

  const localSearchResults = useMemo<LocalSearchResult[]>(() => {
    const query = deferredSearchQuery.trim();
    if (!query) return [];

    const rows = localSearchIndex.search(query, { prefix: true, fuzzy: 0.2 }) as Array<any>;
    const mapped = rows.map((row) => {
      const score = typeof row.score === 'number' ? row.score : 0;
      return {
        id: row.id,
        type: row.type,
        title: row.title,
        body: row.body,
        tags: Array.isArray(row.tags) ? row.tags : [],
        pillarId: row.pillarId,
        urlHash: row.urlHash,
        sourceId: row.sourceId,
        language: row.language,
        offlineCriticality: row.offlineCriticality,
        score,
      } as LocalSearchResult;
    });

    const filtered = mapped.filter((result) => {
      if (searchTypeFilter !== 'all' && result.type !== searchTypeFilter) return false;
      if (searchPillarFilter !== 'all' && result.pillarId !== searchPillarFilter) return false;
      if (searchLanguageFilter !== 'all' && result.language !== searchLanguageFilter) return false;
      if (searchCriticalityFilter !== 'all' && result.offlineCriticality !== searchCriticalityFilter) return false;
      return true;
    });

    filtered.sort((a, b) => {
      const aLangBoost = a.language === currentLang ? 0.15 : 0;
      const bLangBoost = b.language === currentLang ? 0.15 : 0;
      return (b.score + bLangBoost) - (a.score + aLangBoost);
    });

    if (searchLanguageFilter === 'all') {
      const dedupedByEntry: LocalSearchResult[] = [];
      const seen = new Set<string>();
      for (const result of filtered) {
        const baseId = result.id.split(':')[0];
        if (seen.has(baseId)) continue;
        seen.add(baseId);
        dedupedByEntry.push(result);
      }
      return dedupedByEntry.slice(0, SEARCH_RESULT_LIMIT);
    }

    return filtered.slice(0, SEARCH_RESULT_LIMIT);
  }, [currentLang, deferredSearchQuery, localSearchIndex, searchCriticalityFilter, searchLanguageFilter, searchPillarFilter, searchTypeFilter]);


  // Map pillar ID to the exact index in custom mockup
  const getPillarIndex = (id: string) => {
    switch (id) {
      case 'førstehjelp': return "01";
      case 'friluftsliv': return "02";
      case 'egensikkerhet': return "03";
      case 'egenberedskap': return "04";
      case 'personvern': return "05";
      case 'reisesikkerhet': return "06";
      default: return "00";
    }
  };

  // Map pillar ID to exact English tag used in custom mockup layout
  const getPillarEnglishTag = (id: string) => {
    switch (id) {
      case 'førstehjelp': return "Trauma Care";
      case 'friluftsliv': return "Bushcraft";
      case 'egensikkerhet': return "Situational Awareness";
      case 'egenberedskap': return "Preparedness";
      case 'personvern': return "Privacy";
      case 'reisesikkerhet': return "Travel Security";
      default: return "Resilience";
    }
  };

  // Map static topic lists matching the HTML mockup for maximum fidelity
  const getPillarMockTopics = (id: string) => {
    switch (id) {
      case 'førstehjelp': return ["Tourniquet Guide", "Chest Seals", "Massive Bleeding", "Cold Injuries"];
      case 'friluftsliv': return ["Improvised Fire-Starting", "Water Purification", "Cold Weather Sleep", "Map & Compass"];
      case 'egensikkerhet': return ["Pre-Assault Indicators", "Escape Routes", "Night Transit", "Vehicle Positioning"];
      case 'egenberedskap': return ["One-Week Kit", "IoT Isolation", "Blackout Protocols", "Water Storage"];
      case 'personvern': return ["Burner Phone Setup", "Metadata Reduction", "Secure Messaging", "Travel Devices"];
      case 'reisesikkerhet': return ["Baby Milk Scam", "Fake Taxi Guide", "Document Redundancy", "Embassy Fallbacks"];
      default: return [];
    }
  };

  // Mapping theme choice to class name
  const themeClass = theme === 'dark' ? 'theme-dark' : theme === 'signal' ? 'theme-signal' : 'theme-light';

  // Responsive button and theme styles relying on modern CSS custom properties
  const themeStyles = {
    badge: 'px-2 py-0.5 text-[0.7rem] uppercase font-mono rounded-full border border-[var(--border)] text-[var(--muted)] bg-[rgba(255,255,255,0.03)]',
    card: 'bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius)] p-5 shadow-[var(--shadow)] transition-all duration-200',
    title: 'text-[var(--text)] font-sans font-bold tracking-tight',
  };

  const searchTypeLabels = currentLang === 'no' ? SEARCH_TYPE_LABELS_NO : SEARCH_TYPE_LABELS_EN;

  const getCriticalityLabel = (value: 'high' | 'medium' | 'low') => {
    if (currentLang === 'no') {
      if (value === 'high') return 'Høy';
      if (value === 'medium') return 'Middels';
      return 'Lav';
    }
    if (value === 'high') return 'High';
    if (value === 'medium') return 'Medium';
    return 'Low';
  };

  const getSnippet = (text: string) => {
    if (text.length <= 220) return text;
    return `${text.slice(0, 220)}...`;
  };

  const getPackTypeActionLabel = (type: Exclude<SearchDocument['type'], 'content-pack'>) => {
    if (currentLang === 'no') {
      if (type === 'processed-asset') return 'Åpne modul';
      if (type === 'manual-topic') return 'Åpne manualtema';
      if (type === 'checklist-item') return 'Åpne sjekklister';
      if (type === 'shelter') return 'Åpne tilfluktsrom';
      if (type === 'glossary-term') return 'Åpne begreper';
      if (type === 'editorial-article') return 'Åpne artikler';
      return 'Åpne kilder';
    }

    if (type === 'processed-asset') return 'Open module';
    if (type === 'manual-topic') return 'Open manual topic';
    if (type === 'checklist-item') return 'Open checklists';
    if (type === 'shelter') return 'Open shelters';
    if (type === 'glossary-term') return 'Open glossary';
    if (type === 'editorial-article') return 'Open articles';
    return 'Open sources';
  };

  const resolveTabFromHash = (hash?: string): AppTab | null => {
    if (!hash) return null;
    return hashToTab[hash] || null;
  };

  const handleOpenLocalSearchResult = (result: LocalSearchResult) => {
    const baseId = result.id.split(':')[0];
    const manualId = baseId.startsWith('manual-') ? baseId.replace('manual-', '') : '';
    const assetId = baseId.startsWith('asset-') ? baseId.replace('asset-', '') : '';

    if (result.type === 'manual-topic' && manualId) {
      setSelectedAssetId(null);
      setActiveTab('manual');
      setSelectedPillarId((result.pillarId as PillarId) || null);
      setActiveArticleId(manualId);
      window.scrollTo({ top: 350, behavior: 'smooth' });
      return;
    }

    if (result.type === 'processed-asset' && assetId) {
      setActiveTab('reference-library');
      setSelectedPillarId(null);
      setActiveArticleId(null);
      setSelectedAssetId(assetId);
      setSelectedAssetInitialTab('article');
      window.scrollTo({ top: 350, behavior: 'smooth' });
      return;
    }

    if (result.type === 'checklist-item') {
      setSelectedAssetId(null);
      setActiveTab('checklists');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (result.type === 'glossary-term') {
      setSelectedAssetId(null);
      setActiveTab('glossary');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (result.type === 'shelter') {
      setSelectedAssetId(null);
      setActiveTab('shelters');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (result.type === 'editorial-article') {
      setSelectedAssetId(null);
      setActiveTab('library');
      window.setTimeout(() => {
        document.getElementById('editorial-articles-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
      return;
    }

    if (result.type === 'source-link') {
      setSelectedAssetId(null);
      setActiveTab('manual');
      window.setTimeout(() => {
        document.getElementById('official-sources-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
      return;
    }

    if (result.type === 'content-pack') {
      const packId = baseId.startsWith('pack-') ? baseId.replace('pack-', '') : null;
      setSelectedAssetId(null);
      setActiveTab('reference-library');
      if (packId) {
        setLibraryPackFilter(packId);
      }
      window.setTimeout(() => {
        document.getElementById('offline-content-packs')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
      return;
    }

    const tabFromHash = resolveTabFromHash(result.urlHash);
    if (tabFromHash) {
      setSelectedAssetId(null);
      setActiveTab(tabFromHash);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleOpenPackType = (type: Exclude<SearchDocument['type'], 'content-pack'>) => {
    if (!selectedContentPack) return;

    const firstEntry = selectedContentPack.assets.find((asset) => asset.type === type);
    if (!firstEntry) return;

    if (type === 'processed-asset') {
      setActiveTab('reference-library');
      setSelectedPillarId(null);
      setActiveArticleId(null);
      setSelectedAssetId(firstEntry.id.replace(/^asset-/, ''));
      setSelectedAssetInitialTab('article');
      window.scrollTo({ top: 350, behavior: 'smooth' });
      return;
    }

    if (type === 'manual-topic') {
      setSelectedAssetId(null);
      setActiveTab('manual');
      setSelectedPillarId((firstEntry.pillarId as PillarId) || null);
      setActiveArticleId(firstEntry.id.replace(/^topic-/, ''));
      window.scrollTo({ top: 350, behavior: 'smooth' });
      return;
    }

    if (type === 'checklist-item') {
      setSelectedAssetId(null);
      setActiveTab('checklists');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (type === 'glossary-term') {
      setSelectedAssetId(null);
      setActiveTab('glossary');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (type === 'shelter') {
      setSelectedAssetId(null);
      setActiveTab('shelters');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (type === 'editorial-article') {
      setSelectedAssetId(null);
      setActiveTab('library');
      window.setTimeout(() => {
        document.getElementById('editorial-articles-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
      return;
    }

    setSelectedAssetId(null);
    setActiveTab('manual');
    window.setTimeout(() => {
      document.getElementById('official-sources-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  const handleOpenFeaturedGuide = (titleKeyword: string) => {
    const found = allTopics.find(t => t.title.toLowerCase().includes(titleKeyword.toLowerCase()) || t.id.toLowerCase().includes(titleKeyword.toLowerCase()));
    if (found) {
      setSelectedPillarId(found.pillarId);
      setActiveArticleId(found.id);
      setActiveTab('manual');
      window.scrollTo({ top: 350, behavior: 'smooth' });
    } else {
      // Fallback
      setActiveTab('manual');
      setSelectedPillarId(null);
      setActiveArticleId(null);
      window.scrollTo({ top: 400, behavior: 'smooth' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // KnowledgeMap search field: feed the shared offline local-search pipeline and
  // reveal the results section once per empty -> non-empty transition.
  const knowledgeMapPrevQueryRef = useRef('');
  const handleKnowledgeMapSearch = (query: string) => {
    const wasEmpty = knowledgeMapPrevQueryRef.current.trim().length === 0;
    knowledgeMapPrevQueryRef.current = query;
    setSearchQuery(query);

    // Empty queries must not navigate or scroll.
    if (query.trim().length > 0 && wasEmpty) {
      document.getElementById('offline-local-search')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className={`app min-h-screen font-sans flex flex-col justify-between text-[var(--text)] bg-[var(--bg)] transition-colors duration-300 ${themeClass}`}>
      
      {/* GLOBAL SYSTEM STATUS BANNER */}
      <div className="preparedness-banner w-full bg-[var(--accent-solid)] text-[var(--accent-on-solid)] text-[10px] md:text-xs font-mono font-bold tracking-wider py-1.5 px-4 flex items-center justify-center gap-2 border-b border-[var(--border)] overflow-hidden">
        <AlertTriangle className="w-3 md:w-3.5 h-3 md:h-3.5 flex-shrink-0 animate-pulse" />
        <span className="truncate">{t('offline_banner_desc')}</span>
        <span className="hidden md:inline opacity-70">|</span>
        <span className="hidden md:inline opacity-90">
          {currentLang === 'no' ? 'Referansetid' : 'Reference time'}: {referenceTimeLabel}
        </span>
      </div>

      {/* STICKY TOPBAR HEADER */}
      <header className="sticky top-0 z-50 backdrop-blur-md border-b border-[var(--border)] select-none" style={{ backgroundColor: 'var(--header-bg)' }}>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
          
          {/* Brand block exact match */}
          <div 
            className="brand flex flex-col cursor-pointer text-center sm:text-left" 
            onClick={() => {
              setActiveTab('manual');
              setSelectedPillarId(null);
              setActiveArticleId(null);
              setSelectedAssetId(null);
              setSearchQuery('');
              scrollToTop();
            }}
          >
            <strong className="text-[1.12rem] tracking-[0.08em] font-extrabold uppercase text-[var(--text)]">
              BEREDSKAP101
            </strong>
            <span className="text-[0.74rem] text-[var(--muted)] font-medium">
              {t('brand_sub_title')}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {/* Connectivity Telemetry Badge */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-mono font-bold uppercase ${
              connState === 'ONLINE' 
                ? 'bg-[var(--status-success-bg)] border-[var(--status-success-border)] text-[var(--status-success-text)]' 
                : connState === 'DEGRADED'
                ? 'bg-[var(--status-warning-bg)] border-[var(--status-warning-border)] text-[var(--status-warning-text)] animate-pulse'
                : 'bg-[var(--status-error-bg)] border-[var(--status-error-border)] text-[var(--status-error-text)] animate-pulse'
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                connState === 'ONLINE' ? 'bg-green-500' : connState === 'DEGRADED' ? 'bg-yellow-500' : 'bg-red-500'
              }`} />
              <span>{connState}</span>
            </div>

            {/* Language switcher */}
            <div className="language-switcher flex gap-1 bg-[var(--bg)] p-1 rounded-full border border-[var(--border)] text-[10px] md:text-xs font-mono">
              <button
                id="btn-lang-en"
                onClick={() => i18n.changeLanguage('en')}
                aria-pressed={currentLang === 'en'}
                className={`lang-item rounded-full px-2.5 py-1 transition-all cursor-pointer ${
                  currentLang === 'en'
                    ? 'active bg-[var(--accent-solid)] text-[var(--accent-on-solid)] font-extrabold shadow-sm'
                    : 'text-[var(--muted)] hover:text-[var(--text)]'
                }`}
              >
                EN
              </button>
              <button
                id="btn-lang-no"
                onClick={() => i18n.changeLanguage('no')}
                aria-pressed={currentLang === 'no'}
                className={`lang-item rounded-full px-2.5 py-1 transition-all cursor-pointer ${
                  currentLang === 'no'
                    ? 'active bg-[var(--accent-solid)] text-[var(--accent-on-solid)] font-extrabold shadow-sm'
                    : 'text-[var(--muted)] hover:text-[var(--text)]'
                }`}
              >
                NO
              </button>
            </div>

            {/* Theme Switcher custom design */}
            <div className="theme-switcher flex gap-1.5 bg-[var(--bg)] p-1 rounded-full border border-[var(--border)]">
              <button 
                id="btn-theme-dark"
                type="button"
                onClick={() => setTheme('dark')}
                aria-pressed={theme === 'dark'}
                className={`theme-btn inline-flex items-center gap-1.5 text-[10px] md:text-xs font-semibold rounded-full px-3 py-1.5 transition-all cursor-pointer ${
                  theme === 'dark' 
                    ? 'active bg-[var(--accent-solid)] text-[var(--accent-on-solid)] font-extrabold shadow-md' 
                    : 'text-[var(--muted)] hover:text-[var(--text)]'
                }`}
              >
                <Moon className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{currentLang === 'no' ? 'Mørk' : 'Dark'}</span>
              </button>
              <button 
                id="btn-theme-light"
                type="button"
                onClick={() => setTheme('light')}
                aria-pressed={theme === 'light'}
                className={`theme-btn inline-flex items-center gap-1.5 text-[10px] md:text-xs font-semibold rounded-full px-3 py-1.5 transition-all cursor-pointer ${
                  theme === 'light' 
                    ? 'active bg-[var(--accent-solid)] text-[var(--accent-on-solid)] font-extrabold shadow-md' 
                    : 'text-[var(--muted)] hover:text-[var(--text)]'
                }`}
              >
                <Sun className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{currentLang === 'no' ? 'Lys' : 'Light'}</span>
              </button>
              <button
                id="btn-theme-signal"
                type="button"
                onClick={() => setTheme('signal')}
                aria-pressed={theme === 'signal'}
                className={`theme-btn inline-flex items-center gap-1.5 text-[10px] md:text-xs font-semibold rounded-full px-3 py-1.5 transition-all cursor-pointer ${
                  theme === 'signal'
                    ? 'active bg-[var(--accent-solid)] text-[var(--accent-on-solid)] font-extrabold shadow-md'
                    : 'text-[var(--muted)] hover:text-[var(--text)]'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Signal</span>
              </button>
            </div>
          </div>

        </div>

        {/* ECOSYSTEM FUNCTIONAL SUBSYSTEMS NAV BAR */}
        <div className="border-t border-[var(--border)] bg-[rgba(0,0,0,0.15)] select-none">
          <div className="max-w-[1400px] mx-auto px-4 flex items-center justify-center sm:justify-start gap-1 sm:gap-4 overflow-x-auto whitespace-nowrap scrollbar-none py-2 text-xs font-mono">
            <button
              onClick={() => { setActiveTab('manual'); setSelectedPillarId(null); setActiveArticleId(null); setSelectedAssetId(null); scrollToTop(); }}
              className={`nav-item px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'manual' 
                  ? 'active bg-[var(--accent-solid)] border-transparent text-[var(--accent-on-solid)] font-bold' 
                  : 'bg-[var(--card)] text-[var(--muted)] border-[var(--border)] hover:text-[var(--text)]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{t('nav_knowledge')}</span>
            </button>
            <button
              onClick={() => { setActiveTab('library'); setSelectedAssetId(null); scrollToTop(); }}
              className={`nav-item px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'library' 
                  ? 'active bg-[var(--accent-solid)] border-transparent text-[var(--accent-on-solid)] font-bold' 
                  : 'bg-[var(--card)] text-[var(--muted)] border-[var(--border)] hover:text-[var(--text)]'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>{t('nav_library')}</span>
            </button>
            <button
              onClick={() => { setActiveTab('scenarios'); setSelectedAssetId(null); scrollToTop(); }}
              className={`nav-item px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'scenarios' 
                  ? 'active bg-[var(--accent-solid)] border-transparent text-[var(--accent-on-solid)] font-bold' 
                  : 'bg-[var(--card)] text-[var(--muted)] border-[var(--border)] hover:text-[var(--text)]'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>{t('nav_scenarios')}</span>
            </button>
            <button
              onClick={() => { setActiveTab('flowcharts'); setSelectedAssetId(null); scrollToTop(); }}
              className={`nav-item px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'flowcharts' 
                  ? 'active bg-[var(--accent-solid)] border-transparent text-[var(--accent-on-solid)] font-bold' 
                  : 'bg-[var(--card)] text-[var(--muted)] border-[var(--border)] hover:text-[var(--text)]'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>{t('nav_flowcharts')}</span>
            </button>
            <button
              onClick={() => { setActiveTab('checklists'); setSelectedAssetId(null); scrollToTop(); }}
              className={`nav-item px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'checklists' 
                  ? 'active bg-[var(--accent-solid)] border-transparent text-[var(--accent-on-solid)] font-bold' 
                  : 'bg-[var(--card)] text-[var(--muted)] border-[var(--border)] hover:text-[var(--text)]'
              }`}
            >
              <BookmarkCheck className="w-3.5 h-3.5" />
              <span>{t('nav_checklists')}</span>
            </button>
            <button
              onClick={() => { setActiveTab('glossary'); setSelectedAssetId(null); scrollToTop(); }}
              className={`nav-item px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'glossary'
                  ? 'active bg-[var(--accent-solid)] border-transparent text-[var(--accent-on-solid)] font-bold'
                  : 'bg-[var(--card)] text-[var(--muted)] border-[var(--border)] hover:text-[var(--text)]'
              }`}
            >
              <Info className="w-3.5 h-3.5" />
              <span>{currentLang === 'no' ? 'Begrepsliste' : 'Glossary'}</span>
            </button>
            <button
              onClick={() => { setActiveTab('shelters'); setSelectedAssetId(null); scrollToTop(); }}
              className={`nav-item px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'shelters'
                  ? 'active bg-[var(--accent-solid)] border-transparent text-[var(--accent-on-solid)] font-bold'
                  : 'bg-[var(--card)] text-[var(--muted)] border-[var(--border)] hover:text-[var(--text)]'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>{currentLang === 'no' ? 'Tilfluktsrom' : 'Shelters'}</span>
            </button>
            <button
              onClick={() => { setActiveTab('recommended-reading'); setSelectedAssetId(null); scrollToTop(); }}
              className={`nav-item px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'recommended-reading'
                  ? 'active bg-[var(--accent-solid)] border-transparent text-[var(--accent-on-solid)] font-bold'
                  : 'bg-[var(--card)] text-[var(--muted)] border-[var(--border)] hover:text-[var(--text)]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{currentLang === 'no' ? 'Lesetips' : 'Reading'}</span>
            </button>
            <button
              onClick={() => { setActiveTab('support'); setSelectedAssetId(null); scrollToTop(); }}
              className={`nav-item px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'support' 
                  ? 'active bg-[var(--accent-solid)] border-transparent text-[var(--accent-on-solid)] font-bold' 
                  : 'bg-[var(--card)] text-[var(--muted)] border-[var(--border)] hover:text-[var(--text)]'
              }`}
            >
              <LifeBuoy className="w-3.5 h-3.5" />
              <span>{currentLang === 'no' ? 'Innstillinger' : 'Settings'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* CORE FRAMEWORK STAGES */}
      <main className="flex-grow w-full">
        {/* TAB 1: KUNNSKAPSBASEN (MANUAL) */}
        {activeTab === 'manual' && (
          <div>
            {selectedAssetId ? (
              <section className="section py-10 px-4 sm:px-8 max-w-[1400px] mx-auto animate-fade-in">
                {processedAssetsLoading && !selectedProcessedAsset ? (
                  <LazySectionFallback currentLang={currentLang} label={currentLang === 'no' ? 'referansemodul' : 'reference module'} />
                ) : processedAssetsFailed && !selectedProcessedAsset ? (
                  <div className="rounded-2xl border border-[var(--status-error-border)] bg-[var(--status-error-bg)] px-4 py-5 text-xs text-[var(--status-error-text)]">
                    {currentLang === 'no'
                      ? 'Referansearkivet kunne ikke lastes lokalt. Gå tilbake og prøv igjen.'
                      : 'The reference archive could not be loaded locally. Go back and try again.'}
                  </div>
                ) : (
                  <Suspense fallback={<LazySectionFallback currentLang={currentLang} label={currentLang === 'no' ? 'referansemodul' : 'reference module'} />}>
                    <ExtendedAssetViewer
                      key={selectedAssetId}
                      assetId={selectedAssetId}
                      asset={selectedProcessedAsset || undefined}
                      theme={theme}
                      onBack={() => setSelectedAssetId(null)}
                      currentLang={currentLang}
                      initialTab={selectedAssetInitialTab}
                    />
                  </Suspense>
                )}
              </section>
            ) : !selectedPillarId && !activeArticleId ? (
              <div className="space-y-8">
                <Suspense fallback={<LazySectionFallback currentLang={currentLang} label={currentLang === 'no' ? 'kunnskapskart' : 'knowledge map'} />}>
                  <KnowledgeMap
                    currentLang={currentLang}
                    theme={theme}
                    setActiveTab={setActiveTab}
                    setSelectedPillarId={setSelectedPillarId}
                    setActiveArticleId={setActiveArticleId}
                    setSelectedAssetId={setSelectedAssetId}
                    setSelectedAssetInitialTab={setSelectedAssetInitialTab}
                    completedTopics={completedTopics}
                    guideCount={allGuidesCount}
                    onSearch={handleKnowledgeMapSearch}
                  />
                </Suspense>

                <section id="offline-local-search" className="section px-4 sm:px-8 max-w-[1400px] mx-auto">
                  <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 md:p-6 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div>
                        <h2 className="text-xl md:text-2xl font-bold">
                          {currentLang === 'no' ? 'Offline lokalsøk' : 'Offline local search'}
                        </h2>
                        <p className="text-xs md:text-sm text-[var(--muted)] mt-1">
                          {currentLang === 'no'
                            ? 'Søker i manualtemaer, referansemoduler, begreper, artikler, sjekklister, tilfluktsrom, offisielle kilder og innholdspakker. Ingen API-kall kreves.'
                            : 'Searches manual topics, reference assets, glossary terms, articles, checklists, shelters, official sources, and content packs. No API call is required.'}
                        </p>
                      </div>
                      <span className="rounded-full border border-[var(--border)] bg-[var(--bg-alt)] px-3 py-1 text-[10px] font-mono uppercase tracking-wide text-[var(--accent)]">
                        {currentLang === 'no' ? 'Fungerer offline' : 'Works offline'}
                      </span>
                    </div>

                    {(processedAssetsLoading || processedAssetsFailed) && (
                      <div className={`rounded-lg border px-3 py-2 text-xs ${
                        processedAssetsFailed
                          ? 'border-[var(--status-error-border)] bg-[var(--status-error-bg)] text-[var(--status-error-text)]'
                          : 'border-[var(--status-warning-border)] bg-[var(--status-warning-bg)] text-[var(--status-warning-text)]'
                      }`}>
                        {processedAssetsFailed
                          ? (currentLang === 'no'
                            ? 'Referansemoduler er midlertidig utilgjengelige i lokalsøket. Øvrige offline-kilder virker fortsatt.'
                            : 'Reference modules are temporarily unavailable in local search. The rest of the offline sources still work.')
                          : (currentLang === 'no'
                            ? 'Referansemoduler indekseres lokalt i bakgrunnen. Manualtemaer, sjekklister og kilder er allerede søkbare.'
                            : 'Reference modules are indexing locally in the background. Manual topics, checklists, and source links are already searchable.')}
                      </div>
                    )}

                    <div className="bg-[rgba(0,0,0,0.15)] border border-[var(--border)] rounded-full px-4 py-2.5 flex items-center gap-2">
                      <Search className="w-4 h-4 text-[var(--muted)] flex-shrink-0" />
                      <input
                        type="text"
                        placeholder={
                          currentLang === 'no'
                            ? 'Søk: tilfluktsrom, vann, førstehjelp, DAB, personvern...'
                            : 'Search: shelter, water, first aid, DAB, privacy...'
                        }
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        className="bg-transparent border-none outline-none text-xs text-[var(--text)] w-full placeholder:text-[var(--muted)] focus:ring-0"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery('')}
                          className="text-[var(--muted)] hover:text-[var(--text)] text-xs font-mono font-bold cursor-pointer"
                        >
                          {currentLang === 'no' ? 'Tøm' : 'Clear'}
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2">
                      <select
                        value={searchTypeFilter}
                        onChange={(event) => setSearchTypeFilter(event.target.value as SearchTypeFilter)}
                        className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-alt)] text-xs"
                      >
                        <option value="all">{currentLang === 'no' ? 'Alle typer' : 'All types'}</option>
                        {searchTypeOptions.map((type) => (
                          <option key={type} value={type}>
                            {searchTypeLabels[type]}
                          </option>
                        ))}
                      </select>

                      <select
                        value={searchPillarFilter}
                        onChange={(event) => setSearchPillarFilter(event.target.value)}
                        className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-alt)] text-xs"
                      >
                        <option value="all">{currentLang === 'no' ? 'Alle pilarer' : 'All pillars'}</option>
                        {searchPillarOptions.map((pillar) => (
                          <option key={pillar.id} value={pillar.id}>
                            {pillar.label}
                          </option>
                        ))}
                      </select>

                      <select
                        value={searchLanguageFilter}
                        onChange={(event) => setSearchLanguageFilter(event.target.value as SearchLanguageFilter)}
                        className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-alt)] text-xs"
                      >
                        <option value="all">{currentLang === 'no' ? 'Alle språk' : 'All languages'}</option>
                        <option value="no">{currentLang === 'no' ? 'Norsk' : 'Norwegian'}</option>
                        <option value="en">{currentLang === 'no' ? 'Engelsk' : 'English'}</option>
                      </select>

                      <select
                        value={searchCriticalityFilter}
                        onChange={(event) => setSearchCriticalityFilter(event.target.value as SearchCriticalityFilter)}
                        className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-alt)] text-xs"
                      >
                        <option value="all">{currentLang === 'no' ? 'Alle prioriteringer' : 'All criticality levels'}</option>
                        <option value="high">{currentLang === 'no' ? 'Høy prioritet' : 'High priority'}</option>
                        <option value="medium">{currentLang === 'no' ? 'Middels prioritet' : 'Medium priority'}</option>
                        <option value="low">{currentLang === 'no' ? 'Lav prioritet' : 'Low priority'}</option>
                      </select>
                    </div>

                    {!searchQuery.trim() && (
                      <div className="rounded-lg border border-dashed border-[var(--border)] px-3 py-2 text-xs text-[var(--muted)]">
                        {currentLang === 'no'
                          ? 'Prøv søk som: "tilfluktsrom", "vann", "førstehjelp", "DAB", eller "personvern".'
                          : 'Try searches like: "shelter", "water", "first aid", "DAB", or "privacy".'}
                      </div>
                    )}

                    {searchQuery.trim() && localSearchResults.length === 0 && (
                      <div className="rounded-lg border border-dashed border-[var(--border)] px-3 py-3 text-xs text-[var(--muted)]">
                        {currentLang === 'no'
                          ? 'Ingen lokale treff med valgte filtre. Juster filtrene eller bruk færre ord.'
                          : 'No local matches with the selected filters. Adjust filters or use fewer terms.'}
                      </div>
                    )}

                    {searchQuery.trim() && localSearchResults.length > 0 && (
                      <div className="space-y-3">
                        <p className="text-[11px] font-mono text-[var(--muted)] uppercase tracking-wide">
                          {currentLang === 'no'
                            ? `Viser ${localSearchResults.length} lokale treff`
                            : `Showing ${localSearchResults.length} local matches`}
                        </p>
                        <div className="space-y-2">
                          {localSearchResults.map((result) => {
                            const sourceRef = result.sourceId ? sourceRegistryById.get(result.sourceId) : null;
                            return (
                              <article key={result.id} className="border border-[var(--border)] bg-[var(--bg-alt)] rounded-xl p-3 space-y-2">
                                <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono uppercase tracking-wide">
                                  <span className="px-2 py-0.5 rounded-full border border-[var(--border)] text-[var(--accent)]">
                                    {searchTypeLabels[result.type]}
                                  </span>
                                  <span className="px-2 py-0.5 rounded-full border border-[var(--border)] text-[var(--muted)]">
                                    {result.language.toUpperCase()}
                                  </span>
                                  <span className="px-2 py-0.5 rounded-full border border-[var(--border)] text-[var(--muted)]">
                                    {currentLang === 'no' ? 'Prioritet' : 'Criticality'}: {getCriticalityLabel(result.offlineCriticality)}
                                  </span>
                                  {result.pillarId && (
                                    <span className="px-2 py-0.5 rounded-full border border-[var(--border)] text-[var(--muted)]">
                                      {searchPillarOptions.find((pillar) => pillar.id === result.pillarId)?.label || result.pillarId}
                                    </span>
                                  )}
                                </div>
                                <h3 className="text-sm md:text-base font-bold">{result.title}</h3>
                                <p className="text-xs text-[var(--muted)] leading-relaxed">{getSnippet(result.body)}</p>
                                <div className="flex flex-wrap items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenLocalSearchResult(result)}
                                    className="px-3 py-1.5 rounded-lg bg-[var(--accent-solid)] text-[var(--accent-on-solid)] text-xs font-bold cursor-pointer"
                                  >
                                    {currentLang === 'no' ? 'Åpne i appen' : 'Open in app'}
                                  </button>
                                  {result.type === 'source-link' && sourceRef && (
                                    <a
                                      href={sourceRef.homepageUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="px-3 py-1.5 rounded-lg border border-[var(--border)] text-xs font-bold inline-flex items-center gap-1.5"
                                    >
                                      {currentLang === 'no' ? 'Åpne kilde' : 'Open source'}
                                      <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                  )}
                                </div>
                              </article>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </section>

                <Suspense fallback={<LazySectionFallback currentLang={currentLang} label={currentLang === 'no' ? 'offisielle kilder' : 'official sources'} />}>
                  <SourceLinksSection currentLang={currentLang} />
                </Suspense>

                <Suspense fallback={<LazySectionFallback currentLang={currentLang} label={currentLang === 'no' ? 'norske nyheter' : 'norwegian news'} />}>
                  <NorwegianNewsFeed currentLang={currentLang} />
                </Suspense>

                {/* REFERENCE LIBRARY CALL-TO-ACTION */}
                <section className="section bg-[var(--bg-alt)] py-12 px-4 sm:px-8 border-t border-[var(--border)] text-center rounded-2xl max-w-[1400px] mx-auto">
                  <div className="max-w-2xl mx-auto space-y-4">
                    <h2 className="text-2xl md:text-3xl font-bold font-display text-[var(--text)]">
                      {currentLang === 'no' ? 'Lær mer om beredskap' : 'Expand Your Preparedness Knowledge'}
                    </h2>
                    <p className="text-xs md:text-sm text-[var(--muted)] leading-relaxed">
                      {processedAssetsFailed
                        ? (currentLang === 'no'
                          ? 'Referansebiblioteket er midlertidig utilgjengelig i denne økten. Prøv igjen for å laste lokale referansemoduler.'
                          : 'The reference library is temporarily unavailable in this session. Try again to load the local reference modules.')
                        : processedAssetsReady
                          ? (currentLang === 'no'
                            ? `Leter du etter spesifikke emner? Referansebiblioteket har ${referenceCount} kvalitetssikrede artikler akkurat nå, og blir stadig utvidet.`
                            : `Looking for specific topics? The reference library currently includes ${referenceCount} quality-reviewed articles at the moment, and is continuously updated.`)
                          : (currentLang === 'no'
                            ? 'Referansebiblioteket lastes lokalt i bakgrunnen for å redusere treg oppstart på langsommere enheter.'
                            : 'The reference library is loading locally in the background to reduce slow startup on lower-powered devices.')}
                    </p>
                    <div className="pt-2">
                      <button
                        onClick={() => {
                          setActiveTab('reference-library');
                          setSelectedAssetId(null);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[var(--accent-solid)] hover:bg-[var(--accent-solid)]/90 text-[var(--accent-on-solid)] font-bold text-xs md:text-sm shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer"
                        style={{ boxShadow: '0 4px 15px color-mix(in srgb, var(--accent-solid) 24%, transparent)' }}
                      >
                        <span>{currentLang === 'no' ? '\u00c5pne referansebiblioteket' : 'Open Reference Library'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </section>

              </div>
            ) : (
              
              /* SINGLE PILLAR / DEEP MANUAL SUB-PAGE VIEW */
              <section className="section py-10 px-4 sm:px-8 max-w-[1400px] mx-auto">
                
                {/* Back navigation buttons */}
                <div className="flex flex-wrap items-center gap-2 mb-6 cursor-pointer">
                  <button
                    onClick={() => {
                      if (activeArticleId) {
                        setActiveArticleId(null);
                      } else {
                        setSelectedPillarId(null);
                      }
                    }}
                    className="px-4 py-2 bg-[var(--card)] border border-[var(--border)] rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-[var(--bg-alt)] transition-all cursor-pointer"
                  >
                    &larr; {activeArticleId ? t('btn_return_pillar') : t('btn_return_all')}
                  </button>
                  {activeArticleId && (
                    <button
                      onClick={() => {
                        setSelectedPillarId(null);
                        setActiveArticleId(null);
                      }}
                      className="px-4 py-2 bg-[var(--card)] border border-[var(--border)] rounded-xl text-xs font-semibold hover:bg-[var(--bg-alt)] transition-all cursor-pointer"
                    >
                      {t('btn_all_pillars_overview')}
                    </button>
                  )}
                </div>

                {/* Sub Case A: Display a specific pillar's articles */}
                {selectedPillarId && !activeArticleId && (
                  <div className="space-y-8">
                    {(() => {
                      const pil = pillarsData.find(p => p.id === selectedPillarId)!;
                      const idx = getPillarIndex(pil.id);
                      return (
                        <div className="space-y-6">
                          <div className="bg-[var(--card)] border border-[var(--border)] p-6 md:p-8 rounded-[var(--radius)] flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div className="flex gap-4 items-center">
                              <span className="font-mono text-2xl md:text-3xl font-bold text-[var(--accent)]">{idx}</span>
                              <div>
                                <h2 className="text-2xl md:text-3xl font-bold font-display text-[var(--text)]">{pil.title}</h2>
                                <p className="text-xs font-mono text-[var(--muted)] uppercase tracking-widest">{pil.titleEnglish}</p>
                              </div>
                            </div>
                            <blockquote className="border-l-3 border-[var(--accent)] pl-4 py-1 italic text-xs md:text-sm text-[var(--muted)] max-w-md">
                              "{pil.philosophy}"
                            </blockquote>
                          </div>

                          <div className="space-y-4">
                            <h3 className="text-sm font-semibold tracking-wider text-[var(--accent)] uppercase font-mono mb-4">{t('title_practical_sop')} ({pil.topics.length})</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {pil.topics.map(tData => (
                                <div
                                  key={tData.id}
                                  onClick={() => setActiveArticleId(tData.id)}
                                  className="p-5 bg-[var(--card)] hover:bg-[var(--bg-alt)] border border-[var(--border)] hover:border-[var(--accent)]/50 rounded-xl cursor-pointer transition-all flex flex-col justify-between min-h-[170px]"
                                >
                                  <div>
                                    <span className="text-[11px] font-mono text-[var(--accent)] font-extrabold uppercase px-2 py-0.5 rounded bg-[var(--accent-solid)]/10 border border-[var(--accent)]/20 w-fit block mb-2">{t('tag_procedure_code')}</span>
                                    <h4 className="font-bold text-base text-[var(--text)] mb-1.5">{tData.title}</h4>
                                    <p className="text-xs text-[var(--muted)] leading-relaxed line-clamp-2">{tData.shortSummary}</p>
                                  </div>

                                  <div className="mt-4 pt-3 border-t border-dashed border-[var(--border)] flex items-center justify-between text-[11px]">
                                    <span className="text-[9px] font-mono text-[var(--muted)]">Status: Active procedure</span>
                                    <span className="font-bold text-[var(--accent)] flex items-center gap-1">{t('btn_read_sop')} &rarr;</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Related reference modules from the Extended Reference Library */}
                          {(() => {
                            const relatedAssets = (processedAssets as any[]).filter(
                              asset => asset.pillarId === selectedPillarId
                            );

                            if (relatedAssets.length === 0) return null;

                            return (
                              <div className="space-y-4 pt-8 border-t border-dashed border-[var(--border)]">
                                <h3 className="text-sm font-semibold tracking-wider text-teal-400 uppercase font-mono mb-4 flex items-center gap-2">
                                  <Database className="w-4 h-4" />
                                  <span>{t('library_title')} ({relatedAssets.length})</span>
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  {relatedAssets.map(asset => (
                                    <div
                                      key={asset.id}
                                      onClick={() => {
                                        setSelectedAssetId(asset.id);
                                        setSelectedAssetInitialTab('article');
                                        window.scrollTo({ top: 350, behavior: 'smooth' });
                                      }}
                                      className="p-4 bg-[var(--card)] hover:bg-[var(--bg-alt)] border border-[var(--border)] hover:border-[var(--accent)]/50 rounded-xl cursor-pointer transition-all flex flex-col justify-between min-h-[160px]"
                                    >
                                      <div>
                                        <span className="text-[9px] font-mono text-teal-400 font-extrabold uppercase px-2 py-0.5 rounded bg-teal-500/10 border border-teal-500/20 w-fit block mb-2">
                                          {asset.category}
                                        </span>
                                        <h4 className="font-bold text-sm text-[var(--text)] mb-1.5 line-clamp-2">{optimizeTitle(asset.title, currentLang)}</h4>
                                        <p className="text-[11px] text-[var(--muted)] leading-relaxed line-clamp-2">{asset.article.overview}</p>
                                      </div>
                                      <div className="mt-3 pt-2 border-t border-[var(--border)] flex items-center justify-between text-[10px] font-mono">
                                        <span className="opacity-60">{asset.metadata.fileSizeKb.toFixed(1)} KB</span>
                                        <span className="font-bold text-[var(--accent)] flex items-center gap-0.5">Explore &rarr;</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Sub Case B: Display a specific individual article */}
                {activeArticleId && (
                  <div className="max-w-4xl mx-auto">
                    {(() => {
                      const topic = allTopics.find(tData => tData.id === activeArticleId)!;
                      return (
                        <article className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius)] p-6 md:p-8 space-y-6">
                          
                          <div className="border-b border-dashed border-[var(--border)] pb-4 flex flex-col gap-1">
                            <span className="text-[9px] font-mono text-[var(--accent)] uppercase font-bold px-2 py-0.5 rounded border border-[var(--border)] bg-[rgba(0,0,0,0.1)] w-fit">
                              {getPillarEnglishTag(topic.pillarId)}
                            </span>
                            <h2 className="text-2xl md:text-3xl font-extrabold text-[var(--text)] mt-1">{topic.title}</h2>
                            <p className="text-[11px] text-[var(--muted)] font-mono">Reference code: {topic.id}</p>
                          </div>

                          {/* Situation Context */}
                          <div className="p-4 rounded-xl bg-[var(--accent-solid)]/10 border-l-4 border-[var(--accent)]">
                            <h4 className="text-xs font-mono font-bold uppercase text-[var(--accent)] mb-1">{t('lbl_situation_context')}</h4>
                            <p className="text-xs md:text-sm text-[var(--text)]">{topic.situationContext}</p>
                          </div>

                          {/* Core philosophy */}
                          <div className="space-y-1">
                            <small className="text-[10px] font-mono text-[var(--muted)] uppercase">{t('lbl_doctrine_principles')}</small>
                            <p className="italic text-xs md:text-sm p-4 rounded-xl bg-[var(--bg)] text-[var(--text)]">
                              "{topic.corePrinciple}"
                            </p>
                          </div>

                          {/* Steps list */}
                          <div className="space-y-3">
                            <small className="text-[10px] font-mono text-[var(--muted)] uppercase block">{t('lbl_action_sequence')}</small>
                            <div className="space-y-2">
                              {topic.procedureSteps.map((step, index) => (
                                <div key={index} className="p-4 bg-[var(--bg)] border border-[var(--border)] rounded-lg flex items-start gap-3">
                                  <span className="w-5 h-5 rounded-full bg-[var(--accent-solid)] text-[var(--accent-on-solid)] font-mono text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                                    {index + 1}
                                  </span>
                                  <p className="text-xs md:text-sm leading-relaxed text-[var(--text)]">{step}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Warnings list in Red */}
                          <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/30 font-sans">
                            <h4 className="text-xs font-mono font-bold uppercase text-red-500 mb-2 flex items-center gap-1.5 leading-normal">
                              <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {t('lbl_critical_prohibitions')}
                            </h4>
                            <ul className="space-y-2.5 text-xs text-red-400">
                              {topic.warnings.map((warn, i) => (
                                <li key={i} className="flex items-start gap-1.5">
                                  <span className="font-extrabold">&bull;</span>
                                  <p>{warn}</p>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Cross connections */}
                           <div className="pt-4 border-t border-[var(--border)] font-mono text-xs text-[var(--muted)] pb-4">
                             <span className="block mb-2 uppercase text-[10px]">{t('lbl_cross_references')}</span>
                             <div className="flex flex-wrap gap-2">
                               {topic.relatedTopics.map((rel, i) => (
                                 <span key={i} className="px-2.5 py-1 rounded bg-[rgba(255,255,255,0.02)] border border-[var(--border)] text-[10px]">
                                   + {rel}
                                 </span>
                               ))}
                             </div>
                           </div>

                           {/* SOP Completion Button */}
                           <div className="pt-6 border-t border-dashed border-[var(--border)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                             <span className="text-[11px] font-mono text-[var(--muted)]">
                               {currentLang === 'no' ? 'Har du lest og fullført denne prosedyren?' : 'Have you read and completed this procedure?'}
                             </span>
                             <button
                               onClick={() => toggleTopicCompleted(topic.id)}
                               className={`px-5 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                                 completedTopics.includes(topic.id)
                                   ? 'bg-[var(--accent)]/15 text-[var(--accent)] border-[var(--accent)]'
                                   : 'bg-[var(--card)] border-[var(--border)] text-[var(--text)] hover:border-[var(--accent)]/45'
                               }`}
                             >
                               {completedTopics.includes(topic.id) ? (
                                 <>
                                   <CheckSquare className="w-4 h-4 text-[var(--accent)]" />
                                   <span>{currentLang === 'no' ? 'Fullført' : 'Completed'}</span>
                                 </>
                               ) : (
                                 <>
                                   <BookmarkCheck className="w-4 h-4" />
                                   <span>{currentLang === 'no' ? 'Marker som fullført' : 'Mark as Completed'}</span>
                                 </>
                               )}
                             </button>
                           </div>

                         </article>
                      );
                    })()}
                  </div>
                )}

              </section>
            )}

          </div>
        )}

        {/* TAB 1.5: LIBRARY + REFERENCE LIBRARY */}
        {(activeTab === 'library' || activeTab === 'reference-library') && (
          <div>
            {selectedAssetId ? (
              <section className="section py-10 px-4 sm:px-8 max-w-[1400px] mx-auto animate-fade-in">
                {processedAssetsLoading && !selectedProcessedAsset ? (
                  <LazySectionFallback currentLang={currentLang} label={currentLang === 'no' ? 'referansemodul' : 'reference module'} />
                ) : processedAssetsFailed && !selectedProcessedAsset ? (
                  <div className="rounded-2xl border border-[var(--status-error-border)] bg-[var(--status-error-bg)] px-4 py-5 text-xs text-[var(--status-error-text)]">
                    {currentLang === 'no'
                      ? 'Referansearkivet kunne ikke lastes lokalt. Gå tilbake og prøv igjen.'
                      : 'The reference archive could not be loaded locally. Go back and try again.'}
                  </div>
                ) : (
                  <Suspense fallback={<LazySectionFallback currentLang={currentLang} label={currentLang === 'no' ? 'referansemodul' : 'reference module'} />}>
                    <ExtendedAssetViewer
                      key={selectedAssetId}
                      assetId={selectedAssetId}
                      asset={selectedProcessedAsset || undefined}
                      theme={theme}
                      onBack={() => setSelectedAssetId(null)}
                      currentLang={currentLang}
                      initialTab={selectedAssetInitialTab}
                    />
                  </Suspense>
                )}
              </section>
            ) : (
              <div>
                {(processedAssetsLoading || processedAssetsFailed) && (
                  <section className="section px-4 sm:px-8 max-w-[1400px] mx-auto pt-6">
                    <div className={`rounded-xl border px-4 py-3 text-xs ${
                      processedAssetsFailed
                        ? 'border-[var(--status-error-border)] bg-[var(--status-error-bg)] text-[var(--status-error-text)]'
                        : 'border-[var(--status-warning-border)] bg-[var(--status-warning-bg)] text-[var(--status-warning-text)]'
                    }`}>
                      {processedAssetsFailed
                        ? (currentLang === 'no'
                          ? 'Lokale referansemoduler kunne ikke lastes i denne økten. Guider, artikler og øvrig appinnhold fungerer fortsatt.'
                          : 'Local reference modules could not be loaded in this session. Guides, articles, and the rest of the app still work.')
                        : (currentLang === 'no'
                          ? 'Lokale referansemoduler lastes i bakgrunnen for å redusere treg oppstart. Guider og artikler er tilgjengelige allerede nå.'
                          : 'Local reference modules are loading in the background to reduce slow startup. Guides and editorial content are already available.')}
                    </div>
                  </section>
                )}
                {activeTab === 'library' && (
                  <>
                {/* FEATURED OPERATIONAL GUIDES */}
                <section className="section bg-[var(--bg-alt)] py-16 px-4 sm:px-8 border-b border-[var(--border)] relative">
                  
                  <div className="max-w-[1400px] mx-auto animate-fade-in">
                    
                    <div className="section-heading flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-8 border-b border-[var(--border)]">
                      <div>
                        <h2 className="text-3xl md:text-4xl font-bold font-display tracking-tight text-[var(--text)]">
                          {t('featured_title')}
                        </h2>
                      </div>
                      <div>
                        <p className="max-w-[50ch] text-[var(--muted)] text-xs md:text-sm leading-relaxed">
                          {currentLang === 'no'
                          ? 'Korte, praktiske guider for de vanligste beredskapsspørsmålene i 2026: egenberedskap, vann, varsler, strømbrudd, førstehjelp og digitalt personvern.'
                            : 'Short, practical guidance for the most common preparedness questions in 2026: household readiness, water, alerts, outages, first aid, and digital privacy.'}
                        </p>
                      </div>
                    </div>

                    <div className="feature-layout grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Guide 1 */}
                      <article className="feature-card bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius)] p-6 shadow-[var(--shadow)] flex flex-col justify-between min-h-[280px]">
                        <div className="flex flex-col gap-4">
                          <div className="inline-meta flex flex-wrap gap-2">
                            <span className="inline-chip border border-[var(--border)] text-[9px] font-mono tracking-wider font-semibold text-[var(--muted)] px-3 py-1 rounded-full bg-[rgba(0,0,0,0.15)]">{t('read_time_tag')}</span>
                            <span className="inline-chip border border-[var(--border)] text-[9px] font-mono tracking-wider font-semibold text-[var(--muted)] px-3 py-1 rounded-full bg-[rgba(0,0,0,0.15)]">{t('offline_saved_tag')}</span>
                            <span className={`inline-chip border text-[9px] font-mono tracking-wider font-bold px-3 py-1 rounded-full ${
                              theme === 'light'
                                ? 'border-red-200 text-red-700 bg-red-50'
                                : 'border-red-500/35 text-red-500 bg-red-950/25'
                            }`}>{t('high_priority_tag')}</span>
                          </div>
                          
                          <h3 className="text-xl md:text-2xl font-bold leading-tight font-display">{currentLang === 'no' ? 'Improvisert urban traumesett' : 'Improvised Urban Trauma Kit'}</h3>
                          
                          <p className="text-[var(--muted)] text-xs md:text-sm leading-relaxed">
                            {currentLang === 'no' 
                              ? 'Hvordan du setter sammen et enkelt traumesett med vanlige apotekvarer og smart organisering.'
                              : 'How to build a simple trauma kit with common pharmacy items and practical organization.'}
                          </p>
                        </div>

                        <div className="mt-6 pt-4 border-t border-[var(--border)]">
                          <button 
                            onClick={() => handleOpenFeaturedGuide('bleeding')}
                            className="w-full text-center px-4 py-2.5 rounded-xl bg-[var(--card)] hover:bg-[var(--bg)] text-xs font-bold text-[var(--text)] border border-[var(--border)] transition-all hover:border-[var(--accent)] cursor-pointer"
                          >
                            {t('btn_open_guide')}
                          </button>
                        </div>
                      </article>

                      {/* Guide 2 */}
                      <article className="feature-card bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius)] p-6 shadow-[var(--shadow)] flex flex-col justify-between min-h-[280px]">
                        <div className="flex flex-col gap-4">
                          <div className="inline-meta flex flex-wrap gap-2">
                            <span className="inline-chip border border-[var(--border)] text-[9px] font-mono tracking-wider font-semibold text-[var(--muted)] px-3 py-1 rounded-full bg-[rgba(0,0,0,0.15)]">{t('travel_security_tag')}</span>
                            <span className="inline-chip border border-[var(--border)] text-[9px] font-mono tracking-wider font-semibold text-[var(--muted)] px-3 py-1 rounded-full bg-[rgba(0,0,0,0.15)]">{t('updated_tag')}</span>
                            <span className={`inline-chip border text-[9px] font-mono tracking-wider font-bold px-3 py-1 rounded-full ${
                              theme === 'light'
                                ? 'border-green-200 text-green-700 bg-green-50'
                                : 'border-green-500/35 text-green-500 bg-green-950/25'
                            }`}>{t('field_verified_tag')}</span>
                          </div>
                          
                          <h3 className="text-xl md:text-2xl font-bold leading-tight font-display">{currentLang === 'no' ? 'Sikker bruk av reise-telefon' : 'Travel Phone Safety Checklist'}</h3>
                          
                          <p className="text-[var(--muted)] text-xs md:text-sm leading-relaxed">
                            {currentLang === 'no' 
                              ? 'En enkel steg-for-steg guide for tryggere mobilbruk på reise og ved grensepassering.'
                              : 'A simple step-by-step guide for safer phone use while traveling and crossing borders.'}
                          </p>
                        </div>

                        <div className="mt-6 pt-4 border-t border-[var(--border)]">
                          <button 
                            onClick={() => handleOpenFeaturedGuide('burner-phone')}
                            className="w-full text-center px-4 py-2.5 rounded-xl bg-[var(--card)] hover:bg-[var(--bg)] text-xs font-bold text-[var(--text)] border border-[var(--border)] transition-all hover:border-[var(--accent)] cursor-pointer"
                          >
                            {t('btn_open_guide')}
                          </button>
                        </div>
                      </article>

                    </div>

                  </div>

                </section>

                {/* Editorial articles */}
                <section id="editorial-articles-section" className="section py-16 px-4 sm:px-8 max-w-[1400px] mx-auto border-b border-[var(--border)]">
                  <div className="section-heading flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-8 border-b border-[var(--border)]">
                    <div className="max-w-xl">
                      <h2 className="text-3xl md:text-4xl font-bold font-display tracking-tight text-[var(--text)] flex items-center gap-2 select-none">
                        <BookOpen className="w-8 h-8 text-[var(--accent)]" />
                        <span>{currentLang === 'no' ? 'Beredskapsartikler & Dypdykk' : 'Editorial Articles & Deep Dives'}</span>
                      </h2>
                    </div>
                    <div>
                      <p className="max-w-[50ch] text-[var(--muted)] text-xs md:text-sm leading-relaxed">
                        {currentLang === 'no' 
                          ? 'Praktiske artikler basert på åpne kilder og dokumenterte råd.'
                          : 'Practical articles based on open sources and documented guidance.'}
                      </p>
                    </div>
                  </div>
                  <Suspense fallback={<LazySectionFallback currentLang={currentLang} label={currentLang === 'no' ? 'beredskapsartikler' : 'editorial articles'} />}>
                    <EditorialArticlesViewer theme={theme} />
                  </Suspense>
                  
                  <div className="mt-8 text-center pt-6 border-t border-[var(--border)]/35">
                    <p className="text-xs text-[var(--muted)] mb-3">
                      {processedAssetsFailed
                        ? (currentLang === 'no'
                          ? 'Referansebiblioteket er midlertidig utilgjengelig i denne økten. Prøv igjen for å laste lokale referansemoduler.'
                          : 'The reference library is temporarily unavailable in this session. Try again to load the local reference modules.')
                        : processedAssetsReady
                          ? (currentLang === 'no'
                            ? `Leter du etter spesifikke emner? Referansebiblioteket inneholder ${referenceCount} artikler akkurat nå, og blir stadig utvidet.`
                            : `Looking for specific topics? The reference library includes ${referenceCount} articles at the moment, and is continuously updated.`)
                          : (currentLang === 'no'
                            ? 'Referansebiblioteket lastes lokalt i bakgrunnen for å redusere treg oppstart på langsommere enheter.'
                            : 'The reference library is loading locally in the background to reduce slow startup on lower-powered devices.')}
                    </p>
                    <button
                      onClick={() => {
                        setActiveTab('reference-library');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--card)] hover:bg-[var(--bg-alt)] border border-[var(--border)] text-xs font-bold text-[var(--accent)] hover:-translate-y-0.5 transition-all cursor-pointer"
                    >
                      <span>{currentLang === 'no' ? 'Utforsk det utvidede referansebiblioteket' : 'Explore the Extended Reference Library'}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[var(--accent)]" />
                    </button>
                  </div>
                </section>
                </>
                )}

                {/* EXTENDED REFERENCE DATABASE */}
                {activeTab === 'reference-library' && (
                <section id="extended-reference-library" className="section py-16 px-4 sm:px-8 max-w-[1400px] mx-auto border-t border-[var(--border)]">
                  <div className="section-heading flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-8 border-b border-[var(--border)]">
                    <div className="max-w-xl">
                      <h2 className="text-3xl md:text-4xl font-bold font-display tracking-tight text-[var(--text)] flex items-center gap-2 select-none">
                        <Database className="w-8 h-8 text-[var(--accent)]" />
                        <span>{t('library_title')}</span>
                      </h2>
                    </div>
                    <div>
                      <p className="max-w-[50ch] text-[var(--muted)] text-xs md:text-sm leading-relaxed">
                        {t('library_desc')}
                      </p>
                    </div>
                  </div>

                  <section id="offline-content-packs" className="mb-8 space-y-4">
                    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 md:p-5 space-y-3">
                      <h3 className="text-lg md:text-xl font-bold">
                        {currentLang === 'no' ? 'Offline innholdspakker' : 'Offline content packs'}
                      </h3>
                      <p className="text-xs md:text-sm text-[var(--muted)] leading-relaxed">
                        {currentLang === 'no'
                          ? 'Disse pakkene viser hva som allerede er bundlet i appen og hvilke moduler som er valgfrie utvidelser. Offisielle live-kilder beholdes som referanser, ikke avhengigheter.'
                          : 'These packs show what is already bundled in the app and which modules are optional add-ons. Official live sources remain references, not dependencies.'}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                        {contentPacks.map((pack) => {
                          const isPackSelected = libraryPackFilter === pack.id;
                          return (
                          <article
                            key={pack.id}
                            role="button"
                            tabIndex={0}
                            aria-pressed={isPackSelected}
                            data-pack-id={pack.id}
                            onClick={() => {
                              setLibraryPackFilter(pack.id);
                              setLibraryPillarFilter('all');
                              setLibraryPageSize(9);
                              window.setTimeout(() => {
                                document.getElementById('reference-library-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                              }, 60);
                            }}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                setLibraryPackFilter(pack.id);
                                setLibraryPillarFilter('all');
                                setLibraryPageSize(9);
                                window.setTimeout(() => {
                                  document.getElementById('reference-library-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }, 60);
                              }
                            }}
                            className={`bg-[var(--bg-alt)] border rounded-lg p-3 space-y-2 transition-all cursor-pointer ${
                              isPackSelected
                                ? 'border-[var(--accent-solid)] shadow-[0_0_0_1px_var(--accent-solid)]'
                                : 'border-[var(--border)] hover:border-[var(--accent-solid)]/60'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="text-sm font-bold">{pack.title}</h4>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-[var(--border)] text-[var(--accent)]">
                                {pack.assets.length}
                              </span>
                            </div>
                            <p className="text-xs text-[var(--muted)] leading-relaxed">{pack.category}</p>
                            <div className="text-[10px] font-mono text-[var(--muted)] space-y-1">
                              <p>{currentLang === 'no' ? 'Kilder' : 'Sources'}: {pack.sourceIds.length}</p>
                              <p>{currentLang === 'no' ? 'Størrelse' : 'Size'}: {pack.sizeEstimate}</p>
                              <p>{currentLang === 'no' ? 'Siste verifisering' : 'Last verified'}: {pack.lastVerified}</p>
                            </div>
                            <div className="pt-2 border-t border-dashed border-[var(--border)] text-[10px] font-mono text-[var(--muted)] space-y-1">
                              <p>{currentLang === 'no' ? 'Valgfrie moduler:' : 'Optional modules:'}</p>
                              <p>{pack.optionalModules.join(' | ')}</p>
                            </div>
                          </article>
                          );
                        })}
                      </div>
                    </div>

                    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 md:p-5 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs md:text-sm">
                      <div>
                        <p className="text-[10px] font-mono uppercase text-[var(--muted)]">
                          {currentLang === 'no' ? 'Bundlet' : 'Bundled at'}
                        </p>
                        <p className="font-bold">{contentPacks[0]?.bundledAt || '2026-06-01'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-mono uppercase text-[var(--muted)]">
                          {currentLang === 'no' ? 'Siste kildegjennomgang' : 'Last source review'}
                        </p>
                        <p className="font-bold">
                          {contentPacks
                            .map((pack) => pack.lastVerified)
                            .sort()
                            .reverse()[0] || '2026-06-01'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-mono uppercase text-[var(--muted)]">
                          {currentLang === 'no' ? 'Live-status' : 'Live update status'}
                        </p>
                        <p className="font-bold">
                          {currentLang === 'no' ? 'Live-oppdatering utilgjengelig offline' : 'Live update unavailable offline'}
                        </p>
                      </div>
                    </div>
                  </section>

                  {selectedContentPack && (
                    <section className="mb-8 space-y-4">
                      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 md:p-5 space-y-4">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          <div className="space-y-2">
                            <p className="text-[10px] font-mono uppercase tracking-wide text-[var(--accent)]">
                              {currentLang === 'no' ? 'Valgt offline-pakke' : 'Selected offline pack'}
                            </p>
                            <div>
                              <h3 className="text-lg md:text-xl font-bold">{selectedContentPack.title}</h3>
                              <p className="text-xs md:text-sm text-[var(--muted)] leading-relaxed max-w-[70ch]">
                                {selectedContentPack.category}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setLibraryPackFilter('all')}
                            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--bg-alt)] hover:bg-[var(--bg)] border border-[var(--border)] text-xs font-bold transition-all cursor-pointer"
                          >
                            <span>{currentLang === 'no' ? 'Vis alle pakker' : 'Show all packs'}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                          {selectedContentPackTypeSummaries.map((summary) => (
                            <article
                              key={summary.type}
                              className="bg-[var(--bg-alt)] border border-[var(--border)] rounded-lg p-3 space-y-3"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <h4 className="text-sm font-bold">{searchTypeLabels[summary.type]}</h4>
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-[var(--border)] text-[var(--accent)]">
                                  {summary.count}
                                </span>
                              </div>
                              <p className="text-xs text-[var(--muted)] leading-relaxed">
                                {summary.samples.join(' • ')}
                              </p>
                              <button
                                type="button"
                                onClick={() => handleOpenPackType(summary.type)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--card)] hover:bg-[var(--bg)] border border-[var(--border)] text-xs font-bold transition-all cursor-pointer"
                              >
                                <span>{getPackTypeActionLabel(summary.type)}</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            </article>
                          ))}
                        </div>
                      </div>
                    </section>
                  )}

                  {/* Filter and Local Search Bar */}
                  <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8">
                    {/* Pillar pills filter */}
                    <div className="flex flex-wrap gap-2 justify-center md:justify-start text-xs font-mono select-none">
                      <button
                        type="button"
                        onClick={() => {
                          setLibraryPackFilter('all');
                          setLibraryPageSize(9);
                        }}
                        className={`px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                          libraryPackFilter === 'all'
                            ? 'bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)] font-bold'
                            : 'bg-[var(--card)] text-[var(--muted)] border-[var(--border)] hover:text-[var(--text)]'
                        }`}
                      >
                        {currentLang === 'no' ? 'Alle pakker' : 'All packs'}
                      </button>
                      {[
                        { id: 'all', label: currentLang === 'no' ? 'Alle' : 'All' },
                        { id: 'førstehjelp', label: currentLang === 'no' ? 'Førstehjelp' : 'First Aid' },
                        { id: 'friluftsliv', label: currentLang === 'no' ? 'Friluftsliv' : 'Wilderness' },
                        { id: 'egensikkerhet', label: currentLang === 'no' ? 'Egensikkerhet' : 'Personal Safety' },
                        { id: 'egenberedskap', label: currentLang === 'no' ? 'Beredskap' : 'Preparedness' },
                        { id: 'personvern', label: currentLang === 'no' ? 'Personvern' : 'Privacy' },
                        { id: 'reisesikkerhet', label: currentLang === 'no' ? 'Reisesikkerhet' : 'Travel' }
                      ].map(pill => (
                        <button
                          key={pill.id}
                          onClick={() => {
                            setLibraryPillarFilter(pill.id);
                            setLibraryPageSize(9);
                          }}
                          className={`px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                            libraryPillarFilter === pill.id
                              ? 'bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)] font-bold'
                              : 'bg-[var(--card)] text-[var(--muted)] border-[var(--border)] hover:text-[var(--text)]'
                          }`}
                        >
                          {pill.label}
                        </button>
                      ))}
                    </div>

                    {/* Inline Search Bar */}
                    <div className="w-full md:w-80 bg-[rgba(0,0,0,0.15)] border border-[var(--border)] rounded-full px-4 py-2.5 flex items-center gap-2">
                      <Search className="w-4 h-4 text-[var(--muted)] flex-shrink-0" />
                      <input
                        type="text"
                        placeholder={currentLang === 'no' ? 'Søk i referansearkiv...' : 'Search archive...'}
                        value={librarySearchQuery}
                        onChange={(e) => {
                          setLibrarySearchQuery(e.target.value);
                          setLibraryPageSize(9);
                        }}
                        className="bg-transparent border-none outline-none text-[var(--text)] w-full text-xs placeholder:text-[var(--muted)] focus:ring-0"
                      />
                      {librarySearchQuery && (
                        <button onClick={() => setLibrarySearchQuery('')} className="text-[var(--muted)] hover:text-[var(--text)] text-xs font-mono font-bold cursor-pointer">&times;</button>
                      )}
                    </div>
                  </div>

                  {/* Grid of aggregated modular cards */}
                  {filteredReferenceAssets.length === 0 ? (
                    <div className="text-center py-12 bg-[var(--card)] border border-[var(--border)] rounded-xl">
                      <p className="text-sm font-mono text-[var(--muted)]">
                        {selectedContentPack
                          ? (currentLang === 'no'
                            ? 'Denne pakken har ingen egne referansemoduler i arkivformat. Bruk innholdsoversikten over for å åpne kart, sjekklister eller kilder.'
                            : 'This pack has no processed archive modules. Use the pack contents above to open maps, checklists, or source references.')
                          : 'No archive modules match your filters.'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-8" id="reference-library-grid">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {visibleReferenceAssets.map((asset) => (
                          <article
                            key={asset.id}
                            onClick={() => {
                              setSelectedAssetId(asset.id);
                              setSelectedAssetInitialTab('article');
                              window.scrollTo({ top: 350, behavior: 'smooth' });
                            }}
                            className="bg-[var(--card)] border border-[var(--border)] hover:border-[var(--accent)]/40 rounded-[var(--radius)] p-5 shadow-[var(--shadow)] cursor-pointer hover:-translate-y-0.5 transition-all flex flex-col justify-between min-h-[260px]"
                          >
                            <div className="space-y-3">
                              <div className="flex justify-between items-center gap-2">
                                <span className="text-[9px] font-mono uppercase bg-[rgba(255,255,255,0.02)] border border-[var(--border)] text-[var(--muted)] px-2 py-0.5 rounded">
                                  {localizeCategory(asset.category, currentLang)}
                                </span>
                                <span className="text-[9px] font-mono text-[var(--muted)]">
                                  {asset.metadata.fileSizeKb.toFixed(1)} KB
                                </span>
                              </div>
                              <h3 className="text-base font-bold line-clamp-2 leading-tight font-display">
                                {optimizeTitle(asset.title, currentLang)}
                              </h3>
                              <p className="text-xs text-[var(--muted)] line-clamp-3 leading-relaxed">
                                {asset.article.overview}
                              </p>
                            </div>

                            <div className="mt-4 pt-3 border-t border-dashed border-[var(--border)] flex flex-wrap gap-2 justify-between items-center text-[10px] font-mono">
                              <span className="opacity-60">Modules: 7/7</span>
                              <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                <button
                                  title={currentLang === 'no' ? 'Artikkel' : 'Article'}
                                  onClick={() => {
                                    setSelectedAssetId(asset.id);
                                    setSelectedAssetInitialTab('article');
                                    window.scrollTo({ top: 350, behavior: 'smooth' });
                                  }}
                                  className="p-1 rounded border border-transparent hover:border-[var(--border)] hover:bg-[rgba(255,255,255,0.04)] text-[var(--muted)] hover:text-[var(--accent)] transition-all cursor-pointer"
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  title={currentLang === 'no' ? 'Veileder' : 'Guide'}
                                  onClick={() => {
                                    setSelectedAssetId(asset.id);
                                    setSelectedAssetInitialTab('guide');
                                    window.scrollTo({ top: 350, behavior: 'smooth' });
                                  }}
                                  className="p-1 rounded border border-transparent hover:border-[var(--border)] hover:bg-[rgba(255,255,255,0.04)] text-[var(--muted)] hover:text-[var(--accent)] transition-all cursor-pointer"
                                >
                                  <ListChecks className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  title={currentLang === 'no' ? 'Sjekkliste' : 'Checklist'}
                                  onClick={() => {
                                    setSelectedAssetId(asset.id);
                                    setSelectedAssetInitialTab('checklist');
                                    window.scrollTo({ top: 350, behavior: 'smooth' });
                                  }}
                                  className="p-1 rounded border border-transparent hover:border-[var(--border)] hover:bg-[rgba(255,255,255,0.04)] text-[var(--muted)] hover:text-[var(--accent)] transition-all cursor-pointer"
                                >
                                  <CheckSquare className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  title={currentLang === 'no' ? 'Sertifisering' : 'Protocol'}
                                  onClick={() => {
                                    setSelectedAssetId(asset.id);
                                    setSelectedAssetInitialTab('protocol');
                                    window.scrollTo({ top: 350, behavior: 'smooth' });
                                  }}
                                  className="p-1 rounded border border-transparent hover:border-[var(--border)] hover:bg-[rgba(255,255,255,0.04)] text-[var(--muted)] hover:text-[var(--accent)] transition-all cursor-pointer"
                                >
                                  <ShieldCheck className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  title={currentLang === 'no' ? 'Kursmodul' : 'Course Module'}
                                  onClick={() => {
                                    setSelectedAssetId(asset.id);
                                    setSelectedAssetInitialTab('module');
                                    window.scrollTo({ top: 350, behavior: 'smooth' });
                                  }}
                                  className="p-1 rounded border border-transparent hover:border-[var(--border)] hover:bg-[rgba(255,255,255,0.04)] text-[var(--muted)] hover:text-[var(--accent)] transition-all cursor-pointer"
                                >
                                  <BookOpen className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </article>
                        ))}
                      </div>

                      {filteredReferenceAssets.length > libraryPageSize && (
                        <div className="text-center">
                          <button
                            onClick={() => setLibraryPageSize(prev => prev + 9)}
                            className="px-6 py-3 rounded-xl bg-[var(--card)] hover:bg-[var(--bg)] border border-[var(--border)] text-xs font-bold transition-all cursor-pointer"
                          >
                            {currentLang === 'no' ? `Vis flere (+${filteredReferenceAssets.length - libraryPageSize} gjenstående)` : `Show More (+${filteredReferenceAssets.length - libraryPageSize} remaining)`}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </section>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: TRAINING SCENARIOS */}
        {activeTab === 'scenarios' && (
          <section className="section py-10 px-4 sm:px-8 max-w-[1400px] mx-auto space-y-8">
            <div className="text-center space-y-2 max-w-xl mx-auto">
              <span className="text-[10px] font-mono uppercase bg-[var(--card)] px-3 py-1 rounded-full border border-[var(--border)] text-[var(--accent)] font-bold">
                {currentLang === 'no' ? 'Scenario-trener' : 'Scenario Trainer'}
              </span>
              <h2 className="text-3xl md:text-4xl font-bold font-display text-[var(--text)] leading-tight">{t('scenarios_title')}</h2>
              <p className="text-xs md:text-sm text-[var(--muted)] leading-relaxed">
                {t('scenarios_desc')}
              </p>
            </div>
            <Suspense fallback={<LazySectionFallback currentLang={currentLang} label={currentLang === 'no' ? 'scenarioøvelser' : 'training scenarios'} />}>
              <TrainingScenarios theme={theme} />
            </Suspense>
          </section>
        )}

        {/* TAB 3: FLOWCHARTS / BESLUTNINGSTRÆR */}
        {activeTab === 'flowcharts' && (
          <section className="section py-10 px-4 sm:px-8 max-w-[1400px] mx-auto space-y-8">
            <div className="text-center space-y-2 max-w-xl mx-auto">
              <span className="text-[10px] font-mono uppercase bg-[var(--card)] px-3 py-1 rounded-full border border-[var(--border)] text-[var(--accent)] font-bold">
                {currentLang === 'no' ? 'Beslutningstrær' : 'Decision Trees'}
              </span>
              <h2 className="text-3xl md:text-4xl font-bold font-display text-[var(--text)] leading-tight">{t('flowcharts_title')}</h2>
              <p className="text-xs md:text-sm text-[var(--muted)] leading-relaxed">
                {t('flowcharts_desc')}
              </p>
            </div>
            <Suspense fallback={<LazySectionFallback currentLang={currentLang} label={currentLang === 'no' ? 'beslutningstrær' : 'decision trees'} />}>
              <InteractiveFlowcharts theme={theme} />
            </Suspense>
          </section>
        )}

        {/* TAB 4: CHECKLISTS IN LOCALSTORAGE */}
        {activeTab === 'checklists' && (
          <section className="section py-10 px-4 sm:px-8 max-w-[1400px] mx-auto space-y-8">
            <div className="text-center space-y-2 max-w-xl mx-auto">
              <span className="text-[10px] font-mono uppercase bg-[var(--card)] px-3 py-1 rounded-full border border-[var(--border)] text-[var(--accent)] font-bold">
                {currentLang === 'no' ? 'Sivil Robusthet' : 'Civilian Resilience'}
              </span>
              <h2 className="text-3xl md:text-4xl font-bold font-display text-[var(--text)] leading-tight">{t('checklists_title')}</h2>
              <p className="text-xs md:text-sm text-[var(--muted)] leading-relaxed">
                {t('checklists_desc')}
              </p>
            </div>

            {/* Sub-tabs selector for Checklist View */}
            <div className="flex justify-center border-b border-[var(--border)] pb-2 select-none gap-4">
              <button
                onClick={() => setChecklistSubTab('standard')}
                className={`pb-2 px-1 text-xs font-mono font-bold uppercase border-b-2 transition-all cursor-pointer ${
                  checklistSubTab === 'standard'
                    ? 'border-[var(--accent)] text-[var(--accent)] font-bold'
                    : 'border-transparent text-[var(--muted)] hover:text-[var(--text)]'
                }`}
              >
                {currentLang === 'no' ? 'Standard Sjekklister' : 'Standard Checklists'}
              </button>
              <button
                onClick={() => setChecklistSubTab('custom')}
                className={`pb-2 px-1 text-xs font-mono font-bold uppercase border-b-2 transition-all cursor-pointer ${
                  checklistSubTab === 'custom'
                    ? 'border-[var(--accent)] text-[var(--accent)] font-bold'
                    : 'border-transparent text-[var(--muted)] hover:text-[var(--text)]'
                }`}
              >
                {currentLang === 'no' ? 'Egen Sjekkliste (Dynamisk)' : 'Custom List Generator'}
              </button>
              <button
                onClick={() => setChecklistSubTab('backup')}
                className={`pb-2 px-1 text-xs font-mono font-bold uppercase border-b-2 transition-all cursor-pointer ${
                  checklistSubTab === 'backup'
                    ? 'border-[var(--accent)] text-[var(--accent)] font-bold'
                    : 'border-transparent text-[var(--muted)] hover:text-[var(--text)]'
                }`}
              >
                {currentLang === 'no' ? 'Sikkerhetskopi & QR' : 'Backup & QR Sync'}
              </button>
              <button
                onClick={() => setChecklistSubTab('vault')}
                className={`pb-2 px-1 text-xs font-mono font-bold uppercase border-b-2 transition-all cursor-pointer ${
                  checklistSubTab === 'vault'
                    ? 'border-[var(--accent)] text-[var(--accent)] font-bold'
                    : 'border-transparent text-[var(--muted)] hover:text-[var(--text)]'
                }`}
              >
                {currentLang === 'no' ? 'Lokal Dokumentvault' : 'Local Document Vault'}
              </button>
              <button
                onClick={() => setChecklistSubTab('ai')}
                className={`pb-2 px-1 text-xs font-mono font-bold uppercase border-b-2 transition-all cursor-pointer ${
                  checklistSubTab === 'ai'
                    ? 'border-[var(--accent)] text-[var(--accent)] font-bold'
                    : 'border-transparent text-[var(--muted)] hover:text-[var(--text)]'
                }`}
              >
                {currentLang === 'no' ? 'Lokal AI Assistanse' : 'Local AI Assist'}
              </button>
            </div>

            {checklistSubTab === 'standard' && (
              <Suspense fallback={<LazySectionFallback currentLang={currentLang} label={currentLang === 'no' ? 'standardsjekklister' : 'standard checklists'} />}>
                <SafetyChecklists theme={theme} />
              </Suspense>
            )}
            {checklistSubTab === 'custom' && (
              <Suspense fallback={<LazySectionFallback currentLang={currentLang} label={currentLang === 'no' ? 'egen sjekkliste' : 'custom checklist'} />}>
                <DynamicGearListBuilder theme={theme} />
              </Suspense>
            )}
            {checklistSubTab === 'backup' && (
              <Suspense fallback={<LazySectionFallback currentLang={currentLang} label={currentLang === 'no' ? 'sikkerhetskopi' : 'backup tools'} />}>
                <SecureSaveManager theme={theme} />
              </Suspense>
            )}
            {checklistSubTab === 'vault' && (
              <Suspense fallback={<LazySectionFallback currentLang={currentLang} label={currentLang === 'no' ? 'dokumentvault' : 'document vault'} />}>
                <LocalDocumentVault theme={theme} />
              </Suspense>
            )}
            {checklistSubTab === 'ai' && (
              <Suspense fallback={<LazySectionFallback currentLang={currentLang} label={currentLang === 'no' ? 'lokal KI' : 'local AI'} />}>
                <LocalAiAssistant theme={theme} currentLang={currentLang} searchDocuments={searchDocuments} />
              </Suspense>
            )}
          </section>
        )}

        {activeTab === 'glossary' && (
          <Suspense fallback={<LazySectionFallback currentLang={currentLang} label={currentLang === 'no' ? 'begrepsliste' : 'glossary'} />}>
            <GlossaryPage currentLang={currentLang} />
          </Suspense>
        )}

        {activeTab === 'shelters' && (
          <Suspense fallback={<LazySectionFallback currentLang={currentLang} label={currentLang === 'no' ? 'tilfluktsromkart' : 'shelter map'} />}>
            <ShelterMap currentLang={currentLang} theme={theme} />
          </Suspense>
        )}

        {activeTab === 'recommended-reading' && (
          <Suspense fallback={<LazySectionFallback currentLang={currentLang} label={currentLang === 'no' ? 'lesetips' : 'reading'} />}>
            <RecommendedReadingPage currentLang={currentLang} />
          </Suspense>
        )}

        {activeTab === 'support' && (
          <Suspense fallback={<LazySectionFallback currentLang={currentLang} label={currentLang === 'no' ? 'innstillinger' : 'settings'} />}>
            <SupportHubPage
              currentLang={currentLang}
              contactEmail={contactEmail}
              copiedContactEmail={copiedContactEmail}
              onCopyContactEmail={handleCopyContactEmail}
              theme={theme}
              setTheme={setTheme}
              subTab={settingsSubTab}
              setSubTab={setSettingsSubTab}
              onOpenVault={() => {
                setActiveTab('checklists');
                setChecklistSubTab('vault');
                scrollToTop();
              }}
              onOpenBackup={() => {
                setActiveTab('checklists');
                setChecklistSubTab('backup');
                scrollToTop();
              }}
            />
          </Suspense>
        )}

      </main>

      {/* FOOTER */}
      <footer className="footer border-t border-[var(--border)] py-12 px-4 sm:px-8 bg-[var(--bg-alt)] mt-auto select-none">
        <div className="max-w-[1400px] mx-auto space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="space-y-3">
              <strong className="block text-lg tracking-[0.08em] font-extrabold text-[var(--text)]">BEREDSKAP101</strong>
              <p className="text-sm text-[var(--muted)] leading-relaxed max-w-md">
                {t('footer_desc')}
              </p>
              <p className="text-xs text-[var(--muted)] leading-relaxed max-w-md">
                {currentLang === 'no'
                  ? 'Lokal lagring, tydelige klargjøringssteg og støtteverktøy er samlet under Support i navigasjonen.'
                  : 'Local storage, clear preparedness steps, and support tools are gathered under Support in the navigation.'}
              </p>
            </div>

            <div className="space-y-3">
              <div className="rounded-lg border border-dashed border-[var(--border)] px-4 py-3 space-y-2 text-xs text-[var(--muted)] leading-relaxed">
                <p>{currentLang === 'no' ? 'Referansetid' : 'Reference time'}: {referenceTimeLabel}</p>
                <p>
                  {currentLang === 'no'
                    ? 'Juridisk informasjon, personvern, cookievalg, eksport og sletting finner du i Support.'
                    : 'Legal information, privacy, cookie choices, export, and deletion live under Support.'}
                </p>
                <p>{t('footer_all_rights')} &copy; 2026 Beredskap101</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[var(--border)] text-center text-[10px] text-[var(--muted)]/75 leading-relaxed">
            {t('footer_guarantee')}
          </div>
        </div>

      </footer>

      <CookieBanner
        currentLang={currentLang}
        onOpenSettings={() => {
          setActiveTab('support');
          setSettingsSubTab('cookies');
          scrollToTop();
        }}
      />

      {/* MOBILE CRISIS QUICK BOTTOM TABS CONTROL DOCK */}
      <nav className="mobile-nav fixed bottom-0 left-0 right-0 py-3.5 px-2 bg-[var(--card)] border-t border-[var(--border)] flex justify-around items-center md:hidden z-40 shadow-xl select-none">
        <button
          onClick={() => { setActiveTab('manual'); setSelectedPillarId(null); setActiveArticleId(null); scrollToTop(); }}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${activeTab === 'manual' ? 'text-[var(--accent)] font-bold scale-105' : 'text-[var(--muted)] opacity-70'}`}
        >
          <BookOpen className="w-4.5 h-4.5" />
          <span className="text-[9px] font-bold font-mono">{t('nav_home')}</span>
        </button>
        <button
          onClick={() => { setActiveTab('library'); setSelectedAssetId(null); scrollToTop(); }}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${activeTab === 'library' ? 'text-[var(--accent)] font-bold scale-105' : 'text-[var(--muted)] opacity-70'}`}
        >
          <Database className="w-4.5 h-4.5" />
          <span className="text-[9px] font-bold font-mono">{t('nav_library')}</span>
        </button>
        <button
          onClick={() => { setActiveTab('scenarios'); scrollToTop(); }}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${activeTab === 'scenarios' ? 'text-[var(--accent)] font-bold scale-105' : 'text-[var(--muted)] opacity-70'}`}
        >
          <Award className="w-4.5 h-4.5" />
          <span className="text-[9px] font-bold font-mono">{t('nav_guides')}</span>
        </button>
        <button
          onClick={() => { setActiveTab('flowcharts'); scrollToTop(); }}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${activeTab === 'flowcharts' ? 'text-[var(--accent)] font-bold scale-105' : 'text-[var(--muted)] opacity-70'}`}
        >
          <Activity className="w-4.5 h-4.5" />
          <span className="text-[9px] font-bold font-mono">{t('nav_offline')}</span>
        </button>
        <button
          onClick={() => { setActiveTab('checklists'); scrollToTop(); }}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${activeTab === 'checklists' ? 'text-[var(--accent)] font-bold scale-105' : 'text-[var(--muted)] opacity-70'}`}
        >
          <BookmarkCheck className="w-4.5 h-4.5" />
          <span className="text-[9px] font-bold font-mono">{t('nav_profile')}</span>
        </button>
        <button
          onClick={() => { setActiveTab('support'); scrollToTop(); }}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${activeTab === 'support' ? 'text-[var(--accent)] font-bold scale-105' : 'text-[var(--muted)] opacity-70'}`}
        >
          <LifeBuoy className="w-4.5 h-4.5" />
          <span className="text-[9px] font-bold font-mono">{currentLang === 'no' ? 'Innstillinger' : 'Settings'}</span>
        </button>
      </nav>

    </div>
  );
}
