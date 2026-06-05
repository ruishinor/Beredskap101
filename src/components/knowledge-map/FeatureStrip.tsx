import React from 'react';
import { featureItems } from '../../data/knowledgeMapData';
import FeatureItem from './FeatureItem';

interface FeatureStripProps {
  currentLang: string;
}

export default function FeatureStrip({ currentLang }: FeatureStripProps) {
  return (
    <section 
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 p-6 border border-[var(--border-muted)] bg-[var(--bg-panel)] rounded-[var(--radius-md)]"
      aria-label="System key features"
    >
      {featureItems.map((item) => (
        <FeatureItem 
          key={item.id} 
          item={item} 
          currentLang={currentLang} 
        />
      ))}
    </section>
  );
}
