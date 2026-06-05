export type OfflineSnapshotSource = 'live' | 'cache' | 'static';

export type OfflineFeedSnapshot<TItem> = {
  fetchedAt: string;
  cachedAt?: number;
  items: TItem[];
  partialFailures: string[];
  source: OfflineSnapshotSource;
};

export type OfflineCriticality = 'high' | 'medium' | 'low';

export type ContentPackTier =
  | 'Essential Preparedness'
  | 'Norway Hazards'
  | 'Medical And First Aid'
  | 'Maps And Shelter Data'
  | 'Privacy And Personal Safety'
  | 'Travel Resilience';

export type ContentItemType =
  | 'manual-topic'
  | 'processed-asset'
  | 'glossary-term'
  | 'editorial-article'
  | 'shelter'
  | 'source-link'
  | 'checklist-item';

export type ContentSourceMetadata = {
  sourceId: string;
  jurisdiction: string;
  language: string[];
  lastVerified: string;
  offlineAvailable: boolean;
  reviewPriority: OfflineCriticality;
};

export type ContentPackAsset = {
  id: string;
  title: string;
  type: ContentItemType;
  pillarId?: string;
  source: ContentSourceMetadata;
  tags: string[];
};

export type ContentPack = {
  id: string;
  title: string;
  tier: ContentPackTier;
  language: string[];
  category: string;
  sourceIds: string[];
  assets: ContentPackAsset[];
  sizeEstimate: string;
  lastVerified: string;
  bundledAt: string;
  optionalModules: string[];
};

export type SearchDocument = {
  id: string;
  type: ContentItemType | 'content-pack';
  title: string;
  body: string;
  tags: string[];
  pillarId?: string;
  urlHash?: string;
  sourceId?: string;
  language: 'en' | 'no';
  offlineCriticality: OfflineCriticality;
};

export type LocalAiSettings = {
  enabled: boolean;
  baseUrl: string;
  model: string;
  mode: 'disabled' | 'local-openai-compatible';
};

export type VaultDocumentCategory =
  | 'emergency-plan'
  | 'pdf-reference'
  | 'contact-plan'
  | 'medication-list'
  | 'evacuation-note'
  | 'general-note';

export type VaultDocumentAttachment = {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  dataUrl: string;
};

export type VaultDocument = {
  id: string;
  title: string;
  category: VaultDocumentCategory;
  householdMember: string;
  source: string;
  reviewDate: string;
  sensitive: boolean;
  tags: string[];
  note: string;
  attachment?: VaultDocumentAttachment;
  createdAt: number;
  updatedAt: number;
};
