import type { ContentItemType, ContentPack, ContentPackAsset, ContentPackTier, OfflineCriticality, SearchDocument } from '../types/offline';

type TopicLike = {
  id: string;
  title: string;
  shortSummary: string;
  situationContext: string;
  corePrinciple: string;
  procedureSteps: string[];
  warnings: string[];
  relatedTopics: string[];
};

type PillarLike = {
  id: string;
  title: string;
  titleEnglish: string;
  shortDescription: string;
  topics: TopicLike[];
};

type ChecklistItemLike = {
  id: string;
  text: string;
  category: string;
};

type ChecklistGroupLike = {
  id: string;
  title: string;
  items: ChecklistItemLike[];
};

type GlossaryLike = {
  term: string;
  termNo: string;
  explanationEn: string;
  explanationNo: string;
};

type EditorialLike = {
  id: string;
  pillar: string;
  title: string;
  titleNo: string;
  category: string;
  estimatedReadMinutes: number;
  summary: string;
  summaryNo: string;
  keyTakeaways: string[];
  keyTakeawaysNo: string[];
  body: Array<{
    heading: string;
    headingNo: string;
    content: string;
    contentNo: string;
  }>;
  sources: string[];
};

type ProcessedAssetLike = {
  id: string;
  title: string;
  category: string;
  pillarId?: string;
  metadata?: {
    sourceFile?: string;
    fileSizeKb?: number;
  };
  keyElements?: Array<{
    element: string;
    description: string;
  }>;
  article?: {
    overview?: string;
    centralKnowledge?: string[];
    context?: string;
    conclusion?: string;
  };
  checklist?: string[];
  locales?: {
    en?: any;
    no?: any;
  };
};

type ShelterLike = {
  romnr: string;
  plasser: number;
  adresse: string;
};

type SourceRegistryLike = {
  id: string;
  nameEn: string;
  nameNo: string;
  homepageUrl: string;
  summaryEn: string;
  summaryNo: string;
};

type BuildOfflineKnowledgeArtifactsInput = {
  bundledAt?: string;
  lastSourceReview?: string;
  processedAssetsGeneratedAt?: string;
  pillarsEn: PillarLike[];
  pillarsNo: PillarLike[];
  processedAssets: ProcessedAssetLike[];
  checklistsEn: ChecklistGroupLike[];
  checklistsNo: ChecklistGroupLike[];
  glossary: GlossaryLike[];
  editorialArticles: EditorialLike[];
  shelters: ShelterLike[];
  sourceRegistry: SourceRegistryLike[];
};

type PackTemplate = {
  id: string;
  title: string;
  tier: ContentPackTier;
  category: string;
  optionalModules: string[];
};

type SearchDocDraft = Omit<SearchDocument, 'id'> & { docId: string };

const PACK_TEMPLATES: PackTemplate[] = [
  {
    id: 'essential-preparedness',
    title: 'Essential Preparedness',
    tier: 'Essential Preparedness',
    category: 'Household continuity, one-week readiness, and foundational guidance',
    optionalModules: ['Municipal contingency annexes', 'Offline local-AI explainer packs'],
  },
  {
    id: 'norway-hazards',
    title: 'Norway Hazards',
    tier: 'Norway Hazards',
    category: 'Weather, terrain, and civil hazard awareness for Norwegian contexts',
    optionalModules: ['Regional hazard layers', 'Advanced weather modeling notes'],
  },
  {
    id: 'medical-and-first-aid',
    title: 'Medical And First Aid',
    tier: 'Medical And First Aid',
    category: 'Immediate first response, trauma care, and emergency intervention basics',
    optionalModules: ['Printable trauma cards', 'Clinical refresher drills'],
  },
  {
    id: 'maps-and-shelter-data',
    title: 'Maps And Shelter Data',
    tier: 'Maps And Shelter Data',
    category: 'Shelter references, map fallback content, and location guidance',
    optionalModules: ['PMTiles basemap package', 'Offline local points-of-interest overlays'],
  },
  {
    id: 'privacy-and-personal-safety',
    title: 'Privacy And Personal Safety',
    tier: 'Privacy And Personal Safety',
    category: 'Digital hygiene, personal security, and protective decision-making',
    optionalModules: ['Expanded OpSec playbooks', 'High-risk travel communications kit'],
  },
  {
    id: 'travel-resilience',
    title: 'Travel Resilience',
    tier: 'Travel Resilience',
    category: 'Travel risk reduction, route discipline, and continuity while abroad',
    optionalModules: ['Country-specific contingency cards', 'Transit disruption templates'],
  },
];

