import React from 'react';
import { Shield } from 'lucide-react';

interface CorePreparednessNodeProps {
  currentLang: string;
  theme: 'dark' | 'light';
  currentStep: 'core' | 'category' | 'topics' | 'guides' | 'actions';
  onClick: () => void;
  x: number; // Center X
  y: number; // Center Y
  hubSize?: number;
  skewX?: number;
  skewY?: number;
}

export default function CorePreparednessNode({
  currentLang,
  theme,
  currentStep,
  onClick,
  x,
  y,
  hubSize = 200,
  skewX = 0,
  skewY = 0,
}: CorePreparednessNodeProps) {
  const isActive = currentStep === 'core';

  return (
    <>
      {/* Concentric Breathing Glow Rings behind Center Node (only if not reduced-motion) */}
      <div
        className="absolute pointer-events-none rounded-full bg-[var(--accent)]/5 border border-[var(--accent)]/15 breathing-ring z-0 motion-safe:block hidden"
        style={{
          left: `${x - (hubSize * 1.35) / 2}px`,
          top: `${y - (hubSize * 1.35) / 2}px`,
          width: `${hubSize * 1.35}px`,
          height: `${hubSize * 1.35}px`,
          animationDelay: '0s',
        }}
      />
      <div
        className="absolute pointer-events-none rounded-full bg-[var(--accent)]/3 border border-[var(--accent)]/10 breathing-ring z-0 motion-safe:block hidden"
        style={{
          left: `${x - (hubSize * 1.7) / 2}px`,
          top: `${y - (hubSize * 1.7) / 2}px`,
          width: `${hubSize * 1.7}px`,
          height: `${hubSize * 1.7}px`,
          animationDelay: '1.5s',
        }}
      />

      {/* Main Hub Interactive Button Node */}
      <button
        type="button"
        onClick={onClick}
        style={{
          position: 'absolute',
          left: `${x - hubSize / 2}px`,
          top: `${y - hubSize / 2}px`,
          width: `${hubSize}px`,
          height: `${hubSize}px`,
        }}
        className={`flex items-center justify-center z-25 rounded-full border p-4 transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-main)] ${
          isActive
            ? theme === 'light'
              ? 'core-glow-active-light border-[var(--accent)] bg-[var(--accent-soft)]'
              : 'core-glow-active border-[var(--accent)] bg-[var(--accent-soft)]'
            : 'border-[var(--border-muted)] bg-[var(--bg-panel)]/90 hover:border-[var(--accent)]/55'
        }`}
        aria-label={
          currentLang === 'no'
            ? 'Kjerne Beredskap. Klikk for å tilbakestille kartet.'
            : 'Core Preparedness. Click to reset the map.'
        }
        aria-pressed={isActive}
      >
        {/* Inner dashed ring decoration */}
        <div className="absolute inset-1.5 border border-dashed border-[var(--border-muted)] rounded-full pointer-events-none" />
        
        <div className="flex flex-col items-center gap-1.5 select-none">
          <Shield 
            className={`w-8 h-8 transition-colors ${
              isActive ? 'text-[var(--accent)] animate-pulse' : 'text-[var(--text-muted)]'
            }`} 
            aria-hidden="true"
          />
          <h3 className="text-[12px] font-bold tracking-widest uppercase text-[var(--text-main)] font-mono leading-none">
            {currentLang === 'no' ? 'Kjerneberedskap' : 'Core Preparedness'}
          </h3>
          <p className="text-[12px] text-[var(--text-muted)] max-w-[16ch] leading-snug mt-1 text-center font-sans font-medium">
            {currentLang === 'no' 
              ? 'Beredskap starter med kunnskap og handling.' 
              : 'Preparedness starts with knowledge and action.'}
          </p>
        </div>
      </button>
    </>
  );
}
