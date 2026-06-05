/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export function localizeCategory(category: string, lang: string): string {
  if (lang === 'no') return category;

  const c = category.trim();
  switch (c) {
    case 'F\u00F8rstehjelp & Akuttmedisin':
    case 'First Aid & Trauma':
      return 'First Aid & Trauma';
    case 'Egenberedskap & Kriseh\u00E5ndtering i Hjemmet':
    case 'Household Preparedness':
      return 'Household Preparedness';
    case 'Egensikkerhet & Konflikth\u00E5ndtering':
    case 'Personal Safety':
      return 'Personal Safety';
    case 'Friluftsliv & Overlevelse i Naturen':
    case 'Wilderness Survival':
      return 'Wilderness Survival';
    case 'Reisesikkerhet & Utlandsberedskap':
    case 'Travel Security':
      return 'Travel Security';
    case 'Digitalt Personvern & Cybersikkerhet':
    case 'Digital Privacy & Cybersecurity':
      return 'Digital Privacy';
    default:
      return category;
  }
}

export function localizeComplexity(val: string, lang: string): string {
  if (lang === 'no') return val;

  const v = val.toLowerCase();
  if (v.includes('h\u00F8y') || v.includes('hoy') || v.includes('high')) {
    return 'High (Analyzed and structured from source)';
  }
  if (v.includes('middels') || v.includes('medium')) {
    return 'Medium (Analyzed and structured from source)';
  }
  if (v.includes('lav') || v.includes('low')) {
    return 'Low (Analyzed and structured from source)';
  }
  return val;
}

export function localizeDistributionLabel(label: string, lang: string): string {
  if (lang === 'no') return label;

  const l = label.toLowerCase();
  if (l.includes('teoretisk') || l.includes('theoretical')) return 'Theoretical Framework';
  if (l.includes('praktisk') || l.includes('practical')) return 'Practical Application';
  if (l.includes('evaluering') || l.includes('learning')) return 'Evaluation & Learning';
  return label;
}
