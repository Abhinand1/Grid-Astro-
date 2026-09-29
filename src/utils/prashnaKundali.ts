import * as Astronomy from 'astronomy-engine';
import { NAKSHATRAS, RASIS } from './astroData';
import { getAyanamsa, getPlanetSiderealLongitude } from './astronomy';

export type PrashnaCategory = 'career' | 'lost_item' | 'health' | 'travel_visa' | 'litigation';

export interface PrashnaQueryInput {
  question: string;
  category: PrashnaCategory;
  questionTime?: Date;
  tambulaNumber?: number; // 1 to 108 cowrie / tambula selection
}

export interface PrashnaPlanet {
  name: string;
  nameMalayalam: string;
  longitude: number;
  rasiIndex: number;
  rasiName: string;
  rasiMalayalam: string;
  house: number;
  isBenefic: boolean;
}

export interface PrashnaResult {
  query: string;
  category: PrashnaCategory;
  categoryMalayalam: string;
  queryTimeFormatted: string;
  ayanamsa: number;
  
  udayaLagna: {
    longitude: number;
    rasiIndex: number;
    rasiName: string;
    rasiMalayalam: string;
    lord: string;
    lordMalayalam: string;
  };
  
  arudhaLagna: {
    number: number;
    rasiIndex: number;
    rasiName: string;
    rasiMalayalam: string;
  };

  chandraLagna: {
    rasiIndex: number;
    rasiName: string;
    rasiMalayalam: string;
    nakshatraName: string;
    nakshatraMalayalam: string;
    pada: number;
  };

  planets: PrashnaPlanet[];
  
  outcome: 'Highly Favorable' | 'Favorable with Effort' | 'Challenging / Delay' | 'Requires Remedies';
  outcomeMalayalam: string;
  successProbability: number; // percentage
  
  coreAnalysis: {
    en: string;
    ml: string;
  };
  
  timingOfEvent: {
    en: string;
    ml: string;
  };
  
  remedialGuidance: {
    en: string;
    ml: string;
  };
}

// Default Kerala baseline coordinates (Kochi: 9.9312° N, 76.2673° E)
const DEFAULT_LAT = 9.9312;
const DEFAULT_LON = 76.2673;

/**
 * Calculates Prashna Lagna (Ascendant of the Question moment)
 */
function calculatePrashnaAscendant(date: Date, lat = DEFAULT_LAT, lon = DEFAULT_LON): number {
  const time = Astronomy.MakeTime(date);
  const siderealTimeHours = Astronomy.SiderealTime(time);
  const localSiderealTimeDeg = ((siderealTimeHours * 15) + lon) % 360;
  
  const sunVec = Astronomy.GeoVector(Astronomy.Body.Sun, time, true);
  const sunEcl = Astronomy.Ecliptic(sunVec);
  const ayanamsa = getAyanamsa(date);
  
  // Approximate Ascendant calculation using obliquity and local sidereal time
  const rad = Math.PI / 180;
  const eps = 23.43928 * rad; // Mean obliquity
  const theta = localSiderealTimeDeg * rad;
  const phi = lat * rad;
  
  const y = -Math.cos(theta);
  const x = Math.sin(theta) * Math.cos(eps) + Math.tan(phi) * Math.sin(eps);
  let ascTropical = Math.atan2(y, x) * (180 / Math.PI);
  if (ascTropical < 0) ascTropical += 360;
  
  // Sidereal Ascendant
  let ascSidereal = (ascTropical - ayanamsa) % 360;
  if (ascSidereal < 0) ascSidereal += 360;
  
  return ascSidereal;
}

