/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ThemeType = 'dark' | 'light';

export type PillarId = 'førstehjelp' | 'friluftsliv' | 'egensikkerhet' | 'egenberedskap' | 'personvern' | 'reisesikkerhet';

export interface Topic {
  id: string;
  title: string;
  shortSummary: string;
  situationContext: string;
  corePrinciple: string;
  procedureSteps: string[];
  warnings: string[];
  relatedTopics: string[];
  sensitive?: boolean; // E.g., domestic violence content
}

export interface Pillar {
  id: PillarId;
  title: string;
  titleEnglish: string;
  iconName: string; // Map to a lucide-react icon
  shortDescription: string;
  philosophy: string;
  topics: Topic[];
}

export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
  category: string;
}

export interface ChecklistGroup {
  id: string;
  title: string;
  icon: string;
  items: ChecklistItem[];
}

export interface ScenarioStep {
  text: string;
  choices: {
    text: string;
    nextStepId: string;
    feedback: string;
    scoreChange: number;
  }[];
}

export interface Scenario {
  id: string;
  title: string;
  description: string;
  pillar: PillarId;
  initialStepId: string;
  steps: Record<string, ScenarioStep>;
  successOutcome: string;
  failureOutcome: string;
}
