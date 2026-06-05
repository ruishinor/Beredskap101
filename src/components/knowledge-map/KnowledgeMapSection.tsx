import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight, AlertTriangle, Play, Lock, Unlock } from 'lucide-react';
import { PillarId } from '../../types';
import { pillarsDataEn, pillarsDataNo } from '../../data/pillarsData';
import { knowledgePillars } from '../../data/knowledgeMapData';
import KnowledgeMapHeader from './KnowledgeMapHeader';
import CorePreparednessNode from './CorePreparednessNode';
import ConnectorLayer from './ConnectorLayer';
import KnowledgePillarCard from './KnowledgePillarCard';
import ProgressiveDiscoveryStepper from './ProgressiveDiscoveryStepper';
import FeatureStrip from './FeatureStrip';

interface KnowledgeMapSectionProps {
  currentLang: string;
  theme: 'dark' | 'light';
  setActiveTab: (tab: 'manual' | 'scenarios' | 'flowcharts' | 'checklists' | 'library') => void;
  setSelectedPillarId: (id: PillarId | null) => void;
  setActiveArticleId: (id: string | null) => void;
  setSelectedAssetId: (id: string | null) => void;
  setSelectedAssetInitialTab: (tab: 'article' | 'guide' | 'checklist' | 'protocol' | 'module' | 'stats') => void;
  completedTopics: string[];
}

const ASCII_TO_APP_PILLAR_ID: Record<string, PillarId> = {
  'first-aid-trauma': 'førstehjelp',
  'wilderness-survival': 'friluftsliv',
  'personal-safety': 'egensikkerhet',
  'household-preparedness': 'egenberedskap',
  'digital-privacy': 'personvern',
  'travel-security': 'reisesikkerhet',
};

const PILLAR_TOPICS_MAP: Record<string, string[]> = {
  'first-aid-trauma': ['heat-stroke-protocol', 'severe-bleeding', 'cpr-aed-emergency-dispatch', 'ptsd-recognition-first-responder', 'edc-trauma-kit-assembly', 'foot-injury-prevention-athletes'],
  'wilderness-survival': ['stream-crossing', 'fire-starting', 'varsom-route-decision', 'snow-shelter-construction', 'driver-fatigue-prevention', 'offline-navigation-maps', 'rucking-load-bearing-fitness'],
  'personal-safety': ['situational-awareness', 'de-escalation-exit-planning', 'radicalization-extremism'],
  'household-preparedness': ['flood-home-prep', 'iot-router-security', 'one-week-blackout-communication', 'iodine-nuclear-preparedness', 'emergency-prep-72h', 'emergency-prep-7day'],
  'digital-privacy': ['burner-phone-sop', 'domestic-violence-privacy'],
  'travel-security': ['cuba-baby-milk-scam', 'hotel-room-security'],
};