export function calculatePrashnaKundali(input: PrashnaQueryInput): PrashnaResult {
  const queryTime = input.questionTime || new Date();
  const ayanamsa = getAyanamsa(queryTime);
  
  // Calculate Ascendant (Udaya Lagna)
  const lagnaLon = calculatePrashnaAscendant(queryTime);
  const lagnaRasiIdx = Math.floor(lagnaLon / 30);
  const lagnaRasi = RASIS[lagnaRasiIdx];
  
  // Calculate Moon position
  const moonLon = getPlanetSiderealLongitude(Astronomy.Body.Moon, queryTime);
  const moonRasiIdx = Math.floor(moonLon / 30);
  const moonRasi = RASIS[moonRasiIdx];
  const moonStarIdx = Math.floor(moonLon / (360 / 27));
  const moonStar = NAKSHATRAS[moonStarIdx];
  const moonPada = Math.floor((moonLon % (360 / 27)) / (360 / 108)) + 1;
  
  // Calculate Arudha Lagna (based on tambula number 1-108 or minute-seed)
  const tambula = input.tambulaNumber || ((queryTime.getMinutes() * 7 + queryTime.getSeconds()) % 108) + 1;
  const arudhaRasiIdx = (tambula - 1) % 12;
  const arudhaRasi = RASIS[arudhaRasiIdx];
  
  // Calculate 9 grahas
  const bodies: { name: string; nameMl: string; body: Astronomy.Body | 'Rahu' | 'Ketu'; benefic: boolean }[] = [
    { name: 'Sun', nameMl: 'സൂര്യൻ', body: Astronomy.Body.Sun, benefic: false },
    { name: 'Moon', nameMl: 'ചന്ദ്രൻ', body: Astronomy.Body.Moon, benefic: true },
    { name: 'Mars', nameMl: 'ചൊവ്വ', body: Astronomy.Body.Mars, benefic: false },
    { name: 'Mercury', nameMl: 'ബുധൻ', body: Astronomy.Body.Mercury, benefic: true },
    { name: 'Jupiter', nameMl: 'വ്യാഴം (ഗുരു)', body: Astronomy.Body.Jupiter, benefic: true },
    { name: 'Venus', nameMl: 'ശുക്രൻ', body: Astronomy.Body.Venus, benefic: true },
    { name: 'Saturn', nameMl: 'ശനി', body: Astronomy.Body.Saturn, benefic: false },
    { name: 'Rahu', nameMl: 'രാഹു', body: 'Rahu', benefic: false },
    { name: 'Ketu', nameMl: 'കേതു', body: 'Ketu', benefic: false },
  ];
  
  const planets: PrashnaPlanet[] = bodies.map(b => {
    const lon = getPlanetSiderealLongitude(b.body, queryTime);
    const rIdx = Math.floor(lon / 30);
    const rObj = RASIS[rIdx];
    let house = rIdx - lagnaRasiIdx + 1;
    if (house <= 0) house += 12;
    return {
      name: b.name,
      nameMalayalam: b.nameMl,
      longitude: Number(lon.toFixed(2)),
      rasiIndex: rIdx,
      rasiName: rObj.name,
      rasiMalayalam: rObj.malayalamName || rObj.name,
      house,
      isBenefic: b.benefic
    };
  });

  // Evaluate query based on category
  const jupiter = planets.find(p => p.name === 'Jupiter')!;
  const venus = planets.find(p => p.name === 'Venus')!;
  const mercury = planets.find(p => p.name === 'Mercury')!;
  const saturn = planets.find(p => p.name === 'Saturn')!;
  const sun = planets.find(p => p.name === 'Sun')!;
  const mars = planets.find(p => p.name === 'Mars')!;
  const moon = planets.find(p => p.name === 'Moon')!;
  
  let score = 50;
  let analysisEn = '';
  let analysisMl = '';
  let timingEn = '';
  let timingMl = '';
  let remedyEn = '';
  let remedyMl = '';
  
  // Benefics in Kendra (1, 4, 7, 10) or Trikona (1, 5, 9) elevate prashna
  const kendraBenefics = planets.filter(p => p.isBenefic && [1, 4, 7, 10, 5, 9].includes(p.house)).length;
  score += kendraBenefics * 8;
  
  // Moon condition
  if ([6, 8, 12].includes(moon.house)) {
    score -= 15; // Moon in dusthana warns of mental anxiety/delays
  } else {
    score += 10;
  }

  // Category-specific evaluation
  switch (input.category) {
    case 'career': {
      // 10th house, Sun, Jupiter, 1st lord
      const tenthPlanets = planets.filter(p => p.house === 10);
      const tenthHasBenefic = tenthPlanets.some(p => p.isBenefic);
      if (tenthHasBenefic || [1, 5, 9, 10, 11].includes(jupiter.house)) score += 20;
      if (tenthPlanets.some(p => !p.isBenefic)) score -= 10;
      
      analysisEn = `Prashna Lagna is ${lagnaRasi.name} with ${lagnaRasi.lord} as lord. The 10th house of profession is ruled by ${RASIS[(lagnaRasiIdx + 9) % 12].lord}. ${
        tenthHasBenefic ? 'Benefic planetary influence on the 10th indicates successful breakthrough and professional recognition.' : 'Mixed planetary aspects indicate deliberate persistence is required before securing the desired position.'
      }`;
      analysisMl = `പ്രശ്ന ലഗ്നം ${lagnaRasi.malayalamName} ആണ്. പത്താം ഭാവമായ കർമ്മ സ്ഥാനത്ത് ${tenthHasBenefic ? 'ശുഭ ഗ്രഹങ്ങളുടെ സ്വാധീനം കാണപ്പെടുന്നതിനാൽ ജോലിയിലും പുതിയ പദവികളിലും ഉയർന്ന വിജയസാധ്യത കാണുന്നു.' : 'മിശ്രഫലമാണ് കാണുന്നത്. ലക്ഷ്യപ്രാപ്തിക്ക് പരിശ്രമവും ക്ഷമയും ആവശ്യമാണ്.'}`;
      timingEn = score > 65 ? 'Favorable resolution expected within 3 to 7 weeks.' : 'Clear development expected after the upcoming Solar transit (approx. 2-3 months).';
      timingMl = score > 65 ? '3 മുതൽ 7 ആഴ്ചകൾക്കുള്ളിൽ അനുകൂലമായ വാർത്ത ലഭിക്കാൻ സാധ്യത.' : 'അടുത്ത സൂര്യ സംക്രമത്തിനു ശേഷം (2-3 മാസങ്ങൾക്കുള്ളിൽ) അനുകൂല മാറ്റങ്ങൾ ഉണ്ടാകും.';
      remedyEn = 'Offer prayers to Lord Ganesha on Wednesdays and chant Aditya Hridaya Stotram on Sundays.';
      remedyMl = 'ബുധനാഴ്ചകളിൽ ഗണപതി ഭഗവാന് കറുകമാല സമർപ്പിക്കുക, ഞായറാഴ്ചകളിൽ ആദിത്യഹൃദയ സ്തോത്രം ജപിക്കുക.';
      break;
    }
    case 'lost_item': {
      // 2nd (wealth/belongings) and 4th (property) houses, and Moon/Mercury
      const isFixedSign = [1, 4, 7, 10].includes(lagnaRasiIdx); // Sthira / Kendra
      if (isFixedSign || [1, 2, 4, 11].includes(mercury.house)) score += 20;
      
      analysisEn = `The Prashna chart indicates ${isFixedSign ? 'a Fixed (Sthira) Rasi for Lagna, meaning the article is within the domestic perimeter or familiar surroundings.' : 'a Movable or Dual Rasi, suggesting the item has shifted or is in transit.'} ${
        mercury.house <= 6 ? 'It is likely kept in a lower or western/northern section of the premises.' : 'It was misplaced in a public or travel-related space.'
      }`;
      analysisMl = `പ്രശ്ന ലഗ്നം പരിശോധിക്കുമ്പോൾ നഷ്ടപ്പെട്ട വസ്തു ${isFixedSign ? 'വീടിന്റെയോ പരിചിതമായ സ്ഥലത്തിന്റെയോ ഉള്ളിൽ തന്നെയുണ്ട്, സുരക്ഷിതമാണ്.' : 'യാത്രാവേളയിലോ പുറത്തോ വെച്ച് കൈമോശം വന്നിരിക്കാൻ സാധ്യതയുണ്ട്.'} വടക്ക് അല്ലെങ്കിൽ പടിഞ്ഞാറ് ദിശയിൽ പരിശോധിക്കുന്നത് ഫലപ്രദമായിരിക്കും.`;
      timingEn = score > 60 ? 'Search during morning hora (Mercury or Jupiter hora) within 3 days.' : 'Retrieval requires tracing back steps over the next 10-14 days.';
      timingMl = score > 60 ? 'അടുത്ത 3 ദിവസങ്ങൾക്കുള്ളിൽ, പ്രത്യേകിച്ച് പകൽ സമയത്ത് സൂക്ഷ്മമായി തിരഞ്ഞാൽ കണ്ടെത്താം.' : 'അടുത്ത 10-14 ദിവസങ്ങൾക്കുള്ളിൽ തിരിച്ചുകിട്ടാൻ സാധ്യതയുണ്ട്.';
      remedyEn = 'Chant the Kartavirya Arjuna Mantra: "Om Kartaviryarjuno Nama Raja Bahu Sahasravan".';
      remedyMl = 'കാർത്തവീര്യാർജ്ജുന മന്ത്രം 108 തവണ ജപിക്കുക ("ഓം കാർത്തവീര്യാർജ്ജുനായ നമഃ").';
      break;
    }
    case 'health': {
      // 1st (vitality) and 6th (disease) houses
      const sixthPlanets = planets.filter(p => p.house === 6);
      if ([1, 5, 9, 11].includes(jupiter.house) || [1, 4, 10].includes(sun.house)) score += 25;
      if (sixthPlanets.some(p => p.name === 'Saturn' || p.name === 'Rahu')) score -= 15;
      
      analysisEn = `The 1st house vitality indicator and the placement of Jupiter confirm strong recuperative strength. ${
        score >= 65 ? 'The ailment is temporary and positive medical response is clearly indicated.' : 'Careful medical consultation and regular medication are vital to clear chronic stagnation.'
      }`;
      analysisMl = `ലഗ്നാധിപന്റെയും വ്യാഴത്തിന്റെയും സ്ഥിതി ആരോഗ്യ വീണ്ടെടുപ്പിന് അനുകൂലമായ ഊർജ്ജം നൽകുന്നു. ${
        score >= 65 ? 'രോഗശമനം വേഗത്തിലാകാനും ശരിയായ ഔഷധ ഫലം ലഭിക്കാനും ശുഭകരമായ ലക്ഷണങ്ങൾ കാണുന്നു.' : 'വൈദ്യോപദേശവും ചിട്ടയായ ചികിത്സയും മുടങ്ങാതെ തുടരേണ്ടത് അത്യാവശ്യമാണ്.'
      }`;
      timingEn = 'Noticeable relief and stabilization expected within 12 to 21 days.';
      timingMl = '12 മുതൽ 21 ദിവസങ്ങൾക്കുള്ളിൽ ആരോഗ്യ നിലയിൽ വ്യക്തമായ പുരോഗതി അനുഭവപ്പെടും.';
      remedyEn = 'Perform Dhanvantari Homa or light a ghee lamp at a Mahavishnu/Shiva temple on Mondays.';
      remedyMl = 'ധന്വന്തരി ഭഗവാന് തുളസിമാല സമർപ്പിക്കുക, തിങ്കളാഴ്ചകളിൽ ക്ഷേത്രത്തിൽ നെയ്‌വിളക്ക് കൊളുത്തുക.';
      break;
    }
    case 'travel_visa': {
      // 9th (fortune/long journeys) and 12th (foreign lands)
      if ([9, 12, 1, 3].includes(moon.house) || [9, 11].includes(jupiter.house)) score += 20;
      if (saturn.house === 12 || mars.house === 9) score -= 10;
      
      analysisEn = `The 9th house of travel and 12th house of foreign residence show ${
        score >= 65 ? 'unobstructed flow. Approvals, visa processing, or itinerary clearances are favored.' : 'minor administrative queries that will resolve upon supplying secondary documentation.'
      }`;
      analysisMl = `യാത്രാ ഭാവവും വിദേശ ഭാവവും പരിശോധിക്കുമ്പോൾ ${
        score >= 65 ? 'വിസ, പാസ്‌പോർട്ട് അനുമതികൾ വേഗത്തിൽ ലഭിക്കാനും യാത്ര സഫലമാകാനും ഉത്തമമായ യോഗം കാണുന്നു.' : 'രേഖകളുടെ കൃത്യത ഉറപ്പുവരുത്തണം. ചെറിയ കാലതാമസത്തിനു ശേഷം കാര്യങ്ങൾ അനുകൂലമാകും.'
      }`;
      timingEn = score >= 65 ? 'Green signal expected in 2 to 4 weeks.' : 'Expect completion during the next lunar cycle (approx 1 month).';
      timingMl = score >= 65 ? '2 മുതൽ 4 ആഴ്ചകൾക്കുള്ളിൽ ശുഭവാർത്ത ലഭിക്കാൻ സാധ്യത.' : 'ഒരു മാസത്തിനുള്ളിൽ തടസ്സങ്ങൾ നീങ്ങി യാത്ര സാധ്യമാകും.';
      remedyEn = 'Donate food or yellow lentils to travelers/needful people on Thursday.';
      remedyMl = 'വ്യാഴാഴ്ചകളിൽ സാധുക്കൾക്ക് അന്നദാനം ചെയ്യുക, ഹനുമാൻ സ്വാമിയെ പ്രാർത്ഥിക്കുക.';
      break;
    }
    case 'litigation': {
      // 6th house (disputes) and 7th (opponent)
      const sixthLord = RASIS[(lagnaRasiIdx + 5) % 12].lord;
      if ([1, 10, 11].includes(mars.house) || [1, 9].includes(jupiter.house)) score += 20;
      if ([7, 8].includes(saturn.house)) score -= 10;
      
      analysisEn = `The 1st house (querent) maintains superior dignity over the 7th house (opposition). ${
        score >= 65 ? 'A decisive legal advantage or an out-of-court settlement with strong terms is favored.' : 'Patience is advisable; avoiding aggressive confrontation will yield better compromises.'
      }`;
      analysisMl = `തർക്ക സ്ഥാനവും എതിരാളി സ്ഥാനവും അവലോകനം ചെയ്യുമ്പോൾ ${
        score >= 65 ? 'നിയമപരമായ മേൽക്കൈ ലഭിക്കാനും അനുകൂലമായ ഒത്തുതീർപ്പിലെത്താനും ശക്തമായ സാധ്യതയുണ്ട്.' : 'ക്ഷമയോടെയുള്ള സമീപനം ആവശ്യമാണ്. സമവായ ചർച്ചകൾ വഴി പരിഹാരം കാണാൻ ശ്രമിക്കുന്നത് കൂടുതൽ ഫലം ചെയ്യും.'
      }`;
      timingEn = 'Constructive headway expected between 30 and 60 days.';
      timingMl = '30 മുതൽ 60 ദിവസങ്ങൾക്കുള്ളിൽ കേസിൽ നിർണ്ണായകമായ പുരോഗതി പ്രതീക്ഷിക്കാം.';
      remedyEn = 'Recite Subrahmanya Bhujangam or visit a Lord Murugan/Ayyappa temple on Tuesdays.';
      remedyMl = 'ചൊവ്വാഴ്ചകളിൽ സുബ്രഹ്മണ്യ സ്വാമിക്ക് പഞ്ചാമൃതം അല്ലെങ്കിൽ പാൽപ്പായസം വഴിപാട് നടത്തുക.';
      break;
    }
  }

  // Constrain probability score between 25% and 95%
  const finalProbability = Math.max(25, Math.min(95, score));
  
  let outcome: PrashnaResult['outcome'] = 'Favorable with Effort';
  let outcomeMalayalam = 'പരിശ്രമത്താൽ വിജയം';
  
  if (finalProbability >= 75) {
    outcome = 'Highly Favorable';
    outcomeMalayalam = 'അതിവിശിഷ്ടം (പൂർണ്ണ വിജയം)';
  } else if (finalProbability >= 55) {
    outcome = 'Favorable with Effort';
    outcomeMalayalam = 'അനുകൂലം (കാര്യസാധ്യം)';
  } else if (finalProbability >= 40) {
    outcome = 'Challenging / Delay';
    outcomeMalayalam = 'കാലതാമസത്തിന് സാധ്യത';
  } else {
    outcome = 'Requires Remedies';
    outcomeMalayalam = 'പരിഹാരം ആവശ്യമായ സ്ഥിതി';
  }

  const categoryNamesMl: Record<PrashnaCategory, string> = {
    career: 'തൊഴിൽ & പുതിയ അവസരങ്ങൾ',
    lost_item: 'നഷ്ടപ്പെട്ട വസ്തുക്കൾ',
    health: 'രോഗശാന്തി & ആരോഗ്യം',
    travel_visa: 'യാത്ര & വിദേശയാത്ര',
    litigation: 'കോടതി & തർക്കങ്ങൾ'
  };

  return {
    query: input.question,
    category: input.category,
    categoryMalayalam: categoryNamesMl[input.category],
    queryTimeFormatted: queryTime.toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }),
    ayanamsa: Number(ayanamsa.toFixed(4)),
    udayaLagna: {
      longitude: Number(lagnaLon.toFixed(2)),
      rasiIndex: lagnaRasiIdx,
      rasiName: lagnaRasi.name,
      rasiMalayalam: lagnaRasi.malayalamName || lagnaRasi.name,
      lord: lagnaRasi.lord,
      lordMalayalam: lagnaRasi.lord
    },
    arudhaLagna: {
      number: tambula,
      rasiIndex: arudhaRasiIdx,
      rasiName: arudhaRasi.name,
      rasiMalayalam: arudhaRasi.malayalamName || arudhaRasi.name
    },
    chandraLagna: {
      rasiIndex: moonRasiIdx,
      rasiName: moonRasi.name,
      rasiMalayalam: moonRasi.malayalamName || moonRasi.name,
      nakshatraName: moonStar.name,
      nakshatraMalayalam: moonStar.malayalamName,
      pada: moonPada
    },
    planets,
    outcome,
    outcomeMalayalam,
    successProbability: finalProbability,
    coreAnalysis: {
      en: analysisEn,
      ml: analysisMl
    },
    timingOfEvent: {
      en: timingEn,
      ml: timingMl
    },
    remedialGuidance: {
      en: remedyEn,
      ml: remedyMl
    }
  };
}
