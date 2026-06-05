const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'data', 'processedAssets.json');
const rawData = fs.readFileSync(filePath, 'utf8');
let assets = JSON.parse(rawData);

console.log('Original assets count:', assets.length);

// 1. Repair Index 0 (Empty ID/Title)
let index0 = assets[0];
if (index0 && index0.id === '' && index0.metadata.sourceFile === ',.html') {
  console.log('Repairing Index 0 (Psykososial Førstehjelp)...');
  index0.id = 'psykososial-forstehjelp';
  index0.title = 'Psykososial førstehjelp i kriser';
  index0.metadata.sourceFile = 'psykososial-forstehjelp.html';
  
  if (index0.guide && index0.guide.execution) {
    index0.guide.execution = index0.guide.execution.map(step => 
      step.replace('for .', 'for psykososial førstehjelp.')
    );
  }
  if (index0.guide && index0.guide.evaluation) {
    index0.guide.evaluation = index0.guide.evaluation.map(step => 
      step.replace("''", "'psykososial førstehjelp'")
    );
  }
  if (index0.courseModule && index0.courseModule.learningGoals) {
    index0.courseModule.learningGoals = index0.courseModule.learningGoals.map(goal => 
      goal.replace("''", "'psykososial førstehjelp'")
    );
  }
}

// Helper to recursive replace strings in object
function replaceInObject(obj, targetStr, replacementStr) {
  if (typeof obj === 'string') {
    return obj.replaceAll(targetStr, replacementStr);
  } else if (Array.isArray(obj)) {
    return obj.map(item => replaceInObject(item, targetStr, replacementStr));
  } else if (obj && typeof obj === 'object') {
    const newObj = {};
    for (const key in obj) {
      newObj[key] = replaceInObject(obj[key], targetStr, replacementStr);
    }
    return newObj;
  }
  return obj;
}

// 2. Repair Aba_Protectbabiesinemergencies_0
let abaAsset = assets.find(a => a.id === 'Aba_Protectbabiesinemergencies_0' || a.metadata.sourceFile === 'ABA-ProtectBabiesInEmergencies_0.pdf');
if (abaAsset) {
  console.log('Repairing ABA Protect Babies asset...');
  abaAsset.id = 'beskyttelse-spedbarn-gravide-kriser';
  abaAsset.title = 'Egenberedskap for sårbare grupper: Spedbarn, barn og gravide';
  
  // Replace references
  abaAsset.keyElements = replaceInObject(abaAsset.keyElements, 'Aba Protectbabiesinemergencies 0', 'Beredskap for spedbarn og gravide');
  abaAsset.keyElements = replaceInObject(abaAsset.keyElements, 'aba protectbabiesinemergencies 0', 'beredskap for spedbarn og gravide');
  
  abaAsset.article = replaceInObject(abaAsset.article, 'Aba Protectbabiesinemergencies 0', 'Beredskap for spedbarn og gravide');
  abaAsset.article = replaceInObject(abaAsset.article, 'aba protectbabiesinemergencies 0', 'beredskap for spedbarn og gravide');
  
  abaAsset.guide = replaceInObject(abaAsset.guide, 'Aba Protectbabiesinemergencies 0', 'Beredskap for spedbarn og gravide');
  abaAsset.guide = replaceInObject(abaAsset.guide, 'aba protectbabiesinemergencies 0', 'beredskap for spedbarn og gravide');
  
  abaAsset.checklist = replaceInObject(abaAsset.checklist, 'Aba Protectbabiesinemergencies 0', 'Beredskap for spedbarn og gravide');
  abaAsset.checklist = replaceInObject(abaAsset.checklist, 'aba protectbabiesinemergencies 0', 'beredskap for spedbarn og gravide');
  
  abaAsset.courseModule = replaceInObject(abaAsset.courseModule, 'Aba Protectbabiesinemergencies 0', 'Beredskap for spedbarn og gravide');
  abaAsset.courseModule = replaceInObject(abaAsset.courseModule, 'aba protectbabiesinemergencies 0', 'beredskap for spedbarn og gravide');
}

