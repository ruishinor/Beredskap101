/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { HeartPulse, CloudLightning, ShieldAlert, CheckCircle, RotateCcw, Award, ShieldQuestion, HelpCircle } from 'lucide-react';
import type { ThemeType } from '../types';

interface FlowNode {
  text: string;
  options: {
    text: string;
    nextId: string;
    isCorrect?: boolean;
    info?: string;
  }[];
}

interface Flowchart {
  id: string;
  title: string;
  icon: any;
  description: string;
  initialNodeId: string;
  nodes: Record<string, FlowNode>;
}

const FLOWCHARTS_EN: Record<string, Flowchart> = {
  medical: {
    id: 'medical',
    title: 'Emergency First Aid',
    icon: HeartPulse,
    description: 'When seconds count: Life-saving flowchart for unconsciousness and circulation.',
    initialNodeId: 'start',
    nodes: {
      start: {
        text: 'Is the casualty conscious and responsive?',
        options: [
          { text: 'Yes, speaking or responsive', nextId: 'conscious' },
          { text: 'No, no response to speech or gentle physical stimulation', nextId: 'unconscious' }
        ]
      },
      conscious: {
        text: 'Is the casualty breathing normally, or showing signs of respiratory distress/shock?',
        options: [
          { text: 'Breathing normally, but dizzy/overheated', nextId: 'heat_exhaustion', isCorrect: true },
          { text: 'Asphyxiation symptoms (hands clutching throat)', nextId: 'choking' }
        ]
      },
      unconscious: {
        text: 'Clear airways. Tilt the head back gently, lift the chin. Is the casualty breathing normally now? (Look, listen, feel for 10 seconds)',
        options: [
          { text: 'Yes, regular steady breathing', nextId: 'recovery_position', isCorrect: true },
          { text: 'No, absent breathing or agonal gasping', nextId: 'cpr_required' }
        ]
      },
      heat_exhaustion: {
        text: 'Casualty shows potential heat stroke path. Reposition to shade, cool the chest/groin with ice/moist packs, and invoke emergency numbers (911/112/113).',
        options: [
          { text: 'Restart', nextId: 'start' }
        ]
      },
      choking: {
        text: 'Deliver up to 5 firm back blows between the shoulder blades. If unobstructed breathing is not restored, execute 5 abdominal thrusts (Heimlich maneuver). Call emergency services.',
        options: [
          { text: 'Restart', nextId: 'start' }
        ]
      },
      recovery_position: {
        text: 'Excellent. Place the casualty in the stable recovery position to secure a patent airway. Call 911/112/113 immediately. Monitor breathing continuously.',
        options: [
          { text: 'Restart', nextId: 'start' }
        ]
      },
      cpr_required: {
        text: 'Call emergency services immediately, set handset to speaker. Initiate Cardiopulmonary Resuscitation (CPR): 30 chest compressions followed by 2 emergency breaths. Continue continuously.',
        options: [
          { text: 'Restart', nextId: 'start' }
        ]
      }
    }
  },
  weather_shelter: {
    id: 'weather_shelter',
    title: 'Evacuation vs. Sheltering in Place',
    icon: CloudLightning,
    description: 'Choose safe practical responses under extreme storms or flash floods.',
    initialNodeId: 'start',
    nodes: {
      start: {
        text: 'Have civil authorities issued a mandatory evacuation order?',
        options: [
          { text: 'Yes, official evacuation directive declared', nextId: 'evac_yes' },
          { text: 'No, but local waters are surging/wind velocity is rising', nextId: 'assess_risk' }
        ]
      },
      evac_yes: {
        text: 'Evacuate immediately. Grab your prepared go-bag and high-priority papers. Close windows, shut down main electricity and water valves before departing.',
        options: [
          { text: 'Restart', nextId: 'start' }
        ]
      },
      assess_risk: {
        text: 'Are surrounding transit roadways flooding rapidly, compromising safe vehicular passage?',
        options: [
          { text: 'Yes, flowing current exceeds 15 cm in depth', nextId: 'shelter_inplace', isCorrect: true },
          { text: 'No, roads remain dry and stable for now', nextId: 'evac_preemptive' }
        ]
      },
      shelter_inplace: {
        text: 'Retreat to higher ground! Move to the upper floors immediately. Attempting to traverse rushing current by vehicle or foot is lethal (even 30 cm can float a car). Disconnect bottom circuits and await rescue.',
        options: [
          { text: 'Restart', nextId: 'start' }
        ]
      },
      evac_preemptive: {
        text: 'Execute preemptive evacuation to family or designated shelter zones while routes remain dry. Better safe than stranded.',
        options: [
          { text: 'Restart', nextId: 'start' }
        ]
      }
    }
  },
  scam_trust: {
    id: 'scam_trust',
    title: 'Is it a Scam?',
    icon: ShieldAlert,
    description: 'Check common street-scam patterns in plain language.',
    initialNodeId: 'start',
    nodes: {
      start: {
        text: 'Are they asking for a specific purchase, pushing urgency, or trying to pull on your feelings?',
        options: [
          { text: 'Yes, they want me to buy something specific right now', nextId: 'emotional_pressure' },
          { text: 'No, it seems like a normal polite interaction', nextId: 'normal_interaction' }
        ]
      },
      emotional_pressure: {
        text: 'Do they insist it must be bought from one specific shop nearby?',
        options: [
          { text: 'Yes, they reject other help (such as cash, food aid, or water) and point only to that store', nextId: 'scam_confirmed', isCorrect: true },
          { text: 'No, they are open to other help or alternatives', nextId: 'needs_vetting' }
        ]
      },
      scam_confirmed: {
        text: 'This looks like a common baby-milk scam or similar pressure tactic. Decline politely, step back, and keep walking.',
        options: [
          { text: 'Restart', nextId: 'start' }
        ]
      },
      normal_interaction: {
        text: 'Likely a normal interaction, but keep your wallet, passport, and devices secure.',
        options: [
          { text: 'Restart', nextId: 'start' }
        ]
      },
      needs_vetting: {
        text: 'If you want to help, use a trusted aid organization instead of handing over cash or buying items on the spot.',
        options: [
          { text: 'Restart', nextId: 'start' }
        ]
      }
    }
  }
};

