import React from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2 } from 'lucide-react';
import { KnowledgePillar } from '../../data/knowledgeMapData';

interface KnowledgePillarCardProps {
  pillar: KnowledgePillar;
  isActive: boolean;
  isVisited: boolean;
  progressDone: number;
  progressTotal: number;
  currentLang: string;
  onClick: () => void;
  onHoverStart: () => void;
  onHoverEnd: () => void;
  cardRef: (el: HTMLButtonElement | null) => void;
}

function ProgressRing({ percent, complete }: { percent: number; complete: boolean }) {
  const radius = 7;
  const circumference = 2 * Math.PI * radius;
  const filled = (Math.min(100, Math.max(0, percent)) / 100) * circumference;

  if (complete) {
    return <CheckCircle2 className="w-3.5 h-3.5 text-[var(--status-success-text)]" aria-hidden="true" />;
  }

  return (
    <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden="true" className="flex-shrink-0">
      <circle cx="9" cy="9" r={radius} fill="none" stroke="var(--border-muted)" strokeWidth="2" />
      <circle
        cx="9"
        cy="9"
        r={radius}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray={`${filled} ${circumference}`}
        transform="rotate(-90 9 9)"
      />
    </svg>
  );
}

export default function KnowledgePillarCard({
  pillar,
  isActive,
  isVisited,
  progressDone,
  progressTotal,
  currentLang,
  onClick,
  onHoverStart,
  onHoverEnd,
  cardRef,
}: KnowledgePillarCardProps) {
  const { t } = useTranslation();

  const titleText = currentLang === 'no' ? pillar.titleNo : pillar.title;
  const descText = currentLang === 'no' ? pillar.descNo : pillar.desc;
  const badgeText = currentLang === 'no' ? pillar.badgeNo : pillar.badge;

  // Guard empty arrays: a pillar with no mapped topics renders 0/0, never NaN.
  const safeTotal = Number.isFinite(progressTotal) && progressTotal > 0 ? progressTotal : 0;
  const safeDone = Number.isFinite(progressDone) && progressDone > 0 ? Math.min(progressDone, safeTotal || progressDone) : 0;
  const isComplete = safeTotal > 0 && safeDone === safeTotal;
  const percent = safeTotal > 0 ? Math.round((safeDone / safeTotal) * 100) : 0;
  const progressLabel = t('pillar_progress', { done: safeDone, total: safeTotal });

  // Build the ARIA label
  let ariaLabel = `${pillar.index}: ${titleText}. ${progressLabel}.`;
  if (isActive) {
    ariaLabel += currentLang === 'no' ? ' Aktiv søyle.' : ' Active pillar.';
  } else if (isVisited) {
    ariaLabel += currentLang === 'no' ? ' Besøkt.' : ' Visited.';
  }

  return (
    <div className="relative w-full h-full select-none">
      {/* Visual Card Button */}
      <button
        ref={cardRef}
        type="button"
        onClick={onClick}
        onMouseEnter={onHoverStart}
        onMouseLeave={onHoverEnd}
        onFocus={onHoverStart}
        onBlur={onHoverEnd}
        className={`w-full text-left rounded-[var(--radius-sm)] p-3 flex flex-col justify-between min-h-[135px] h-full transition-all duration-300 relative overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
          isActive
            ? 'border-2 border-[var(--border-active)] bg-[var(--bg-panel)] shadow-[0_0_15px_var(--accent-glow)]'
            : isVisited
            ? 'border border-emerald-500/30 bg-[var(--bg-panel)]/90 hover:border-emerald-500/60'
            : 'border border-[var(--border-muted)] bg-[var(--bg-panel)]/80 hover:border-[var(--accent)]/55'
        }`}
        aria-label={ariaLabel}
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

        {/* Footer info: topics count + honest completion progress */}
        <div className="flex justify-between items-center mt-1 pt-1.5 border-t border-[var(--border-muted)] text-[11px] font-normal text-[var(--text-dim)] w-full">
          <span className="font-mono">{pillar.topicsCount}</span>
          <span className="flex items-center gap-1.5">
            <span
              className={`font-mono text-[10px] ${
                isComplete ? 'text-[var(--status-success-text)]' : 'text-[var(--text-muted)]'
              }`}
            >
              {progressLabel}
            </span>
            <ProgressRing percent={percent} complete={isComplete} />
          </span>
        </div>
      </button>
    </div>
  );
}
