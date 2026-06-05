/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Editorial Articles
 * High-density, research-backed articles synthesized from primary source material.
 * Sources: B101 1_foerstehjelp and 2_friluftsliv document corpus.
 */

export interface EditorialArticle {
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
  body: ArticleSection[];
  printSummary: PrintSummary;
  sources: string[];
}

export interface ArticleSection {
  heading: string;
  headingNo: string;
  content: string;
  contentNo: string;
}

export interface PrintSummary {
  title: string;
  titleNo: string;
  bullets: string[];
  bulletsNo: string[];
}

export const editorialArticles: EditorialArticle[] = [
  {
    id: 'the-3-minute-window',
    pillar: 'førstehjelp',
    title: 'The 3-Minute Window: Why Bystander Response Saves More Lives Than Ambulances',
    titleNo: '3-minuttersvinduet: Hvorfor tilfeldig forbi redder flere liv enn ambulansen',
    category: 'Emergency Medicine',
    estimatedReadMinutes: 6,
    summary: 'Norwegian and international data confirms that bystander CPR and hemorrhage control in the first 3–5 minutes after cardiac arrest or severe bleeding determines survival outcome — before any emergency service can arrive.',
    summaryNo: 'Norske og internasjonale data bekrefter at HLR og blødningskontroll fra forbipasserende i de første 3–5 minuttene etter hjertestans eller alvorlig blødning avgjør overlevelsesutfallet — lenge før noen nødtjeneste kan ankomme.',
    keyTakeaways: [
      'Annually 3,500 Norwegians suffer cardiac arrest outside hospital; early bystander CPR could save 200 additional lives per year.',
      'A trauma victim with arterial hemorrhage can exsanguinate in 3–5 minutes — faster than median EMS response in most urban areas.',
      'Half of Norwegians surveyed are unsure whether they can perform CPR correctly. 1 in 5 over 50 would wait for the ambulance rather than intervene.',
      'The gap between knowledge and action is bridged by regular, deliberate practice — not by reading guidelines once.',
      'An IFAK (Individual First Aid Kit) costs less than a dinner out, fits in a jacket pocket, and can arrest fatal bleeding with one hand.'
    ],
    keyTakeawaysNo: [
      'Hvert år rammes 3 500 nordmenn av hjertestans utenfor sykehus; tidlig HLR fra forbipasserende kan redde 200 ekstra liv per år.',
      'Et traumaoffer med arteriell blødning kan blø i hjel på 3–5 minutter — raskere enn median ambulanseresponstid i de fleste byområder.',
      'Halvparten av spurte nordmenn er usikre på om de kan utføre HLR korrekt. Hver femte over 50 år ville ventet på ambulansen i stedet for å gripe inn.',
      'Gapet mellom kunnskap og handling tettes av regelmessig, bevisst øving — ikke ved å lese retningslinjer én gang.',
      'Et IFAK (individuelt førstehjelpsett) koster mindre enn en middag ute, passer i en jakkefrakke og kan stanse dødelig blødning med én hånd.'
    ],
    body: [
      {
        heading: 'The Math of Survival',
        headingNo: 'Overlevelsesmatematikken',
        content: 'In Norway, over 12,000 people suffer cardiac arrest every year. Outside hospital, the number stands at approximately 3,500 — and survival depends overwhelmingly on what happens in the minutes before the ambulance arrives. According to the National Directorate of Health, well-executed bystander CPR could realistically save 200 additional lives annually. Yet a nationally representative survey found that nearly half of Norwegians are not confident they could perform CPR correctly, and 1 in 5 people over the age of 50 would actively wait for emergency services rather than intervene. The directive from health authorities is clear: the most powerful medical resource at any emergency scene is the first human being who arrives there.',
        contentNo: 'I Norge rammes over 12 000 mennesker av hjertestans hvert år. Utenfor sykehus er tallet omtrent 3 500 — og overlevelse avhenger overveldende av hva som skjer i minuttene før ambulansen ankommer. Ifølge Helsedirektoratet kunne vellykket HLR fra forbipasserende realistisk redde 200 ekstra liv årlig. Likevel fant en landsrepresentativ undersøkelse at nesten halvparten av nordmenn ikke er trygge på at de kan utføre HLR korrekt, og at 1 av 5 over 50 år ville aktivt vente på nødetater fremfor å gripe inn. Direktivet fra helsemyndigheter er tydelig: den mest effektive medisinske ressursen på ethvert ulykkessted er det første mennesket som ankommer.'
      },
      {
        heading: 'Bleeding: The Silent Countdown',
        headingNo: 'Blødning: Den stille nedtellingen',
        content: 'Trauma medicine operates on a brutal timeline. An arterial rupture in a major limb vessel can produce lethal blood loss in under 5 minutes. Shock onset occurs even faster, typically within 2–3 minutes, meaning the patient loses the ability to assist their own rescue. The average bystander, without equipment or training, faces a biologically catastrophic gap. However, studies in emergency and trauma care show that a windlass tourniquet applied correctly within 2 minutes of major extremity injury will arrest bleeding with near-certainty. The device weighs 80 grams, costs under 40 USD, and requires less than 60 seconds of training to apply effectively. The limiting factor is not complexity — it is the decision to prepare.',
        contentNo: 'Traumemedisin opererer på en brutal tidslinje. Et arteriebristning i et stort lemmefartøy kan produsere dødelig blodtap på under 5 minutter. Sjokkinnsettelse skjer enda raskere, typisk innen 2–3 minutter, noe som betyr at pasienten mister evnen til å assistere sin egen redning. Den gjennomsnittlige forbipasserende, uten utstyr eller opplæring, møter et biologisk katastrofalt gap. Imidlertid viser studier fra både militære og sivile sammenhenger at en windlass tourniquet påført korrekt innen 2 minutter etter alvorlig ekstremitetsskade vil stanse blødning med nær-sikkerhet. Enheten veier 80 gram, koster under 400 kr, og krever under 60 sekunders opplæring for effektiv påføring. Den begrensende faktoren er ikke kompleksitet — det er beslutningen om å forberede seg.'
      },
      {
        heading: 'The Role of First Aid Training in Norway',
        headingNo: 'Rollen til førstehjelpsopplæring i Norge',
        content: 'The initiative "Sammen redder vi liv" (Together we save lives), launched by the Ministry of Health in 2017, represents a national commitment to closing the knowledge-action gap. The platform 113.no now offers comprehensive, current first aid guidance in a single accessible location. The Red Cross (Røde Kors) offers structured training across all age groups and skill levels. Despite these resources, the survey data is sobering: when nearly half the population cannot reliably perform a procedure that takes 30 hours to learn and saves lives every week, the infrastructure for preparedness must grow beyond institutional training and into everyday culture.',
        contentNo: 'Initiativet "Sammen redder vi liv", lansert av Helsedepartementet i 2017, representerer en nasjonal forpliktelse til å tette kunnskap-handling-gapet. Plattformen 113.no tilbyr nå omfattende, oppdatert førstehjelpsinfo på ett tilgjengelig sted. Røde Kors tilbyr strukturert opplæring på tvers av alle aldersgrupper og ferdighetsnivåer. Til tross for disse ressursene er undersøkelsesdataene nedslående: når nesten halvparten av befolkningen ikke pålitelig kan utføre en prosedyre som tar 30 timer å lære og redder liv ukentlig, må infrastrukturen for beredskap vokse utover institusjonell opplæring og inn i dagligdags kultur.'
      }
    ],
    printSummary: {
      title: 'The 3-Minute Window: Key Points for Print',
      titleNo: '3-minuttersvinduet: Nøkkelpunkter for utskrift',
      bullets: [
        '113 is Norway\'s emergency number. Know it, call it immediately, put on speaker.',
        'CPR: 30 chest compressions + 2 rescue breaths (or compressions only if uncertain about breaths).',
        'AED: Follow voice prompts. Keep hands off during analysis and shock.',
        'Bleeding: Direct pressure first, tourniquet 5–8 cm above wound if pressure fails.',
        'NEVER remove a tourniquet once applied. Mark time of application.',
        'PTSD after witnessing trauma is real: seek peer support or professional help within 72 hours.'
      ],
      bulletsNo: [
        '113 er Norges nødnummer. Kjenn det, ring umiddelbart, sett på høyttaler.',
        'HLR: 30 brystkompresjoner + 2 innblåsninger (eller kompresjoner alene hvis usikker på innblåsninger).',
        'Hjertestarter: Følg stemmeinstruksjoner. Hold hendene borte under analyse og støt.',
        'Blødning: Direkte trykk først, tourniquet 5–8 cm over såret hvis trykk ikke hjelper.',
        'ALDRI fjern en tourniquet etter påføring. Merk tidspunkt for påføring.',
        'PTSD etter å ha vitnet traumer er reelt: søk kollegastøtte eller profesjonell hjelp innen 72 timer.'
      ]
    },
    sources: [
      'Helsedirektoratet — Pressemelding: "Dan Børge Aker fronter nasjonal førstehjelpsatsing" (2017)',
      'NSW Health — "What is Post-Traumatic Stress Disorder?" (2022)',
      'NAKOS / 113.no — National Prehospital Emergency Medicine Competence Service',
      'Røde Kors — "Den viktigste førstehjelpen" (rodekors.no/forstehjelp/tema)',
      'Vonhof, J. — "Fixing Your Feet: Injury Prevention and Treatments for Athletes" (2018)'
    ]
  },
  {
    id: 'wilderness-physics-of-survival',
    pillar: 'friluftsliv',
    title: 'Wilderness Physics: How Nature Kills and How Preparation Changes the Equation',
    titleNo: 'Villmarksfysikk: Hvordan naturen dreper — og hvordan forberedelse endrer ligningen',
    category: 'Outdoor Preparedness',
    estimatedReadMinutes: 7,
    summary: 'A data-driven look at how moving water, falling temperatures, driver fatigue, and navigation failure interact to create wilderness fatalities — and the specific, teachable skills that neutralize each threat.',
    summaryNo: 'En datadrevet gjennomgang av hvordan rennende vann, fallende temperaturer, tretthet bak rattet og navigasjonssvikt samvirker for å skape villmarksulykker — og de spesifikke, lærbare ferdighetene som nøytraliserer hver trussel.',
    keyTakeaways: [
      'Moving water at knee depth can generate over 100 kg of horizontal force — enough to sweep an adult off stable footing.',
      'Snow shelters maintain an interior temperature of –1°C to –3°C regardless of outdoor conditions — turning a lethal bivouac into a survivable one.',
      'A 4-second microsleep at 100 km/h means 110 meters of road covered with zero driver input — the equivalent of driving through a full intersection completely blind.',
      'Offline map packs cost nothing and take 3 minutes to download. They eliminate the single most common navigation failure in backcountry emergencies.',
      'Hand sanitizer ignites from a single spark and can light natural tinder — a practical backup item worth carrying as an emergency fire starter.'
    ],
    keyTakeawaysNo: [
      'Rennende vann på kne-dybde kan generere over 100 kg horisontal kraft — nok til å feie en voksen av stabilt fotfeste.',
      'Snøhus opprettholder en innetemperatur på –1 °C til –3 °C uavhengig av uteforhold — og gjør et dødelig bivuakk til et overlevbart.',
      'En 4-sekunders mikrosøvn ved 100 km/t betyr 110 meter vei tilbakelagt med null sjåførinput — tilsvarende å kjøre gjennom et fullt kryss helt blint.',
      'Offline kartpakker koster ingenting og tar 3 minutter å laste ned. De eliminerer den vanligste enkeltnavigasjonsfeilen i friluftsberedskapsituasjoner.',
      'Antibac antennes fra en enkelt gnist og kan antenne naturlig tende — et praktisk reserveprodukt verdt å ha som backup til nødtenning.'
    ],
    body: [
      {
        heading: 'Water: Force That Cannot Be Reasoned With',
        headingNo: 'Vann: En kraft som ikke kan forhandles med',
        content: 'River crossing is one of the most underestimated hazards in outdoor recreation. A stream at knee depth flowing at walking pace generates hydraulic pressure sufficient to knock an adult off balance. The problem compounds rapidly: weighted by a backpack, knocked off footing, and pulled downstream toward hidden boulders or sweep hydraulics, a person in moving water becomes a passive object in seconds. The National SINTEF research body and outdoor survival doctrine both converge on the same protocols: test with a branch (if it moves faster than a casual walk, do not cross), unbuckle hip and chest straps before entering, move diagonally downstream with a pole, and never cross above waterfalls or in flood-opaque conditions. The hardest part is not the technique — it is accepting that "almost crossable" is the same decision as "not crossable".',
        contentNo: 'Elverkryssing er en av de mest undervurderte farene i friluftsliv. En bekk i knedybde som strømmer i gangfart genererer hydraulisk trykk tilstrekkelig til å kaste en voksen av balanse. Problemet forverres raskt: belastet av en ryggsekk, mistet fotfeste og dratt nedstrøms mot skjulte stein eller hydrauliske feller, blir en person i rennende vann et passivt objekt på sekunder. Statlig SINTEF-forskning og villmarksdoktrine konvergerer begge på de samme protokollene: test med en kvist (hvis den beveger seg raskere enn rolig gange, ikke kryss), løsne hoftebeltet og brystremmen før du går ut, beveg deg skrått nedstrøms med en stav, og kryss aldri over fossefall eller i flomopake forhold. Den vanskeligste delen er ikke teknikken — det er å akseptere at "nesten krysserbar" er den samme beslutningen som "ikke krysserbar".'
      },
      {
        heading: 'Cold: The Engineering of Snow Shelter',
        headingNo: 'Kulde: Ingeniørvitenskapen bak snøhus',
        content: 'The SINTEF Building Research Institute published a detailed technical analysis of snow shelter construction physics (Byggforskserien S 330.140), documenting what Norwegian polar and alpine tradition has practiced for generations: snow is an outstanding thermal insulator with a thermal conductivity of λ = 0.23–0.5 W/mK for natural pack, compared to still air at 0.024 W/mK. A properly constructed quinzhee or snow cave consistently maintains an interior temperature of –1°C to –3°C regardless of external conditions. The construction takes 60–90 minutes. The rules are simple: curved ceiling (dome prevents drip), sleeping surface elevated above entrance (cold air pools at lowest point), ventilation hole mandatory, no cooking inside sealed spaces. The cost of not knowing this skill in a winter survival scenario is measurable in hours of life lost.',
        contentNo: 'SINTEF Byggforsk publiserte en detaljert teknisk analyse av sn\u00f8husbyggingsfysikk (Byggforskserien S 330.140), og dokumenterte hva norsk polar- og alpin-tradisjon har praktisert i generasjoner: sn\u00f8 er en fremragende varmeisolator med varmeledningsevne p\u00e5 \u03bb = 0,23\u20130,5 W/mK for naturlig pakket sn\u00f8, sammenlignet med stille luft p\u00e5 0,024 W/mK. En korrekt bygget quinzhee eller sn\u00f8hule opprettholder konsekvent en innetemperatur p\u00e5 \u20131 \u00b0C til \u20133 \u00b0C uavhengig av ytre forhold. Konstruksjonen tar 60\u201390 minutter. Reglene er enkle: hvelvet tak (kuppel forhindrer drypp), liggesflate h\u00f8yere enn inngangen (kald luft samles p\u00e5 laveste punkt), ventilasjonshuller obligatorisk, ingen matlaging i forseglede rom. Kostnaden av ikke \u00e5 kjenne denne ferdigheten i et vinteroverlevelsesscenar er m\u00e5lbar i timer av tapt liv.'
      },
      {
        heading: 'The Navigation Failure Nobody Talks About',
        headingNo: 'Navigasjonssvikten ingen snakker om',
        content: 'Modern outdoor navigation has a systematic vulnerability: smartphone map apps are dependent on a continuous data connection for tile loading. In dead zones — which cover vast portions of Norwegian mountain terrain and international wilderness — the app displays a blank background with a blue dot. The solution has been available for years and costs nothing: pre-downloading offline map packages in local-first navigation apps. Organic Maps, OsmAnd, and Maps.me provide offline vector mapping with routing without relying on a live tile connection. For mountain terrain, Kartverket provides 1:50,000 topographic data. Battery management completes the picture: airplane mode with GPS active extends phone life 4–6x over full LTE operation. The failure mode that kills is not equipment breakdown — it is the assumption that equipment works.',
        contentNo: 'Moderne friluftsliv-navigasjon har en systematisk sårbarhet: smarttelefon-kartapper er avhengige av kontinuerlig dataforbindelse for kartlasting. I blindsoner \u2014 som dekker store deler av norsk fjelll\u00e5nde og internasjonal villmark \u2014 viser appen en blank bakgrunn med en bl\u00e5 prikk. L\u00f8sningen har v\u00e6rt tilgjengelig i \u00e5revis og koster ingenting: forh\u00e5ndsnedlasting av offline kartpakker i lokal-f\u00f8rst navigasjonsapper. Organic Maps, OsmAnd og Maps.me gir offline vektorkartlegging med ruteplanlegging uten live karttilkobling. For fjelll\u00e5nde tilbyr Kartverket 1:50 000 topografiske data. Batteristyring fullfj\u00f8rer bildet: flymodus med GPS aktiv forlenger telefonlevetiden 4\u20136x over full LTE-drift. Sviktmodusen som dreper er ikke utstyrssvikt \u2014 det er antagelsen om at utstyr virker.'
      },
      {
        heading: 'Rucking: The Preparedness Fitness Framework',
        headingNo: 'Rucking: Beredskapsfitness-rammeverket',
        content: 'Michael Easter\'s 2026 analysis of rucking (walking with a loaded pack) demonstrates a consistent physiological case: it is the highest-efficiency preparedness fitness modality available to non-professional civilians. Unlike running, it generates minimal impact-related injury rates. Unlike gym training, it translates directly to functional emergency capacity — the ability to carry a 72-hour bag for extended periods, evacuate another person, or sustain physical effort under real-world load. A commonly cited preparedness benchmark (30% body weight over 10 km in under 2 hours) represents a meaningful real-world threshold. The 10-week progressive program (starting at 20% body weight, 30 minutes, 3x per week) requires no equipment beyond a functional pack and the discipline to show up. Combined with systematic foot care — two-layer socks, pre-hike lubrication, immediate hot-spot intervention — it is the single most compressible preparedness investment available.',
        contentNo: 'Michael Easters 2026-analyse av rucking (vandring med lastet sekk) demonstrerer et konsekvent fysiologisk argument: det er den h\u00f8yest-effektivitets beredskapsfitness-modaliteten tilgjengelig for ikke-profesjonelle sivile. I motsetning til l\u00f8ping genererer det minimale skadefrekvenser relatert til belastning. I motsetning til treningssaltrening oversettes det direkte til funksjonell beredskapskapasitet \u2014 evnen til \u00e5 b\u00e6re en 72-timers bag over lengre perioder, evakuere en annen person, eller opprettholde fysisk innsats under reell belastning. Et vanlig referansepunkt for utholdenhetstrening (30 % kroppsvekt over 10 km p\u00e5 under 2 timer) representerer en meningsfull reell-verden terskel. Det 10-ukers progressive programmet (starter p\u00e5 20 % kroppsvekt, 30 minutter, 3x per uke) krever intet utstyr utover en funksjonell sekk og disiplinen til \u00e5 m\u00f8te opp. Kombinert med systematisk fotpleie \u2014 to-lags sokker, f\u00f8rhiking-sm\u00f8ring, umiddelbar varm-flekk-intervensjon \u2014 er det den enkelt mest komprimerte beredskapsinvesteringen tilgjengelig.'
      }
    ],
    printSummary: {
      title: 'Wilderness Physics: Quick Reference Card',
      titleNo: 'Villmarksfysikk: Hurtigreferansekort',
      bullets: [
        'WATER: Throw a stick. If it moves faster than walking pace, do NOT cross.',
        'WATER: Unbuckle hip belt and chest strap before wading. Be ready to shed the pack instantly.',
        'SNOW SHELTER: Need 1.5 m of packed snow. Build dome shape. Always include ventilation hole.',
        'SNOW SHELTER: Never seal entry completely. Sleep elevated above entry level.',
        'FATIGUE: Take a 20-min nap at first sign. Wait 30 min after waking before resuming driving.',
        'MAPS: Download offline map packs in a local/offline navigation app BEFORE you need them.',
        'FIRE: Hand sanitizer + spark = fire. Carry as emergency backup.',
        'RUCKING: Start at 20% body weight, 30 min, 3x/week. Add 5 min each week.'
      ],
      bulletsNo: [
        'VANN: Kast en kvist. Hvis den flyter raskere enn gangfart, kryss IKKE.',
        'VANN: Løsne hoftebeltet og brystremmen før du vasser. Vær klar til å kaste sekken umiddelbart.',
        'SNØHUS: Trenger 1,5 m pakket snø. Bygg kuppelform. Ha alltid et ventilasjonshulle.',
        'SNØHUS: Forsegl aldri inngangen helt. Sov høyere enn inngangsnivå.',
        'TRETTHET: Ta en 20-min lur ved første tegn. Vent 30 min etter oppvåkning før du gjenopptar kjøringen.',
        'KART: Last ned offline-kartpakker i en lokal/offline navigasjonsapp FØR du trenger dem.',
        'ILD: Antibac + gnist = ild. Ha med som praktisk backup for nødtenning.',
        'RUCKING: Start med 20 % kroppsvekt, 30 min, 3x/uke. Legg til 5 min hver uke.'
      ]
    },
    sources: [
      'SINTEF Byggforsk — "Hytter og huler av snø" Byggforskserien S 330.140 (1990)',
      'NSW Government Transport — "Driver Fatigue" (transport.nsw.gov.au)',
      'NSW SES — "Local Flood Insights and Historical Flood Maps" (ses.nsw.gov.au)',
      'Easter, M. — "Walk with Weight: The Definitive Guide to Rucking" (2026)',
      'Trackers Earth — "Forest Ninja Training Manual" (2017)',
      'US Marine Corps — "Scouting and Patrolling MCW" (Marine Corps Warfighting Publication)'
    ]
  }
];