function dedupe(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

function compactText(parts: Array<string | undefined | null>): string {
  return parts
    .map((part) => (part || '').trim())
    .filter(Boolean)
    .join(' ');
}

function safeDate(value?: string): string {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toISOString().slice(0, 10);
}

function normalizeLookupKey(value?: string): string {
  return (value || '')
    .replace(/\u00C3\u0192\u00C6\u2019\u00C3\u201A\u00C2\u00B8/g, '\u00F8')
    .replace(/\u00C3\u0192\u00C6\u2019\u00C3\u201A\u00C2\u00A6/g, '\u00E6')
    .replace(/\u00C3\u0192\u00C6\u2019\u00C3\u201A\u00C2\u00A5/g, '\u00E5')
    .replace(/\u00C3\u0192\u00C2\u00B8/g, '\u00F8')
    .replace(/\u00C3\u0192\u00C2\u00A6/g, '\u00E6')
    .replace(/\u00C3\u0192\u00C2\u00A5/g, '\u00E5')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\u00F8/g, 'o')
    .replace(/\u00E6/g, 'ae')
    .replace(/\u00E5/g, 'a')
    .toLowerCase();
}

function cleanPillarId(value?: string): string {
  return normalizeLookupKey(value);
}

function inferPackIdFromPillar(pillarId?: string): string {
  const key = cleanPillarId(pillarId);
  if (key.includes('reise')) return 'travel-resilience';
  if (key.includes('personvern') || key.includes('egensikker')) return 'privacy-and-personal-safety';
  if (key.includes('friluft')) return 'norway-hazards';
  if (key.includes('forstehjelp')) return 'medical-and-first-aid';
  if (key.includes('egenberedskap')) return 'essential-preparedness';
  return 'essential-preparedness';
}

function inferPackIdFromText(value: string): string {
  const haystack = normalizeLookupKey(value);
  if (
    haystack.includes('tilfluktsrom') ||
    haystack.includes('shelter') ||
    haystack.includes('kart') ||
    haystack.includes('map')
  ) {
    return 'maps-and-shelter-data';
  }
  if (
    haystack.includes('forstehjelp') ||
    haystack.includes('first aid') ||
    haystack.includes('trauma') ||
    haystack.includes('hlr') ||
    haystack.includes('aed')
  ) {
    return 'medical-and-first-aid';
  }
  if (
    haystack.includes('personvern') ||
    haystack.includes('privacy') ||
    haystack.includes('sikkerhet') ||
    haystack.includes('safety')
  ) {
    return 'privacy-and-personal-safety';
  }
  if (
    haystack.includes('reise') ||
    haystack.includes('travel') ||
    haystack.includes('passport') ||
    haystack.includes('border')
  ) {
    return 'travel-resilience';
  }
  if (
    haystack.includes('nve') ||
    haystack.includes('met') ||
    haystack.includes('hazard') ||
    haystack.includes('flood') ||
    haystack.includes('storm')
  ) {
    return 'norway-hazards';
  }
  return 'essential-preparedness';
}

function reviewPriorityForType(type: ContentItemType | 'content-pack'): OfflineCriticality {
  if (type === 'manual-topic' || type === 'checklist-item' || type === 'shelter') return 'high';
  if (type === 'content-pack') return 'low';
  return 'medium';
}

function estimateSize(assets: ContentPackAsset[]): string {
  const approxBytes = assets.reduce((total, asset) => {
    return total + asset.title.length * 2 + asset.tags.join(' ').length + 280;
  }, 0);
  const kb = approxBytes / 1024;
  if (kb >= 1024) return `${(kb / 1024).toFixed(2)} MB metadata`;
  return `${kb.toFixed(1)} KB metadata`;
}

