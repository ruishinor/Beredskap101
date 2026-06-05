export type GlossaryItem = {
  term: string;
  termNo: string;
  explanationEn: string;
  explanationNo: string;
};

export const glossaryData: GlossaryItem[] = [
  {
    term: 'DSB',
    termNo: 'DSB',
    explanationEn: 'Norway’s civil protection authority. Publishes preparedness guidance and emergency information.',
    explanationNo: 'Direktoratet for Samfunnssikkerhet og Beredskap; Norges myndighet for samfunnssikkerhetsarbeid. Publiserer beredskapsråd og kriseinformasjon.'
  },
  {
    term: 'NVE',
    termNo: 'NVE',
    explanationEn: 'Norwegian Water and Energy Authority. Important source for flood, landslide, and power-system information.',
    explanationNo: 'Norges vassdrags- og energidirektorat. Viktig kilde for flom, skred og strømrelatert informasjon.'
  },
  {
    term: 'Sivilforsvaret',
    termNo: 'Sivilforsvaret',
    explanationEn: 'Civil Defence support for crises, warnings, and local emergency preparedness.',
    explanationNo: 'Sivil beredskapsressurs som støtter ved kriser, varsling og lokal beredskap.'
  },
  {
    term: 'to-do list',
    termNo: 'gjøremålsliste',
    explanationEn: 'prosedyrer, situasjonsforståelse, situasjonsbevissthet, tiltakskort, aksjonsplaner, burner telefon, sop, lovverk rundt å redde seg selv (fare for selv, fare for andre..+)',
    explanationNo: 'prosedyrer, situasjonsforståelse, situasjonsbevissthet, tiltakskort, aksjonsplaner, burner telefon, sop, lovverk rundt å redde seg selv (fare for selv, fare for andre..+)'
  },
  {
    term: 'Emergency Alert',
    termNo: 'Nødvarsel',
    explanationEn: 'Emergency alert sent to mobile phones in affected areas.',
    explanationNo: 'Varsel sendt til mobiltelefoner i områder som er berørt av en hendelse.'
  },
  {
    term: 'Risk and Vulnerability Analysis',
    termNo: 'ROS-analyse',
    explanationEn: 'Risk and vulnerability analysis. A structured way to identify what can go wrong and how to prepare.',
    explanationNo: 'Risiko- og sårbarhetsanalyse. En strukturert metode for å finne hva som kan gå galt og hvordan man forbereder seg.'
  },
  {
    term: 'CIM',
    termNo: 'CIM',
    explanationEn: 'A crisis-management tool used by Norwegian organizations to coordinate incident handling.',
    explanationNo: 'Et verktøy for krisehåndtering som brukes i norske virksomheter for koordinering av hendelser.'
  },
  {
    term: 'HLR / CPR',
    termNo: 'HLR / CPR',
    explanationEn: 'Chest compressions and rescue breaths used when a person’s heart has stopped.',
    explanationNo: 'Brystkompresjoner og innblåsninger som brukes når en person har hjertestans.'
  },
  {
    term: 'AED',
    termNo: 'Hjertestarter (AED)',
    explanationEn: 'Automated External Defibrillator. A device that can shock the heart back into rhythm.',
    explanationNo: 'Automatisk hjertestarter. Et apparat som kan gi støt for å gjenopprette hjerterytme.'
  },
  {
    term: 'IFAK',
    termNo: 'Individuelt førstehjelpssett (IFAK)',
    explanationEn: 'Individual First Aid Kit (IFAK) for serious bleeding and trauma.',
    explanationNo: 'Personlig førstehjelpssett for alvorlig blødning og akutte skader.'
  },
  {
    term: 'PWA',
    termNo: 'PWA',
    explanationEn: 'Progressive Web App. A website that can be installed and used more like an app, including offline features.',
    explanationNo: 'Progressive Web App. En nettside som kan installeres og brukes mer som en app, inkludert frakoblet funksjon.'
  },
  {
    term: 'GDPR',
    termNo: 'GDPR',
    explanationEn: 'European privacy law governing how personal data is collected and used.',
    explanationNo: 'Europeisk personvernlov som styrer hvordan personopplysninger samles inn og brukes.'
  }
];
