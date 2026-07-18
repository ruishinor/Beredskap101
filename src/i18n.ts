import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

export const LANGUAGE_STORAGE_KEY = 'beredskap101_language_v1';
const SUPPORTED_LANGUAGES = new Set(['en', 'no']);

function readStoredLanguage(): 'en' | 'no' | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored && SUPPORTED_LANGUAGES.has(stored)) {
      return stored as 'en' | 'no';
    }
  } catch {
    // Ignore storage failures and fall back to browser preference.
  }

  return null;
}

function readBrowserLanguage(): 'en' | 'no' {
  if (typeof navigator === 'undefined') return 'en';

  const browserLanguages = [navigator.language, ...(navigator.languages || [])]
    .filter(Boolean)
    .map((value) => value.toLowerCase());

  const prefersNorwegian = browserLanguages.some(
    (value) => value.startsWith('no') || value.startsWith('nb') || value.startsWith('nn')
  );

  return prefersNorwegian ? 'no' : 'en';
}

function resolveInitialLanguage(): 'en' | 'no' {
  return readStoredLanguage() || readBrowserLanguage();
}

const en = {
  brand_sub_title: 'Preparedness for the real world, not just book-theory.',
  offline_banner_desc: 'Preparedness mode: core guides, checklists, and scenario training are designed for offline use',
  nav_knowledge: 'Knowledge',
  nav_library: 'Library',
  nav_scenarios: 'Scenarios',
  nav_flowcharts: 'Flowcharts',
  nav_checklists: 'Checklists',
  hero_eyebrow: 'Norwegian-ready civil resilience guide',
  hero_title: 'Prepared for the real world.',
  hero_description:
    'Beredskap101 turns official emergency advice, first aid principles, standard operating procedures, wilderness assessment, household preparedness, and travel safety into practical actions you can use before, during, and after a crisis.',
  hero_btn_flowcharts: 'Open emergency flowcharts',
  hero_btn_checklists: 'Build one-week kit',
  search_placeholder: 'Search: water storage, tourniquet, emergency alert, burner phone, blackout...',
  btn_close: 'Close',
  btn_close_search: 'Close search',
  search_results_title: 'Direct search results',
  search_no_results: 'No matches for "{{query}}". Try: water, blackout, bleeding, privacy, travel, or storm.',
  metric_cache: 'Offline cache',
  metric_cache_val: 'Ready',
  metric_alerts: 'Warning channels',
  metric_alerts_val: 'DSB/NVE',
  metric_battery: 'Battery saver',
  metric_battery_val: 'Enabled',
  metric_guides: 'Action guides',
  pillars_title: 'Core preparedness pillars',
  pillars_desc:
    'Structured, mobile-first guidance for one-week household self-preparedness, acute first aid, practical real-world decisions, digital privacy, personal safety, and resilient travel.',
  featured_title: 'Featured practical guides',
  featured_desc:
    'Short, practical guidance for the highest-intent searches in 2026: egenberedskap, 20 liters water per person, Nødvarsel, blackout preparation, first aid, and digital privacy.',
  read_time_tag: '6 min read',
  offline_saved_tag: 'Offline ready',
  high_priority_tag: 'High priority',
  travel_security_tag: 'Travel security',
  updated_tag: '2026 aligned',
  field_verified_tag: 'Practice focused',
  btn_open_guide: 'Open guide',
  btn_return_pillar: 'Return to pillar overview',
  btn_return_all: 'Return to all pillars',
  btn_all_pillars_overview: 'All 6 pillars',
  title_practical_sop: 'Practical procedures',
  tag_procedure_code: 'Procedure code',
  btn_read_sop: 'Read guide',
  lbl_situation_context: 'Situation context',
  lbl_doctrine_principles: 'Core principle',
  lbl_action_sequence: 'Action sequence',
  lbl_critical_prohibitions: 'Critical warnings: what not to do',
  lbl_cross_references: 'Related skills',
  scenarios_title: 'Interactive tabletop scenarios',
  scenarios_desc:
    'Practice realistic decisions before stress hits. Each scenario rewards calm observation, official information channels, and low-risk action.',
  flowcharts_title: 'Interactive emergency flowcharts',
  flowcharts_desc:
    'Decision trees for the first minute of a crisis: first aid, evacuation versus sheltering, and common travel scams.',
  checklists_title: 'Readiness Checklists',
  checklists_desc:
    'DSB now advises households to plan for one week. These local-only checklists help you track water, food, heat, medicine, communications, payments, and privacy readiness.',
  lbl_scenario_modules: 'Scenario modules',
  lbl_resilience_points: 'Resilience score',
  lbl_score_help_text: 'Baseline is 100. Good decisions add margin; risky shortcuts remove it.',
  lbl_simulation_tag: 'Tabletop simulation',
  lbl_select_reaction: 'Select your reaction',
  lbl_choice_result: 'Choice result',
  lbl_simulation_complete: 'Simulation complete',
  lbl_scenario_review: 'Scenario review',
  lbl_result_level: 'Result level',
  btn_reset: 'Reset',
  btn_try_again: 'Try again',
  btn_next_scenario: 'Next scenario',
  lbl_flowchart: 'Emergency flowchart',
  btn_back: 'Back',
  lbl_flowchart_step: 'Status / step',
  lbl_flowchart_conclusion: 'Action reached',
  lbl_flowchart_conclusion_desc:
    'This decision path is complete. Reset to re-evaluate, or keep the result visible while you act.',
  lbl_critical_advisory: 'Critical advisory:',
  lbl_critical_advisory_desc:
    'These flowcharts support thinking under stress. They do not replace 113 medical dispatch, 112 police, 110 fire, or official civil protection instructions.',
  lbl_equipment_checklists: 'Equipment and maintenance',
  btn_reset_checklists: 'Reset this list',
  lbl_resilience_status: 'Readiness status',
  lbl_of: 'of',
  lbl_completed: 'completed',
  lbl_monthly_maintenance_title: 'Monthly verification and maintenance',
  lbl_monthly_maintenance_desc:
    'Rotate water and food, test lights/radio/powerbanks, check medicine dates, and confirm where your municipality publishes crisis information if mobile data is down.',
  footer_desc: 'Practical preparedness guidance for households, travelers, outdoor users, and privacy-minded people.',
  footer_bullet_1: 'Aligned with Norwegian personal preparedness intent.',
  footer_bullet_2: 'Built as a lightweight, local-first web application.',
  footer_bullet_3: 'No tracking scripts, ads, or analytics calls.',
  footer_contact: 'System contact',
  footer_time: 'Preparedness reference time',
  footer_all_rights: 'All rights reserved',
  footer_guarantee:
    'Privacy guarantee: Checklist progress stays in this browser. Beredskap101 does not send tracking data, ads, or analytics. Nor do we save it.',
  nav_home: 'Home',
  nav_guides: 'Guides',
  nav_offline: 'Offline',
  nav_profile: 'Profile',
  library_title: 'Extended Reference Library',
  library_desc: 'Detailed reference modules based on official documentation, research reports, and safety reviews.',
  tab_article: 'Knowledge Article',
  tab_guide: 'Instructional Guide',
  tab_checklist: 'Operational Checklist',
  tab_protocol: 'Testing Protocol',
  tab_module: 'Course Module',
  tab_stats: 'Stats & Profile',
  lbl_complexity: 'Data Complexity',
  lbl_readiness: 'Readiness Factor',
  lbl_source_file: 'Source File',
  lbl_file_size: 'Resource Size',
  lbl_distribution: 'Focus Area Distribution',
  lbl_learning_goals: 'Learning Goals',
  lbl_theory: 'Theory (2 Min Read)',
  lbl_reflection: 'Reflection Questions',
  lbl_test_procedures: 'Test Procedures',
  lbl_approval_reqs: 'Approval Requirements',
  lbl_key_elements: 'Curated Key Elements',
  backup_notice_upgraded: 'Backup upgraded to stronger encryption (v3).',
  backup_warn_reduced_encryption: 'Warning: encryption strength reduced on non-HTTPS connection.',
  backup_error_corrupt: 'Backup file is corrupted or passphrase is wrong.',
  backup_error_unsupported_version: 'Unsupported backup version.',
  backup_error_v3_requires_https: 'This backup uses strong encryption (v3) that requires a secure HTTPS connection.',
  backup_hint_passphrase_strength: 'Tip: mix upper/lowercase letters, digits and symbols for a stronger passphrase.'
};

