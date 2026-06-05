import React from 'react';
import { discoverySteps } from '../../data/knowledgeMapData';

interface ProgressiveDiscoveryStepperProps {
  currentLang: string;
  currentStep: 'core' | 'category' | 'topics' | 'guides' | 'actions';
  unlockedSteps: string[];
  isVertical?: boolean; // Determines layout mode (sidebar vs bottom strip)
}

const STEP_INDEX_MAP: Record<string, number> = {
  core: 1,
  category: 2,
  topics: 3,
  guides: 4,
  actions: 5,
};

export default function ProgressiveDiscoveryStepper({
  currentLang,
  currentStep,
  unlockedSteps,
  isVertical = false,
}: ProgressiveDiscoveryStepperProps) {
  const activeStepNum = STEP_INDEX_MAP[currentStep] || 1;

  if (isVertical) {
    // Compact Vertical Stepper for Desktop Sidebar
    return (
      <nav 
        className="bg-black/15 border border-[var(--border-muted)] rounded-[var(--radius-md)] p-4 select-none w-full"
        aria-label="Progressive discovery steps"
      >
        <div className="mb-3 pb-2 border-b border-white/5">
          <h4 className="text-[12px] font-bold tracking-widest text-[var(--accent)] uppercase font-mono">
            PROGRESSIVE DISCOVERY
          </h4>
          <p className="text-[12px] text-[var(--text-muted)] mt-0.5 font-mono">
            {currentLang === 'no' ? 'Din vei til kunnskap' : 'Your path through knowledge'}
          </p>
        </div>

        <div className="relative flex flex-col gap-3 pl-2">
          {/* Vertical connection dashed line */}
          <div 
            className="absolute left-5 top-4 bottom-4 w-0.5 border-l-2 border-dashed border-[var(--border-muted)] z-0" 
            aria-hidden="true" 
          />

          {discoverySteps.map((stepItem) => {
            const isCompleted = STEP_INDEX_MAP[stepItem.id] < activeStepNum;
            const isActive = STEP_INDEX_MAP[stepItem.id] === activeStepNum;

            return (
              <div 
                key={stepItem.step}
                className="flex items-center gap-3 relative z-10"
              >
                {/* Node Circle */}
                <span 
                  className={`w-6 h-6 rounded-full text-[12px] font-mono font-bold flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                    isActive 
                      ? 'bg-[var(--accent-solid)] text-[var(--accent-on-solid)] font-extrabold shadow-[0_0_8px_var(--accent-glow)]'
                      : isCompleted
                      ? 'bg-[var(--status-success-text)] text-[var(--accent-on-solid)] font-extrabold'
                      : 'bg-neutral-800 text-[var(--text-dim)] border border-white/5'
                  }`}
                >
                  {stepItem.step}
                </span>
                
                {/* Text Block */}
                <div className="flex flex-col">
                  <span className={`text-[12px] font-mono font-bold ${isActive ? 'text-[var(--text-main)]' : isCompleted ? 'text-[var(--status-success-text)]' : 'text-[var(--text-dim)]'}`}>
                    {currentLang === 'no' ? stepItem.labelNo : stepItem.label}
                  </span>
                  <span className="text-[12px] text-[var(--text-dim)] leading-none mt-0.5 font-sans">
                    {currentLang === 'no' ? stepItem.subNo : stepItem.sub}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </nav>
    );
  }

  // Horizontal/Stacked Stepper for Mobile
  return (
    <section 
      className="bg-[var(--bg-panel)] border border-[var(--border-muted)] rounded-[var(--radius-md)] p-4 shadow-lg select-none"
      aria-label="Progressive discovery steps"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 pb-2 border-b border-[var(--border-muted)] gap-2">
        <div>
          <h4 className="text-xs font-bold tracking-widest text-[var(--accent)] uppercase font-mono">
            PROGRESSIVE DISCOVERY
          </h4>
          <p className="text-[12px] text-[var(--text-muted)] mt-0.5 font-mono">
            {currentLang === 'no' ? 'Din vei til kunnskap' : 'Your path through knowledge'}
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center md:justify-between gap-3 md:gap-2">
        {discoverySteps.map((stepItem, idx) => {
          const isCompleted = STEP_INDEX_MAP[stepItem.id] < activeStepNum;
          const isActive = STEP_INDEX_MAP[stepItem.id] === activeStepNum;

          return (
            <React.Fragment key={stepItem.step}>
              {/* Stepper Node */}
              <div 
                className={`flex items-center gap-3 p-2.5 rounded-md border transition-all duration-300 w-full md:w-auto md:flex-1 max-w-[240px] ${
                  isActive
                    ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--text-main)] shadow-[0_0_10px_var(--accent-glow)]'
                    : isCompleted
                    ? 'border-[var(--status-success-border)] bg-[var(--status-success-bg)] text-[var(--status-success-text)]'
                    : 'border-[var(--border-muted)] text-[var(--text-dim)] opacity-60'
                }`}
              >
                <span 
                  className={`w-6 h-6 rounded-full text-[12px] font-mono font-bold flex items-center justify-center flex-shrink-0 ${
                    isActive 
                      ? 'bg-[var(--accent-solid)] text-[var(--accent-on-solid)] font-extrabold'
                      : isCompleted
                      ? 'bg-[var(--status-success-text)] text-[var(--accent-on-solid)] font-extrabold'
                      : 'bg-neutral-800 text-[var(--text-dim)]'
                  }`}
                >
                  {stepItem.step}
                </span>
                
                <div className="flex flex-col">
                  <strong className="text-[12px] font-mono font-bold text-[var(--text-main)]">
                    {currentLang === 'no' ? stepItem.labelNo : stepItem.label}
                  </strong>
                  <span className="text-[12px] text-[var(--text-muted)] font-sans">
                    {currentLang === 'no' ? stepItem.subNo : stepItem.sub}
                  </span>
                </div>
              </div>

              {/* Connecting line (rendered only between nodes on desktop) */}
              {idx < discoverySteps.length - 1 && (
                <div 
                  className={`hidden md:block h-0.5 flex-grow border-t-2 border-dashed mx-2 ${
                    isCompleted ? 'border-emerald-500/40' : 'border-[var(--border-muted)]'
                  }`}
                  aria-hidden="true"
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </section>
  );
}