function buildPackAssets(input: BuildOfflineKnowledgeArtifactsInput): Record<string, ContentPackAsset[]> {
  const assetsByPack: Record<string, ContentPackAsset[]> = {};
  for (const template of PACK_TEMPLATES) {
    assetsByPack[template.id] = [];
  }

  const sourceReview = safeDate(input.lastSourceReview);
  // Generation/bundling dates are not evidence that content was reviewed.
  const processedAssetReview = sourceReview;

  for (const pillar of input.pillarsEn) {
    const packId = inferPackIdFromPillar(pillar.id);
    for (const topic of pillar.topics) {
      assetsByPack[packId].push({
        id: `topic-${topic.id}`,
        title: topic.title,
        type: 'manual-topic',
        pillarId: pillar.id,
        tags: dedupe([pillar.title, topic.id, 'guide', 'manual']),
        source: {
          sourceId: 'beredskap101-manual',
          jurisdiction: 'NO',
          language: ['en', 'no'],
          lastVerified: sourceReview,
          offlineAvailable: true,
          reviewPriority: 'high',
        },
      });
    }
  }

  for (const asset of input.processedAssets) {
    const packId = inferPackIdFromPillar(asset.pillarId);
    assetsByPack[packId].push({
      id: `asset-${asset.id}`,
      title: asset.title,
      type: 'processed-asset',
      pillarId: asset.pillarId,
      tags: dedupe([asset.category, asset.pillarId || '', 'reference', 'library']),
      source: {
        sourceId: 'processed-assets',
        jurisdiction: 'NO + International references',
        language: ['en', 'no'],
        lastVerified: processedAssetReview,
        offlineAvailable: true,
        reviewPriority: 'medium',
      },
    });
  }

  for (const group of input.checklistsEn) {
    const packId = inferPackIdFromText(group.title);
    for (const item of group.items) {
      assetsByPack[packId].push({
        id: `checklist-${group.id}-${item.id}`,
        title: `${group.title}: ${item.text}`,
        type: 'checklist-item',
        tags: dedupe([group.id, item.category, 'checklist']),
        source: {
          sourceId: 'beredskap101-checklists',
          jurisdiction: 'NO',
          language: ['en', 'no'],
          lastVerified: sourceReview,
          offlineAvailable: true,
          reviewPriority: 'high',
        },
      });
    }
  }

  for (const entry of input.glossary) {
    const packId = inferPackIdFromText(`${entry.term} ${entry.termNo} ${entry.explanationEn} ${entry.explanationNo}`);
    assetsByPack[packId].push({
      id: `glossary-${entry.term.toLowerCase().replace(/\s+/g, '-')}`,
      title: `${entry.term} / ${entry.termNo}`,
      type: 'glossary-term',
      tags: dedupe(['glossary', entry.term, entry.termNo]),
      source: {
        sourceId: 'beredskap101-glossary',
        jurisdiction: 'NO',
        language: ['en', 'no'],
        lastVerified: sourceReview,
        offlineAvailable: true,
        reviewPriority: 'medium',
      },
    });
  }

  for (const article of input.editorialArticles) {
    const packId = inferPackIdFromPillar(article.pillar);
    assetsByPack[packId].push({
      id: `editorial-${article.id}`,
      title: article.title,
      type: 'editorial-article',
      pillarId: article.pillar,
      tags: dedupe([article.category, article.pillar, 'editorial']),
      source: {
        sourceId: 'beredskap101-editorial',
        jurisdiction: 'NO + International references',
        language: ['en', 'no'],
        lastVerified: sourceReview,
        offlineAvailable: true,
        reviewPriority: 'medium',
      },
    });
  }

  for (const shelter of input.shelters) {
    assetsByPack['maps-and-shelter-data'].push({
      id: `shelter-${shelter.romnr}`,
      title: `${shelter.adresse} (#${shelter.romnr})`,
      type: 'shelter',
      tags: ['tilfluktsrom', 'shelter', shelter.romnr],
      source: {
        sourceId: 'dsb-geonorge-shelters',
        jurisdiction: 'NO',
        language: ['no', 'en'],
        lastVerified: sourceReview,
        offlineAvailable: true,
        reviewPriority: 'high',
      },
    });
  }

  for (const source of input.sourceRegistry) {
    const packId = inferPackIdFromText(`${source.nameEn} ${source.nameNo} ${source.summaryEn} ${source.summaryNo}`);
    assetsByPack[packId].push({
      id: `source-${source.id}`,
      title: source.nameEn,
      type: 'source-link',
      tags: dedupe([source.id, source.nameEn, source.nameNo, 'official-source']),
      source: {
        sourceId: source.id,
        jurisdiction: 'NO',
        language: ['en', 'no'],
        lastVerified: sourceReview,
        offlineAvailable: true,
        reviewPriority: 'medium',
      },
    });
  }

  return assetsByPack;
}

