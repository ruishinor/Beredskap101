import React from 'react';
import { Shield, Users, WifiOff, Zap } from 'lucide-react';
import { FeatureItemData } from '../../data/knowledgeMapData';

interface FeatureItemProps {
  key?: React.Key;
  item: FeatureItemData;
  currentLang: string;
}

const featureIcons = { WifiOff, Zap, Shield, Users };

export default function FeatureItem({ item, currentLang }: FeatureItemProps) {
  const IconComponent = featureIcons[item.iconName] || Shield;

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
