import { useMemo, useState, type FormEvent } from 'react';
import { BookOpen, ExternalLink, FileText, Mail, MessageSquare, Shield } from 'lucide-react';
import { glossaryData } from '../data/glossaryData';

type AboutPageProps = {
  currentLang: string;
  onStartLearning: () => void;
  onBeginTraining: () => void;
};

type ReadingItem = {
  id: string;
  title: string;
  author: string;
  categoryEn: string;
  categoryNo: string;
  reasonEn: string;
  reasonNo: string;
  url?: string;
  cover?: string;
  seriesBooks?: Array<{
    title: string;
    url: string;
  }>;
};

const readingItems: ReadingItem[] = [
  {
    id: 'the-unthinkable',
    title: 'The Unthinkable',
    author: 'Amanda Ripley',
    categoryEn: 'Crisis behavior',
    categoryNo: 'Kriseatferd',
    reasonEn: 'A clear look at how people actually react under pressure and why training before an event matters.',
    reasonNo: 'En tydelig gjennomgang av hvordan mennesker faktisk reagerer under press, og hvorfor øving før en hendelse betyr noe.',
    url: 'https://openlibrary.org/works/OL9389857W'
  },
  {
    id: 'deep-survival',
    title: 'Deep Survival',
    author: 'Laurence Gonzales',
    categoryEn: 'Situational awareness',
    categoryNo: 'Vurderingsevne og situasjonsbevissthet',
    reasonEn: 'Useful for understanding your immediate environment, attention, decision-making, and the small choices that separate trouble from recovery.',
    reasonNo: 'Nyttig for å forstå omgivelsene dine, oppmerksomheten din, beslutningstaking og de små valgene som skiller problemer fra kontroll.',
    url: 'https://openlibrary.org/works/OL3458633W'
  },
  {
    id: 'nols-wilderness-medicine',
    title: 'NOLS Wilderness Medicine',
    author: 'Tod Schimelpfenig',
    categoryEn: 'First aid',
    categoryNo: 'Førstehjelp',
    reasonEn: 'A practical reference for medical decisions when help is delayed or conditions are difficult.',
    reasonNo: 'Et praktisk oppslagsverk for medisinske valg når hjelp tar tid eller forholdene er krevende.',
    url: 'https://openlibrary.org/works/OL21295121W'
  },
  {
    id: 'where-there-is-no-doctor',
    title: 'Where There Is No Doctor',
    author: 'David Werner',
    categoryEn: 'Health',
    categoryNo: 'Helse',
    reasonEn: 'A plain-language health manual that is strongest when used as background knowledge, not as emergency replacement care.',
    reasonNo: 'En enkel helsehåndbok som er mest nyttig som bakgrunnskunnskap, ikke som erstatning for akutt helsehjelp.',
    url: 'https://openlibrary.org/works/OL2891264W'
  },
  {
    id: 'gift-of-fear',
    title: 'The Gift of Fear',
    author: 'Gavin de Becker',
    categoryEn: 'Personal safety',
    categoryNo: 'Egensikkerhet',
    reasonEn: 'Good for sharpening threat recognition while keeping the focus on practical boundaries and early action.',
    reasonNo: 'God for å skjerpe evnen til å kjenne igjen fare, med vekt på praktiske grenser og tidlig handling.',
    url: 'https://openlibrary.org/works/OL3355180W'
  },
  {
    id: 'dsb-egenberedskap',
    title: 'DSB self-preparedness guidance',
    author: 'Directorate for Civil Protection',
    categoryEn: 'Official guidance',
    categoryNo: 'Offisiell veiledning',
    reasonEn: 'The baseline Norwegian guidance for household preparedness, supplies, and planning.',
    reasonNo: 'Grunnlaget for norske råd om egenberedskap, utstyr og planlegging i hjemmet.',
    url: 'https://www.dsb.no/sikkerhverdag/egenberedskap/'
  },
  {
    id: 'helsenorge-first-aid',
    title: 'Helsenorge first-aid guidance',
    author: 'Helsenorge',
    categoryEn: 'Official guidance',
    categoryNo: 'Offisiell veiledning',
    reasonEn: 'Norwegian public health guidance for common first-aid and emergency situations.',
    reasonNo: 'Norsk offentlig helseinformasjon for vanlige førstehjelps- og nødsituasjoner.',
    url: 'https://www.helsenorge.no/forstehjelp/'
  },
  {
    id: 'met-warning-guidance',
    title: 'MET Norway weather warning guidance',
    author: 'Meteorologisk institutt',
    categoryEn: 'Official guidance',
    categoryNo: 'Offisiell veiledning',
    reasonEn: 'Explains Norwegian weather warnings and helps turn forecasts into concrete preparation decisions.',
    reasonNo: 'Forklarer norske farevarsler og gjør det lettere å omsette værmeldinger til konkrete forberedelser.',
    url: 'https://www.met.no/vaer-og-klima/ekstremvaervarsler-og-andre-farevarsler'
  },
  {
    id: 'lights-out',
    title: 'Lights Out',
    author: 'Ted Koppel',
    categoryEn: 'Disaster resilience',
    categoryNo: 'Katastroferesiliens',
    reasonEn: 'A practical look at how dependent everyday life is on electricity, communications, and recovery planning.',
    reasonNo: 'En praktisk gjennomgang av hvor avhengig hverdagen er av strøm, kommunikasjon og gjenopprettingsplaner.',
    url: 'https://openlibrary.org/works/OL20008564W/Lights_out'
  },
  {
    id: 'after-series',
    title: 'The After series',
    author: 'William R. Forstchen',
    categoryEn: 'Disaster resilience',
    categoryNo: 'Katastroferesiliens',
    reasonEn: 'Three closely related novels that make long-duration disruption, recovery, and household planning easier to think through in sequence.',
    reasonNo: 'Tre nært beslektede romaner som gjør det lettere å tenke gjennom langvarig svikt, gjenoppretting og husstandsplanlegging i rekkefølge.',
    seriesBooks: [
      {
        title: 'One Second After',
        url: 'https://openlibrary.org/works/OL5947682W/One_second_after'
      },
      {
        title: 'One Year After',
        url: 'https://openlibrary.org/books/OL26605017M/One_Year_After'
      },
      {
        title: 'The Final Day',
        url: 'https://openlibrary.org/books/OL27223563M/The_final_day'
      }
    ]
  },
  {
    id: 'sandworm',
    title: 'Sandworm',
    author: 'Andy Greenberg',
    categoryEn: 'Disaster resilience',
    categoryNo: 'Katastroferesiliens',
    reasonEn: 'A useful book for understanding cyber disruption, infrastructure fragility, and the real-world consequences of digital attacks.',
    reasonNo: 'En nyttig bok for å forstå digital forstyrrelse, sårbar infrastruktur og de reelle konsekvensene av digitale angrep.',
    url: 'https://openlibrary.org/books/OL29815270M/Sandworm'
  },
  {
    id: 'once-a-warrior',
    title: 'Once a Warrior',
    author: 'Jake Wood',
    categoryEn: 'Crisis behavior',
    categoryNo: 'Kriseatferd',
    reasonEn: 'A grounded account of service, trauma, and how people carry responsibility through chaos.',
    reasonNo: 'En jordnær fortelling om tjeneste, traumer og hvordan mennesker bærer ansvar gjennom kaos.',
    url: 'https://openlibrary.org/books/OL30192431M/Once_a_Warrior'
  },
  {
    id: 'tribe',
    title: 'Tribe',
    author: 'Sebastian Junger',
    categoryEn: 'Crisis behavior',
    categoryNo: 'Kriseatferd',
    reasonEn: 'Explains belonging, cohesion, and why recovery often works better when people act together instead of alone.',
    reasonNo: 'Forklarer tilhørighet, samhold og hvorfor gjenoppretting ofte fungerer bedre når mennesker handler sammen i stedet for alene.',
    url: 'https://openlibrary.org/books/OL27207580M/Tribe'
  },
  {
    id: 'six-minute-x-ray',
    title: 'Six Minute X-Ray',
    author: 'Chase Hughes',
    categoryEn: 'Situational awareness',
    categoryNo: 'Situasjonsbevissthet',
    reasonEn: 'Focuses on fast observation habits that help you read a room without turning every interaction into a drama.',
    reasonNo: 'Handler om raske observasjonsvaner som hjelper deg å lese et rom uten å gjøre hver samtale dramatisk.',
    url: 'https://openlibrary.org/books/OL33516338M/Six_Minute_X-Ray'
  },
  {
    id: 'left-of-bang',
    title: 'Left of Bang',
    author: 'Patrick Van Horne and Jason A. Riley',
    categoryEn: 'Situational awareness',
    categoryNo: 'Situasjonsbevissthet',
    reasonEn: 'A practical guide to noticing early signs before a situation becomes a problem.',
    reasonNo: 'En praktisk guide til å legge merke til tidlige tegn før en situasjon blir et problem.',
    url: 'https://openlibrary.org/books/OL30552834M/Left_of_Bang'
  },
  {
    id: 'what-every-body-is-saying',
    title: 'What Every BODY Is Saying',
    author: 'Joe Navarro',
    categoryEn: 'Situational awareness',
    categoryNo: 'Situasjonsbevissthet',
    reasonEn: 'Useful for reading nonverbal cues without assuming more than the evidence supports.',
    reasonNo: 'Nyttig for å lese ikke-verbale signaler uten å anta mer enn det som faktisk vises.',
    url: 'https://openlibrary.org/books/OL19904132M/What_every_BODY_is_saying'
  }
];