function buildContentPacks(input: BuildOfflineKnowledgeArtifactsInput): ContentPack[] {
  const bundledAt = safeDate(input.bundledAt);
  const sourceReview = safeDate(input.lastSourceReview);
  const assetsByPack = buildPackAssets(input);

  return PACK_TEMPLATES.map((template) => {
    const assets = assetsByPack[template.id] || [];
    const sourceIds = dedupe(assets.map((asset) => asset.source.sourceId));
    // A pack is not fully reviewed merely because one of its assets is.
    const reviewDates = assets.map((asset) => asset.source.lastVerified);
    const lastVerified = reviewDates.length && reviewDates.every(Boolean) ? reviewDates.sort()[0] : sourceReview;
    return {
      id: template.id,
      title: template.title,
      tier: template.tier,
      language: ['en', 'no'],
      category: template.category,
      sourceIds,
      assets,
      sizeEstimate: estimateSize(assets),
      lastVerified,
      bundledAt,
      optionalModules: template.optionalModules,
    };
  });
}

function addDraft(
  drafts: SearchDocDraft[],
  docId: string,
  language: 'en' | 'no',
  type: SearchDocument['type'],
  title: string,
  body: string,
  tags: string[],
  options: {
    pillarId?: string;
    urlHash?: string;
    sourceId?: string;
    offlineCriticality?: OfflineCriticality;
  } = {}
) {
  drafts.push({
    docId,
    language,
    type,
    title,
    body,
    tags: dedupe(tags),
    pillarId: options.pillarId,
    urlHash: options.urlHash,
    sourceId: options.sourceId,
    offlineCriticality: options.offlineCriticality || reviewPriorityForType(type),
  });
}