export default function KnowledgeMapSection({
  currentLang,
  theme,
  setActiveTab,
  setSelectedPillarId,
  setActiveArticleId,
  setSelectedAssetId,
  setSelectedAssetInitialTab,
  completedTopics,
}: KnowledgeMapSectionProps) {
  const { t } = useTranslation();

  // 1. Interactive Knowledge Map State Model
  const [activePillarId, setActivePillarId] = useState<string | null>(null); // null means core/no selection
  const [hoveredPillarId, setHoveredPillarId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<'core' | 'category' | 'topics' | 'guides' | 'actions'>('core');
  const [unlockedSteps, setUnlockedSteps] = useState<string[]>(['core']);
  
  // Lock Bypass Override Toggle State
  const [lockOverride, setLockOverride] = useState<boolean>(false);

  // Dynamic Hub Skew State
  const [skew, setSkew] = useState({ x: 0, y: 0 });

  // Ref container track for dynamic ResizeObserver SVG line routing
  const containerRef = useRef<HTMLDivElement>(null);
  const hubRef = useRef<HTMLButtonElement>(null);
  const cardRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Compact Aspect Ratio: 800 width, 500 height (aspect ratio = 1.6)
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width } = entry.contentRect;
        // Keep compact 1.6 aspect ratio
        setDimensions({ width, height: width / 1.6 });
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Center coordinate mapping
  const hubCenterX = dimensions.width / 2;
  const hubCenterY = dimensions.height / 2;
  const scale = dimensions.width / 850; // Scaling factor relative to 850px compact base

  // Skew calculation effect
  useEffect(() => {
    const activeOrHoveredId = hoveredPillarId || activePillarId;
    if (activeOrHoveredId) {
      const pillar = knowledgePillars.find((p) => p.id === activeOrHoveredId);
      if (pillar) {
        const angle = Math.atan2(pillar.yOffset, pillar.xOffset);
        const skewDistance = 14; // Skew translation limit in pixels
        setSkew({
          x: skewDistance * Math.cos(angle),
          y: skewDistance * Math.sin(angle),
        });
        return;
      }
    }
    setSkew({ x: 0, y: 0 });
  }, [hoveredPillarId, activePillarId]);

  // Sound feedback helper (audio feedback disabled)
  const playBeep = (freq: number, type: OscillatorType = 'sine', vol = 0.04, duration = 0.1) => {
    // Audio feedback disabled
  };

  // Interactions
  const handleSelectHub = () => {
    setActivePillarId(null);
    setCurrentStep('core');
    playBeep(440, 'sine', 0.03, 0.1);
  };

  const handleSelectPillar = (pillarId: string) => {
    const pillar = knowledgePillars.find((p) => p.id === pillarId);
    if (!pillar) return;

    // Allow interaction if pillar is unlocked OR override is active
    if (pillar.isUnlocked || lockOverride) {
      setActivePillarId(pillarId);
      setCurrentStep('category');
      setUnlockedSteps((prev) => {
        const next = [...prev];
        if (!next.includes('category')) next.push('category');
        return next;
      });
      playBeep(520, 'sine', 0.03, 0.1);
    }
  };

  const handleLaunchTopic = (appPillarId: PillarId, actionId: string) => {
    playBeep(600, 'triangle', 0.05, 0.15);
    setSelectedPillarId(appPillarId);
    setActiveArticleId(actionId);

    // Context tabs routing based on SOP code
    if (actionId === 'severe-bleeding' || actionId === 'burner-phone-sop' || actionId === 'cuba-baby-milk-scam') {
      setActiveTab('manual');
    } else if (actionId === 'stream-crossing' || actionId === 'varsom-route-decision') {
      setActiveTab('flowcharts');
    } else if (actionId === 'emergency-prep-72h') {
      setActiveTab('checklists');
    } else {
      setActiveTab('manual');
    }
    window.scrollTo({ top: 380, behavior: 'smooth' });
  };

  // Resolve topics for the active pillar drawer
  const getActivePillarData = () => {
    if (!activePillarId) return null;
    const mappedAppPillarId = ASCII_TO_APP_PILLAR_ID[activePillarId];
    return (currentLang === 'no' ? pillarsDataNo : pillarsDataEn).find(
      (p) => p.id === mappedAppPillarId
    );
  };

  const activePillarData = getActivePillarData();

  return (
    <div className="knowledge-map-container w-full flex flex-col gap-6 py-4 relative overflow-hidden bg-[var(--bg-main)] rounded-[var(--radius-lg)] p-5 border border-[var(--border-muted)]">
      {/* Background patterns */}
      <div className="knowledge-map-grain" aria-hidden="true" />
      <div className="knowledge-map-grid-bg absolute inset-0 opacity-30 pointer-events-none" aria-hidden="true" />
      <div 
        className="knowledge-map-radial-glow" 
        aria-hidden="true"
        style={{
          transform: `translate(calc(-50% + ${skew.x * 2.5}px), calc(-50% + ${skew.y * 2.5}px))`,
          transition: 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
      />

      {/* A. Localized map header */}
      <KnowledgeMapHeader currentLang={currentLang} />

      {/* B. DASHBOARD SPLIT GRID (Side-by-side on desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch relative z-10 w-full">
        
        {/* Left Column: Radial Map Canvas (75% width on desktop) */}
        <div className="lg:col-span-9 flex justify-center items-center relative min-h-[360px] lg:min-h-[480px] bg-black/10 border border-[var(--border-muted)] rounded-[var(--radius-lg)] p-3">
          <div
            ref={containerRef}
            className="relative w-full max-w-[850px] aspect-[850/500] hidden lg:block select-none"
            style={{ margin: '0 auto' }}
          >
            {/* SVG path connections layer */}
            <ConnectorLayer
              pillars={knowledgePillars}
              activePillarId={activePillarId}
              hoveredPillarId={hoveredPillarId}
              completedTopics={completedTopics}
              pillarTopicsMap={PILLAR_TOPICS_MAP}
              hubCenterX={hubCenterX}
              hubCenterY={hubCenterY}
              containerRef={containerRef}
              hubRef={hubRef}
              cardRefs={cardRefs}
            />

            {/* Central Hub Interactive Node */}
            <CorePreparednessNode
              currentLang={currentLang}
              theme={theme}
              currentStep={currentStep}
              onClick={handleSelectHub}
              x={hubCenterX}
              y={hubCenterY}
              hubSize={160} // Compact hub
              skewX={skew.x}
              skewY={skew.y}
            />

            {/* Symmetrical Orbiting Cards */}
            {knowledgePillars.map((pillar) => {
              const cardX = hubCenterX + pillar.xOffset * scale;
              const cardY = hubCenterY + pillar.yOffset * scale;

              const cardWidth = 240; // Shipped from 220
              const cardHeight = 135; // Shipped from 110
              const left = cardX - cardWidth / 2;
              const top = cardY - cardHeight / 2;

              const isActive = activePillarId === pillar.id && currentStep !== 'core';
              const isUnlocked = pillar.isUnlocked || lockOverride;
              
              // Map topic status to visited
              const topicIds = PILLAR_TOPICS_MAP[pillar.id] || [];
              const isVisited = topicIds.length > 0 && topicIds.some((id) => completedTopics.includes(id));

              return (
                <div
                  key={pillar.id}
                  style={{
                    position: 'absolute',
                    left: `${left}px`,
                    top: `${top}px`,
                    width: `${cardWidth}px`,
                    height: `${cardHeight}px`,
                  }}
                  className="z-20 transition-all duration-300"
                >
                  <KnowledgePillarCard
                    pillar={pillar}
                    isActive={isActive}
                    isUnlocked={isUnlocked}
                    isVisited={isVisited}
                    currentLang={currentLang}
                    onClick={() => handleSelectPillar(pillar.id)}
                    onHoverStart={() => setHoveredPillarId(pillar.id)}
                    onHoverEnd={() => setHoveredPillarId(null)}
                    cardRef={(el) => {
                      cardRefs.current[pillar.id] = el;
                    }}
                  />
                </div>
              );
            })}
          </div>

          {/* MOBILE FLOW (Vertical layout sequence) */}
          <div className="lg:hidden flex flex-col gap-4 w-full max-w-sm mx-auto py-2">
            {/* 1. Core hub button */}
            <button
              type="button"
              onClick={handleSelectHub}
              className={`w-full rounded-[var(--radius-md)] border p-4 flex items-center gap-3 transition-all duration-200 ${
                currentStep === 'core'
                  ? 'border-[var(--accent)] bg-[var(--accent-soft)] shadow-[0_0_10px_var(--accent-glow)]'
                  : 'border-[var(--border-muted)] bg-[var(--bg-panel)] hover:border-[var(--accent)]/55'
              }`}
              aria-label={currentLang === 'no' ? 'Kjerneberedskap' : 'Core Preparedness'}
            >
              <div className="w-8 h-8 rounded-full border border-dashed border-white/20 flex items-center justify-center flex-shrink-0 bg-black/40">
                <span className={`w-2 h-2 rounded-full ${currentStep === 'core' ? 'bg-[var(--accent)]' : 'bg-white/40'}`} />
              </div>
              <div className="text-left">
                <h3 className="text-[12px] font-bold tracking-widest uppercase text-[var(--text-main)] font-mono leading-none">
                  {currentLang === 'no' ? 'Kjerneberedskap' : 'Core Preparedness'}
                </h3>
                <p className="text-[12px] text-[var(--text-muted)] leading-tight mt-1 font-sans">
                  {currentLang === 'no' 
                    ? 'Beredskap starter med kunnskap og handling.' 
                    : 'Preparedness starts with knowledge and action.'}
                </p>
              </div>
            </button>

            {/* Vertical Flow Divider */}
            <div className="h-3 w-0.5 border-l border-dashed border-[var(--border-muted)] mx-auto" aria-hidden="true" />

            {/* 2. Unlocked/Active Cards */}
            <div className="flex flex-col gap-3">
              {knowledgePillars
                .filter((p) => p.isUnlocked || lockOverride)
                .map((pillar) => {
                  const isActive = activePillarId === pillar.id && currentStep !== 'core';
                  const topicIds = PILLAR_TOPICS_MAP[pillar.id] || [];
                  const isVisited = topicIds.length > 0 && topicIds.some((id) => completedTopics.includes(id));

                  return (
                    <div key={pillar.id} className="w-full min-h-[135px]">
                      <KnowledgePillarCard
                        pillar={pillar}
                        isActive={isActive}
                        isUnlocked={true}
                        isVisited={isVisited}
                        currentLang={currentLang}
                        onClick={() => handleSelectPillar(pillar.id)}
                        onHoverStart={() => {}}
                        onHoverEnd={() => {}}
                        cardRef={() => {}}
                      />
                    </div>
                  );
                })}
            </div>

            {/* Vertical Flow Divider */}
            <div className="h-3 w-0.5 border-l border-dashed border-[var(--border-muted)] mx-auto" aria-hidden="true" />

            {/* 3. Locked Cards */}
            <div className="flex flex-col gap-3">
              {knowledgePillars
                .filter((p) => !p.isUnlocked && !lockOverride)
                .map((pillar) => {
                  const isActive = activePillarId === pillar.id && currentStep !== 'core';
                  const topicIds = PILLAR_TOPICS_MAP[pillar.id] || [];
                  const isVisited = topicIds.length > 0 && topicIds.some((id) => completedTopics.includes(id));

                  return (
                    <div key={pillar.id} className="w-full min-h-[135px]">
                      <KnowledgePillarCard
                        pillar={pillar}
                        isActive={isActive}
                        isUnlocked={false}
                        isVisited={isVisited}
                        currentLang={currentLang}
                        onClick={() => handleSelectPillar(pillar.id)}
                        onHoverStart={() => {}}
                        onHoverEnd={() => {}}
                        cardRef={() => {}}
                      />
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Control Sidebar (25% width on desktop) */}
        <div className="lg:col-span-3 flex flex-col gap-4 justify-between h-full">
          
          {/* Lock Override Actions panel */}
          <div className="bg-[var(--bg-panel)] border border-[var(--border-muted)] rounded-[var(--radius-md)] p-4 flex items-center justify-between shadow-sm select-none">
            <span className="text-[12px] font-mono font-bold text-[var(--text-main)] flex items-center gap-1.5">
              <span>{lockOverride ? 'ðŸ”“' : 'ðŸ”’'}</span>
              <span>{currentLang === 'no' ? 'Systemlås' : 'System Lock State'}</span>
            </span>
            
            <button
              type="button"
              onClick={() => {
                setLockOverride(prev => !prev);
                playBeep(lockOverride ? 350 : 650, 'sine', 0.04, 0.15);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[12px] font-mono font-bold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${
                lockOverride
                  ? 'bg-[var(--accent-soft)] border-[var(--border-active)] text-[var(--accent)] font-extrabold shadow-sm'
                  : 'bg-black/30 border-[var(--border-muted)] text-[var(--text-dim)] hover:border-white/20'
              }`}
              aria-label={lockOverride ? 'Bypass locks active. Click to lock.' : 'Locks active. Click to bypass locks.'}
              aria-pressed={lockOverride}
            >
              <span>{lockOverride ? 'Bypass: ACTIVE' : 'Bypass: OFF'}</span>
            </button>
          </div>

          {/* Stepper (Vertical rendering for compact sidebar) */}
          <ProgressiveDiscoveryStepper
            currentLang={currentLang}
            currentStep={currentStep}
            unlockedSteps={unlockedSteps}
            isVertical={true}
          />

          {/* Compact topic preview (progressive reveal on selected pillar) */}
          {currentStep !== 'core' && activePillarId && activePillarData ? (
            <div 
              className="bg-[var(--bg-panel)] border border-[var(--border-muted)] rounded-[var(--radius-md)] p-3 space-y-3 animate-fade-in flex-grow overflow-hidden flex flex-col justify-between"
              role="region"
              aria-labelledby="sidebar-preview-title"
            >
              <div className="border-b border-[var(--border-muted)] pb-2 flex justify-between items-start gap-2 flex-shrink-0">
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] font-mono text-[var(--accent)] uppercase font-bold block">
                    {currentLang === 'no' ? 'AKTUELT TEMA' : 'SELECTED CORE'}
                  </span>
                  <h3 id="sidebar-preview-title" className="text-[14px] font-bold text-[var(--text-main)] font-display leading-tight truncate">
                    {activePillarData.title}
                  </h3>
                </div>
                
                {/* Completed topics count */}
                {(() => {
                  const topics = activePillarData.topics;
                  const completedCount = topics.filter((t) => completedTopics.includes(t.id)).length;
                  return (
                    <span className="text-[11px] font-mono text-[var(--status-success-text)] bg-[var(--status-success-bg)] px-2 py-0.5 rounded border border-[var(--status-success-border)] flex-shrink-0">
                      {completedCount}/{topics.length} Done
                    </span>
                  );
                })()}
              </div>

              {/* Actionable SOP list */}
              <div className="space-y-2 max-h-[135px] overflow-y-auto pr-1 flex-grow">
                {activePillarData.topics.slice(0, 3).map((topic, idx) => {
                  const isCompleted = completedTopics.includes(topic.id);
                  return (
                    <button
                      key={topic.id}
                      type="button"
                      onClick={() => handleLaunchTopic(ASCII_TO_APP_PILLAR_ID[activePillarId], topic.id)}
                      onMouseEnter={() => {
                        setCurrentStep('topics');
                        setUnlockedSteps((prev) => {
                          const next = [...prev];
                          if (!next.includes('topics')) next.push('topics');
                          return next;
                        });
                      }}
                      className={`w-full text-left bg-black/20 hover:bg-black/40 border ${
                        isCompleted ? 'border-emerald-500/20' : 'border-white/5'
                      } hover:border-[var(--accent)]/40 p-2 rounded-lg flex items-center justify-between gap-3 group transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]`}
                    >
                      <div className="min-w-0 flex-1">
                        <span className="text-[11px] font-mono text-[var(--text-dim)] uppercase block leading-none mb-0.5">SOP 0{idx + 1}</span>
                        <h4 className="font-bold text-[12px] text-[var(--text-main)] truncate">
                          {topic.title}
                        </h4>
                      </div>
                      <div className="flex-shrink-0 flex items-center gap-1 text-[var(--accent)] font-mono text-[11px] opacity-70 group-hover:opacity-100">
                        <span>GO</span>
                        <Play className="w-2.5 h-2.5 fill-current" />
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* View all button */}
              <div className="flex justify-end pt-1">
                <button
                  onClick={() => {
                    setSelectedPillarId(ASCII_TO_APP_PILLAR_ID[activePillarId]);
                    setActiveArticleId(null);
                    setActiveTab('manual');
                    window.scrollTo({ top: 350, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-1 text-[12px] font-bold text-[var(--text-main)] hover:text-[var(--accent)] transition-all font-mono"
                >
                  <span>{currentLang === 'no' ? 'Se alle SOP-er' : 'View all SOPs'}</span>
                  <span>&rarr;</span>
                </button>
              </div>

            </div>
          ) : (
            <div className="bg-black/10 border border-dashed border-[var(--border-muted)] rounded-[var(--radius-md)] p-6 text-center flex flex-col justify-center items-center flex-grow py-8 text-[var(--text-dim)] font-mono select-none">
              <span className="text-[20px] mb-2 opacity-50">ðŸ§­</span>
              <p className="text-[12px] max-w-[25ch] leading-relaxed">
                {currentLang === 'no'
                  ? 'Velg en av søylene på kartet for å låse opp temaer.'
                  : 'Select an active domain pillar on the map to reveal SOP paths.'}
              </p>
            </div>
          )}

        </div>

      </div>

      {/* C. Localized full-width feature footer strip */}
      <div className="w-full mt-2">
        <FeatureStrip currentLang={currentLang} />
      </div>

    </div>
  );
}
