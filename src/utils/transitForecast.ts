import * as Astronomy from 'astronomy-engine';
import { RASIS, NAKSHATRAS } from './astroData';
import { getPlanetSiderealLongitude } from './astronomy';

export interface TransitForecastInput {
  moonRasiIndex: number; // 0 to 11
  nakshatraId: number;   // 1 to 27
  currentDate?: Date;
}

export type SadeSatiStatus = 
  | 'none' 
  | 'rising' // 12th from Moon
  | 'peak'   // In Moon sign (Janma Shani)
  | 'setting'// 2nd from Moon
  | 'ashtama'// 8th from Moon
  | 'kandaka'; // 4th, 7th, 10th from Moon

export interface TransitReport {
  moonRasiName: string;
  moonRasiMalayalam: string;
  nakshatraName: string;
  nakshatraMalayalam: string;
  reportDateFormatted: string;

  // Saturn Transit (Shani Gocharam)
  saturn: {
    longitude: number;
    rasiIndex: number;
    rasiName: string;
    rasiMalayalam: string;
    houseFromMoon: number;
    sadeSatiStatus: SadeSatiStatus;
    sadeSatiTitleEn: string;
    sadeSatiTitleMl: string;
    impactDescriptionEn: string;
    impactDescriptionMl: string;
  };

  // Jupiter Transit (Guru Gocharam)
  jupiter: {
    longitude: number;
    rasiIndex: number;
    rasiName: string;
    rasiMalayalam: string;
    houseFromMoon: number;
    hasGuruBala: boolean;
    statusEn: string;
    statusMl: string;
    impactDescriptionEn: string;
    impactDescriptionMl: string;
  };

  // Rahu & Ketu Transit
  rahuKetu: {
    rahuRasiName: string;
    rahuRasiMalayalam: string;
    rahuHouse: number;
    ketuRasiName: string;
    ketuRasiMalayalam: string;
    ketuHouse: number;
    impactDescriptionEn: string;
    impactDescriptionMl: string;
  };

  // Overall Transit Index
  overallScore: number; // 0 to 100
  overallVerdictEn: string;
  overallVerdictMl: string;

  // Predictions
  predictions: {
    career: { en: string; ml: string };
    wealth: { en: string; ml: string };
    health: { en: string; ml: string };
    relationships: { en: string; ml: string };
  };

  remedies: {
    en: string[];
    ml: string[];
  };
}

