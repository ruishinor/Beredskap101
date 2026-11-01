import { PillarId } from '../types';

export interface KnowledgePillar {
  id: string; // ASCII UI ID, e.g. 'first-aid-trauma'
  appPillarId: PillarId;
  index: string;
  badge: string;
  badgeNo: string;
  title: string;
  titleNo: string;
  desc: string;
  descNo: string;
  topicsCount: string;
  position: 'top-left' | 'top-right' | 'middle-right' | 'bottom-right' | 'bottom-left' | 'middle-left';
  xOffset: number; // Center-relative coordinate offset for fallback layout
  yOffset: number;
  isUnlocked: boolean; // All pillars are accessible on load; progression is shown as completion, never gating
  progressionOrder: number; // Intended exploration sequence (1..6) as guidance, not a gate
}

export interface DiscoveryStep {
  step: number;
  id: 'core' | 'category' | 'topics' | 'guides' | 'actions';
  label: string;
  labelNo: string;
  sub: string;
  subNo: string;
}

export interface FeatureItemData {
  id: string;
  iconName: 'WifiOff' | 'Zap' | 'Shield' | 'Users';
  title: string;
  titleNo: string;
  desc: string;
  descNo: string;
}

export const knowledgePillars: KnowledgePillar[] = [
  {
    id: 'first-aid-trauma',
    appPillarId: 'førstehjelp',
    index: '01',
    badge: 'Trauma Care',
    badgeNo: 'Førstehjelp',
    title: 'First Aid & Trauma Care',
    titleNo: 'Førstehjelp & traumepleie',
    desc: 'Practical medical guidance designed to save lives.',
    descNo: 'Praktisk førstehjelpskompetanse designet for å redde liv.',
    topicsCount: '12 topics',
    position: 'top-left',
    xOffset: -250,
    yOffset: -150,
    isUnlocked: true,
    progressionOrder: 1,
  },
  {
    id: 'personal-safety',
    appPillarId: 'egensikkerhet',
    index: '02',
    badge: 'Situational Awareness',
    badgeNo: 'Egensikkerhet',
    title: 'Personal Safety',
    titleNo: 'Egensikkerhet & fokus',
    desc: 'Mindset and tools to reduce risk in daily life.',
    descNo: 'Mentale verktøy for å redusere risiko i hverdagen.',
    topicsCount: '10 topics',
    position: 'middle-left',
    xOffset: -250,
    yOffset: 0,
    isUnlocked: true,
    progressionOrder: 2,
  },
  {
    id: 'household-preparedness',
    appPillarId: 'egenberedskap',
    index: '03',
    badge: 'Preparedness',
    badgeNo: 'Beredskap',
    title: 'Household Preparedness',
    titleNo: 'Egenberedskap i hjemmet',
    desc: 'Secure your home, power, water, food and communications.',
    descNo: 'Sikring av hjemmet, strøm, rent vann, mat og samband.',
    topicsCount: '16 topics',
    position: 'bottom-left',
    xOffset: -250,
    yOffset: 150,
    isUnlocked: true,
    progressionOrder: 3,
  },
  {
    id: 'digital-privacy',
    appPillarId: 'personvern',
    index: '04',
    badge: 'Privacy',
    badgeNo: 'Personvern',
    title: 'Digital Privacy',
    titleNo: 'Digitalt personvern',
    desc: 'Protect data, devices and digital footprints.',
    descNo: 'Beskyttelse av personlige data, enheter og spor.',
    topicsCount: '9 topics',
    position: 'top-right',
    xOffset: 250,
    yOffset: -150,
    isUnlocked: true,
    progressionOrder: 4,
  },
  {
    id: 'travel-security',
    appPillarId: 'reisesikkerhet',
    index: '05',
    badge: 'Travel Security',
    badgeNo: 'Reisesikkerhet',
    title: 'Travel Security',
    titleNo: 'Reisesikkerhet & risiko',
    desc: 'Stay safe before, during and after your trip.',
    descNo: 'Trygghet og risikoreduserende tiltak på reise.',
    topicsCount: '11 topics',
    position: 'middle-right',
    xOffset: 250,
    yOffset: 0,
    isUnlocked: true,
    progressionOrder: 5,
  },
  {
    id: 'wilderness-survival',
    appPillarId: 'friluftsliv',
    index: '06',
    badge: 'Bushcraft',
    badgeNo: 'Villmark',
    title: 'Wilderness Survival',
    titleNo: 'Villmark & overlevelse',
    desc: 'Survival skills for harsh environments.',
    descNo: 'Overlevelsesferdigheter for krevende naturmiljøer.',
    topicsCount: '14 topics',
    position: 'bottom-right',
    xOffset: 250,
    yOffset: 150,
    isUnlocked: true,
    progressionOrder: 6,
  },
];

export const discoverySteps: DiscoveryStep[] = [
  {
    step: 1,
    id: 'core',
    label: 'Core',
    labelNo: 'Kjerne',
    sub: 'Start here',
    subNo: 'Start her',
  },
  {
    step: 2,
    id: 'category',
    label: 'Category',
    labelNo: 'Kategori',
    sub: 'Choose a pillar',
    subNo: 'Velg en søyle',
  },
  {
    step: 3,
    id: 'topics',
    label: 'Topics',
    labelNo: 'Temaer',
    sub: 'Explore topics',
    subNo: 'Utforsk emner',
  },
  {
    step: 4,
    id: 'guides',
    label: 'Guides',
    labelNo: 'Guider',
    sub: 'Read & learn',
    subNo: 'Les og lær',
  },
  {
    step: 5,
    id: 'actions',
    label: 'Actions',
    labelNo: 'Handlinger',
    sub: 'Take action',
    subNo: 'Gjør tiltak',
  },
];

export const featureItems: FeatureItemData[] = [
  {
    id: 'offline',
    iconName: 'WifiOff',
    title: 'Offline first',
    titleNo: 'Offline først',
    desc: 'Works without internet',
    descNo: 'Fungerer uten internett',
  },
  {
    id: 'real-life',
    iconName: 'Zap',
    title: 'Built for real life',
    titleNo: 'Utformet for virkeligheten',
    desc: 'Practical. Relevant. Actionable.',
    descNo: 'Praktisk. Relevant. Handlingsbar.',
  },
  {
    id: 'privacy',
    iconName: 'Shield', // Swapped from Eye as requested: "Privacy should use a shield-style icon instead of Eye."
    title: 'Privacy focused',
    titleNo: 'Personvern i fokus',
    desc: 'Your data stays yours.',
    descNo: 'Dine data er dine egne.',
  },
  {
    id: 'community',
    iconName: 'Users',
    title: 'Community & updates',
    titleNo: 'Fellesskap og oppdateringer',
    desc: 'More resilient, together.',
    descNo: 'Mer motstandsdyktige, sammen.',
  },
];
