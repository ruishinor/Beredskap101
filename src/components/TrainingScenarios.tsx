/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { scenariosDataEn, scenariosDataNo } from '../data/pillarsData';
import { Award, ShieldAlert, ChevronRight, RefreshCw, Trophy, CheckCircle2 } from 'lucide-react';
import type { ThemeType } from '../types';

export default function TrainingScenarios({ theme }: { theme: ThemeType }) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'en';
  const scenariosData = currentLang === 'no' ? scenariosDataNo : scenariosDataEn;

  const [activeScenarioId, setActiveScenarioId] = useState<string>('commute-incident');
  const [currentStepId, setCurrentStepId] = useState<string>('start');
  const [score, setScore] = useState<number>(100);
  const [history, setHistory] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string>('');
  const [complete, setComplete] = useState<boolean>(false);

  const scenario = scenariosData.find(s => s.id === activeScenarioId) || scenariosData[0];
  const currentStep = scenario.steps[currentStepId] || scenario.steps['start'];

  const handleChoice = (nextStepId: string, choiceFeedback: string, scoreChange: number) => {
    setScore(prev => Math.max(0, prev + scoreChange));
    setFeedback(choiceFeedback);
    setHistory([...history, currentStepId]);

    if (!nextStepId || !scenario.steps[nextStepId] || Object.keys(scenario.steps[nextStepId].choices).length === 0) {
      setComplete(true);
    } else {
      setCurrentStepId(nextStepId);
    }
  };

  const resetScenario = () => {
    setCurrentStepId('start');
    setScore(100);
    setHistory([]);
    setFeedback('');
    setComplete(false);
  };

  const selectScenario = (id: string) => {
    setActiveScenarioId(id);
    setCurrentStepId('start');
    setScore(100);
    setHistory([]);
    setFeedback('');
    setComplete(false);
  };

  // Resilience ranking evaluation based on score and language
  const getRank = (finalScore: number) => {
    if (currentLang === 'no') {
      if (finalScore >= 150) return { title: 'Godt forberedt', desc: 'Du handler rolig, praktisk og med god fokusdisiplin.', color: 'text-green-500' };
      if (finalScore >= 100) return { title: 'Gatestrateg', desc: 'Du har solid forståelse og gjør fornuftige risikovurderinger.', color: 'text-yellow-500' };
      return { title: 'Nybegynner', desc: 'Du har rom for forbedring. Les mer i kunnskapspillarene og prøv igjen!', color: 'text-red-500 font-bold' };
    } else {
      if (finalScore >= 150) return { title: 'Well Prepared', desc: 'You stay calm, make practical choices, and keep good situational discipline.', color: 'text-green-500' };
      if (finalScore >= 100) return { title: 'Steady Decision-Maker', desc: 'You make sensible choices and keep a solid overview.', color: 'text-yellow-500' };
      return { title: 'Getting Started', desc: 'You have room for improvement. Read more in the knowledge sections and try again!', color: 'text-red-500 font-bold' };
    }
  };

  const rank = getRank(score);

  const styles = {
    cardBg: 'bg-[var(--card)] border border-[var(--border)]',
    titleText: 'text-[var(--text)] font-display',
    bodyText: 'text-[var(--text)] font-sans',
    btnActive: 'bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]',
    btnInactive: 'bg-[var(--card)] text-[var(--muted)] border-[var(--border)] hover:border-[var(--muted)]/50 hover:text-[var(--text)]',
    choiceBtn: 'bg-[var(--card)] hover:bg-[rgba(255,255,255,0.03)] text-[var(--text)] border-[var(--border)] hover:border-[var(--accent)]/50'
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Sidebar Selector */}
      <div className="lg:col-span-1 space-y-3">
        <h4 className={`text-xs uppercase font-mono tracking-widest opacity-60 px-1`}>{t('lbl_scenario_modules')}</h4>
        <div className="flex flex-col gap-2">
          {scenariosData.map(sc => (
            <button
              id={`btn-scenario-select-${sc.id}`}
              key={sc.id}
              onClick={() => selectScenario(sc.id)}
              className={`w-full text-left p-3 rounded-lg border text-sm transition-all focus:outline-none cursor-pointer ${
                sc.id === activeScenarioId ? styles.btnActive : styles.btnInactive
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase font-mono tracking-tight opacity-50 px-1 bg-neutral-900/20 rounded">
                  {sc.pillar}
                </span>
                {complete && sc.id === activeScenarioId && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                )}
              </div>
              <p className="font-semibold line-clamp-2">{sc.title}</p>
            </button>
          ))}
        </div>

        {/* Dark Status Display */}
        <div className={`p-4 rounded-xl border-2 text-center ${styles.cardBg}`}>
          <div className="flex items-center justify-center gap-1.5 text-yellow-500 mb-1">
            <Trophy className="w-4 h-4" />
            <span className="text-xs font-mono uppercase tracking-widest">{t('lbl_resilience_points')}</span>
          </div>
          <p className={`text-4xl font-extrabold font-mono tracking-tight ${theme !== 'light' ? 'text-white' : 'text-slate-900'}`}>{score}</p>
          <p className={`text-xs mt-2 leading-relaxed ${theme !== 'light' ? 'text-neutral-400' : 'text-slate-500'}`}>
            {t('lbl_score_help_text')}
          </p>
        </div>
      </div>

      {/* Primary Simulator Panel */}
      <div className="lg:col-span-3 space-y-6">
        <div className={`p-6 rounded-xl border-2 shadow-sm ${styles.cardBg} transition-colors duration-200`}>
          {/* Header */}
          <div className="border-b border-dashed border-neutral-700/30 pb-4 mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-[var(--accent)]">{t('lbl_simulation_tag')}</span>
              <h3 className={`text-2xl font-bold font-display ${styles.titleText}`}>{scenario.title}</h3>
              <p className="text-xs opacity-75 mt-0.5 max-w-xl">{scenario.description}</p>
            </div>
            <button
              id="btn-scenario-restart"
              onClick={resetScenario}
              className={`p-2 rounded border transition-colors flex items-center gap-1.5 text-xs cursor-pointer ${styles.btnInactive}`}
            >
              <RefreshCw className="w-3.5 h-3.5" /> {t('btn_reset')}
            </button>
          </div>

          {!complete ? (
            <div className="space-y-6">
              {/* Question Text */}
              <div className="p-4 rounded-lg leading-relaxed bg-[var(--bg-alt)] border border-[var(--border)] text-[var(--text)]">
                <p className="text-base font-medium">{currentStep.text}</p>
              </div>

              {/* Live choice feedback if any */}
              {feedback && (
                <div className={`p-3 rounded-lg border text-xs leading-relaxed flex items-start gap-2.5 ${
                  feedback.includes('Riktig') || feedback.includes('Perfekt') || feedback.includes('Correct') || feedback.includes('Excellent')
                    ? 'bg-green-950/20 text-green-400 border-green-500/30'
                    : 'bg-red-950/20 text-red-400 border-red-500/30'
                }`}>
                  <ShieldAlert className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-bold uppercase tracking-widest font-mono block mb-0.5">{t('lbl_choice_result')}</span>
                    <p>{feedback}</p>
                  </div>
                </div>
              )}

              {/* Choices list */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-mono uppercase tracking-wider opacity-60">{t('lbl_select_reaction')}</span>
                {currentStep.choices.map((choice, index) => (
                  <button
                    id={`btn-scenario-choice-${index}`}
                    key={index}
                    onClick={() => handleChoice(choice.nextStepId, choice.feedback, choice.scoreChange)}
                    className={`w-full text-left p-4 rounded-lg border-2 flex items-start justify-between gap-4 transition-all duration-150 hover:translate-x-1 cursor-pointer ${styles.choiceBtn}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center border text-xs font-mono ${
                        theme !== 'light' ? 'border-neutral-700 bg-neutral-900' : 'border-slate-300 bg-slate-100'
                      }`}>
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span className="font-medium text-sm md:text-base">{choice.text}</span>
                    </div>
                    <ChevronRight className="w-5 h-5 opacity-40 flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            // Simulation Completed Pane
            <div className="py-6 text-center space-y-6 animate-fade-in">
              <div className="flex justify-center">
                <div className={`p-4 rounded-full ${score >= 110 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'} animate-bounce`}>
                  <Award className="w-16 h-16" />
                </div>
              </div>

              <div className="max-w-md mx-auto space-y-2">
                <span className="text-xs font-mono uppercase tracking-widest opacity-60">{t('lbl_simulation_complete')}</span>
                <h4 className="text-2xl font-extrabold font-display">{t('lbl_scenario_review')}</h4>
                <div className="p-4 rounded-lg bg-neutral-950/30 border border-neutral-800/80 my-4">
                  <p className="text-xs font-mono uppercase opacity-50">{t('lbl_result_level')}</p>
                  <p className={`text-xl font-black ${rank.color} mt-1 uppercase tracking-tight`}>
                    {rank.title} (Poeng: {score})
                  </p>
                  <p className="text-sm opacity-80 mt-2">{rank.desc}</p>
                </div>
                <p className={`text-sm leading-relaxed p-4 rounded bg-neutral-900/10 ${styles.bodyText}`}>
                  {score >= 100 ? scenario.successOutcome : scenario.failureOutcome}
                </p>
              </div>

              <div className="flex justify-center gap-4">
                <button
                  id="btn-scenario-retry"
                  onClick={resetScenario}
                  className={`px-6 py-2.5 rounded-lg border font-semibold text-sm transition-colors cursor-pointer ${styles.btnInactive}`}
                >
                  {t('btn_try_again')}
                </button>
                <button
                  id="btn-scenario-next"
                  onClick={() => selectScenario(scenario.id === 'commute-incident' ? 'burner-setup' : 'commute-incident')}
                  className={`px-6 py-2.5 rounded-lg font-bold text-sm bg-[var(--accent-solid)] hover:bg-[var(--accent-solid)] text-[var(--accent-on-solid)] cursor-pointer`}
                >
                  {t('btn_next_scenario')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
