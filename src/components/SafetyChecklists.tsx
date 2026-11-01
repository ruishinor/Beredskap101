/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { checklistsDataEn, checklistsDataNo } from '../data/pillarsData';
import type { ThemeType } from '../types';
import { CheckSquare, Square, RefreshCw, Info } from 'lucide-react';

export default function SafetyChecklists({ theme }: { theme: ThemeType }) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'en';
  const checklistsData = currentLang === 'no' ? checklistsDataNo : checklistsDataEn;

  const [activeGroupId, setActiveGroupId] = useState<string>('emergency-72h');
  const [saveFailed, setSaveFailed] = useState(false);
  
  const [checkedIds, setCheckedIds] = useState<string[]>(() => {
    try {
      const saved = window.localStorage.getItem('beredskap_checklists_checked_ids');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Checklist progress could not be loaded from local storage', e);
    }
    return [];
  });

  // Persist checked IDs to localStorage
  useEffect(() => {
    try {
      window.localStorage.setItem('beredskap_checklists_checked_ids', JSON.stringify(checkedIds));
      setSaveFailed(false);
    } catch (e) {
      setSaveFailed(true);
      console.warn('Checklist progress could not be saved to local storage', e);
    }
  }, [checkedIds]);

  const activeGroup = checklistsData.find(g => g.id === activeGroupId) || checklistsData[0];
  const activeItems = activeGroup.items;

  const toggleCheck = (itemId: string) => {
    setCheckedIds(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const resetAllChecks = () => {
    const message = currentLang === 'no' 
      ? 'Er du sikker på at du vil nullstille alle avkrysninger i denne listen?' 
      : 'Are you sure you want to reset all checkboxes in this list?';
    
    if (window.confirm(message)) {
      const activeIds = activeItems.map(i => i.id);
      setCheckedIds(prev => prev.filter(id => !activeIds.includes(id)));
    }
  };

  // Progress calculations
  const totalCount = activeItems.length;
  const checkedCount = activeItems.filter(i => checkedIds.includes(i.id)).length;
  const progressPercent = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;

  // Custom styling mappings
  const styles = {
    cardBg: 'bg-[var(--card)] border border-[var(--border)]',
    titleText: 'text-[var(--text)] font-display',
    bodyText: 'text-[var(--text)] font-sans',
    btnActive: 'bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]',
    btnInactive: 'bg-[var(--card)] text-[var(--muted)] border-[var(--border)] hover:border-[var(--muted)]/50 hover:text-[var(--text)]',
    hoverText: 'hover:text-[var(--accent)] font-sans',
    progressBar: 'bg-[var(--accent)]'
  };

  return (
    <div className="space-y-6">
      {saveFailed && <p role="alert" className="text-sm text-red-500">
        {currentLang === 'no'
          ? 'Kunne ikke lagre sjekklistefremdriften. Endringene er midlertidige til lagring er tilgjengelig. Frigjør plass og prøv igjen.'
          : 'Could not save checklist progress. Changes are temporary until storage is available. Free storage space and try again.'}
      </p>}
      {/* Category selector */}
      <div className="flex flex-col sm:flex-row gap-2">
        {checklistsData.map((group) => (
          <button
            id={`btn-checklist-group-${group.id}`}
            key={group.id}
            onClick={() => setActiveGroupId(group.id)}
            className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border font-semibold text-sm transition-all focus:outline-none cursor-pointer ${
              group.id === activeGroupId ? styles.btnActive : styles.btnInactive
            }`}
          >
            <span>{group.title}</span>
          </button>
        ))}
      </div>

      {/* Main checklist box */}
      <div className={`p-6 rounded-xl border-2 shadow-sm ${styles.cardBg} transition-all duration-200`}>
        {/* Header with Title and Reset */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-dashed border-neutral-700/30 pb-4 mb-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-neutral-500">{t('lbl_equipment_checklists')}</span>
            <h3 className={`text-xl font-bold ${styles.titleText}`}>{activeGroup.title}</h3>
          </div>
          <button
            id="btn-checklist-reset"
            onClick={resetAllChecks}
            className={`text-xs flex items-center justify-center gap-1.5 p-2 rounded border font-semibold transition-colors self-start md:self-auto cursor-pointer ${styles.btnInactive}`}
          >
            <RefreshCw className="w-3.5 h-3.5" /> {t('btn_reset_checklists')}
          </button>
        </div>

        {/* Custom Progress Tracker */}
        <div className="mb-6 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono uppercase">
            <span className="opacity-70">{t('lbl_resilience_status')}</span>
            <span className="font-bold">{checkedCount} {t('lbl_of')} {totalCount} {t('lbl_completed')} ({progressPercent}%)</span>
          </div>
          <div className={`w-full h-2 rounded-full overflow-hidden ${theme !== 'light' ? 'bg-neutral-950' : 'bg-slate-100'}`}>
            <div
              className={`h-full transition-all duration-300 ${styles.progressBar}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Checklist List Items */}
        <div className="space-y-2">
          {activeItems.map((itm) => {
            const isChecked = checkedIds.includes(itm.id);
            return (
              <button
                type="button"
                role="checkbox"
                aria-checked={isChecked}
                id={`checklist-row-${itm.id}`}
                key={itm.id}
                onClick={() => toggleCheck(itm.id)}
                className={`w-full text-left flex items-start gap-4 p-3.5 rounded-lg border cursor-pointer select-none transition-all duration-150 group ${
                  isChecked
                    ? theme !== 'light'
                      ? 'bg-[var(--accent-solid)]/10 border-[var(--accent)]/30'
                      : 'bg-teal-50/40 border-teal-500/30 text-slate-500 line-through opacity-85'
                    : theme !== 'light'
                    ? 'bg-neutral-950/20 hover:bg-neutral-950/40 border-neutral-800 hover:border-neutral-700'
                    : 'bg-slate-50/20 hover:bg-slate-50/80 border-slate-200'
                }`}
              >
                <span aria-hidden="true" className="flex-shrink-0 mt-0.5 text-[var(--accent)] text-[var(--accent)] group-hover:scale-105 transition-transform">
                  {isChecked ? (
                    <CheckSquare className={`w-5 h-5 ${theme !== 'light' ? 'text-[var(--accent)]' : 'text-teal-600'}`} />
                  ) : (
                    <Square className="w-5 h-5 text-neutral-500" />
                  )}
                </span>
                <span className={`text-sm md:text-base leading-snug font-medium transition-colors ${
                  isChecked ? 'opacity-80' : 'text-neutral-200 group-hover:text-white dark:text-neutral-200'
                } ${theme !== 'dark' && !isChecked ? '!text-neutral-800' : ''}`}>
                  {itm.text}
                </span>
              </button>
            );
          })}
        </div>

        {/* Educational Checklist Tip */}
        <div className="mt-6 p-4 rounded-lg flex items-start gap-3.5 border text-xs leading-relaxed bg-[var(--accent)]/5 border-[var(--accent)]/20 text-[var(--text)]">
          <Info className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5 animate-bounce" />
          <div>
            <span className="font-bold block mb-0.5">{t('lbl_monthly_maintenance_title')}</span>
            {t('lbl_monthly_maintenance_desc')}
          </div>
        </div>
      </div>
    </div>
  );
}