function buildSearchDocuments(input: BuildOfflineKnowledgeArtifactsInput, packs: ContentPack[]): SearchDocument[] {
  const drafts: SearchDocDraft[] = [];

  for (let i = 0; i < input.pillarsEn.length; i += 1) {
    const pillarEn = input.pillarsEn[i];
    const pillarNo = input.pillarsNo[i];
    for (let j = 0; j < pillarEn.topics.length; j += 1) {
      const topicEn = pillarEn.topics[j];
      const topicNo = pillarNo?.topics?.[j];
      addDraft(
        drafts,
        `manual-${topicEn.id}`,
        'en',
        'manual-topic',
        topicEn.title,
        compactText([
          topicEn.shortSummary,
          topicEn.situationContext,
          topicEn.corePrinciple,
          topicEn.procedureSteps.join(' '),
          topicEn.warnings.join(' '),
          topicEn.relatedTopics.join(' '),
        ]),
        [pillarEn.title, pillarEn.id, topicEn.id, 'manual', 'guide'],
        {
          pillarId: pillarEn.id,
          urlHash: 'knowledge',
          sourceId: 'beredskap101-manual',
          offlineCriticality: 'high',
        }
      );

      addDraft(
        drafts,
        `manual-${topicEn.id}`,
        'no',
        'manual-topic',
        topicNo?.title || topicEn.title,
        compactText([
          topicNo?.shortSummary || topicEn.shortSummary,
          topicNo?.situationContext || topicEn.situationContext,
          topicNo?.corePrinciple || topicEn.corePrinciple,
          (topicNo?.procedureSteps || topicEn.procedureSteps).join(' '),
          (topicNo?.warnings || topicEn.warnings).join(' '),
          (topicNo?.relatedTopics || topicEn.relatedTopics).join(' '),
        ]),
        [pillarNo?.title || pillarEn.title, pillarEn.id, topicEn.id, 'manual', 'guide'],
        {
          pillarId: pillarEn.id,
          urlHash: 'knowledge',
          sourceId: 'beredskap101-manual',
          offlineCriticality: 'high',
        }
      );
    }
  }

  for (const asset of input.processedAssets) {
    const en = asset.locales?.en || {};
    const no = asset.locales?.no || en;

    addDraft(
      drafts,
      `asset-${asset.id}`,
      'en',
      'processed-asset',
      en.title || asset.title,
      compactText([
        en.category || asset.category,
        en.article?.overview || asset.article?.overview,
        (en.article?.centralKnowledge || asset.article?.centralKnowledge || []).join(' '),
        (en.checklist || asset.checklist || []).join(' '),
        (en.keyElements || asset.keyElements || [])
          .map((entry: any) => `${entry.element || ''} ${entry.description || ''}`)
          .join(' '),
      ]),
      [en.category || asset.category, asset.pillarId || '', 'reference-library', 'offline'],
      {
        pillarId: asset.pillarId,
        urlHash: 'reference-library',
        sourceId: 'processed-assets',
      }
    );

    addDraft(
      drafts,
      `asset-${asset.id}`,
      'no',
      'processed-asset',
      no.title || en.title || asset.title,
      compactText([
        no.category || en.category || asset.category,
        no.article?.overview || en.article?.overview || asset.article?.overview,
        (no.article?.centralKnowledge || en.article?.centralKnowledge || asset.article?.centralKnowledge || []).join(' '),
        (no.checklist || en.checklist || asset.checklist || []).join(' '),
        (no.keyElements || en.keyElements || asset.keyElements || [])
          .map((entry: any) => `${entry.element || ''} ${entry.description || ''}`)
          .join(' '),
      ]),
      [no.category || en.category || asset.category, asset.pillarId || '', 'referanse', 'offline'],
      {
        pillarId: asset.pillarId,
        urlHash: 'reference-library',
        sourceId: 'processed-assets',
      }
    );
  }

  for (let i = 0; i < input.checklistsEn.length; i += 1) {
    const groupEn = input.checklistsEn[i];
    const groupNo = input.checklistsNo[i];
    for (let j = 0; j < groupEn.items.length; j += 1) {
      const itemEn = groupEn.items[j];
      const itemNo = groupNo?.items?.[j];
      addDraft(
        drafts,
        `checklist-${groupEn.id}-${itemEn.id}`,
        'en',
        'checklist-item',
        `${groupEn.title}: ${itemEn.text}`,
        compactText([itemEn.text, groupEn.title, itemEn.category]),
        [groupEn.id, itemEn.category, 'checklist'],
        {
          urlHash: 'checklists',
          sourceId: 'beredskap101-checklists',
          offlineCriticality: 'high',
        }
      );
      addDraft(
        drafts,
        `checklist-${groupEn.id}-${itemEn.id}`,
        'no',
        'checklist-item',
        `${groupNo?.title || groupEn.title}: ${itemNo?.text || itemEn.text}`,
        compactText([itemNo?.text || itemEn.text, groupNo?.title || groupEn.title, itemNo?.category || itemEn.category]),
        [groupEn.id, itemNo?.category || itemEn.category, 'sjekkliste'],
        {
          urlHash: 'checklists',
          sourceId: 'beredskap101-checklists',
          offlineCriticality: 'high',
        }
      );
    }
  }

  for (const item of input.glossary) {
    const slug = item.term.toLowerCase().replace(/\s+/g, '-');
    addDraft(
      drafts,
      `glossary-${slug}`,
      'en',
      'glossary-term',
      item.term,
      compactText([item.explanationEn, item.termNo, item.explanationNo]),
      ['glossary', item.term, item.termNo],
      {
        urlHash: 'glossary',
        sourceId: 'beredskap101-glossary',
      }
    );
    addDraft(
      drafts,
      `glossary-${slug}`,
      'no',
      'glossary-term',
      item.termNo,
      compactText([item.explanationNo, item.term, item.explanationEn]),
      ['begrepsliste', item.term, item.termNo],
      {
        urlHash: 'glossary',
        sourceId: 'beredskap101-glossary',
      }
    );
  }

  for (const article of input.editorialArticles) {
    addDraft(
      drafts,
      `editorial-${article.id}`,
      'en',
      'editorial-article',
      article.title,
      compactText([
        article.category,
        article.summary,
        article.keyTakeaways.join(' '),
        article.body.map((section) => `${section.heading} ${section.content}`).join(' '),
        article.sources.join(' '),
      ]),
      [article.category, article.pillar, 'editorial', 'article'],
      {
        pillarId: article.pillar,
        urlHash: 'library',
        sourceId: 'beredskap101-editorial',
      }
    );
    addDraft(
      drafts,
      `editorial-${article.id}`,
      'no',
      'editorial-article',
      article.titleNo,
      compactText([
        article.category,
        article.summaryNo,
        article.keyTakeawaysNo.join(' '),
        article.body.map((section) => `${section.headingNo} ${section.contentNo}`).join(' '),
        article.sources.join(' '),
      ]),
      [article.category, article.pillar, 'artikkel', 'fordypning'],
      {
        pillarId: article.pillar,
        urlHash: 'library',
        sourceId: 'beredskap101-editorial',
      }
    );
  }

  for (const shelter of input.shelters) {
    addDraft(
      drafts,
      `shelter-${shelter.romnr}`,
      'en',
      'shelter',
      `${shelter.adresse} (#${shelter.romnr})`,
      compactText([
        shelter.adresse,
        `shelter ${shelter.romnr}`,
        `capacity ${shelter.plasser}`,
        'public emergency shelter norway',
      ]),
      ['shelter', 'tilfluktsrom', shelter.romnr],
      {
        urlHash: 'shelters',
        sourceId: 'dsb-geonorge-shelters',
        offlineCriticality: 'high',
      }
    );
    addDraft(
      drafts,
      `shelter-${shelter.romnr}`,
      'no',
      'shelter',
      `${shelter.adresse} (#${shelter.romnr})`,
      compactText([
        shelter.adresse,
        `tilfluktsrom ${shelter.romnr}`,
        `plasser ${shelter.plasser}`,
        'offentlig tilfluktsrom norge',
      ]),
      ['tilfluktsrom', 'shelter', shelter.romnr],
      {
        urlHash: 'shelters',
        sourceId: 'dsb-geonorge-shelters',
        offlineCriticality: 'high',
      }
    );
  }

  for (const source of input.sourceRegistry) {
    addDraft(
      drafts,
      `source-${source.id}`,
      'en',
      'source-link',
      source.nameEn,
      compactText([source.summaryEn, source.homepageUrl, source.nameNo]),
      [source.id, 'official-source', 'live-feed-reference'],
      {
        urlHash: 'knowledge',
        sourceId: source.id,
      }
    );
    addDraft(
      drafts,
      `source-${source.id}`,
      'no',
      'source-link',
      source.nameNo,
      compactText([source.summaryNo, source.homepageUrl, source.nameEn]),
      [source.id, 'offisiell-kilde', 'live-feed-reference'],
      {
        urlHash: 'knowledge',
        sourceId: source.id,
      }
    );
  }

  for (const pack of packs) {
    const typeCounts = Object.entries(
      pack.assets.reduce<Record<string, number>>((acc, asset) => {
        acc[asset.type] = (acc[asset.type] || 0) + 1;
        return acc;
      }, {})
    )
      .map(([type, count]) => `${type}: ${count}`)
      .join(', ');

    addDraft(
      drafts,
      `pack-${pack.id}`,
      'en',
      'content-pack',
      pack.title,
      compactText([
        pack.category,
        `Bundled at ${pack.bundledAt}`,
        pack.lastVerified ? `Last source review ${pack.lastVerified}` : 'Source review not documented',
        `Assets ${pack.assets.length}`,
        typeCounts,
        pack.optionalModules.join(' '),
      ]),
      ['content-pack', pack.tier, ...pack.sourceIds],
      {
        urlHash: 'reference-library',
        sourceId: 'content-pack',
        offlineCriticality: 'low',
      }
    );

    addDraft(
      drafts,
      `pack-${pack.id}`,
      'no',
      'content-pack',
      pack.title,
      compactText([
        pack.category,
        `Bundlet ${pack.bundledAt}`,
        pack.lastVerified ? `Siste kildegjennomgang ${pack.lastVerified}` : 'Kildegjennomgang er ikke dokumentert',
        `Innhold ${pack.assets.length}`,
        typeCounts,
        'Live update unavailable offline',
        pack.optionalModules.join(' '),
      ]),
      ['content-pack', pack.tier, ...pack.sourceIds],
      {
        urlHash: 'reference-library',
        sourceId: 'content-pack',
        offlineCriticality: 'low',
      }
    );
  }

  return drafts.map((draft) => ({
    ...draft,
    id: `${draft.docId}:${draft.language}`,
  }));
}

export function buildOfflineKnowledgeArtifacts(input: BuildOfflineKnowledgeArtifactsInput): {
  contentPacks: ContentPack[];
  searchDocuments: SearchDocument[];
} {
  const contentPacks = buildContentPacks(input);
  const searchDocuments = buildSearchDocuments(input, contentPacks);
  return { contentPacks, searchDocuments };
}
