import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { generateCustomChecklist, GeneratedChecklist, GeneratedChecklistItem } from '../utils/checklistGenerator';
import { saveProgressState, loadProgressState } from '../utils/saveSystem';
import { CheckSquare, Square, RefreshCw, Printer, AlertCircle } from 'lucide-react';
import type { ThemeType } from '../types';

export default function DynamicGearListBuilder({ theme }: { theme: ThemeType }) {
  const { t, i18n } = useTranslation();
  const currentLang = (i18n.language || 'en') as 'en' | 'no';

  // Form State
  const [familySize, setFamilySize] = useState<number>(2);
  const [durationDays, setDurationDays] = useState<number>(3);
  const [environment, setEnvironment] = useState<'urban' | 'rural' | 'subzero'>('urban');
  const [specialNeeds, setSpecialNeeds] = useState<('pets' | 'infants' | 'medication')[]>([]);

  // Active generated checklist
  const [checklist, setChecklist] = useState<GeneratedChecklist | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    const saved = await loadProgressState();
    const generated = generateCustomChecklist({
      familySize,
      durationDays,
      environment,
      specialNeeds
    }, currentLang);
    
    setChecklist({ ...generated, items: generated.items.map(item => ({ ...item, checked: saved.checkedIds.includes(item.id) })) });
    setSaveError(false);
    setSaving(false);
  };

  const toggleItem = async (itemId: string) => {
    if (!checklist || saving) return;
    setSaving(true);

    const updatedItems = checklist.items.map(item => {
      if (item.id === itemId) {
        return { ...item, checked: !item.checked };
      }
      return item;
    });

    // Save to global state
    const saved = await loadProgressState();
    let nextChecked = [...saved.checkedIds];
    if (nextChecked.includes(itemId)) {
      nextChecked = nextChecked.filter(id => id !== itemId);
    } else {
      nextChecked.push(itemId);
    }
    const stored = await saveProgressState({
      ...saved,
      checkedIds: nextChecked,
      lastSynced: Date.now()
    });
    if (stored) setChecklist({ ...checklist, items: updatedItems });
    setSaveError(!stored);
    setSaving(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const toggleSpecialNeed = (need: 'pets' | 'infants' | 'medication') => {
    setSpecialNeeds(prev => 
      prev.includes(need) ? prev.filter(x => x !== need) : [...prev, need]
    );
  };

  const totalCount = checklist ? checklist.items.length : 0;
  const checkedCount = checklist ? checklist.items.filter(i => i.checked).length : 0;
  const progressPercent = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;

  // Custom styling mappings
  const styles = {
    cardBg: theme !== 'light' ? 'bg-neutral-900 border-neutral-800 text-neutral-200' : 'bg-white border-slate-200 text-slate-800',
    titleText: theme !== 'light' ? 'text-[var(--accent)] font-mono' : 'text-slate-900 font-display',
    bodyText: theme !== 'light' ? 'text-neutral-300 font-mono' : 'text-slate-600 font-sans',
    btnActive: theme !== 'light' ? 'bg-[var(--accent-solid)] text-[var(--accent-on-solid)] border-[var(--accent)] font-black' : 'bg-[var(--accent-solid)] text-[var(--accent-on-solid)] border-[var(--accent-solid)] font-semibold',
    btnSecondary: theme !== 'light' ? 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:border-neutral-700' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100',
    inputField: theme !== 'light' ? 'bg-black border-neutral-800 text-[var(--accent)] font-mono focus:border-[var(--accent)]' : 'bg-slate-50 border-slate-200 text-slate-800 font-sans focus:border-teal-500',
    progressBar: theme !== 'light' ? 'bg-[var(--accent-solid)]' : 'bg-teal-600'
  };

  return (
    <div className="space-y-6" id="dynamic-gear-list-builder">
      <div className={`p-6 rounded-xl border-2 shadow-sm ${styles.cardBg} transition-all duration-200`}>
        <h3 className={`text-xl font-bold mb-4 ${styles.titleText}`}>
          {currentLang === 'no' ? 'Dynamisk Sjekklistegenerator' : 'Dynamic Checklist Generator'}
        </h3>
        
        <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            {/* Family Size */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="familySize" className="text-xs font-mono uppercase tracking-widest text-neutral-500">
                {currentLang === 'no' ? 'Antall Personer i Husholdningen' : 'Number of Persons in Household'}
              </label>
              <input
                id="familySize"
                type="number"
                min="1"
                max="20"
                value={familySize}
                onChange={(e) => setFamilySize(Math.max(1, parseInt(e.target.value) || 1))}
                className={`p-3 rounded-lg border-2 text-base font-semibold focus:outline-none transition-colors ${styles.inputField}`}
              />
            </div>

            {/* Duration Days */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="durationDays" className="text-xs font-mono uppercase tracking-widest text-neutral-500">
                {currentLang === 'no' ? 'Beredskapsperiode (Dager)' : 'Preparedness Duration (Days)'}
              </label>
              <select
                id="durationDays"
                value={durationDays}
                onChange={(e) => setDurationDays(parseInt(e.target.value))}
                className={`p-3 rounded-lg border-2 text-base font-semibold focus:outline-none transition-colors ${styles.inputField}`}
              >
                <option value={3}>{currentLang === 'no' ? '3 Dager (72 timer standard)' : '3 Days (72h standard)'}</option>
                <option value={7}>{currentLang === 'no' ? '7 Dager (Utvidet beredskap)' : '7 Days (Extended preparedness)'}</option>
                <option value={14}>{currentLang === 'no' ? '14 Dager (Langvarig krise)' : '14 Days (Extended crisis)'}</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {/* Climate/Environment */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="environment" className="text-xs font-mono uppercase tracking-widest text-neutral-500">
                {currentLang === 'no' ? 'Klima / Omgivelser' : 'Climate / Environment'}
              </label>
              <select
                id="environment"
                value={environment}
                onChange={(e) => setEnvironment(e.target.value as any)}
                className={`p-3 rounded-lg border-2 text-base font-semibold focus:outline-none transition-colors ${styles.inputField}`}
              >
                <option value="urban">{currentLang === 'no' ? 'Urban (By / Leilighet)' : 'Urban (City / Apartment)'}</option>
                <option value="rural">{currentLang === 'no' ? 'Rural (Landlig / Avsides)' : 'Rural (Countryside / Remote)'}</option>
                <option value="subzero">{currentLang === 'no' ? 'Kulde / Vinter (Under 0°C)' : 'Subzero / Winter (Below 0°C)'}</option>
              </select>
            </div>

            {/* Special Needs */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-mono uppercase tracking-widest text-neutral-500">
                {currentLang === 'no' ? 'Særlige Behov' : 'Special Needs'}
              </span>
              <div className="grid grid-cols-3 gap-2 mt-1">
                {(['pets', 'infants', 'medication'] as const).map((need) => {
                  const active = specialNeeds.includes(need);
                  const label = need === 'pets' 
                    ? (currentLang === 'no' ? 'Kjæledyr' : 'Pets')
                    : need === 'infants'
                    ? (currentLang === 'no' ? 'Spedbarn' : 'Infants')
                    : (currentLang === 'no' ? 'Medisin' : 'Medicine');
                  
                  return (
                    <button
                      type="button"
                      key={need}
                      onClick={() => toggleSpecialNeed(need)}
                      className={`gear-need-btn p-2.5 text-xs font-bold rounded-lg border cursor-pointer select-none text-center transition-all ${
                        active 
                          ? 'active ' + styles.btnActive 
                          : styles.btnSecondary
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="col-span-1 md:col-span-2 mt-2">
            <button
              type="submit"
              disabled={saving}
              className={`w-full py-4 rounded-lg font-extrabold uppercase tracking-wide text-base active:scale-[0.99] transition-transform cursor-pointer min-h-[56px] ${
                theme !== 'light' ? 'bg-[var(--accent-solid)] text-[var(--accent-on-solid)] hover:brightness-105' : 'bg-[var(--accent-solid)] text-[var(--accent-on-solid)] hover:brightness-105'
              }`}
            >
              {currentLang === 'no' ? 'GENERER BEREDSKAPSLISTE' : 'GENERATE ADAPTIVE KIT LIST'}
            </button>
          </div>
        </form>
      </div>

      {saveError && <p role="alert" className="text-sm text-red-500">
        {currentLang === 'no' ? 'Kunne ikke lagre fremdriften. Forrige tilstand er beholdt. Frigjør lagringsplass og prøv igjen.' : 'Could not save progress. The previous state was kept. Free storage space and try again.'}
      </p>}

      {checklist && (
        <div className={`p-6 rounded-xl border-2 shadow-sm ${styles.cardBg} transition-all duration-200`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-dashed border-neutral-700/30 pb-4 mb-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-neutral-500">
                {currentLang === 'no' ? 'Tilpasset Utstyrsliste' : 'Custom Equipment List'}
              </span>
              <h4 className={`text-xl font-bold ${styles.titleText}`}>{checklist.title}</h4>
            </div>
            <button
              onClick={handlePrint}
              className={`text-xs flex items-center justify-center gap-1.5 p-2 rounded border font-semibold transition-colors self-start md:self-auto cursor-pointer ${styles.btnSecondary}`}
            >
              <Printer className="w-4 h-4" /> {currentLang === 'no' ? 'Skriv ut liste' : 'Print Checklist'}
            </button>
          </div>

          {/* Progress Tracker */}
          <div className="mb-6 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono uppercase">
              <span className="opacity-70">{currentLang === 'no' ? 'Fullført' : 'Completed'}</span>
              <span className="font-bold">{checkedCount} {t('lbl_of')} {totalCount} ({progressPercent}%)</span>
            </div>
            <div className={`w-full h-2 rounded-full overflow-hidden ${theme !== 'light' ? 'bg-neutral-950' : 'bg-slate-100'}`}>
              <div
                className={`h-full transition-all duration-300 ${styles.progressBar}`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Checklist Items */}
          <div className="space-y-2">
            {checklist.items.map((itm) => (
              <button
                type="button"
                role="checkbox"
                aria-checked={itm.checked}
                disabled={saving}
                id={`dyn-checklist-row-${itm.id}`}
                key={itm.id}
                onClick={() => toggleItem(itm.id)}
                className={`w-full text-left flex items-start gap-4 p-3.5 rounded-lg border cursor-pointer select-none transition-all duration-150 group ${
                  itm.checked
                      ? theme !== 'light'
                        ? 'bg-[var(--accent-solid)]/10 border-[var(--accent)]/30 text-neutral-400'
                        : 'bg-teal-50/40 border-teal-500/30 text-slate-600 line-through opacity-90'
                    : theme !== 'light'
                    ? 'bg-neutral-950/20 hover:bg-neutral-950/40 border-neutral-800 hover:border-neutral-700'
                    : 'bg-slate-50/20 hover:bg-slate-50/80 border-slate-200 text-slate-800'
                }`}
              >
                <span aria-hidden="true" className="flex-shrink-0 mt-0.5 text-[var(--accent)] text-[var(--accent)] group-hover:scale-105 transition-transform">
                  {itm.checked ? (
                    <CheckSquare className={`w-5 h-5 ${theme !== 'light' ? 'text-[var(--accent)]' : 'text-teal-600'}`} />
                  ) : (
                    <Square className="w-5 h-5 text-neutral-500" />
                  )}
                </span>
                <span className="text-sm md:text-base leading-snug font-medium">
                  {itm.text}
                </span>
              </button>
            ))}
          </div>

          {/* Environmental Warn Note */}
          {environment === 'subzero' && (
            <div className="mt-6 p-4 rounded-lg flex items-start gap-3 bg-[var(--accent-solid)]/10 border border-[var(--accent)]/20 text-xs text-yellow-500 font-semibold">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                {currentLang === 'no' 
                  ? 'KULDE ADVARSEL: Frostsikre vannrør og ha alternativ oppvarming som ikke krever strøm. Vann fryser ved 0°C.'
                  : 'SUBZERO WARNING: Keep your water storage from freezing and ensure non-electric ventilation if burning backup fuels.'}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
