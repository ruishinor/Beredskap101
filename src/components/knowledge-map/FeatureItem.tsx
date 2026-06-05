import React from 'react';
import * as Icons from 'lucide-react';
import { FeatureItemData } from '../../data/knowledgeMapData';

interface FeatureItemProps {
  key?: React.Key;
  item: FeatureItemData;
  currentLang: string;
}

export default function FeatureItem({ item, currentLang }: FeatureItemProps) {
  // Dynamically resolve the Lucide icon component by name
  const IconComponent = (Icons as any)[item.iconName];

  return (
    <div className="flex items-start gap-3 p-2 select-none">
      {IconComponent && (
        <IconComponent 
          className="w-5 h-5 text-[var(--accent)] flex-shrink-0 mt-0.5" 
          aria-hidden="true" 
        />
      )}
      <div className="space-y-0.5">
        <strong className="block text-[var(--text-main)] uppercase tracking-wide text-[12px] font-bold font-mono">
          {currentLang === 'no' ? item.titleNo : item.title}
        </strong>
        <span className="text-[var(--text-dim)] block text-[12px] font-mono leading-relaxed">
          {currentLang === 'no' ? item.descNo : item.desc}
        </span>
      </div>
    </div>
  );
}
