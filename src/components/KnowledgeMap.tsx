/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';
import { PillarId, type ThemeType } from '../types';
import KnowledgeMapSection from './knowledge-map/KnowledgeMapSection';

interface KnowledgeMapProps {
  currentLang: string;
  theme: ThemeType;
  setActiveTab: (tab: 'manual' | 'scenarios' | 'flowcharts' | 'checklists' | 'library') => void;
  setSelectedPillarId: (id: PillarId | null) => void;
  setActiveArticleId: (id: string | null) => void;
  setSelectedAssetId: (id: string | null) => void;
  setSelectedAssetInitialTab: (tab: 'article' | 'guide' | 'checklist' | 'protocol' | 'module' | 'stats') => void;
  completedTopics: string[];
  guideCount: number;
  onSearch: (query: string) => void;
}

export default function KnowledgeMap({
  currentLang,
  theme,
  setActiveTab,
  setSelectedPillarId,
  setActiveArticleId,
  setSelectedAssetId,
  setSelectedAssetInitialTab,
  completedTopics,
  guideCount,
  onSearch,
}: KnowledgeMapProps) {
  const { t } = useTranslation();
  
  // Collapse details by default to keep the top view compact
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  return (
    <div className="w-full flex flex-col gap-4 font-sans text-[var(--text-main)] select-none">
      
      {/* 1. COLLAPSIBLE STATUS BAR */}
      <div className="max-w-[1400px] w-full mx-auto px-4 sm:px-6">
        <div className="bg-[var(--bg-panel)] border border-[var(--border-muted)] rounded-[var(--radius-md)] p-3 flex flex-wrap items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-bold tracking-wider uppercase font-mono text-[var(--text-main)]">
              {currentLang === 'no' ? 'Systemstatus' : 'System status'}
            </span>
            <span className="hidden md:inline text-[var(--text-dim)] font-mono text-[12px]">|</span>
            <span className="hidden md:inline text-[var(--text-dim)] font-sans text-[12px]">
              {currentLang === 'no' 
                ? 'Vis detaljer for søk, status og hurtigknapper.' 
                : 'Show details for search, status, and quick actions.'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowDetails(prev => !prev)}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-[var(--border-muted)] text-[12px] font-mono font-bold transition-all bg-black/25 text-[var(--text-main)] hover:border-[var(--accent)] hover:text-[var(--accent)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            aria-expanded={showDetails}
            aria-label={showDetails ? 'Hide details panel' : 'Show details panel'}
          >
            <span>{showDetails ? (currentLang === 'no' ? 'Skjul detaljer' : 'Hide details') : (currentLang === 'no' ? 'Vis detaljer' : 'Show details')}</span>
            {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expanded details panel */}
      {showDetails && (
        <div className="max-w-[1400px] w-full mx-auto px-4 sm:px-6 animate-fade-in">
          <div className="bg-[var(--bg-panel)] border border-[var(--border-muted)] rounded-[var(--radius-lg)] p-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start shadow-xl">
            
            {/* Left Column (Hero copy) */}
            <div className="lg:col-span-7 flex flex-col gap-3">
              <div className="border border-[#ff3b30]/20 bg-[#ff3b30]/5 rounded px-2.5 py-0.5 text-[11px] font-mono font-bold tracking-widest text-[#ff3b30] w-fit uppercase">
                {currentLang === 'no' ? 'Norsk Sivil Robusthetsguide' : 'Norwegian-Ready Civil Resilience Guide'}
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[var(--text-main)] leading-tight">
                {currentLang === 'no' ? 'Forberedt på den virkelige verden.' : 'Prepared for the real world.'}
              </h1>
              <p className="text-[12px] text-[var(--text-muted)] leading-relaxed max-w-[65ch]">
                {currentLang === 'no'
                  ? 'Beredskap101 gjør offisielle beredskapsråd, førstehjelpsprinsipper, prosedyrer, friluftsvurderinger, egenberedskap og reisesikkerhet om til praktiske handlinger du kan bruke før, under og etter en krise.'
                  : 'Beredskap101 turns official emergency advice, first aid principles, standard operating procedures, wilderness assessment, household preparedness, and travel safety into practical actions you can use before, during, and after a crisis.'}
              </p>
              <div className="flex flex-wrap gap-2.5 mt-1">
                <button
                  onClick={() => {
                    setActiveTab('flowcharts');
                    window.scrollTo({ top: 400, behavior: 'smooth' });
                  }}
                  className="px-4 py-2 rounded bg-[var(--accent-solid)] hover:brightness-110 text-[var(--accent-on-solid)] text-[12px] font-bold transition-all shadow-[0_0_12px_rgba(255,59,48,0.15)] cursor-pointer"
                >
                  {currentLang === 'no' ? 'Åpne flytskjema' : 'Open emergency flowcharts'}
                </button>
                <button
                  onClick={() => {
                    setActiveTab('checklists');
                    window.scrollTo({ top: 400, behavior: 'smooth' });
                  }}
                  className="px-4 py-2 rounded bg-transparent text-[var(--text-main)] border border-[var(--border-muted)] hover:border-white/30 text-[12px] font-bold transition-all cursor-pointer"
                >
                  {currentLang === 'no' ? 'Sjekklister' : 'Build one-week kit'}
                </button>
              </div>
            </div>

            {/* Right Column (Status indicators) */}
            <div className="lg:col-span-5 flex flex-col gap-3 w-full">
              {/* Local Search — wired into the shared offline local-search pipeline */}
              <div className="relative bg-black/35 border border-[var(--border-muted)] rounded-md px-3 py-2 flex items-center gap-2">
                <Search className="w-4 h-4 text-[var(--text-dim)]" />
                <input
                  type="text"
                  placeholder={t('kmap_search_placeholder')}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    onSearch(e.target.value);
                  }}
                  aria-label={t('kmap_search_placeholder')}
                  className="bg-transparent border-none outline-none text-[12px] text-[var(--text-main)] placeholder:text-[var(--text-dim)] w-full focus:ring-0"
                />
              </div>

              {/* Grid status indicators */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="border border-[var(--border-muted)] rounded-md p-3 bg-black/10">
                  <small className="text-[10px] text-[var(--text-dim)] font-mono block tracking-wider uppercase mb-0.5">
                    OFFLINE CACHE
                  </small>
                  <strong className="text-[12px] font-mono text-[#ff3b30] tracking-wide">
                    {currentLang === 'no' ? 'Klar' : 'Ready'}
                  </strong>
                </div>
                <div className="border border-[var(--border-muted)] rounded-md p-3 bg-black/10">
                  <small className="text-[10px] text-[var(--text-dim)] font-mono block tracking-wider uppercase mb-0.5">
                    BATTERY SAVER
                  </small>
                  <strong className="text-[12px] font-mono text-[#ff3b30] tracking-wide">
                    {currentLang === 'no' ? 'Aktivert' : 'Enabled'}
                  </strong>
                </div>
                <div className="border border-[var(--border-muted)] rounded-md p-3 bg-black/10">
                  <small className="text-[10px] text-[var(--text-dim)] font-mono block tracking-wider uppercase mb-0.5">
                    {currentLang === 'no' ? 'GUIDER' : 'GUIDES'}
                  </small>
                  <strong className="text-[12px] font-mono text-[#ff3b30] tracking-wide">{guideCount}</strong>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* 2. THE INTERACTIVE KNOWLEDGE MAP SECTION (Full-Width Landing Section) */}
      <section 
        className={`w-full py-8 border-y border-[var(--border-muted)] relative rounded-[var(--radius-lg)] ${
          theme === 'light' ? 'bg-[var(--bg)]' : 'bg-[#09090b]'
        }`}
        aria-label="Interactive preparedness pathways"
      >
        <div className="max-w-[1400px] w-full mx-auto px-4 sm:px-6">
          <KnowledgeMapSection
            currentLang={currentLang}
            theme={theme}
            setActiveTab={setActiveTab}
            setSelectedPillarId={setSelectedPillarId}
            setActiveArticleId={setActiveArticleId}
            setSelectedAssetId={setSelectedAssetId}
            setSelectedAssetInitialTab={setSelectedAssetInitialTab}
            completedTopics={completedTopics}
          />
        </div>
      </section>

    </div>
  );
}