export function GlossaryPage({ currentLang }: { currentLang: string }) {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return glossaryData;
    return glossaryData.filter((item) => {
      const text = `${item.term} ${item.termNo} ${item.explanationEn} ${item.explanationNo}`.toLowerCase();
      return text.includes(q);
    });
  }, [query]);

  return (
    <section className="section py-10 px-4 sm:px-8 max-w-[1000px] mx-auto space-y-6">
      {/* FIXED: Boxed introductory card for visual harmony */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-5 space-y-3">
        <h2 className="text-3xl font-bold text-[var(--text)]">{currentLang === 'no' ? 'Begrepsliste' : 'Glossary'}</h2>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={currentLang === 'no' ? 'Søk i begreper...' : 'Search terms...'}
          className="w-full border border-[var(--border)] bg-[var(--bg)] rounded-xl px-4 py-3 text-sm text-[var(--text)] placeholder-[var(--muted)]/50 focus:outline-none focus:border-[var(--accent)]"
        />
      </div>
      <div className="space-y-3">
        {filtered.map((item) => (
          <article key={item.term} className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4">
            <h3 className="text-sm md:text-base font-bold text-[var(--text)]">
              {currentLang === 'no' ? item.termNo : item.term}
            </h3>
            <p className="text-xs md:text-sm text-[var(--muted)] mt-1">
              {currentLang === 'no' ? item.explanationNo : item.explanationEn}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function AboutPage({ currentLang, onStartLearning, onBeginTraining }: AboutPageProps) {
  return (
    <section className="section py-10 px-4 sm:px-8 max-w-[920px] mx-auto space-y-6">
      {/* FIXED: Boxed introductory card for consistent grid tracking layout */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-5 space-y-3">
        <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--accent)]">
          {currentLang === 'no' ? 'Om prosjektet' : 'About the project'}
        </span>
        <h2 className="text-2xl md:text-3xl font-bold text-[var(--text)]">{currentLang === 'no' ? 'Om Beredskap101' : 'About Beredskap101'}</h2>
        <p className="text-sm md:text-base text-[var(--muted)] leading-relaxed max-w-[72ch]">
          {currentLang === 'no'
            ? 'Beredskap101 gjør beredskap lettere å forstå og bruke. Siden samler guider, artikler, sjekklister og scenarioøvelser for folk som vil være bedre forberedt i hverdagen.'
            : 'Beredskap101 makes preparedness easier to understand and use. The site brings together guides, articles, checklists, and scenario training for people who want to be better prepared in everyday life.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-4">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4">
          <h3 className="font-bold text-sm mb-2 text-[var(--text)]">{currentLang === 'no' ? 'Hva vi tilbyr' : 'What we provide'}</h3>
          {/* FIXED: Assigned uniform theme-variable token tracking for list elements */}
          <ul className="text-sm text-[var(--muted)] space-y-2 list-disc list-inside marker:text-[var(--accent)]">
            <li>{currentLang === 'no' ? 'Kunnskapsartikler og dypere lesing' : 'Knowledge articles and deeper guides'}</li>
            <li>{currentLang === 'no' ? 'Interaktive flytskjema og scenarioer' : 'Interactive flowcharts and scenarios'}</li>
            <li>{currentLang === 'no' ? 'Sjekklister og beredskapsverktøy' : 'Checklists and preparedness tools'}</li>
            <li>{currentLang === 'no' ? 'Utvidet referansebibliotek' : 'Extended reference library'}</li>
          </ul>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4">
          <h3 className="font-bold text-sm mb-2 text-[var(--text)]">
            {currentLang === 'no' ? 'Bakgrunn' : 'Background'}
          </h3>
          
          <div className="text-sm text-[var(--muted)] leading-relaxed space-y-4">
            {currentLang === 'no' ? (
              <>
                <p>
                  <span className="font-bold text-[var(--text)]">Beredskap101</span> er en kunnskapsplattform basert på blant annet mer enn 7,000 timer <span className="font-bold text-[var(--text)]">operativt arbeid</span> med sikkerhet og beredskap i roller fra både <span className="font-bold text-[var(--text)]">privat og offentlig sektor</span> – fra utøvelse i felt til operativ koordinering til <span className="font-bold text-[var(--text)]">strategisk analyse.</span>
                </p>
                <p>
                  Akademisk og faglig bakgrunn innebærer videre <span className="font-bold text-[var(--text)]">forsvarsforskning på fremmedstatlig innflytelse</span>, samfunnsforskning om vold knyttet til <span className="font-bold text-[var(--text)]">radikalisering og ekstremisme</span>, og en rekke universitetsutdanninger innen beredskap, <span className="font-bold text-[var(--text)]">krisehåndtering</span>, samfunnssikkerhet og operativ ledelse.
                </p>
                <p>
                  Erfaring innenfor frivillighetssektoren innebærer blant annet både Hjelpekorpset, og erfaring fra flyktningsleir i utland.
                </p>
                <p>
                  Beredskap101 bygger også på både private erfaringer og kursing innenfor en rekke relaterte temaer, <span className="font-bold text-[var(--text)]">instruktørsertifiseringer innen villmarksoverlevelse</span> på tvers av klimaer fra USA og norsk instruktørsertifisering med basis i <span className="font-bold text-[var(--text)]">sanitet, søk og redning</span>.
                </p>
                <p>
                  <span className="font-bold text-[var(--text)]">Målet her er ikke</span> å gjøre beredskap til noe dramatisk. Tvert imot. Det er heller å hjelpe vanlige mennesker med å ta <span className="font-bold text-[var(--text)]">roligere og bedre valg</span> før uønskede hendelser oppstår, samt <span className="font-bold text-[var(--text)]">skape og øke generell bevissthet</span> rundt fagfelt som veldig mange ikke har hørt navnene på i det hele tatt.
                </p>
              </>
            ) : (
              <>
                <p>
                  <span className="font-bold text-[var(--text)]">Beredskap101</span> is a <span className="font-bold text-[var(--text)]">knowledge platform</span>. The content we choose to include is based on more than 7,000 hours of <span className="font-bold text-[var(--text)]">hands-on work</span> in safety, security and emergency preparedness, spanning roles in both the <span className="font-bold text-[var(--text)]">private and public sectors</span> – from field work to operational coordination and <span className="font-bold text-[var(--text)]">strategic analysis</span>.
                </p>
                <p>
                  Our academic and professional background includes <span className="font-bold text-[var(--text)]">defense research on foreign state influence</span>, societal research on violence related to <span className="font-bold text-[var(--text)]">radicalization and extremism</span>, and a number of university degrees in emergency preparedness, <span className="font-bold text-[var(--text)]">crisis management</span>, societal safety and operational leadership.
                </p>
                <p>
                  Beredskap101 also draws on both personal experience and training in a range of related topics, including <span className="font-bold text-[var(--text)]">cross-climate wilderness survival instructor</span> certifications from the U.S., as well as Norwegian instructor certifications in first aid, search and rescue.
                </p>
                <p>
                  Experience in the volunteer sector includes, among other things, the Norwegian Auxiliary/<span className="font-bold text-[var(--text)]">Search & Rescue</span> Corps and field experience from refugee camps abroad.
                </p>
                <p>
                  <span className="font-bold text-[var(--text)]">The goal here is not</span> to make emergency preparedness (and management) seem dramatic. Quite the opposite. Rather, it is to help regular people make <span className="font-bold text-[var(--text)]">calmer and better choices</span> before unwanted incidents occur, as well as to <span className="font-bold text-[var(--text)]">create and raise general awareness</span> of topics that many people have never even heard of.
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4">
          <h3 className="font-bold text-sm mb-2 text-[var(--text)]">{currentLang === 'no' ? 'Lokal lagring, ikke sky' : 'Local storage, not cloud'}</h3>
          <p className="text-sm text-[var(--muted)] leading-relaxed">
            {currentLang === 'no'
              ? 'Sjekklister, lokale dokumenter, vedlegg, cookievalg og lokale AI-innstillinger lagres i nettleseren på enheten du bruker. Det finnes ingen automatisk skysynk. Hvis du bytter enhet eller sletter nettleserdata, må du bruke egen eksport for å gjenopprette innholdet.'
              : 'Checklists, local documents, attachments, cookie choices, and local AI settings are stored in the browser on the device you use. There is no automatic cloud sync. If you change device or clear browser data, you must use your own export to restore the content.'}
          </p>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4">
          <h3 className="font-bold text-sm mb-2 text-[var(--text)]">{currentLang === 'no' ? 'Valgfri lokal AI' : 'Optional local AI'}</h3>
          <p className="text-sm text-[var(--muted)] leading-relaxed">
            {currentLang === 'no'
              ? 'Hvis du aktiverer lokal AI, kobles appen bare til din egen lokale AI-kjører, som Ollama, LM Studio, Jan eller vLLM. Appen lagrer bare lokal URL og modellnavn. Modellfilene blir i den lokale kjøreren, og appen bruker deterministisk lokal reserve hvis tilkoblingen feiler.'
              : 'If you enable local AI, the app connects only to your own local AI runner, such as Ollama, LM Studio, Jan, or vLLM. The app stores only the local URL and model name. The model files stay in the local runner, and the app uses deterministic local fallback if the connection fails.'}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        <button
          type="button"
          onClick={onStartLearning}
          className="px-4 py-2 rounded-lg bg-[var(--accent-solid)] text-[var(--accent-on-solid)] text-sm font-bold inline-flex items-center gap-2 cursor-pointer transition-colors hover:opacity-90"
        >
          <BookOpen className="w-4 h-4" />
          {currentLang === 'no' ? 'Start læring' : 'Start Learning'}
        </button>
        <button
          type="button"
          onClick={onBeginTraining}
          className="px-4 py-2 rounded-lg border border-[var(--border)] text-sm font-bold text-[var(--text)] inline-flex items-center gap-2 cursor-pointer transition-colors hover:bg-[var(--border)]/30"
        >
          <Shield className="w-4 h-4" />
          {currentLang === 'no' ? 'Start trening' : 'Begin Training'}
        </button>
      </div>
    </section>
  );
}

export function RecommendedReadingPage({ currentLang }: { currentLang: string }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const categoryOptions = useMemo(() => {
    const categories = new Map<string, string>();
    for (const item of readingItems) {
      categories.set(item.categoryEn, currentLang === 'no' ? item.categoryNo : item.categoryEn);
    }
    return [['all', currentLang === 'no' ? 'Alle' : 'All'], ...Array.from(categories.entries())];
  }, [currentLang]);

  const filteredItems = useMemo(() => {
    if (selectedCategory === 'all') return readingItems;
    return readingItems.filter((item) => item.categoryEn === selectedCategory);
  }, [selectedCategory]);

  return (
    <section className="section py-10 px-4 sm:px-8 max-w-[1100px] mx-auto space-y-6">
      {/* FIXED: Boxed introductory card for content encapsulation uniformity */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-5 space-y-3">
        <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--accent)]">
          {currentLang === 'no' ? 'Lesetips' : 'Recommended reading'}
        </span>
        <h2 className="text-2xl md:text-3xl font-bold text-[var(--text)]">
          {currentLang === 'no' ? 'Anbefalt lesning' : 'Recommended Reading'}
        </h2>
        <p className="text-sm md:text-base text-[var(--muted)] leading-relaxed">
          {currentLang === 'no'
            ? 'Et kort, praktisk bibliotek for deg som vil forstå kriser, førstehjelp, egensikkerhet og norske beredskapsråd bedre.'
            : 'A short, practical shelf for understanding crisis behavior, first aid, personal safety, and Norwegian preparedness guidance.'}
        </p>
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label={currentLang === 'no' ? 'Filtrer lesetips' : 'Filter reading recommendations'}>
        {categoryOptions.map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setSelectedCategory(key)}
            className={`px-3 py-2 rounded-full border text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === key
                ? 'bg-[var(--accent-solid)] border-transparent text-[var(--accent-on-solid)]'
                : 'bg-[var(--card)] border-[var(--border)] text-[var(--text)] hover:border-[var(--accent)]/60'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.map((item) => (
          <article key={item.id} className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4 flex gap-4">
            {item.cover ? (
              <img
                src={item.cover}
                alt=""
                loading="lazy"
                className="w-20 h-28 rounded-md object-cover border border-[var(--border)] bg-[var(--bg)] flex-shrink-0"
              />
            ) : (
              <div className="w-20 h-28 rounded-md border border-[var(--border)] bg-[var(--bg)] flex-shrink-0 flex items-center justify-center text-[var(--accent)]">
                <FileText className="w-7 h-7" />
              </div>
            )}
            <div className="min-w-0 space-y-2">
              <span className="text-[10px] font-mono uppercase text-[var(--accent)]">
                {currentLang === 'no' ? item.categoryNo : item.categoryEn}
              </span>
              <div>
                <h3 className="text-base font-bold text-[var(--text)] leading-snug">{item.title}</h3>
                <p className="text-xs text-[var(--muted)]">{item.author}</p>
              </div>
              <p className="text-sm text-[var(--muted)] leading-relaxed">
                {currentLang === 'no' ? item.reasonNo : item.reasonEn}
              </p>
              {item.seriesBooks ? (
                <div className="space-y-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] p-3">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted)]">
                    {currentLang === 'no' ? 'Bøker i serien' : 'Books in the series'}
                  </p>
                  <div className="space-y-1.5">
                    {item.seriesBooks.map((book) => (
                      <a
                        key={book.title}
                        href={book.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between gap-2 rounded-md border border-[var(--border)] px-3 py-2 text-sm font-semibold text-[var(--text)] hover:border-[var(--accent)]/60 hover:text-[var(--accent)]"
                      >
                        <span>{book.title}</span>
                        <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              ) : item.url ? (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-[var(--accent)] hover:underline"
                >
                  {currentLang === 'no' ? 'Åpne kilde' : 'Open source'}
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function ContactPage({ currentLang }: { currentLang: string }) {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [result, setResult] = useState<string>('');

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setResult('');
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    const payload = await response.json();
    if (!response.ok) {
      setResult(currentLang === 'no' ? 'Skjemaet mangler informasjon.' : 'The form is missing required information.');
      return;
    }
    window.location.href = payload.mailto;
  };

  return (
    <section className="section py-10 px-4 sm:px-8 max-w-[900px] mx-auto space-y-6">
      <h2 className="text-3xl font-bold text-[var(--text)]">{currentLang === 'no' ? 'Kontakt' : 'Contact'}</h2>
      <p className="text-sm text-[var(--muted)]">{currentLang === 'no' ? 'E-post: info@holf.services' : 'Email: info@holf.services'}</p>
      <form onSubmit={submit} className="space-y-3 bg-[var(--card)] border border-[var(--border)] rounded-lg p-4">
        <input
          required
          value={form.name}
          onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          placeholder={currentLang === 'no' ? 'Navn' : 'Name'}
          className="w-full border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--accent)] placeholder:[var(--muted)]/40"
        />
        <input
          required
          type="email"
          value={form.email}
          onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
          placeholder={currentLang === 'no' ? 'E-post' : 'Email'}
          className="w-full border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--accent)] placeholder:[var(--muted)]/40"
        />
        <input
          value={form.subject}
          onChange={(event) => setForm((prev) => ({ ...prev, subject: event.target.value }))}
          placeholder={currentLang === 'no' ? 'Emne' : 'Subject'}
          className="w-full border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--accent)] placeholder:[var(--muted)]/40"
        />
        <textarea
          required
          value={form.message}
          onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
          placeholder={currentLang === 'no' ? 'Melding' : 'Message'}
          rows={6}
          className="w-full border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--accent)] placeholder:[var(--muted)]/40"
        />
        <button className="px-4 py-2 rounded-lg bg-[var(--accent-solid)] text-[var(--accent-on-solid)] text-sm font-bold inline-flex items-center gap-2 cursor-pointer transition-colors hover:opacity-90">
          <Mail className="w-4 h-4" />
          {currentLang === 'no' ? 'Send' : 'Send'}
        </button>
        {result && <p className="text-xs text-red-500">{result}</p>}
      </form>
    </section>
  );
}

export function PolicyPage({ title, body }: { title: string; body: string[] }) {
  return (
    <section className="section py-10 px-4 sm:px-8 max-w-[900px] mx-auto space-y-4">
      <h2 className="text-3xl font-bold text-[var(--text)]">{title}</h2>
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4 space-y-3">
        {body.map((paragraph, idx) => (
          <p key={idx} className="text-sm text-[var(--muted)] leading-relaxed">
            {paragraph}
          </p>
        ))}
      </div>
    </section>
  );
}

export function FAQPage({ currentLang }: { currentLang: string }) {
  const faqs = currentLang === 'no'
    ? [
        ['Lagrer dere persondata?', 'Nei. Sjekklister og preferanser lagres lokalt i nettleseren din.'],
        ['Bruker dere analyseverktøy?', 'Nei. Ingen tredjeparts sporing eller annonseteknologi er aktivert.'],
        ['Kan jeg bruke siden uten nett?', 'Ja. Kjerneinnhold er laget for frakoblet bruk etter første last.'],
        ['Hva lagres lokalt på denne enheten?', 'Sjekklisteprogresjon, lokale dokumenter og vedlegg, lokal AI-innstillinger, cookievalg og enkelte lokale hurtigbuffere lagres i nettleserlagringen på denne enheten. Data sendes ikke automatisk to våre servere.'],
        ['Hvordan fungerer Lokal dokumentoversikt egentlig?', 'Den lagres i denne nettleseren på denne enheten (IndexedDB med localStorage som reserve). Det betyr samme nettleserprofil på samme enhet. Hvis du bytter profil/enhet, bruker privat modus eller sletter nettleserdata, må du importere fra egen eksport for å få dataene tilbake.'],
        ['Hvorfor står det at eksport/import er manuell og lokal?', 'Fordi appen ikke bruker automatisk skysynk. Du må selv eksportere en lokal backupfil eller kryptert backupkode, lagre den trygt, og senere importere den manuelt hvis du vil flytte eller gjenopprette data.'],
        ['Hvordan tar jeg i bruk lokal AI her? Forklar enkelt.', '1. Installer en lokal AI-kjører som Ollama, LM Studio, Jan, vLLM eller annen OpenAI-kompatibel lokal server. 2. Hent inn en liten modell i den kjøreren, for eksempel qwen2.5:3b eller llama3.2:3b. 3. I appen: aktiver Lokal AI, lim inn lokal URL (ofte http://localhost:11434/v1) og samme modellnavn. 4. Trykk Test tilkobling. 5. Hvis det feiler, bruker appen deterministisk lokal fallback uten sky.'],
        ['Lagrer appen selve AI-modellen?', 'Nei. Appen lagrer bare av/på-valg, lokal URL og modellnavn i nettleseren. Modellfilene ligger i din lokale AI-kjører, ikke i denne appen.'],
        ['Hvordan bytter jeg mellom online/offline modus?', '1. Åpne appen med nett minst én gang så offline-skall caches. 2. For online: skru på nett og last siden på nytt. 3. For offline-test: sett nettleserer til Offline i DevTools og oppdater siden. 4. See status-chip øverst: ONLINE, DEGRADED eller OFFLINE. 5. I offline modus brukes lokale data, cache og statiske kilder automatisk.'],
        ['Hvordan laster jeg ned og aktiverer kartpakker?', 'For de fleste: du trenger ikke gjøre noe. Kartet virker automatisk når du er på nett. Bruk bare offline-kartpakke hvis du vil ha kartbakgrunn uten internett. Enkleste oppsett for egen kopi av appen er: 1. Legg de ferdige kartpakkefilene i appens public/maps-mappe. 2. Last appen på nytt. 3. Åpne Tilfluktsrom og se etter statusen "Offline-kartpakke klar". Hvis det ikke virker, fortsetter vanlig nettkart eller enkel reservevisning å fungere.'],
        ['Er dette en erstatning for nødetater?', 'Nei. Ring alltid 110, 112 eller 113 ved akutte hendelser.']
      ]
    : [
        ['Do you store personal data?', 'No. Checklists and preferences stay in your browser.'],
        ['Do you use analytics?', 'No. No third-party tracking or ad technology is enabled.'],
        ['Can I use this without internet?', 'Yes. Core content is designed for offline use after first load.'],
        ['What is stored locally on this device?', 'Checklist progress, local documents and attachments, local AI settings, cookie preferences, and some local caches are stored in this browser on this device. They are not automatically sent to our servers.'],
        ['How does Local Document Overview actually work?', 'It is stored in this browser on this device (IndexedDB with localStorage fallback). That means the same browser profile on the same device. If you switch profile/device, use private browsing, or clear site data, you must restore from your own export to get the data back.'],
        ['Why does it say export/import is manual and local only?', 'Because the app does not use automatic cloud sync. You must export a local backup file or encrypted backup code yourself, store it safely, and later import it manually if you want to move or restore data.'],
        ['How do I start using a local AI model here? ELI5.', '1. Install a local AI runner such as Ollama, LM Studio, Jan, vLLM, or another OpenAI-compatible local server. 2. Pull or import a small model there, for example qwen2.5:3b or llama3.2:3b. 3. In the app: enable Local AI, paste the local URL (often http://localhost:11434/v1) and the same model name. 4. Press Test connection. 5. If it fails, the app uses deterministic local fallback with no cloud call.'],
        ['Does the app store the AI model itself?', 'No. The app stores only the on/off toggle, local URL, and model name in your browser. The model files stay inside your local AI runner, not in this app.'],
        ['How do I switch between online and offline mode?', '1. Open the app online at least once so the offline shell is cached. 2. For online mode: reconnect and refresh. 3. For offline testing: set your browser to Offline in DevTools and refresh. 4. Check the status chip at the top: ONLINE, DEGRADED, or OFFLINE. 5. In offline mode, the app automatically uses local content, cache, and static source fallback.'],
        ['How do I download and activate map packages?', 'For most people: you do not need to do anything. The map works automatically while you are online. Use an offline map package only if you want the map background to keep working without internet. The simplest setup for your own copy of the app is: 1. Put the ready-made map package files in the app’s public/maps folder. 2. Reload the app. 3. Open Shelters and look for the status "Offline map package ready". If that fails, the normal online map or simple fallback view still works automatically.'],
        ['Is this a replacement for emergency services?', 'No. Always call 110, 112 or 113 in acute emergencies.']
      ];

  return (
    <section className="section py-10 px-4 sm:px-8 max-w-[900px] mx-auto space-y-5">
      {/* FIXED: Boxed introductory card for content encapsulation uniformity */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-5">
        <h2 className="text-3xl font-bold text-[var(--text)]">{currentLang === 'no' ? 'Vanlige spørsmål' : 'FAQ'}</h2>
      </div>
      {faqs.map(([question, answer]) => (
        <article key={question} className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4">
          <h3 className="font-bold text-sm text-[var(--text)] inline-flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            {question}
          </h3>
          <p className="text-sm text-[var(--muted)] mt-2">{answer}</p>
        </article>
      ))}
    </section>
  );
}