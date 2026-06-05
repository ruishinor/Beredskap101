/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Optimizes raw asset titles / filenames into descriptive, professional headings.
 * Aligns with the Beredskap101 Title Optimization guidelines.
 * 
 * @param title The raw title from processedAssets.json
 * @param lang The current active language ('en' | 'no')
 * @returns A polished, meaningful title reflecting the subject matter
 */
export function optimizeTitle(title: string, lang: string): string {
  const t = title.toLowerCase();
  const isNo = lang === 'no';

  // Explicit title optimization mappings (high fidelity translations of raw files)
  if (t.includes('10 grunner til at psykologisk trygghet')) {
    return isNo 
      ? '10 grunner til at psykologisk trygghet er kritisk viktig' 
      : '10 Reasons Why Psychological Safety is Critically Important';
  }
  if (t.includes('21 04 19 bt a magasin') || t.includes('kjøpt av kina') || t.includes('kjopt av kina')) {
    return isNo
      ? 'Kinesiske oppkjøp og investeringer i Norge: En kartlegging'
      : 'Chinese Acquisitions and Investments in Norway: An Overview';
  }
  if (t.includes('moderne trusler mot demokratiet') || t.includes('moderne_trusler_mot_demokratiet')) {
    return isNo
      ? 'Moderne trusler mot demokratiet'
      : 'Modern Threats to Democracy';
  }
  if (t.includes('degnepoll') || t.includes('beredskap på deltid') || t.includes('beredskap pa deltid')) {
    return isNo
      ? 'Beredskap på deltid: Heimevernets evne til å håndtere det uforutsette'
      : 'Part-Time Readiness: Home Guard Capacity for the Unforeseen';
  }
  if (t.includes('norsk næringsliv på dypt vann') || t.includes('norsk naringstid pa dypt vann') || t.includes('norsk naering') || t.includes('norsk naringsliv pa dypt vann')) {
    return isNo
      ? 'Norsk næringsliv på dypt vann etter geopolitisk skifte'
      : 'Norwegian Industry in Deep Water After Geopolitical Shift';
  }
  if (t.includes('possible sabotage against the norwegian petroleum sector') || t.includes('possible_sabotage')) {
    return isNo
      ? 'Sabotasjetrusler mot norsk petroleumssektor (NUPI-rapport)'
      : 'Possible Sabotage Against the Norwegian Petroleum Sector (NUPI)';
  }
  if (t.includes('beredskapsplan for hjemmet') || t.includes('beredskapsplan_for_hjemmet')) {
    return isNo
      ? 'Hvordan lage en beredskapsplan for hjemmet: Komplett guide'
      : 'How to Make a Household Emergency Plan: Complete Guide';
  }
  if (t.includes('pets emergency plan') || t.includes('pets_emergency')) {
    return isNo
      ? 'Kjæledyr i beredskap: Evakueringsguide'
      : 'Pets Emergency Plan: Grab & Go Guide';
  }
  if (t.includes('leave early actions')) {
    return isNo
      ? 'Skogbrann evakueringssjekkliste: Forlat tidlig'
      : 'Bushfire Evacuation Checklist: Leave Early Actions';
  }
  if (t.includes('prepare to stay actions')) {
    return isNo
      ? 'Skogbrann beredskapssjekkliste: Forbered deg på å bli'
      : 'Bushfire Preparedness Checklist: Prepare to Stay';
  }
  if (t.includes('stayplan equipment')) {
    return isNo
      ? 'Skogbrann utstyrsliste: Sjekkliste for opphold'
      : 'Bushfire Equipment Checklist: Stayplan Equipment';
  }
  if (t.includes('important items checklist')) {
    return isNo
      ? 'Viktige dokumenter og verdisaker: Beredskapssjekkliste'
      : 'Important Documents & Valuables Emergency Checklist';
  }
  if (t.includes('go bag') || t.includes('beredskapssekk for evakuering')) {
    return isNo
      ? 'Go Bag: Beredskapssekk for rask evakuering'
      : 'Go Bag: Emergency Evacuation Pack Guide';
  }
  if (t.includes('tørrmat') || t.includes('ta,rrmat') || t.includes('na,drasjon') || t.includes('nødrasjon') || t.includes('t\u00f5,rrmat') || t.includes('n\u00f5,drasjon')) {
    return isNo
      ? 'Tørrmat og nødrasjoner: Beredskapstest og sammenligning'
      : 'Dry Food and Emergency Rations: Testing and Comparison';
  }
  if (t.includes('landscape of hybrid threats') || t.includes('landscape_of_hybrid')) {
    return isNo
      ? 'Det hybride trusselbildet: Analyse og landskap'
      : 'The Landscape of Hybrid Threats (Analysis & Concepts)';
  }
  if (t.includes('real life and osint') || t.includes('real_life_and_osint')) {
    return isNo
      ? 'Digitalt fotavtrykk, personvern og OSINT-grunnprinsipper'
      : 'Your Digital Footprint, Privacy, and OSINT Basics';
  }
  if (t.includes('flerdimensjonal labyrint') || t.includes('flerdimensjonal laflerdimensjonal')) {
    return isNo
      ? 'Flerdimensjonal labyrint: Kompleksitetsanalyse for kriser'
      : 'Multidimensional Labyrinth: Crisis Complexity Analysis';
  }
  if (t.includes('norsk beredskap ukr rus') || t.includes('kronikk dyndal')) {
    return isNo
      ? 'Kronikk: Norsk beredskap i lys av Ukraina-Russland-krigen'
      : 'Op-Ed: Norwegian Preparedness in Light of the Ukraine-Russia Conflict';
  }
  if (t.includes('enhancing the effectiveness of work groups')) {
    return isNo
      ? 'Effektive arbeidsgrupper og team under kriser (Kozlowski & Ilgen)'
      : 'Enhancing the Effectiveness of Work Groups and Teams (Kozlowski & Ilgen)';
  }
  if (t.includes('getting to yes') || t.includes('getting_to_yes')) {
    return isNo
      ? 'Getting to Yes: Forhandlingsteknikk uten å gi etter'
      : 'Getting to Yes: Negotiating Agreement Without Giving In';
  }
  if (t.includes('scout mindset') || t.includes('scout_mindset')) {
    return isNo
      ? 'Speidermindset: Hvorfor noen ser ting klart og andre ikke'
      : 'The Scout Mindset: Why Some People See Things Clearly and Others Don\'t';
  }
  if (t.includes('effective individual evacuation plans') || t.includes('evacuation_plans')) {
    return isNo
      ? 'Individuelle evakueringsplaner for personer med nedsatt funksjonsevne'
      : 'Towards Effective Individual Evacuation Plans for Persons with Disabilities';
  }
  if (t.includes('innledende bestemmelser') || t.includes('innledende_bestemmelser')) {
    return isNo
      ? 'Helsedirektoratet: Innledende bestemmelser §§ 1–3'
      : 'Directorate of Health: Introductory Provisions §§ 1–3';
  }
  if (t.includes('sikkerhet og beredskap udir') || t.includes('sikkerhet og beredskap   udir')) {
    return isNo
      ? 'Utdanningsdirektoratet: Sikkerhet og beredskap i skolen'
      : 'Directorate for Education: School Safety and Preparedness';
  }
  if (t.includes('nye råd for bedre beredskap') || t.includes('nye rad for bedre beredskap') || t.includes('nye ra,d') || t.includes('nye r\u00e5d for bedre beredskap')) {
    return isNo
      ? 'Nye råd for egenberedskap i norske virksomheter'
      : 'New Guidelines for Business Continuity and Preparedness';
  }
  if (t.includes('preparedness for effective response') || t.includes('per summary')) {
    return isNo
      ? 'IFRC: Beredskap for effektiv respons (PER-sammendrag)'
      : 'IFRC: Preparedness for Effective Response (PER Summary)';
  }
  if (t.includes('lopeprogram 10 uker') || t.includes('løpeprogram 10 uker')) {
    return isNo
      ? 'Løpeprogram: 10 uker til 10 km (komprimert beredskapstrening)'
      : 'Running Program: 10 Weeks to 10km (Compressed Physical Conditioning)';
  }
  if (t.includes('farm fire plan') || t.includes('farm_fire_plan')) {
    return isNo
      ? 'Brannsikring for landbruksegendommer og gårdsbruk'
      : 'Farm Fire Plan: Get Ready for Fire on Your Property';
  }
  if (t.includes('safety manual edit') || t.includes('trackers safety manual')) {
    return isNo
      ? 'Sikkerhetsveileder for sporere og støttepersonell (Trackers Earth)'
      : 'Safety Manual for Trackers and Support Staff (Trackers Earth)';
  }
  if (t.includes('kode råd') || t.includes('kode ra,d') || t.includes('kode r\u00e5d')) {
    return isNo
      ? 'Koderåd og beredskapstiltak'
      : 'Emergency Response Code Guide';
  }
  if (t.includes('kriseleder kompetanse') || t.includes('kriseleder_kompetanse')) {
    return isNo
      ? 'Kompetansekrav og utdanningsløp for kriseledere'
      : 'Crisis Leader Competency and Certification Standards';
  }
  if (t.includes('mental health act 2017')) {
    return isNo
      ? 'Lov om psykisk helsevern 2017: Veileder'
      : 'Mental Health Act 2017: Guidebook';
  }
  if (t.includes('animal holding establishments')) {
    return isNo
      ? 'Beredskapsplanlegging for dyrehold og dyreparker'
      : 'Planning for Emergencies: Guide for Animal Holding Establishments';
  }
  if (t.includes('country roads tz')) {
    return isNo
      ? 'Trafikksikkerhet på landeveier (Tanzania, IFRC-faktaark)'
      : 'Road Safety Factsheet: Country Roads (Tanzania)';
  }
  if (t.includes('warning road signs')) {
    return isNo
      ? 'Fare- og varselskilt i trafikken: Betydning og reaksjon'
      : 'Warning Road Signs: Identification & Speed Response';
  }
  if (t.includes('anbefaler ikke tiktok') || t.includes('tjenesteenheter')) {
    return isNo
      ? 'Nasjonal sikkerhetsmyndighet: Råd mot TikTok og Telegram på tjenestemobiler'
      : 'NSM Advisory: Ban on TikTok and Telegram for Government Devices';
  }
  if (t.includes('hva får du varsler om') || t.includes('hva far du varsler om') || t.includes('hva f\u00e5r du varsler om')) {
    return isNo
      ? 'Nødvarsel på mobil: Hvilke situasjoner varsles det om?'
      : 'Emergency Mobile Alerts: What Situations Trigger Warnings?';
  }
  if (t.includes('hvem kan få varsler') || t.includes('hvem kan fa varsler') || t.includes('hvem kan f\u00e5 varsler')) {
    return isNo
      ? 'Mottakere av Nødvarsel: Hvem får varslene på mobilen?'
      : 'Emergency Mobile Alerts: Who Receives the Warning?';
  }
  if (t.includes('myfireplan') || t.includes('how fireproof is your plan')) {
    return isNo
      ? 'MyFirePlan: Er beredskapsplanen din brannsikker?'
      : 'MyFirePlan: How Fireproof is Your Plan?';
  }
  if (t.includes('naturhendelser kart')) {
    return isNo
      ? 'Historiske flomkart og innsikt i naturhendelser'
      : 'Historical Flood Maps and Disaster Analytics';
  }
  if (t.includes('kaleb excerpts')) {
    return isNo
      ? 'Utdrag og erfaringer: Feltkurs i overlevelse'
      : 'Survival Skills Excerpts & Notes (Kaleb)';
  }

  // ==========================================
  // New Egensikkerhet & Egenberedskap mappings
  // ==========================================
  if (t.includes('aktuelle tiltak mot radikalisering')) {
    return isNo ? 'Regjeringen: Aktuelle tiltak mot radikalisering' : 'Government: Current Measures Against Radicalization';
  }
  if (t.includes('barnehagemiljø') || t.includes('barnehagemilj')) {
    return isNo ? 'Utdanningsdirektoratet: Trygt barnehagemiljø' : 'Directorate for Education: Safe Kindergarten Environment';
  }
  if (t.includes('begreper, ord og uttrykk')) {
    return isNo ? 'Ordliste: Arbeidet mot radikalisering' : 'Glossary: Anti-Radicalization Terms';
  }
  if (t.includes('billås') || t.includes('billas') || t.includes('fjernstyrt lås')) {
    return isNo ? 'Egensikkerhet: Vurdering av fjernstyrt billås' : 'Personal Safety: Risk Assessment of Remote Car Locking';
  }
  if (t.includes('minibank')) {
    return isNo ? 'Egensikkerhet: Trygg bruk av minibank' : 'Personal Safety: Safe ATM Transactions';
  }
  if (t.includes('situasjonsbevissthet')) {
    return isNo ? 'Egensikkerhet: Grunnleggende situasjonsbevissthet' : 'Personal Safety: Fundamentals of Situational Awareness';
  }
  if (t.includes('tinder')) {
    return isNo ? 'Egensikkerhet: Sikkerhet ved nettdating (Tinder)' : 'Personal Safety: Safe Online Dating (Tinder)';
  }
  if (t.includes('egensikkerhet.txt') || t.includes('egensikkerhet: introduksjon') || t === 'egensikkerhet') {
    return isNo ? 'Egensikkerhet: Grunnleggende prinsipper' : 'Personal Safety: Core Principles';
  }
  if (t.includes('team resilience') || t.includes('teamresiliens')) {
    return isNo ? 'Akademisk: Teamresiliens under kriser' : 'Academic: Team Resilience Under Crisis';
  }
  if (t.includes('hva gjør du hvis du er bekymret') || t.includes('hva gjor du hvis du er bekymret')) {
    return isNo ? 'Veileder: Hva gjør du ved bekymring for radikalisering?' : 'Guide: What to Do if Concerned About Radicalization';
  }
  if (t.includes('internett og radikalisering')) {
    return isNo ? 'Analyse: Internett og radikalisering' : 'Analysis: The Internet and Radicalization';
  }
  if (t.includes('nasjonal veileder for forebygging') || t.includes('nasjonal-veileder-for-forebygging')) {
    return isNo ? 'Nasjonal veileder: Forebygging av ekstremisme' : 'National Guide: Preventing Violent Extremism';
  }
  if (t.includes('råd mot terrorhandlinger') || t.includes('rad mot terrorhandlinger')) {
    return isNo ? 'NSM: Råd og egenbeskyttelse mot terror' : 'NSM Advisory: Personal Protection Against Terror';
  }
  if (t.includes('samtaleverktøy') || t.includes('samtaleverktoy')) {
    return isNo ? 'Samtaleverktøy: Dialog ved bekymring' : 'Dialogue Tool: Discussing Radicalization Concerns';
  }
  if (t.includes('skolemiljø') || t.includes('skolemiljo')) {
    return isNo ? 'Utdanningsdirektoratet: Trygt skolemiljø' : 'Directorate for Education: Safe School Environment';
  }
  if (t.includes('tiltakskort for handling')) {
    return isNo ? 'Tiltakskort: Bekymring for et barn (Udir)' : 'Action Card: Concerns for a Child (Udir)';
  }
  if (t.includes('varsling ved bekymring')) {
    return isNo ? 'Varslingsrutiner: Bekymring for terrorplanlegging' : 'Reporting Procedures: Terrorist Planning Concerns';
  }
  if (t.includes('vulnerable people')) {
    return isNo ? 'Akademisk: Sårbare grupper i samfunnet' : 'Academic: Vulnerable Groups in Society';
  }
  if (t.includes('spilleregler for en gruppe')) {
    return isNo ? 'Gruppeledelse: Spilleregler for teams' : 'Group Dynamics: Team Rules and Guidelines';
  }
  if (t.includes('tilstedeværelse i rommet') || t.includes('tilstedevrelse i rommet')) {
    return isNo ? 'Kommunikasjon: Sikre tilstedeværelse i rommet' : 'Communication: Ensuring Presence in the Room';
  }

  // Egenberedskap mappings
  if (t.includes('beredskapskasse')) {
    return isNo ? 'Beredskapskasse: Komplett innholdsliste (2026)' : 'Emergency Kit: Complete Contents List (2026)';
  }
  if (t.includes('beredskapslager')) {
    return isNo ? 'Beredskapslager: Sjekkliste og ferdig-pakkede løsninger' : 'Emergency Storage: Checklist and Pre-packed Solutions';
  }
  if (t.includes('beredskapsmat')) {
    return isNo ? 'Beredskapsmat: Nødrasjoner og lagringstips' : 'Emergency Food: Rations and Storage Tips';
  }
  if (t.includes('30 fot regel') || t.includes('30-fots regelen')) {
    return isNo ? 'Egenberedskap: 30-fots regelen for nødutstyr' : 'Household Preparedness: The 30-Foot Rule for Emergency Gear';
  }
  if (t.includes('ekstra drivstoff')) {
    return isNo ? 'Egenberedskap: Trygg lagring av drivstoff' : 'Household Preparedness: Safe Storage of Extra Fuel';
  }
  if (t.includes('garasjeport')) {
    return isNo ? 'Egenberedskap: Manuell åpning av garasjeport' : 'Household Preparedness: Manual Garage Door Release';
  }
  if (t.includes('wifi router') || t.includes('router')) {
    return isNo ? 'Egenberedskap: Sikring av WiFi-router' : 'Household Preparedness: Securing WiFi Routers';
  }
  if (t.includes('kameraovervåkning') || t.includes('kameraovervakning')) {
    return isNo ? 'Egenberedskap: Kameraovervåkning og områdesikring' : 'Household Preparedness: Camera Surveillance';
  }
  if (t.includes('flyalarmen')) {
    return isNo ? 'Sivilforsvaret: Flyalarmen – hva betyr signalene?' : 'Civil Defense: Air Raid Siren Interpretations';
  }
  if (t.includes('jodtabletter')) {
    return isNo ? 'DSA: Jodtabletter ved atomulykker' : 'DSA: Iodine Tablets for Nuclear Emergencies';
  }
  if (t.includes('flom og skred')) {
    return isNo ? 'NVE: Kommuneguide for flom og skred' : 'NVE: Municipal Guide for Flood and Landslide Prevention';
  }
  if (t.includes('vannlagring') || t.includes('lagring av vann')) {
    return isNo ? 'Vannlagring: 7 enkle huskeregler' : 'Water Storage: 7 Simple Rules for Safe Drinking Water';
  }
  if (t.includes('overvann')) {
    return isNo ? 'NVE: Håndtering og forebygging av overvann' : 'NVE: Stormwater Runoff Management';
  }
  if (t.includes('mobiltelefonen under lupen')) {
    return isNo ? 'Sikkerhet: Skjulte risikoer ved mobiltelefoner' : 'Security: Mobile Phone Hidden Risks';
  }
  if (t.includes('fjellskred')) {
    return isNo ? 'NVE: Nasjonal beredskapsplan for fjellskred' : 'NVE: National Emergency Plan for Rockslides';
  }
  if (t.includes('naturskadar') || t.includes('naturskader')) {
    return isNo ? 'Politiet: Håndtering av naturskader' : 'Police: Natural Disasters Management';
  }
  if (t.includes('skoleskyting')) {
    return isNo ? 'Rapport: Risikoanalyse av skoleskyting (Nordland)' : 'Report: School Shooting Risk Analysis (Nordland)';
  }
  if (t.includes('tilfluktsrom')) {
    return isNo ? 'Beredskap: Kart over tilfluktsrom i Norge' : 'Preparedness: Maps of Air Raid Shelters in Norway';
  }
  if (t.includes('tilskudd til sikringstiltak')) {
    return isNo ? 'Politiet: Søk tilskudd til fysiske sikringstiltak' : 'Police: Applying for Grants for Physical Security';
  }
  if (t.includes('personellfravær') || t.includes('personellfravr')) {
    return isNo ? 'DSB: Kontinuitetsplanlegging ved personellfravær' : 'DSB: Continuity Planning for Personnel Absenteeism';
  }
  if (t.includes('samfunnssikkerhet i ein fragmentert stat') || t.includes('samfunnssikkerhet i ein fragmentert')) {
    return isNo ? 'Analyse: Beredskap i en fragmentert stat' : 'Analysis: Preparedness in a Fragmented State';
  }

  // Role Profile Mappings
  if (t.includes('rolleprofil:')) {
    const roleNo = title.split(':')[1]?.trim() || '';
    if (!isNo) {
      const roleEn = roleNo
        .replace('Beredskapsrådgiver', 'Emergency Preparedness Advisor')
        .replace('Personellsikkerhet', 'Personnel Security Specialist')
        .replace('Etterretningsrådgiver', 'Intelligence Advisor')
        .replace('Kriseoperatør', 'Crisis Coordinator')
        .replace('Senior Rådgiver', 'Senior Policy Advisor')
        .replace('Etterretningsanalytiker', 'Intelligence Analyst')
        .replace('Lederstøtte', 'Leader Support')
        .replace('Romkoordinator', 'Space Coordinator')
        .replace('Sikkerhetsrådgiver', 'Security Advisor')
        .replace('Etterretningsoffiser', 'Intelligence Officer')
        .replace('KOSS-Koordinator', 'KOSS Coordinator')
        .replace('Mottiltak mot terrorisme', 'Counter-Terror Advisor')
        .replace('Forsker og analytiker', 'Researcher and Analyst')
        .replace('Distriktsrådgiver', 'District Advisor')
        .replace('Fysisk Sikkerhetsrådgiver', 'Physical Security Advisor')
        .replace('Etterretningsstab', 'Intelligence Staff');
      return `Role Profile: ${roleEn}`;
    }
    return `Rolleprofil: ${roleNo}`;
  }

  // ==========================================
  // General heuristic cleaning fallback
  // ==========================================
  let cleaned = title;
  
  // Fix general Norwegian encoding bugs in fallback
  cleaned = cleaned
    .replace(/FAr/g, 'Får')
    .replace(/fAr/g, 'får')
    .replace(/FA/g, 'Få')
    .replace(/fA/g, 'få')
    .replace(/TA,rrmat/g, 'Tørrmat')
    .replace(/tA,rrmat/g, 'tørrmat')
    .replace(/NA,drasjon/g, 'Nødrasjon')
    .replace(/nA,drasjon/g, 'nødrasjon')
    .replace(/ufA,resette/g, 'uforutsette')
    .replace(/PA/g, 'På')
    .replace(/pA/g, 'på')
    .replace(/RA,d/g, 'Råd')
    .replace(/rA,d/g, 'råd')
    .replace(/[\?\uFFFD]/g, '');

  // Strip file extensions and artifact strings
  cleaned = cleaned
    .replace(/\.(pdf|html|txt|odt|lnk)$/i, '')
    .replace(/\s+(files|shortcut|copy(\s+\(\d+\))?)$/i, '')
    .replace(/[\-_]/g, ' ') // replace dashes and underscores with spaces
    .replace(/\s+/g, ' ') // replace multiple spaces with single space
    .trim();

  // Clean trailing file junk
  if (cleaned.endsWith(' Pdf')) cleaned = cleaned.substring(0, cleaned.length - 4);
  if (cleaned.endsWith(' Html')) cleaned = cleaned.substring(0, cleaned.length - 5);
  if (cleaned.endsWith(' Txt')) cleaned = cleaned.substring(0, cleaned.length - 4);
  if (cleaned.endsWith(' Lnk')) cleaned = cleaned.substring(0, cleaned.length - 4);
  if (cleaned.endsWith(' Odt')) cleaned = cleaned.substring(0, cleaned.length - 4);
  if (cleaned.endsWith(' Files')) cleaned = cleaned.substring(0, cleaned.length - 6);
  if (cleaned.endsWith(' Shortcut')) cleaned = cleaned.substring(0, cleaned.length - 9);

  return cleaned;
}
