import React, { useState, useRef, useEffect } from 'react';
import { Lock, Unlock, CheckCircle2 } from 'lucide-react';
import { KnowledgePillar } from '../../data/knowledgeMapData';

interface KnowledgePillarCardProps {
  pillar: KnowledgePillar;
  isActive: boolean;
  isUnlocked: boolean;
  isVisited: boolean;
  currentLang: string;
  onClick: () => void;
  onHoverStart: () => void;
  onHoverEnd: () => void;
  cardRef: (el: HTMLButtonElement | null) => void;
}

export default function KnowledgePillarCard({
  pillar,
  isActive,
  isUnlocked,
  isVisited,
  currentLang,
  onClick,
  onHoverStart,
  onHoverEnd,
  cardRef,
}: KnowledgePillarCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const titleText = currentLang === 'no' ? pillar.titleNo : pillar.title;
  const descText = currentLang === 'no' ? pillar.descNo : pillar.desc;
  const badgeText = currentLang === 'no' ? pillar.badgeNo : pillar.badge;

  const handleInteraction = (e: React.MouseEvent | React.FocusEvent) => {
    if (!isUnlocked) {
      if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
      setShowTooltip(true);
      
      // Auto-hide tooltip after 3 seconds for focus/click
      tooltipTimeoutRef.current = setTimeout(() => {
        setShowTooltip(false);
      }, 3000);
    }
  };

  const handleMouseLeave = () => {
    onHoverEnd();
    if (!isUnlocked) {
      setShowTooltip(false);
    }
  };

  const handleBlur = () => {
    if (!isUnlocked) {
      setShowTooltip(false);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!isUnlocked) {
      e.preventDefault();
      handleInteraction(e);
    } else {
      onClick();
    }
  };

  useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
    };
  }, []);

  // Build the ARIA label
  let ariaLabel = `${pillar.index}: ${titleText}.`;
  if (isActive) {
    ariaLabel += currentLang === 'no' ? ' Aktiv søyle.' : ' Active pillar.';
  }
  if (!isUnlocked) {
    ariaLabel += currentLang === 'no' ? ' Låst. Fullfør forrige steg for å låse opp.' : ' Locked. Complete previous step to unlock.';
  } else if (isVisited) {
    ariaLabel += currentLang === 'no' ? ' Fullført / Besøkt.' : ' Completed / Visited.';
  } else {
    ariaLabel += currentLang === 'no' ? ' Ulåst.' : ' Unlocked.';
  }

  return (
    <div className="relative w-full h-full select-none">
      {/* Visual Card Button */}
      <button
        ref={cardRef}
        type="button"
        onClick={handleClick}
        onMouseEnter={() => {
          onHoverStart();
          if (!isUnlocked) setShowTooltip(true);
        }}
        onMouseLeave={handleMouseLeave}
        onFocus={() => {
          onHoverStart();
          if (!isUnlocked) setShowTooltip(true);
        }}
        onBlur={handleBlur}
        className={`w-full text-left rounded-[var(--radius-sm)] p-3 flex flex-col justify-between min-h-[135px] h-full transition-all duration-300 relative overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
          isActive
            ? 'border-2 border-[var(--border-active)] bg-[var(--bg-panel)] shadow-[0_0_15px_var(--accent-glow)]'
            : isVisited
            ? 'border border-emerald-500/30 bg-[var(--bg-panel)]/90 hover:border-emerald-500/60'
            : isUnlocked
            ? 'border border-[var(--border-muted)] bg-[var(--bg-panel)]/80 hover:border-[var(--accent)]/55'
            : 'border border-[var(--border-muted)] bg-[var(--bg-panel)]/40 opacity-55 cursor-not-allowed'
        }`}
        aria-label={ariaLabel}
        aria-disabled={!isUnlocked}
      >
        {/* Header strip */}
        <div className="flex justify-between items-center w-full mb-1">
          <span 
            className={`font-mono text-[11px] font-bold ${
              isActive 
                ? 'text-[var(--accent)]' 
                : isVisited 
                ? 'text-[var(--status-success-text)]' 
                : 'text-[var(--text-dim)]'
            }`}
          >
            {pillar.index}
          </span>
          <span className="text-[10px] font-mono tracking-wider uppercase text-[var(--text-muted)] bg-[var(--bg-panel-soft)] border border-[var(--border-muted)] px-1.5 py-0.5 rounded-full">
            {badgeText}
          </span>
        </div>

        {/* Content body */}
        <div className="flex-grow flex flex-col justify-center my-0.5">
          <h3 className="font-semibold text-[13px] text-[var(--text-main)] tracking-[-0.01em] leading-snug">
            {titleText}
          </h3>
          <p className="font-normal text-[11px] text-[var(--text-muted)] leading-relaxed mt-0.5">
            {descText}
          </p>
        </div>

        {/* Footer info */}
        <div className="flex justify-between items-center mt-1 pt-1.5 border-t border-[var(--border-muted)] text-[11px] font-normal text-[var(--text-dim)] w-full">
          <span className="font-mono">{pillar.topicsCount}</span>
          <span className="flex items-center">
            {isActive ? (
              <Unlock className="w-3 h-3 text-[var(--accent)]" aria-hidden="true" />
            ) : isVisited ? (
              <CheckCircle2 className="w-3 h-3 text-[var(--status-success-text)]" aria-hidden="true" />
            ) : isUnlocked ? (
              <Unlock className="w-3 h-3 text-[var(--text-muted)]" aria-hidden="true" />
            ) : (
              <Lock className="w-3 h-3 text-[var(--text-dim)]" aria-hidden="true" />
            )}
          </span>
        </div>
      </button>

      {/* Accessible Locked Tooltip */}
      {showTooltip && (
        <div
          role="tooltip"
          className="absolute z-30 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-neutral-900 border border-red-500/30 text-white rounded-md p-3 text-[12px] font-mono shadow-xl text-center animate-fade-in"
          style={{ pointerEvents: 'none' }}
        >
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-width-[6px] border-solid border-t-neutral-900 border-x-transparent border-b-transparent" />
          <span className="text-red-400 font-bold block mb-1">🔒 {currentLang === 'no' ? 'STI LÅST' : 'PATH LOCKED'}</span>
          {currentLang === 'no'
            ? 'Fullfør det forrige nivået for å låse opp denne stien.'
            : 'Complete the previous layer to unlock this path.'}
        </div>
      )}
    </div>
  );
}
