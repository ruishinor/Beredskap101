export function localizeProcessedAsset(asset: any, language: string): any {
  if (!asset || typeof asset !== 'object') return asset;
  const locale = language === 'no' ? 'no' : 'en';
  const localized = asset.locales?.[locale] || asset.locales?.en;
  if (!localized || typeof localized !== 'object') return asset;

  return {
    ...asset,
    title: localized.title ?? asset.title,
    category: localized.category ?? asset.category,
    keyElements: localized.keyElements ?? asset.keyElements ?? [],
    sourceDerivedClaims: localized.sourceDerivedClaims ?? asset.sourceDerivedClaims,
    domainActions: localized.domainActions ?? asset.domainActions,
    validationNotes: localized.validationNotes ?? asset.validationNotes,
    humanReviewStatus: localized.humanReviewStatus ?? asset.humanReviewStatus,
    article: localized.article ?? asset.article,
    stats: localized.stats ?? asset.stats,
    guide: localized.guide ?? asset.guide,
    checklist: localized.checklist ?? asset.checklist,
    protocol: localized.protocol ?? asset.protocol,
    courseModule: localized.courseModule ?? asset.courseModule,
  };
}
