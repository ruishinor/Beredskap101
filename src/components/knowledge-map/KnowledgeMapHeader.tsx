import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface KnowledgeMapHeaderProps {
  currentLang: string;
}

export default function KnowledgeMapHeader({ currentLang }: KnowledgeMapHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[var(--border-muted)] pb-4 gap-3 select-none">
      <h2 className="text-xl md:text-2xl font-bold text-[var(--text-main)] tracking-wide uppercase font-display">
        {currentLang === 'no' ? 'Interaktiv kunnskapsoversikt' : 'Interactive knowledge map'}
      </h2>
      
      {/* Localized progressive path instructions banner */}
      <div 
        className="text-[12px] font-mono tracking-wider text-[var(--accent)] flex items-center gap-2 border border-[var(--accent)]/20 bg-[var(--accent-soft)] px-3.5 py-1.5 rounded-full"
        role="status"
        aria-live="polite"
      >
        <AlertTriangle className="w-4 h-4 text-[var(--accent)] animate-pulse" aria-hidden="true" />
        <span className="font-bold">
          {currentLang === 'no' 
            ? 'Følg rekkefølgen. Hvert steg låser opp neste nivå.' 
            : 'Follow the flow. Each step unlocks the next layer.'}
        </span>
      </div>
    </div>
  );
}