// 3. Repair Agentic_Development (PLIVO)
let plivoAsset = assets.find(a => a.id === 'Agentic_Development' || a.metadata.sourceFile === 'agentic-development.md');
if (plivoAsset) {
  console.log('Repairing Agentic Development (PLIVO) asset...');
  plivoAsset.id = 'egenbeskyttelse-vold-terror';
  plivoAsset.title = 'Egenbeskyttelse ved voldsepisoder og terror (PLIVO)';
  plivoAsset.category = 'Egensikkerhet & Konflikthåndtering';
  
  // Replace the checklist
  plivoAsset.checklist = [
    'Løp: Evaluer situasjonen raskt og evakuer umiddelbart hvis det er en trygg fluktvei',
    'Løp: Forlat eiendeler og hjelp andre med å flykte om mulig uten å forsinke deg selv',
    'Gjem deg: Hvis fluktveien er blokkert, søk dekning i et rom som kan låses eller barrikaderes',
    'Gjem deg: Blokker døren med tunge møbler og skru av lys, PC-skjermer og lydkilder',
    'Gjem deg: Sett mobiltelefonen på fullstendig lydløs (deaktiver også vibrasjon)',
    'Varsle: Ring politiet på 112 så snart det er trygt, og oppgi sted, antall gjerningspersoner og våpen',
    'Varsle: Følg politiets instruksjoner og hold hendene synlige når politiet ankommer'
  ];
  
  // Replace the theory section
  plivoAsset.courseModule.theory = 'Ved pågående livstruende vold (PLIVO), for eksempel et terrorangrep eller skyting, er rask handling avgjørende for overlevelse. Offentlige råd fra politiet og PST er delt inn i tre hovedregler: Løp, Gjem deg, Varsle. Din primære oppgave er å bringe deg selv i sikkerhet. Hvis du kan flykte, gjør det umiddelbart og uten å bære bagasje. Hvis fluktveien er blokkert, må du gjemme deg, låse eller barrikadere døren, og eliminere alle tegn til tilstedeværelse ved å slukke lys og sette mobiltelefonen på fullstendig lydløs uten vibrasjon. Ring politiet på 112 først når du er i sikkerhet eller ikke lenger kan oppdages.';
  
  // Replace strings in other fields
  plivoAsset.article = replaceInObject(plivoAsset.article, 'Agentic Development', 'Egenbeskyttelse ved pågående vold');
  plivoAsset.article = replaceInObject(plivoAsset.article, 'agentic development', 'egenbeskyttelse ved pågående vold');
  
  plivoAsset.guide = replaceInObject(plivoAsset.guide, 'Agentic Development', 'Egenbeskyttelse ved pågående vold');
  plivoAsset.guide = replaceInObject(plivoAsset.guide, 'agentic development', 'egenbeskyttelse ved pågående vold');
  
  plivoAsset.courseModule = replaceInObject(plivoAsset.courseModule, 'Agentic Development', 'Egenbeskyttelse ved pågående vold');
  plivoAsset.courseModule = replaceInObject(plivoAsset.courseModule, 'agentic development', 'egenbeskyttelse ved pågående vold');
}

// 4. Filter out developer-only and screenshot assets
const devPatterns = [
  'skjermbilde',
  'specification-quality',
  'state-management',
  'strategic-design',
  'strategic-documentation',
  'token-architecture',
  'trigger-mapping',
  'validation-patterns',
  'wds-glossary',
  'working-with-existing-materials',
  'wrap.md',
  'project-brief.template',
  'saga-',
  'saga.',
  'saga_',
  'readme.md',
  'tilbakemeldinger.txt',
  'start.md'
];

const cleanedAssets = assets.filter(a => {
  const sf = a.metadata.sourceFile.toLowerCase();
  const id = a.id.toLowerCase();
  
  const isDev = devPatterns.some(p => sf.includes(p) || id.includes(p));
  return !isDev;
});

console.log('Cleaned assets count:', cleanedAssets.length);
console.log('Removed assets count:', assets.length - cleanedAssets.length);

// Save cleaned assets back
fs.writeFileSync(filePath, JSON.stringify(cleanedAssets, null, 2), 'utf8');
console.log('Updated file saved successfully.');
