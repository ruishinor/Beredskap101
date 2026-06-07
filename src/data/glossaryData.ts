export type GlossaryItem = {
  term: string;
  termNo: string;
  explanationEn: string;
  explanationNo: string;
};

export const glossaryData: GlossaryItem[] = [
  {
    term: 'Article 17 Erasure',
    termNo: 'Artikkel 17 sletting',
    explanationEn: 'The GDPR right to have personal data deleted when there is no valid reason to keep it.',
    explanationNo: 'GDPR-retten til å få personopplysninger slettet når det ikke lenger finnes gyldig grunn til å beholde dem.',
  },
  {
    term: 'Article 20 Portability',
    termNo: 'Artikkel 20 dataportabilitet',
    explanationEn: 'The GDPR right to receive your data in a usable format and move it elsewhere.',
    explanationNo: 'GDPR-retten til å få ut egne data i et brukbart format og flytte dem til et annet system.',
  },
  {
    term: 'Air-gapped client',
    termNo: 'Klient-side luftgap',
    explanationEn: 'A setup where sensitive work stays on the device and is not automatically sent to cloud services.',
    explanationNo: 'Et oppsett der sensitiv bruk holdes på enheten og ikke automatisk sendes til skytjenester.',
  },
  {
    term: 'CIM',
    termNo: 'CIM',
    explanationEn: 'A crisis-management platform used by many Norwegian organizations for logging, coordination, and incident handling.',
    explanationNo: 'En krisehåndteringsplattform som brukes av mange norske virksomheter til logging, koordinering og hendelseshåndtering.',
  },
  {
    term: 'DAB radio',
    termNo: 'DAB-radio',
    explanationEn: 'Digital radio used in Norway for public information and backup communications during outages.',
    explanationNo: 'Digital radio som brukes i Norge til informasjon og reservekommunikasjon ved bortfall av andre kanaler.',
  },
  {
    term: 'DPIA',
    termNo: 'DPIA',
    explanationEn: 'Data Protection Impact Assessment. A structured privacy-risk review required for higher-risk processing.',
    explanationNo: 'Vurdering av personvernkonsekvenser. En strukturert vurdering av personvernrisiko ved behandling med høyere risiko.',
  },
  {
    term: 'DSB',
    termNo: 'DSB',
    explanationEn: 'The Norwegian Directorate for Civil Protection. Publishes preparedness guidance, warnings, and resilience advice.',
    explanationNo: 'Direktoratet for samfunnssikkerhet og beredskap. Publiserer beredskapsråd, varsler og veiledning om robusthet.',
  },
  {
    term: 'EDC',
    termNo: 'EDC',
    explanationEn: 'Every Day Carry. A compact kit of tools and supplies that can be carried daily for common emergencies.',
    explanationNo: 'Every Day Carry / Hverdagsutstyr. Et kompakt sett med verktøy, utstyr og forbruksmateriell som kan bæres daglig for vanlige nødsituasjoner.',
  },
  {
    term: 'GDPR',
    termNo: 'GDPR',
    explanationEn: 'The EU and EEA privacy regulation that governs how personal data may be collected, stored, and used.',
    explanationNo: 'EU- og EØS-regelverket som styrer hvordan personopplysninger kan samles inn, lagres og brukes.',
  }, 
  {
    term: 'haemostatic',
    termNo: 'hemostatisk',
    explanationEn: 'A substance or material used to stop bleeding by promoting blood clotting.',
    explanationNo: 'Et stoff eller materiale som brukes til å stoppe blødning ved å fremme blodkoagulasjon.',
  },
  {
    term: 'HITL',
    termNo: 'HITL',
    explanationEn: 'Human in the loop. A safeguard where a person reviews or controls higher-risk actions instead of leaving everything to automation.',
    explanationNo: 'Menneskelig innvolvering. Et sikkerhetstiltak der en person vurderer eller styrer handlinger med høyere risiko i stedet for å overlate alt til automasjon.',
  },
  {
    term: 'HLR / CPR',
    termNo: 'HLR / CPR',
    explanationEn: 'Cardiopulmonary resuscitation: chest compressions and rescue breathing used in cardiac arrest.',
    explanationNo: 'Hjerte-lunge-redning: brystkompresjoner og innblåsninger ved hjertestans.',
  },
  {
    term: 'IFAK',
    termNo: 'IFAK',
    explanationEn: 'Individual First Aid Kit. A compact kit for serious bleeding, airway support, and trauma basics.',
    explanationNo: 'Personlig førstehjelpskit for hverdagsbruk. Et kompakt sett for alvorlig blødning, luftveistiltak og grunnleggende traumehjelp.',
  },
  {
    term: 'Local AI runner',
    termNo: 'Lokal KI-kjører',
    explanationEn: 'Software such as Ollama, LM Studio, Jan, or another OpenAI-compatible local server that hosts a model on your own machine.',
    explanationNo: 'Programvare som Ollama, LM Studio, Jan eller en annen OpenAI-kompatibel lokal server som kjører en KI-modell på din egen maskin.',
  },
  {
    term: 'MET alert',
    termNo: 'MET-varsel',
    explanationEn: 'A weather or hazard alert from MET Norway, often used for severe rain, wind, ice, flood, or landslide risk.',
    explanationNo: 'Et vær- eller farevarsel fra MET Norway, ofte brukt ved kraftig nedbør, vind, is, flom eller skredfare.',
  },
  {
    term: 'NVE',
    termNo: 'NVE',
    explanationEn: 'The Norwegian Water Resources and Energy Directorate. Key source for flood, landslide, and energy-system information.',
    explanationNo: 'Norges vassdrags- og energidirektorat. Viktig kilde for informasjon om flom, skred og energisystemer.',
  },
  {
    term: 'Nødvarsel',
    termNo: 'Nødvarsel',
    explanationEn: 'Emergency mobile alert sent to phones in an affected geographic area.',
    explanationNo: 'Nødvarsel sendt til mobiltelefoner i et berørt geografisk område.',
  },
  {
    term: 'OWASP Top 10',
    termNo: 'OWASP Top 10',
    explanationEn: 'A widely used list of common web-application security risks such as injection, broken access control, and XSS.',
    explanationNo: 'En mye brukt oversikt over vanlige sikkerhetsrisikoer i webapplikasjoner, som injeksjon, brutt tilgangskontroll og XSS.',
  },
  {
    term: 'PMTiles',
    termNo: 'PMTiles',
    explanationEn: 'A single-file map package format used to bundle map tiles for offline or low-dependency delivery.',
    explanationNo: 'Et filformat for kartpakker som samler kartfliser i én fil for offline-bruk eller leveranser med få avhengigheter.',
  },
  {
    term: 'PWA',
    termNo: 'PWA',
    explanationEn: 'Progressive Web App. A website that can behave more like an installed app, including offline caching.',
    explanationNo: 'Progressive Web App. En nettside som kan oppføre seg mer som en installert app, inkludert offline-cache.',
  },
  {
    term: 'ROS analysis',
    termNo: 'ROS-analyse',
    explanationEn: 'Risk and vulnerability analysis. A structured review of what can fail, how severe it is, and what mitigations are needed.',
    explanationNo: 'Risiko- og sårbarhetsanalyse. En strukturert gjennomgang av hva som kan svikte, hvor alvorlig det er, og hvilke tiltak som trengs.',
  },
  {
    term: 'Shelter map',
    termNo: 'Tilfluktsromkart',
    explanationEn: 'A map view showing registered public shelters together with a live, bundled offline, or reserve background.',
    explanationNo: 'En kartvisning som viser registrerte offentlige tilfluktsrom sammen med levende, innebygd offline- eller reservebakgrunn.',
  },
  {
    term: 'Sivilforsvaret',
    termNo: 'Sivilforsvaret',
    explanationEn: 'Norway’s civil defence resource for warnings, support tasks, shelter preparation, and local crisis assistance.',
    explanationNo: 'Norges sivilforsvarsressurs for varsling, støtteoppgaver, klargjøring av tilfluktsrom og lokal krisehjelp.',
  },
];