const FLOWCHARTS_NO: Record<string, Flowchart> = {
  medical: {
    id: 'medical',
    title: 'AKUTT FØRSTEHJELP',
    icon: HeartPulse,
    description: 'Når sekunder teller: Livreddende flytskjema for bevisstløshet og sirkulasjon.',
    initialNodeId: 'start',
    nodes: {
      start: {
        text: 'Er pasienten bevisst og kontaktbar?',
        options: [
          { text: 'Ja, snakker eller reagerer', nextId: 'conscious' },
          { text: 'Nei, ingen reaksjon på tiltale eller forsiktig risting', nextId: 'unconscious' }
        ]
      },
      conscious: {
        text: 'Puster pasienten normalt eller strever de med pusten/viser tegn på heteslag/traume?',
        options: [
          { text: 'Normal pust, men svimmel/overopphetet', nextId: 'heat_exhaustion', isCorrect: true },
          { text: 'Kvelningssymptomer (slår på halsen)', nextId: 'choking' }
        ]
      },
      unconscious: {
        text: 'Sjekk luftveiene. Bøy hodet lett bakover, løft haken. Puster pasienten normalt nå? (Lytt, se, føl i 10 sekunder)',
        options: [
          { text: 'Ja, puster regelmessig', nextId: 'recovery_position', isCorrect: true },
          { text: 'Nei, puster ikke eller har kun uregelmessig gisping', nextId: 'cpr_required' }
        ]
      },
      heat_exhaustion: {
        text: 'Pasienten kan være på vei mot heteslag. Plasser dem i skyggen, kjøl ned kroppen med isposer i armhulene/lysken, og ring 113 om nødvendig.',
        options: [
          { text: 'Start forfra', nextId: 'start' }
        ]
      },
      choking: {
        text: 'Gi inntil 5 kraftige slag mellom skulderbladene. Hvis ikke virksomt: utfør 5 buktrykk (Heimlich-manøver). Ring 113.',
        options: [
          { text: 'Start forfra', nextId: 'start' }
        ]
      },
      recovery_position: {
        text: 'Utmerket. Legg pasienten i stabilt sideleie for å sikre frie luftveier. Ring 113 umiddelbart. Overvåk pusten kontinuerlig.',
        options: [
          { text: 'Start forfra', nextId: 'start' }
        ]
      },
      cpr_required: {
        text: 'Ring 113 umiddelbart og sett på høyttaler. Start hjerte-lunge-redning (HLR): 30 tunge brystkompresjoner fulgt av 2 munn-til-munn innblåsinger. Fortsett kontinuerlig.',
        options: [
          { text: 'Start forfra', nextId: 'start' }
        ]
      }
    }
  },
  weather_shelter: {
    id: 'weather_shelter',
    title: 'Hjemmet: Evakuering vs Sikring',
    icon: CloudLightning,
    description: 'Treff riktig beslutning under ekstremvær eller flomscenarier.',
    initialNodeId: 'start',
    nodes: {
      start: {
        text: 'Har myndighetene utstedt påbud om umiddelbar evakuering?',
        options: [
          { text: 'Ja, offisielt påbud gitt', nextId: 'evac_yes' },
          { text: 'Nei, men vannet stiger/vinden øker rundt eiendommen', nextId: 'assess_risk' }
        ]
      },
      evac_yes: {
        text: 'Evakuer umiddelbart. Ta klar evakueringssekk og viktige dokumenter. Lukk vinduer, skru av hovedstrøm og hovedvannkran før du går.',
        options: [
          { text: 'Start forfra', nextId: 'start' }
        ]
      },
      assess_risk: {
        text: 'Stiger vannet så raskt at veiene rundt er i ferd med å oversvømmes?',
        options: [
          { text: 'Ja, veiene har rennende vann på over 15 cm dybde', nextId: 'shelter_inplace', isCorrect: true },
          { text: 'Nei, veiene er åpne og tørre ennå', nextId: 'evac_preemptive' }
        ]
      },
      shelter_inplace: {
        text: 'Søk oppover! Trekk opp i andre etasje. Å kjøre bil eller gå ut i flomvann er livsfarlig (selv 30 cm vann kan feie bort en bil). Koble ut sikringene for oversvømte etasjer og vent på redning.',
        options: [
          { text: 'Start forfra', nextId: 'start' }
        ]
      },
      evac_preemptive: {
        text: 'Gjør en preventiv evakuering til familie eller trygt mottak nå mens veiene er tørre. Bedre å være føre var enn etter snar.',
        options: [
          { text: 'Start forfra', nextId: 'start' }
        ]
      }
    }
  },
  scam_trust: {
    id: 'scam_trust',
    title: 'Er dette svindel?',
    icon: ShieldAlert,
    description: 'Sjekk vanlige svindelmønstre på gaten uten fagjargon.',
    initialNodeId: 'start',
    nodes: {
      start: {
        text: 'Ber de deg kjøpe noe bestemt, virker de veldig pågående, eller prøver de å spille på følelsene dine?',
        options: [
          { text: 'Ja, de vil at jeg skal kjøpe noe bestemt nå', nextId: 'emotional_pressure' },
          { text: 'Nei, det er bare en vanlig høflig forespørsel', nextId: 'normal_interaction' }
        ]
      },
      emotional_pressure: {
        text: 'Insisterer de på at det må kjøpes i én bestemt butikk rett ved siden av?',
        options: [
          { text: 'Ja, de vil bare ha kjøp i den butikken', nextId: 'scam_confirmed', isCorrect: true },
          { text: 'Nei, de tar gjerne imot annen hjelp', nextId: 'needs_vetting' }
        ]
      },
      scam_confirmed: {
        text: 'Dette ligner en vanlig svindel eller en lignende press-svindel. Si nei, ta et steg tilbake og gå videre.',
        options: [
          { text: 'Start forfra', nextId: 'start' }
        ]
      },
      normal_interaction: {
        text: 'Sannsynligvis en vanlig henvendelse, men hold fortsatt verdisaker trygt på plass.',
        options: [
          { text: 'Start forfra', nextId: 'start' }
        ]
      },
      needs_vetting: {
        text: 'Hvis du vil hjelpe, bruk en kjent hjelpeorganisasjon i stedet for å kjøpe noe på stedet.',
        options: [
          { text: 'Start forfra', nextId: 'start' }
        ]
      }
    }
  }
};