export function calculateTransitForecast(input: TransitForecastInput): TransitReport {
  const date = input.currentDate || new Date();
  const moonRasi = RASIS[input.moonRasiIndex] || RASIS[0];
  const star = NAKSHATRAS.find(s => s.id === input.nakshatraId) || NAKSHATRAS[0];

  // Calculate real sidereal positions
  const saturnLon = getPlanetSiderealLongitude(Astronomy.Body.Saturn, date);
  const saturnRasiIdx = Math.floor(saturnLon / 30);
  const saturnRasi = RASIS[saturnRasiIdx];

  const jupiterLon = getPlanetSiderealLongitude(Astronomy.Body.Jupiter, date);
  const jupiterRasiIdx = Math.floor(jupiterLon / 30);
  const jupiterRasi = RASIS[jupiterRasiIdx];

  const rahuLon = getPlanetSiderealLongitude('Rahu', date);
  const rahuRasiIdx = Math.floor(rahuLon / 30);
  const rahuRasi = RASIS[rahuRasiIdx];

  const ketuLon = (rahuLon + 180) % 360;
  const ketuRasiIdx = Math.floor(ketuLon / 30);
  const ketuRasi = RASIS[ketuRasiIdx];

  // Houses relative to Moon Rasi (1-indexed)
  let saturnHouse = saturnRasiIdx - input.moonRasiIndex + 1;
  if (saturnHouse <= 0) saturnHouse += 12;

  let jupiterHouse = jupiterRasiIdx - input.moonRasiIndex + 1;
  if (jupiterHouse <= 0) jupiterHouse += 12;

  let rahuHouse = rahuRasiIdx - input.moonRasiIndex + 1;
  if (rahuHouse <= 0) rahuHouse += 12;

  let ketuHouse = ketuRasiIdx - input.moonRasiIndex + 1;
  if (ketuHouse <= 0) ketuHouse += 12;

  // Determine Ezharashani status
  let sadeSatiStatus: SadeSatiStatus = 'none';
  let sadeSatiTitleEn = 'Free of Ezharashani';
  let sadeSatiTitleMl = 'ഏഴരശ്ശനി ദോഷമില്ല';
  let saturnDescEn = '';
  let saturnDescMl = '';

  if (saturnHouse === 12) {
    sadeSatiStatus = 'rising';
    sadeSatiTitleEn = 'Ezharashani - Rising Phase (12th House)';
    sadeSatiTitleMl = 'ഏഴരശ്ശനി ആരംഭം (ആദ്യ ഘട്ടം - 12-ൽ)';
    saturnDescEn = 'Saturn transits the 12th house from your Moon sign. This marks the beginning of the 7.5-year cycle (Ezharashani), urging restraint in expenses, caution in travel, and mental discipline.';
    saturnDescMl = 'ശനി ചന്ദ്രന്റെ 12-ാം ഭാവത്തിൽ സഞ്ചരിക്കുന്നു. ഏഴരശ്ശനിയുടെ ആദ്യ ഘട്ടമായതിനാൽ അനാവശ്യ ചിലവുകൾ നിയന്ത്രിക്കാനും ആരോഗ്യത്തിലും യാത്രകളിലും കൂടുതൽ ജാഗ്രത പുലർത്താനും ശ്രദ്ധിക്കുക.';
  } else if (saturnHouse === 1) {
    sadeSatiStatus = 'peak';
    sadeSatiTitleEn = 'Janma Shani - Core Phase (In Moon Sign)';
    sadeSatiTitleMl = 'ജന്മശനി (ഏഴരശ്ശനി ഉച്ചസ്ഥായി - ജന്മത്തിൽ)';
    saturnDescEn = 'Saturn is directly transiting over your natal Moon sign. Known as Janma Shani, this period demands steadfast patience, resilience against emotional strain, and humility.';
    saturnDescMl = 'ശനി ജന്മരാശിയിൽ കൂടി സഞ്ചരിക്കുന്ന കാലഘട്ടമാണ്. ജോലിയിലും ജീവിതത്തിലും ക്ഷമയും വിവേകവും പാലിച്ച് മുന്നോട്ടു പോകേണ്ട സമയമാണ്.';
  } else if (saturnHouse === 2) {
    sadeSatiStatus = 'setting';
    sadeSatiTitleEn = 'Ezharashani - Setting Phase (2nd House)';
    sadeSatiTitleMl = 'ഏഴരശ്ശനി സമാപന ഘട്ടം (രണ്ടിൽ ശനി)';
    saturnDescEn = 'Saturn transits the 2nd house from your Moon sign. The intensity of previous years subsides, clearing past burdens and stabilizing family life and finances.';
    saturnDescMl = 'ശനി രണ്ടാം ഭാവത്തിൽ സഞ്ചരിക്കുന്നു. ഏഴരശ്ശനിയുടെ അവസാന ഘട്ടമായതിനാൽ മുൻകാല പ്രതിസന്ധികൾക്ക് അയവുണ്ടാകുകയും ക്രമേണ സമാധാനം കൈവരുകയും ചെയ്യും.';
  } else if (saturnHouse === 8) {
    sadeSatiStatus = 'ashtama';
    sadeSatiTitleEn = 'Ashtama Shani (Saturn in 8th)';
    sadeSatiTitleMl = 'അഷ്ടമശനി (എട്ടിൽ ശനി)';
    saturnDescEn = 'Saturn in the 8th house requires rigorous prudence in financial contracts, avoiding speculative ventures, and maintaining steady physical health.';
    saturnDescMl = 'അഷ്ടമത്തിൽ ശനി സഞ്ചരിക്കുന്ന കാലമാണ്. വലിയ സാമ്പത്തിക റിസ്കുകൾ ഒഴിവാക്കുകയും ദൈനംദിന കാര്യങ്ങളിൽ ശ്രദ്ധയോടെ മുന്നോട്ട് നീങ്ങുകയും വേണം.';
  } else if ([4, 7, 10].includes(saturnHouse)) {
    sadeSatiStatus = 'kandaka';
    sadeSatiTitleEn = `Kandaka Shani (Saturn in ${saturnHouse}th House)`;
    sadeSatiTitleMl = `കണ്ടകശ്ശനി (${saturnHouse}-ാം ഭാവത്തിൽ)`;
    saturnDescEn = `Saturn in the ${saturnHouse}th house brings increased professional workloads and responsibilities that eventually build long-term character and success.`;
    saturnDescMl = `ശനി ${saturnHouse}-ാം ഭാവത്തിൽ സഞ്ചരിക്കുന്നു. തൊഴിൽ രംഗത്ത് കൂടുതൽ ഉത്തരവാദിത്തങ്ങളും അധ്വാനവും ആവശ്യമായി വരുന്ന സമയമാണ്.`;
  } else {
    saturnDescEn = `Saturn is transiting your ${saturnHouse}th house from Moon. ${
      [3, 6, 11].includes(saturnHouse)
        ? 'This is a powerful Upachaya house placement giving victory over obstacles, career prestige, and financial stability.'
        : 'Saturn promotes deliberate growth through discipline and structured routine.'
    }`;
    saturnDescMl = `ശനി ചന്ദ്രനിൽ നിന്ന് ${saturnHouse}-ാം ഭാവത്തിലാണ്. ${
      [3, 6, 11].includes(saturnHouse)
        ? 'ശനി ഉപചയ സ്ഥാനങ്ങളിൽ സഞ്ചരിക്കുന്നതിനാൽ തടസ്സങ്ങൾ മാറി കാര്യവിജയവും സാമ്പത്തിക അഭിവൃദ്ധിയും ഉണ്ടാകും.'
        : 'സാധാരണ ഫലങ്ങൾ പ്രതീക്ഷിക്കാം. കൃത്യനിഷ്ഠയോടെയുള്ള പ്രവർത്തനം ഗുണം ചെയ്യും.'
    }`;
  }

  // Determine Jupiter status (Guru Bala)
  // Auspicious Guru Gocharam: 2, 5, 7, 9, 11
  const hasGuruBala = [2, 5, 7, 9, 11].includes(jupiterHouse);
  let jupiterStatusEn = hasGuruBala ? 'Auspicious Guru Bala (Shubha Gocharam)' : 'Moderate Transit (Supportive)';
  let jupiterStatusMl = hasGuruBala ? 'ഗുരുബലം ഉണ്ട് (ശുഭ ഗോചാരം)' : 'സാധാരണ വ്യാഴ മാറ്റം';
  let jupiterDescEn = hasGuruBala
    ? `Jupiter graces the ${jupiterHouse}th house from your Moon sign. This brings auspicious blessings, spiritual clarity, educational honors, and opportunities for prosperity.`
    : `Jupiter transits the ${jupiterHouse}th house from your Moon. Spiritual discipline and consulting mentors will unlock divine grace.`;
  let jupiterDescMl = hasGuruBala
    ? `വ്യാഴം ചന്ദ്രന്റെ ${jupiterHouse}-ാം ഭാവത്തിൽ സഞ്ചരിക്കുന്നു. ഉന്നതമായ ഗുരുബലമുള്ളതിനാൽ കുടുംബത്തിൽ മംഗളകർമ്മങ്ങൾ നടക്കാനും ഭാഗ്യം വർദ്ധിക്കാനും വഴിയൊരുങ്ങും.`
    : `വ്യാഴം ${jupiterHouse}-ാം ഭാവത്തിലാണ്. ഈശ്വര പ്രാർത്ഥനകളിലൂടെയും ഗുരുക്കന്മാരെ ആദരിക്കുന്നതിലൂടെയും തടസ്സങ്ങൾ തരണം ചെയ്യാം.`;

  // Rahu / Ketu Description
  let rahuKetuDescEn = `Rahu occupies the ${rahuHouse}th house and Ketu occupies the ${ketuHouse}th house. ${
    [3, 6, 11].includes(rahuHouse)
      ? 'Rahu in this house bestows courage to overcome competitors and bold breakthroughs.'
      : 'Rahu encourages exploration of novel concepts while Ketu deepens intuitive insights.'
  }`;
  let rahuKetuDescMl = `രാഹു ${rahuHouse}-ാം ഭാവത്തിലും കേതു ${ketuHouse}-ാം ഭാവത്തിലും സ്ഥിതിചെയ്യുന്നു. ${
    [3, 6, 11].includes(rahuHouse)
      ? 'രാഹുവിന്റെ അനുകൂല സ്ഥിതി കാരണം ശത്രുക്കളെ അതിജീവിക്കാനും ആത്മവിശ്വാസത്തോടെ പുതിയ കാര്യങ്ങൾ ഏറ്റെടുക്കാനും സാധിക്കും.'
      : 'ആത്മീയ ചിന്തകൾക്കും വിവേകത്തോടെയുള്ള തീരുമാനങ്ങൾക്കും ഈ സമയം അനുയോജ്യമാണ്.'
  }`;

  // Calculate Overall Transit Score
  let score = 60;
  if (hasGuruBala) score += 20;
  if ([3, 6, 11].includes(saturnHouse)) score += 15;
  if (['peak', 'ashtama'].includes(sadeSatiStatus)) score -= 20;
  else if (['rising', 'setting', 'kandaka'].includes(sadeSatiStatus)) score -= 10;
  if ([3, 6, 11].includes(rahuHouse)) score += 10;
  const overallScore = Math.max(30, Math.min(95, score));

  let overallVerdictEn = overallScore >= 75 ? 'Highly Supportive Cosmic Phase' : overallScore >= 55 ? 'Balanced Growth Period' : 'Testing Phase (Remedies Advised)';
  let overallVerdictMl = overallScore >= 75 ? 'അത്യന്തം അനുകൂലമായ ഗോചാര കാലഘട്ടം' : overallScore >= 55 ? 'മിശ്രഫലങ്ങളും പുരോഗതിയും' : 'ശ്രദ്ധയോടെ നീങ്ങേണ്ട സമയം';

  return {
    moonRasiName: moonRasi.name,
    moonRasiMalayalam: moonRasi.malayalamName || moonRasi.name,
    nakshatraName: star.name,
    nakshatraMalayalam: star.malayalamName,
    reportDateFormatted: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    
    saturn: {
      longitude: Number(saturnLon.toFixed(2)),
      rasiIndex: saturnRasiIdx,
      rasiName: saturnRasi.name,
      rasiMalayalam: saturnRasi.malayalamName || saturnRasi.name,
      houseFromMoon: saturnHouse,
      sadeSatiStatus,
      sadeSatiTitleEn,
      sadeSatiTitleMl,
      impactDescriptionEn: saturnDescEn,
      impactDescriptionMl: saturnDescMl
    },

    jupiter: {
      longitude: Number(jupiterLon.toFixed(2)),
      rasiIndex: jupiterRasiIdx,
      rasiName: jupiterRasi.name,
      rasiMalayalam: jupiterRasi.malayalamName || jupiterRasi.name,
      houseFromMoon: jupiterHouse,
      hasGuruBala,
      statusEn: jupiterStatusEn,
      statusMl: jupiterStatusMl,
      impactDescriptionEn: jupiterDescEn,
      impactDescriptionMl: jupiterDescMl
    },

    rahuKetu: {
      rahuRasiName: rahuRasi.name,
      rahuRasiMalayalam: rahuRasi.malayalamName || rahuRasi.name,
      rahuHouse,
      ketuRasiName: ketuRasi.name,
      ketuRasiMalayalam: ketuRasi.malayalamName || ketuRasi.name,
      ketuHouse,
      impactDescriptionEn: rahuKetuDescEn,
      impactDescriptionMl: rahuKetuDescMl
    },

    overallScore,
    overallVerdictEn,
    overallVerdictMl,

    predictions: {
      career: {
        en: hasGuruBala
          ? 'Jupiter’s supportive rays unlock promotion avenues, mentorship from superiors, and expansion into prestigious projects.'
          : 'Maintain steady diligence in your current role. Focus on skill refinement rather than hasty job switches.',
        ml: hasGuruBala
          ? 'തൊഴിൽ രംഗത്ത് അംഗീകാരങ്ങളും പുതിയ സ്ഥാനക്കയറ്റങ്ങളും ലഭിക്കാൻ അനുകൂലമായ സാഹചര്യമുണ്ട്.'
          : 'ജോലിയിൽ കൂടുതൽ ശ്രദ്ധ കേന്ദ്രീകരിക്കുക. എടുത്തുചാടിയുള്ള തൊഴിൽ മാറ്റങ്ങൾ ഒഴിവാക്കുക.'
      },
      wealth: {
        en: [2, 11].includes(jupiterHouse) || saturnHouse === 11
          ? 'Strong cash inflow is favored. Smart investments in land or long-term assets yield solid appreciation.'
          : 'Maintain liquid reserves and review household budgets carefully before committing to big capital expenditures.',
        ml: [2, 11].includes(jupiterHouse) || saturnHouse === 11
          ? 'സാമ്പത്തികമായി നല്ല നേട്ടങ്ങൾ ഉണ്ടാകും. മുൻകാല നിക്ഷേപങ്ങളിൽ നിന്ന് ലാഭം ലഭിക്കും.'
          : 'അനാവശ്യമായ ആഡംബര ചിലവുകൾ കുറച്ച് കൃത്യമായ സമ്പാദ്യ ശീലം പാലിക്കുക.'
      },
      health: {
        en: ['peak', 'ashtama'].includes(sadeSatiStatus)
          ? 'Watch out for physical fatigue, joint or back discomfort, and erratic sleep patterns. Daily walking and meditation will restore balance.'
          : 'Vitality remains harmonious. Align with seasonal Ayurvedic routines to maintain sustained energy.',
        ml: ['peak', 'ashtama'].includes(sadeSatiStatus)
          ? 'ക്ഷീണവും ഉറക്കക്കുറവും അനുഭവപ്പെടാൻ സാധ്യതയുള്ളതിനാൽ വ്യായാമവും ചിട്ടയായ ഭക്ഷണവും ശീലമാക്കുക.'
          : 'ആരോഗ്യം പൊതുവെ തൃപ്തികരമായി തുടരും. മാനസിക സന്തോഷം നിലനിർത്താൻ സാധിക്കും.'
      },
      relationships: {
        en: hasGuruBala || [5, 7].includes(jupiterHouse)
          ? 'Bliss in marital and family bonds. Single natives find meaningful alliances and familial harmony blooms.'
          : 'Practice transparent communication with partners to avoid misunderstandings generated by outside gossip.',
        ml: hasGuruBala || [5, 7].includes(jupiterHouse)
          ? 'കുടുംബജീവിതത്തിൽ സന്തോഷവും സമാധാനവും നിറയും. മംഗളകാര്യങ്ങൾക്ക് തുടക്കം കുറിക്കാൻ നല്ല സമയം.'
          : 'കുടുംബാംഗങ്ങളോട് സ്നേഹത്തോടെയും തുറന്ന മനസ്സോടെയും ഇടപെടുന്നത് ബന്ധങ്ങൾ ദൃഢമാക്കും.'
      }
    },

    remedies: {
      en: [
        'Light a sesame (til) oil lamp at a Lord Ayyappa or Shani temple on Saturdays.',
        'Chant the Hanuman Chalisa or Aditya Hridaya Stotram during morning hours.',
        'Donate black sesame seeds, iron vessels, or blue blankets to the underprivileged.',
        'Perform Guru Pooja or chant the Brihaspati Gayatri on Thursdays.'
      ],
      ml: [
        'ശനിയാഴ്ചകളിൽ അയ്യപ്പ ക്ഷേത്രത്തിലോ ശാസ്താ ക്ഷേത്രത്തിലോ എള്ളുതിരി കൊളുത്തുക.',
        'ഹനുമാൻ ചാലിസ നിത്യവും ജപിക്കുക, ശനീശ്വര സ്തോത്രം ചൊല്ലുക.',
        'സാധുക്കൾക്ക് അന്നദാനമോ വസ്ത്രദാനമോ നടത്തുക.',
        'വ്യാഴാഴ്ചകളിൽ ഗുരുവായൂരപ്പനെ പ്രാർത്ഥിക്കുകയും വ്യാഴ പ്രീതി വരുത്തുകയും ചെയ്യുക.'
      ]
    }
  };
}
