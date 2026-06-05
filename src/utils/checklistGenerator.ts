export interface GeneratorParams {
  familySize: number;
  durationDays: number;
  environment: 'urban' | 'rural' | 'subzero';
  specialNeeds: ('pets' | 'infants' | 'medication')[];
}

export interface GeneratedChecklistItem {
  id: string;
  text: string;
  checked: boolean;
  category: string;
}

export interface GeneratedChecklist {
  id: string;
  title: string;
  items: GeneratedChecklistItem[];
}

export function generateCustomChecklist(
  params: GeneratorParams,
  lang: 'en' | 'no'
): GeneratedChecklist {
  const { familySize, durationDays, environment, specialNeeds } = params;
  const items: GeneratedChecklistItem[] = [];
  const checklistId = `dyn-list-${Date.now()}`;

  // Water Calculation (3L per person per day)
  const waterLiters = familySize * 3 * durationDays;
  items.push({
    id: 'water-calc',
    text: lang === 'no' 
      ? `Drikkevann: Lagre minst ${waterLiters} liter vann (${familySize} personer x 3L x ${durationDays} dager)`
      : `Drinking Water: Store at least ${waterLiters} liters (${familySize} persons x 3L x ${durationDays} days)`,
    checked: false,
    category: 'water'
  });

  // Food Calculation
  const foodPortions = familySize * 3 * durationDays;
  items.push({
    id: 'food-calc',
    text: lang === 'no'
      ? `Hermetisk / tørr mat: ${foodPortions} porsjoner lagringsstabil mat (${familySize} personer x 3 måltider x ${durationDays} dager)`
      : `Shelf-stable Food: ${foodPortions} portions of ready-to-eat rations (${familySize} persons x 3 meals x ${durationDays} days)`,
    checked: false,
    category: 'food'
  });

  // Basic Hygiene
  items.push({
    id: 'hygiene-basics',
    text: lang === 'no'
      ? `Hygiene: Våtservietter, såpe, håndsprit og toalettpapir for ${durationDays} dager`
      : `Hygiene: Wet wipes, soap, hand sanitizer, and toilet paper for ${durationDays} days`,
    checked: false,
    category: 'hygiene'
  });

  // Environmental overrides
  if (environment === 'subzero') {
    items.push({
      id: 'env-heat',
      text: lang === 'no' 
        ? 'Varme: Parafinbrenner, ved, eller teltovn med reservebrensel for kulde'
        : 'Auxiliary Heat: Paraffin/wood stove with extra fuel for subzero temperatures',
      checked: false,
      category: 'heat'
    });
    items.push({
      id: 'env-sleep',
      text: lang === 'no' 
        ? 'Soveposer: Ekstrem-soveposer og varme ulltepper egnet ned til -15°C' 
        : 'Sleeping Bags: Subzero rated bags (-15°C minimum) and wool blankets',
      checked: false,
      category: 'heat'
    });
  } else if (environment === 'urban') {
    items.push({
      id: 'env-urban-cash',
      text: lang === 'no' 
        ? 'Kontanter: Små sedler i lokal valuta for butikker uten nettverk' 
        : 'Cash Reserve: Small banknotes in local currency for shops without card networks',
      checked: false,
      category: 'cash'
    });
  } else if (environment === 'rural') {
    items.push({
      id: 'env-rural-tools',
      text: lang === 'no'
        ? 'Verktøy & Navigasjon: Øks/sag, kniv, fyrstikker (vanntette) og fysiske kart over nærområdet'
        : 'Tools & Navigation: Axe/saw, knife, waterproof matches, and physical maps of the local area',
      checked: false,
      category: 'tools'
    });
  }

  // Special Needs
  if (specialNeeds.includes('infants')) {
    items.push({
      id: 'special-infants-formula',
      text: lang === 'no' 
        ? 'Barnemat & Erstatning: Morsmelkerstatning, sterile flasker og tørre barneklær' 
        : 'Infant Supplies: Formula, sterile bottles, diapers, and warm baby clothing',
      checked: false,
      category: 'special'
    });
  }
  if (specialNeeds.includes('medication')) {
    items.push({
      id: 'special-meds',
      text: lang === 'no' 
        ? `Faste medisiner: Nok for hele perioden (${durationDays} dager) + 3 dager sikkerhetsmargin` 
        : `Critical medications: Supply for ${durationDays} days + 3 days safety buffer`,
      checked: false,
      category: 'medical'
    });
  }
  if (specialNeeds.includes('pets')) {
    const petFoodKg = (familySize * 0.5 * durationDays).toFixed(1);
    items.push({
      id: 'special-pets-supplies',
      text: lang === 'no'
        ? `Kjæledyr: Ca. ${petFoodKg} kg fôr, vannreserver og eventuelle bånd/bur`
        : `Pets: Approx. ${petFoodKg} kg food, pet water reserves, and pet leash/crate`,
      checked: false,
      category: 'special'
    });
  }

  // Communications
  items.push({
    id: 'comm-radio',
    text: lang === 'no'
      ? 'DAB-radio: Batteridrevet eller opptrekkbar (sveive) radio for beredskapsmeldinger'
      : 'Emergency Radio: Battery-powered or hand-crank DAB/FM radio for emergency alerts',
    checked: false,
    category: 'comms'
  });

  return {
    id: checklistId,
    title: lang === 'no' ? `Generert sjekkliste (${durationDays} dager)` : `Generated Kit Checklist (${durationDays} days)`,
    items
  };
}