export default function InteractiveFlowcharts({ theme }: { theme: ThemeType }) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'en';
  const FLOWCHARTS = currentLang === 'no' ? FLOWCHARTS_NO : FLOWCHARTS_EN;

  const [activeId, setActiveId] = useState<string>('medical');
  const [currentNodeId, setCurrentNodeId] = useState<string>('start');
  const [history, setHistory] = useState<string[]>([]);

  const flowchart = FLOWCHARTS[activeId];
  const currentNode = flowchart.nodes[currentNodeId];

  const handleOptionSelect = (nextId: string) => {
    setHistory([...history, currentNodeId]);
    setCurrentNodeId(nextId);
  };

  const handleReset = () => {
    setCurrentNodeId('start');
    setHistory([]);
  };

  const handleBack = () => {
    if (history.length > 0) {
      const prev = history[history.length - 1];
      setCurrentNodeId(prev);
      setHistory(history.slice(0, -1));
    }
  };

  /** Theme custom styles */
  const styles = {
    cardBg: theme !== 'light' ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-slate-200',
    titleText: theme !== 'light' ? 'text-[var(--accent)] font-mono' : 'text-slate-900 font-display',
    bodyText: theme !== 'light' ? 'text-neutral-300 font-mono' : 'text-slate-600 font-sans',
    btnActive: theme !== 'light' ? 'bg-[var(--accent-solid)]/15 text-[var(--accent)] border-[var(--accent)]' : 'bg-teal-50 text-teal-900 border-teal-600',
    btnInactive: theme !== 'light' ? 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:border-neutral-700' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100',
    optionBtn: theme !== 'light' ? 'bg-neutral-950 hover:bg-neutral-800 text-neutral-200 border-neutral-800 hover:border-[var(--accent)]/50' : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 hover:border-teal-500'
  };

  const FlowIcon = flowchart.icon;

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {Object.values(FLOWCHARTS).map((flow) => {
          const Icon = flow.icon;
          const isActive = flow.id === activeId;
          return (
            <button
              id={`btn-flow-${flow.id}`}
              key={flow.id}
              onClick={() => {
                setActiveId(flow.id);
                setCurrentNodeId('start');
                setHistory([]);
              }}
              className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all cursor-pointer ${
                isActive ? styles.btnActive : styles.btnInactive
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm">{flow.title}</p>
                <p className="text-xs opacity-80 line-clamp-1">{flow.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Flow Rendering Box */}
      <div className={`p-6 rounded-xl border-2 shadow-sm ${styles.cardBg} transition-colors duration-200`}>
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-dashed border-neutral-700/30">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${theme !== 'light' ? 'bg-[var(--accent-solid)]/10 text-[var(--accent)]' : 'bg-teal-100 text-teal-800'}`}>
              <FlowIcon className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-widest font-mono opacity-60">{t('lbl_flowchart')}</span>
              <h3 className={`text-xl font-bold ${styles.titleText}`}>{flowchart.title}</h3>
            </div>
          </div>
          {history.length > 0 && (
            <div className="flex gap-2">
              <button
                id="btn-flow-back"
                onClick={handleBack}
                className={`p-1.5 rounded border flex items-center gap-1 text-xs transition-colors cursor-pointer ${styles.btnInactive}`}
              >
                {t('btn_back')}
              </button>
              <button
                id="btn-flow-reset"
                onClick={handleReset}
                className={`p-1.5 rounded border flex items-center gap-1 text-xs transition-colors cursor-pointer ${styles.btnInactive}`}
              >
                <RotateCcw className="w-3.5 h-3.5" /> {t('btn_reset')}
              </button>
            </div>
          )}
        </div>

        {/* Question/Instructions */}
        <div className="my-6 min-h-[100px] flex flex-col justify-center">
          <span className="text-xs font-mono uppercase opacity-50 block mb-1">{t('lbl_flowchart_step')}</span>
          <p className={`text-lg md:text-xl font-medium leading-relaxed ${theme !== 'light' ? 'text-white' : 'text-neutral-900'}`}>
            {currentNode.text}
          </p>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {currentNode.options.map((opt, idx) => {
            const isFinishedNode = currentNode.options.length === 1 && opt.nextId === 'start';
            return (
              <button
                id={`btn-flow-opt-${idx}`}
                key={idx}
                onClick={() => handleOptionSelect(opt.nextId)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all flex items-start justify-between gap-4 cursor-pointer hover:translate-x-1 duration-150 ${styles.optionBtn}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-1 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center border text-xs ${
                    theme !== 'light' ? 'border-neutral-600 bg-neutral-900' : 'border-slate-300 bg-slate-100'
                  }`}>
                    {idx + 1}
                  </div>
                  <span className="font-medium text-sm md:text-base leading-snug">{opt.text}</span>
                </div>
                {isFinishedNode ? (
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                ) : (
                  <HelpCircle className="w-5 h-5 opacity-40 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Actionable Tips bottom block when landing on a leaf node */}
        {currentNode.options.length === 1 && currentNode.options[0].nextId === 'start' && (
          <div className={`mt-6 p-4 rounded-lg border-l-4 flex items-start gap-3 ${
            theme !== 'light' ? 'bg-[var(--accent-solid)]/10 border-[var(--accent)]' : 'bg-teal-50 border-teal-600'
          }`}>
            <Award className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className={`font-semibold text-sm ${theme !== 'light' ? 'text-white' : 'text-neutral-900'}`}>
                {t('lbl_flowchart_conclusion')}
              </p>
              <p className="text-xs opacity-80 mt-1">
                {t('lbl_flowchart_conclusion_desc')}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className={`p-4 rounded-xl border text-xs leading-relaxed ${styles.cardBg}`}>
        <div className="flex gap-2 items-center text-yellow-600 text-[var(--accent)] mb-1 font-semibold font-mono">
          <ShieldQuestion className="w-4 h-4" />
          <span>{t('lbl_critical_advisory')}</span>
        </div>
        {t('lbl_critical_advisory_desc')}
      </div>
    </div>
  );
}