const no = {
  brand_sub_title: 'Beredskap for virkeligheten, ikke bare bok-teori.',
  offline_banner_desc: 'Beredskap-modus: kjerneguider, sjekklister og scenarioer er laget for frakoblet bruk',
  nav_knowledge: 'Kunnskap',
  nav_library: 'Bibliotek',
  nav_scenarios: 'Scenarioer',
  nav_flowcharts: 'Flytskjema',
  nav_checklists: 'Sjekklister for beredskap',
  hero_eyebrow: 'Norsk sivil robusthet i praksis',
  hero_title: 'Forberedt på den virkelige verden.',
  hero_description:
    'Beredskap101 gjør offisielle beredskapsråd, førstehjelp, prosedyrer, friluftsvurderinger, egenberedskap og reisesikkerhet om til praktisk kunnskap og konkrete handlinger du kan bruke før, under og etter en krise.',
  hero_btn_flowcharts: 'Åpne nødflytskjema',
  hero_btn_checklists: 'Bygg én-ukes lager',
  search_placeholder: 'Søk: vannlagring, tourniquet, nødvarsel, brennertelefon, strømbrudd...',
  btn_close: 'Lukk',
  btn_close_search: 'Lukk søk',
  search_results_title: 'Direkte søkeresultater',
  search_no_results: 'Ingen treff på "{{query}}". Prøv: vann, strømbrudd, blødning, personvern, reise eller uvær.',
  metric_cache: 'Offline-cache',
  metric_cache_val: 'Klar',
  metric_alerts: 'Varslingskanaler',
  metric_alerts_val: 'DSB/NVE',
  metric_battery: 'Batterisparing',
  metric_battery_val: 'Aktiv',
  metric_guides: 'Handlingsguider',
  pillars_title: 'Kjernepillarer for beredskap',
  pillars_desc:
    'Strukturert, mobiltilpasset veiledning for én uke egenberedskap, akutt førstehjelp, praktiske beslutninger ute i virkeligheten, digitalt personvern, egensikkerhet og robust reise.',
  featured_title: 'Utvalgte praktiske veiledninger',
  featured_desc:
    'Korte, praktiske guider for de viktigste søkeintensjonene i 2026: egenberedskap, 20 liter vann per person, Nødvarsel, strømbrudd, førstehjelp og digitalt personvern.',
  read_time_tag: '6 min lesing',
  offline_saved_tag: 'Offline-klar',
  high_priority_tag: 'Høy prioritet',
  travel_security_tag: 'Reisesikkerhet',
  updated_tag: '2026-tilpasset',
  field_verified_tag: 'Praksisfokus',
  btn_open_guide: 'Åpne guide',
  btn_return_pillar: 'Tilbake til pilaren',
  btn_return_all: 'Tilbake til alle pilarer',
  btn_all_pillars_overview: 'Alle 6 pilarer',
  title_practical_sop: 'Praktiske prosedyrer',
  tag_procedure_code: 'Prosedyrekode',
  btn_read_sop: 'Les guide',
  lbl_situation_context: 'Situasjonskontekst',
  lbl_doctrine_principles: 'Kjerneprinsipp',
  lbl_action_sequence: 'Handlingsrekkefølge',
  lbl_critical_prohibitions: 'Kritiske advarsler: dette må du ikke gjøre',
  lbl_cross_references: 'Relaterte ferdigheter',
  scenarios_title: 'Interaktive tabletop-scenarioer',
  scenarios_desc:
    'Øv på realistiske valg før stresset kommer. Scenarioene belønner rolig observasjon, offisielle informasjonskanaler og lavrisiko handling.',
  flowcharts_title: 'Interaktive nødflytskjema',
  flowcharts_desc:
    'Beslutningstrær for det første minuttet av en krise: førstehjelp, evakuering mot å bli hjemme, og vanlige reisesvindler.',
  checklists_title: 'Sjekklister for én uke egenberedskap',
  checklists_desc:
    'DSB anbefaler nå at husholdninger planlegger for én uke. Disse lokale sjekklistene hjelper deg med vann, mat, varme, medisiner, kommunikasjon, betaling og personvern.',
  lbl_scenario_modules: 'Scenario-moduler',
  lbl_resilience_points: 'Resilienspoeng',
  lbl_score_help_text: 'Startverdi er 100. Gode valg gir margin; risikable snarveier fjerner den.',
  lbl_simulation_tag: 'Tabletop-simulering',
  lbl_select_reaction: 'Velg reaksjon',
  lbl_choice_result: 'Valgresultat',
  lbl_simulation_complete: 'Simulering fullført',
  lbl_scenario_review: 'Scenariogjennomgang',
  lbl_result_level: 'Resultatnivå',
  btn_reset: 'Nullstill',
  btn_try_again: 'Prøv igjen',
  btn_next_scenario: 'Neste scenario',
  lbl_flowchart: 'Nødflytskjema',
  btn_back: 'Tilbake',
  lbl_flowchart_step: 'Status / steg',
  lbl_flowchart_conclusion: 'Handling nådd',
  lbl_flowchart_conclusion_desc:
    'Denne beslutningsveien er fullført. Nullstill for å vurdere på nytt, eller behold resultatet synlig mens du handler.',
  lbl_critical_advisory: 'Viktig advarsel:',
  lbl_critical_advisory_desc:
    'Flytskjemaene støtter tenkning under stress. De erstatter ikke 113 medisinsk nødtelefon, 112 politi, 110 brann eller offisielle råd fra myndighetene.',
  lbl_equipment_checklists: 'Utstyr og vedlikehold',
  btn_reset_checklists: 'Nullstill listen',
  lbl_resilience_status: 'Beredskapsstatus',
  lbl_of: 'av',
  lbl_completed: 'fullført',
  lbl_monthly_maintenance_title: 'Månedlig sjekk og vedlikehold',
  lbl_monthly_maintenance_desc:
    'Roter vann og mat, test lys/radio/nødladere, sjekk medisindatoer og avklar hvor kommunen deler kriseinformasjon hvis mobilnett faller ut.',
  footer_desc: 'Praktiske beredskapsråd for husholdninger, reisende, friluftsfolk og personvernbevisste.',
  footer_bullet_1: 'Tilpasset norsk beredskap.',
  footer_bullet_2: 'Bygget som en lett, lokal-først nettapplikasjon.',
  footer_bullet_3: 'Ingen sporingsskript, annonser eller analysekall.',
  footer_contact: 'Systemkontakt',
  footer_time: 'Beredskapsreferanse',
  footer_all_rights: 'Alle rettigheter forbeholdt',
  footer_guarantee:
    'Personverngaranti: sjekklisteprogresjon blir i denne nettleseren. Beredskap101 sender ikke sporingsdata, reklame eller analysekall.',
  nav_home: 'Hjem',
  nav_guides: 'Guider',
  nav_offline: 'Offline',
  nav_profile: 'Profil',
  library_title: 'Utvidet Referansebibliotek',
  library_desc: 'Detaljerte referansemoduler basert på offisiell dokumentasjon, forskningsrapporter og sikkerhetsgjennomganger.',
  tab_article: 'Kunnskapsartikkel',
  tab_guide: 'Instruksjonsveiledning',
  tab_checklist: 'Operasjonell Sjekkliste',
  tab_protocol: 'Testprotokoll',
  tab_module: 'Kursmodul',
  tab_stats: 'Statistikk & Profil',
  lbl_complexity: 'Datakompleksitet',
  lbl_readiness: 'Beredskapsfaktor',
  lbl_source_file: 'Kildefil',
  lbl_file_size: 'Ressursstørrelse',
  lbl_distribution: 'Fordeling av Kjerneområder',
  lbl_learning_goals: 'Læringsmål',
  lbl_theory: 'Teori (2 Min Lesing)',
  lbl_reflection: 'Spørsmål til Refleksjon',
  lbl_test_procedures: 'Testprosedyrer',
  lbl_approval_reqs: 'Godkjenningskrav',
  lbl_key_elements: 'Strukturerte Nøkkelelementer',
  backup_notice_upgraded: 'Backupen er oppgradert til sterkere kryptering (v3).',
  backup_warn_reduced_encryption: 'Advarsel: krypteringsstyrken er redusert på tilkobling uten HTTPS.',
  backup_error_corrupt: 'Backupfilen er ødelagt, eller passordet er feil.',
  backup_error_unsupported_version: 'Ustøttet backupversjon.',
  backup_error_v3_requires_https: 'Denne backupen bruker sterk kryptering (v3) som krever en sikker HTTPS-tilkobling.',
  backup_hint_passphrase_strength: 'Tips: bland store og små bokstaver, tall og symboler for et sterkere passord.'
};

const resources = {
  en: { translation: en },
  no: { translation: no }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: resolveInitialLanguage(),
    fallbackLng: 'en',
    supportedLngs: ['en', 'no'],
    nonExplicitSupportedLngs: true,
    load: 'languageOnly',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
