import * as Astronomy from 'astronomy-engine';
import { NAKSHATRAS, RASIS } from './astroData';
import { getPlanetSiderealLongitude, getAyanamsa } from './astronomy';

// ==========================================
// 1. CAREER & VOCATIONAL DIRECTION (KARMA PHALAM)
// ==========================================
export interface CareerForecastResult {
  karmaRasi: string;
  karmaRasiMl: string;
  karmaLord: string;
  karmaLordMl: string;
  careerArchetypeEn: string;
  careerArchetypeMl: string;
  suitableFieldsEn: string[];
  suitableFieldsMl: string[];
  leadershipScore: number; // 0 - 100
  entrepreneurshipScore: number; // 0 - 100
  corporateScore: number; // 0 - 100
  strengthsEn: string[];
  strengthsMl: string[];
  favorablePeriodsEn: string;
  favorablePeriodsMl: string;
  guidanceEn: string;
  guidanceMl: string;
}

export function calculateCareerForecast(starId: number, dob?: string, birthTime?: string): CareerForecastResult {
  const star = NAKSHATRAS.find(s => s.id === starId) || NAKSHATRAS[0];
  const janmaRasiIdx = RASIS.findIndex(r => r.name === star.defaultRashi);
  
  // 10th house from Janma Rasi (Karma Bhava in Chandra Lagna / Janma Jathakam)
  const tenthRasiIdx = (janmaRasiIdx + 9) % 12;
  const karmaRasi = RASIS[tenthRasiIdx];

  // Rulers of Rasis in Kerala tradition
  const RASI_LORDS: Record<number, { en: string; ml: string; element: string }> = {
    0: { en: 'Mars (Chovva)', ml: 'ചൊവ്വ', element: 'Fire' },      // Medam
    1: { en: 'Venus (Shukran)', ml: 'ശുക്രൻ', element: 'Earth' },   // Edavam
    2: { en: 'Mercury (Budhan)', ml: 'ബുധൻ', element: 'Air' },      // Mithunam
    3: { en: 'Moon (Chandran)', ml: 'ചന്ദ്രൻ', element: 'Water' },   // Karkidakam
    4: { en: 'Sun (Sooryan)', ml: 'സൂര്യൻ', element: 'Fire' },       // Chingam
    5: { en: 'Mercury (Budhan)', ml: 'ബുധൻ', element: 'Earth' },    // Kanni
    6: { en: 'Venus (Shukran)', ml: 'ശുക്രൻ', element: 'Air' },     // Thulam
    7: { en: 'Mars (Chovva)', ml: 'ചൊവ്വ', element: 'Water' },      // Vrischikam
    8: { en: 'Jupiter (Vyazham)', ml: 'വ്യാഴം', element: 'Fire' },  // Dhanu
    9: { en: 'Saturn (Shani)', ml: 'ശനി', element: 'Earth' },       // Makaram
    10: { en: 'Saturn (Shani)', ml: 'ശനി', element: 'Air' },        // Kumbham
    11: { en: 'Jupiter (Vyazham)', ml: 'വ്യാഴം', element: 'Water' }  // Meenam
  };

  const lord = RASI_LORDS[tenthRasiIdx];

  // Ephemeris verification of planetary influence
  const now = new Date();
  const sunLon = getPlanetSiderealLongitude(Astronomy.Body.Sun, now);
  const marsLon = getPlanetSiderealLongitude(Astronomy.Body.Mars, now);
  const jupLon = getPlanetSiderealLongitude(Astronomy.Body.Jupiter, now);
  const satLon = getPlanetSiderealLongitude(Astronomy.Body.Saturn, now);

  const sunRasi = Math.floor(sunLon / 30);
  const marsRasi = Math.floor(marsLon / 30);
  const jupRasi = Math.floor(jupLon / 30);
  const satRasi = Math.floor(satLon / 30);

  // Scores based on Karma lord and element
  let leadership = 65;
  let entrepreneurship = 60;
  let corporate = 60;

  if (lord.en.includes('Sun') || lord.en.includes('Mars')) {
    leadership += 25;
    entrepreneurship += 20;
    corporate += 5;
  } else if (lord.en.includes('Mercury') || lord.en.includes('Venus')) {
    entrepreneurship += 25;
    corporate += 20;
    leadership += 10;
  } else if (lord.en.includes('Jupiter')) {
    leadership += 20;
    corporate += 25;
    entrepreneurship += 15;
  } else if (lord.en.includes('Saturn')) {
    corporate += 30;
    entrepreneurship += 10;
    leadership += 15;
  }

  // Cap at 95
  leadership = Math.min(95, Math.max(45, leadership));
  entrepreneurship = Math.min(95, Math.max(40, entrepreneurship));
  corporate = Math.min(95, Math.max(40, corporate));

  // Determine Archetype and Fields
  let archetypeEn = 'Visionary Leader & Strategist';
  let archetypeMl = 'നേതൃത്വപാടവമുള്ള കർമ്മധീരൻ';
  let fieldsEn: string[] = [];
  let fieldsMl: string[] = [];
  let strengthsEn: string[] = [];
  let strengthsMl: string[] = [];

  switch (tenthRasiIdx) {
    case 0: // Medam (Mars)
    case 7: // Vrischikam (Mars)
      archetypeEn = 'Dynamic Pioneer & Executive Driver';
      archetypeMl = 'സാഹസികതയും കാര്യശേഷിയുമുള്ള മുന്നണി പോരാളി';
      fieldsEn = ['Defense, Police & Security Services', 'Civil & Mechanical Engineering', 'Surgery, Medicine & Diagnostics', 'Real Estate & Construction', 'Sports Management & Athletics'];
      fieldsMl = ['പ്രതിരോധം, പോലീസ്, സുരക്ഷാ മേഖലകൾ', 'സിവിൽ, മെക്കാനിക്കൽ എൻജിനീയറിംഗ്', 'ശസ്ത്രക്രിയ, മെഡിസിൻ, ഡയഗ്നോസ്റ്റിക്സ്', 'റിയൽ എസ്റ്റേറ്റ്, നിർമ്മാണ മേഖല', 'കായിക മേഖല, അഡ്വഞ്ചർ സ്പോർട്സ്'];
      strengthsEn = ['Quick, decisive decision-making under high pressure', 'Natural executive command and fearlessness', 'High physical and intellectual stamina'];
      strengthsMl = ['സമ്മർദ്ദങ്ങൾക്കിടയിലും കൃത്യമായ പെട്ടെന്നുള്ള തീരുമാനങ്ങൾ', 'ഭയമില്ലായ്മയും അധികാര നേതൃത്വ ശേഷിയും', 'ശാരീരികവും മാനസികവുമായ ഉയർന്ന ഊർജ്ജസ്വലത'];
      break;
    case 1: // Edavam (Venus)
    case 6: // Thulam (Venus)
      archetypeEn = 'Creative Innovator & Financial Diplomat';
      archetypeMl = 'സൗന്ദര്യബോധവും സാമ്പത്തിക കാര്യപ്രാപ്തിയുമുള്ള നയതന്ത്രജ്ഞൻ';
      fieldsEn = ['Banking, Wealth Advisory & Investment', 'Architecture, Interior & Fashion Design', 'Hospitality, Tourism & Luxury Retail', 'Media, Film & Performing Arts', 'Legal Arbitration & Diplomacy'];
      fieldsMl = ['ബാങ്കിംഗ്, ഫിനാൻഷ്യൽ അഡ്വൈസറി, നിക്ഷേപം', 'വാസ്തുശില്പം, ഇന്റീരിയർ, ഫാഷൻ ഡിസൈനിംഗ്', 'ഹോസ്പിറ്റാലിറ്റി, ടൂറിസം, ലക്ഷ്വറി വ്യാപാരം', 'സിനിമ, മാധ്യമങ്ങൾ, ലളിതകലകൾ', 'നിയമ മധ്യസ്ഥത, നയതന്ത്രം'];
      strengthsEn = ['Refined aesthetic taste and diplomatic negotiation', 'Prudent asset management and client relationship mastery', 'Harmonious team building and brand creation'];
      strengthsMl = ['ഉയർന്ന സൗന്ദര്യബോധവും സമവായ ചർച്ചാ സാമർത്ഥ്യവും', 'കൃത്യമായ സാമ്പത്തിക ആസൂത്രണവും സൗഹൃദ ബന്ധങ്ങളും', 'ടീം വർക്കും ബ്രാൻഡ് ബിൽഡിംഗ് മികവും'];
      break;
    case 2: // Mithunam (Mercury)
    case 5: // Kanni (Mercury)
      archetypeEn = 'Analytical Strategist & Technology Architect';
      archetypeMl = 'ബുദ്ധിശക്തിയും ഗവേഷണ താല്പര്യവുമുള്ള വിശകലന വിദഗ്ദ്ധൻ';
      fieldsEn = ['Software Architecture, AI & Data Analytics', 'Chartered Accountancy & Financial Auditing', 'Journalism, Publishing & Communications', 'Commerce, Supply Chain & Logistics', 'Education, Scientific Research & Linguistics'];
      fieldsMl = ['സോഫ്റ്റ്‌വെയർ, AI, ഡാറ്റാ അനലിറ്റിക്സ്', 'ചാർട്ടേഡ് അക്കൗണ്ടൻസി, ഓഡിറ്റിംഗ്', 'പത്രപ്രവർത്തനം, മാധ്യമം, പബ്ലിഷിംഗ്', 'ഇ-കൊമേഴ്സ്, ലോജിസ്റ്റിക്സ്, വ്യാപാരം', 'വിദ്യാഭ്യാസം, ശാസ്ത്ര ഗവേഷണം, ഭാഷാശാസ്ത്രം'];
      strengthsEn = ['Sharp intellect and rapid learning agility', 'Exceptional verbal and written communication', 'Data-driven problem-solving and process optimization'];
      strengthsMl = ['സൂക്ഷ്മ നിരീക്ഷണ ബുദ്ധിയും പഠന മികവും', 'മികച്ച ആശയവിനിമയ ശേഷിയും വാക്ചാതുര്യവും', 'യുക്തിപരമായ പ്രശ്നപരിഹാര പാടവം'];
      break;
    case 3: // Karkidakam (Moon)
      archetypeEn = 'Empathetic Administrator & Public Mentor';
      archetypeMl = 'ജനസമ്പർക്കവും സാമൂഹിക പ്രതിബദ്ധതയുമുള്ള ഭരണാധികാരി';
      fieldsEn = ['Healthcare, Nursing & Hospital Administration', 'Public Administration & Civil Services', 'Human Resources & Talent Development', 'Marine, Dairy & Food Processing', 'Psychology & Mental Health Counseling'];
      fieldsMl = ['ആരോഗ്യ പരിപാലനം, ആശുപത്രി അഡ്മിനിസ്ട്രേഷൻ', 'സിവിൽ സർവീസ്, പബ്ലിക് അഡ്മിനിസ്ട്രേഷൻ', 'ഹ്യൂമൻ റിസോഴ്സസ് (HR), പേഴ്സണൽ മാനേജ്മെന്റ്', 'ഡയറി, മറൈൻ, ഭക്ഷ്യ സംസ്കരണ മേഖല', 'മനഃശാസ്ത്രം, കൗൺസിലിംഗ് സേവനങ്ങൾ'];
      strengthsEn = ['Deep emotional intelligence and empathy', 'Strong public rapport and community resonance', 'Calm nurturing of organizations and talent'];
      strengthsMl = ['ഉയർന്ന വൈകാരിക ബുദ്ധിശക്തിയും സഹാനുഭൂതിയും', 'ജനങ്ങളുമായി എളുപ്പത്തിൽ ഇഴുകിച്ചേരാനുള്ള കഴിവ്', 'സ്ഥാപനങ്ങളെ സുരക്ഷിതമായി നയിക്കാനുള്ള പ്രാപ്തി'];
      break;
    case 4: // Chingam (Sun)
      archetypeEn = 'Sovereign Leader & Institutional Authority';
      archetypeMl = 'പ്രൗഢിയും ഇച്ഛാശക്തിയുമുള്ള ഭരണനായകൻ';
      fieldsEn = ['Government Leadership & Politics', 'Corporate C-Suite (CEO/COO/Director)', 'Entrepreneurship & Conglomerate Ownership', 'Judiciary & Public Policy', 'Defense Command & High Administration'];
      fieldsMl = ['ഭരണരംഗം, രാഷ്ട്രീയം, ഭരണകൂട പദവികൾ', 'കോർപ്പറേറ്റ് ഉന്നത നേതൃത്വം (CEO, ഡയറക്ടർ)', 'സ്വന്തം സംരംഭങ്ങൾ, ബിസിനസ്സ് ഉടമസ്ഥത', 'നീതിന്യായ വകുപ്പ്, പോളിസി മേക്കിംഗ്', 'പ്രതിരോധ നേതൃത്വം, ഉന്നത ഉദ്യോഗങ്ങൾ'];
      strengthsEn = ['Magnanimous presence and commanding authority', 'High ethical integrity and inspiring vision', 'Unshakable self-confidence in crisis management'];
      strengthsMl = ['വ്യക്തിപ്രഭാവവും ആജ്ഞാശക്തിയും', 'ധാർമ്മിക ബോധവും ദീർഘവീക്ഷണമുള്ള കാഴ്ചപ്പാടും', 'പ്രതിസന്ധികളിൽ പതറാത്ത ആത്മവിശ്വാസം'];
      break;
    case 8: // Dhanu (Jupiter)
    case 11: // Meenam (Jupiter)
      archetypeEn = 'Eminent Counselor & Institutional Mentor';
      archetypeMl = 'ജ്ഞാനവും ദാർശനിക കാഴ്ചപ്പാടുമുള്ള ഉപദേശകൻ';
      fieldsEn = ['Higher Academia, Professorship & Research', 'Law, Judiciary & Constitutional Counsel', 'Wealth Management & Institutional Treasury', 'Philosophical & Spiritual Leadership', 'International Development & Philanthropy'];
      fieldsMl = ['ഉന്നത വിദ്യാഭ്യാസം, പ്രൊഫസർഷിപ്പ്, ഗവേഷണം', 'നിയമം, ജുഡീഷ്യറി, കോൺസ്റ്റിറ്റ്യൂഷണൽ കൺസൾട്ടേഷൻ', 'വൻകിട സാമ്പത്തിക മാനേജ്മെന്റ്, ട്രഷറി', 'ആത്മീയ, സാമൂഹിക, സാംസ്കാരിക നേതൃത്വം', 'അന്താരാഷ്ട്ര ഏജൻസികൾ, ചാരിറ്റി ഫൗണ്ടേഷൻ'];
      strengthsEn = ['Unrivaled moral authority and advisory wisdom', 'Long-term strategic foresight', 'Deep spiritual and ethical foundation'];
      strengthsMl = ['ഉയർന്ന നീതിബോധവും മൂല്യാധിഷ്ഠിത ഉപദേശക മികവും', 'ദീർഘകാല തന്ത്രപരമായ മുൻകാഴ്ച', 'ആഴത്തിലുള്ള ജ്ഞാനവും പക്വതയും'];
      break;
    default: // 9, 10 Makaram / Kumbham (Saturn)
      archetypeEn = 'Industrial Builder & Operational Pillar';
      archetypeMl = 'കഠിനാധ്വാനവും സംഘടനാ മികവുമുള്ള കർമ്മയോഗി';
      fieldsEn = ['Heavy Manufacturing, Mining & Metals', 'Infrastructure, Transport & Urban Planning', 'Labor Law, Industrial Relations & Governance', 'Renewable Energy & Agriculture Systems', 'Public Service & Social Empowerment'];
      fieldsMl = ['വൻകിട നിർമ്മാണം, മൈനിംഗ്, മെറ്റലർജി', 'റെയിൽവേ, ഗതാഗതം, ഇൻഫ്രാസ്ട്രക്ചർ ഡെവലപ്മെന്റ്', 'തൊഴിൽ നിയമം, ഇൻഡസ്ട്രിയൽ റിലേഷൻസ്', 'പുനരുപയോഗ ഊർജ്ജം, കൃഷി സാങ്കേതികവിദ്യ', 'സന്നദ്ധ പ്രവർത്തനം, സാമൂഹിക ശാക്തീകരണം'];
      strengthsEn = ['Unrelenting perseverance and disciplined execution', 'Methodical mastery of complex large-scale systems', 'Quiet resilience and grounded authenticity'];
      strengthsMl = ['അചഞ്ചലമായ പരിശ്രമശീലവും കൃത്യനിഷ്ഠയും', 'സങ്കീർണ്ണമായ പ്രക്രിയകൾ വ്യവസ്ഥാപിതമായി നടപ്പാക്കാനുള്ള കഴിവ്', 'പ്രതിബന്ധങ്ങളെ അതിജീവിക്കാനുള്ള മനക്കരുത്ത്'];
      break;
  }

  return {
    karmaRasi: karmaRasi.name,
    karmaRasiMl: karmaRasi.malayalamName,
    karmaLord: lord.en,
    karmaLordMl: lord.ml,
    careerArchetypeEn: archetypeEn,
    careerArchetypeMl: archetypeMl,
    suitableFieldsEn: fieldsEn,
    suitableFieldsMl: fieldsMl,
    leadershipScore: leadership,
    entrepreneurshipScore: entrepreneurship,
    corporateScore: corporate,
    strengthsEn,
    strengthsMl,
    favorablePeriodsEn: `When your 10th lord (${lord.en}) or Jupiter/Sun transit auspicious houses (1st, 5th, 9th, 10th, 11th from Janma Rasi), major promotions and business breakthroughs occur.`,
    favorablePeriodsMl: `നിങ്ങളുടെ കർമ്മാധിപനായ ${lord.ml} അല്ലെങ്കിൽ വ്യാഴം, സൂര്യൻ എന്നിവർ ജനന രാശിയുടെ 1, 5, 9, 10, 11 ഭാവങ്ങളിൽ സഞ്ചരിക്കുന്ന കാലഘട്ടങ്ങളിൽ ഉദ്യോഗക്കയറ്റവും ബിസിനസ്സിൽ വലിയ വിജയവും കൈവരിക്കും.`,
    guidanceEn: `Align your vocation with the elemental nature of your Karma Bhava (${karmaRasi.name} - ${lord.element}). Consistent discipline and maintaining ethical integrity in dealings will ensure lasting fame and prosperity.`,
    guidanceMl: `നിങ്ങളുടെ പത്താം ഭാവത്തിന്റെ (${karmaRasi.malayalamName} - ${lord.element}) പ്രകൃതിക്കനുസൃതമായ തൊഴിൽ തിരഞ്ഞെടുക്കുക. സത്യസന്ധതയും കൃത്യനിഷ്ഠയും പാലിക്കുന്നത് ദീർഘകാല പ്രശസ്തിയും സാമ്പത്തിക സുരക്ഷിതത്വവും ഉറപ്പുനൽകും.`
  };
}

// ==========================================
// 2. MEDICAL ASTROLOGY (AYUR-JYOTISH & TRIDOSHA)
// ==========================================
export interface MedicalAstrologyResult {
  primaryDosha: 'Vata' | 'Pitta' | 'Kapha' | 'Vata-Pitta' | 'Pitta-Kapha' | 'Vata-Kapha';
  primaryDoshaMl: string;
  vulnerableOrganEn: string;
  vulnerableOrganMl: string;
  constitutionalAnalysisEn: string;
  constitutionalAnalysisMl: string;
  healthRiskCyclesEn: string;
  healthRiskCyclesMl: string;
  dietaryRecommendationsEn: string[];
  dietaryRecommendationsMl: string[];
  ayurvedicRemediesEn: string[];
  ayurvedicRemediesMl: string[];
  templeVazhipaduEn: string;
  templeVazhipaduMl: string;
}

export function calculateMedicalAstrology(starId: number): MedicalAstrologyResult {
  const star = NAKSHATRAS.find(s => s.id === starId) || NAKSHATRAS[0];
  const janmaRasiIdx = RASIS.findIndex(r => r.name === star.defaultRashi);
  
  // 6th house is Roga Bhava (Illness / Constitutional weakness)
  const sixthRasiIdx = (janmaRasiIdx + 5) % 12;
  const sixthRasi = RASIS[sixthRasiIdx];

  // 8th house is Ayur Bhava
  const eighthRasiIdx = (janmaRasiIdx + 7) % 12;

  // Traditional Kerala Nakshatra Tridosha classification
  // 27 stars grouped into Vata, Pitta, Kapha
  const DOSHA_MAP: Record<number, { type: 'Vata' | 'Pitta' | 'Kapha'; ml: string }> = {
    1: { type: 'Vata', ml: 'വാതം (Vata)' },     // Aswathi
    2: { type: 'Pitta', ml: 'പിത്തം (Pitta)' },  // Bharani
    3: { type: 'Kapha', ml: 'കഫം (Kapha)' },    // Karthika
    4: { type: 'Kapha', ml: 'കഫം (Kapha)' },    // Rohini
    5: { type: 'Pitta', ml: 'പിത്തം (Pitta)' },  // Makayiram
    6: { type: 'Vata', ml: 'വാതം (Vata)' },     // Thiruvathira
    7: { type: 'Vata', ml: 'വാതം (Vata)' },     // Punartham
    8: { type: 'Pitta', ml: 'പിത്തം (Pitta)' },  // Pooyam
    9: { type: 'Kapha', ml: 'കഫം (Kapha)' },    // Aayilyam
    10: { type: 'Kapha', ml: 'കഫം (Kapha)' },   // Makam
    11: { type: 'Pitta', ml: 'പിത്തം (Pitta)' }, // Pooram
    12: { type: 'Vata', ml: 'വാതം (Vata)' },    // Uthram
    13: { type: 'Vata', ml: 'വാതം (Vata)' },    // Atham
    14: { type: 'Pitta', ml: 'പിത്തം (Pitta)' }, // Chithira
    15: { type: 'Kapha', ml: 'കഫം (Kapha)' },   // Chothi
    16: { type: 'Kapha', ml: 'കഫം (Kapha)' },   // Vishakham
    17: { type: 'Pitta', ml: 'പിത്തം (Pitta)' }, // Anizham
    18: { type: 'Vata', ml: 'വാതം (Vata)' },    // Thrikketta
    19: { type: 'Vata', ml: 'വാതം (Vata)' },    // Moolam
    20: { type: 'Pitta', ml: 'പിത്തം (Pitta)' }, // Pooradam
    21: { type: 'Kapha', ml: 'കഫം (Kapha)' },   // Uthradam
    22: { type: 'Kapha', ml: 'കഫം (Kapha)' },   // Thiruvonam
    23: { type: 'Pitta', ml: 'പിത്തം (Pitta)' }, // Avittam
    24: { type: 'Vata', ml: 'വാതം (Vata)' },    // Chathayam
    25: { type: 'Vata', ml: 'വാതം (Vata)' },    // Pooruruttathi
    26: { type: 'Pitta', ml: 'പിത്തം (Pitta)' }, // Uthrattathi
    27: { type: 'Kapha', ml: 'കഫം (Kapha)' },   // Revathi
  };

  const starDosha = DOSHA_MAP[star.id] || { type: 'Vata' as const, ml: 'വാതം (Vata)' };

  // Kalapurusha organ mapping for 6th and 8th Bhava
  const ORGAN_MAP: Record<number, { en: string; ml: string }> = {
    0: { en: 'Head, Brain, Cranial Nerves, Eyes', ml: 'തല, മസ്തിഷ്കം, കണ്ണ്, രക്തസമ്മർദ്ദം' },
    1: { en: 'Throat, Vocal Cords, Thyroid, Teeth', ml: 'തൊണ്ട, തൈറോയ്ഡ്, സ്വനപേടകം, പല്ലുകൾ' },
    2: { en: 'Lungs, Bronchial tubes, Shoulders, Arms', ml: 'ശ്വാസകോശം, തോളുകൾ, ശ്വാസനാളി' },
    3: { en: 'Stomach, Digestion, Chest, Breast, Lymphatics', ml: 'വയർ, ദഹനം, നെഞ്ച്, ലിംഫാറ്റിക് സിസ്റ്റം' },
    4: { en: 'Heart, Spine, Upper Back, Vital Circulation', ml: 'ഹൃദയം, നട്ടെല്ല്, രക്തചംക്രമണം' },
    5: { en: 'Intestines, Abdomen, Pancreas, Gut Microbiome', ml: 'കുടൽ, വയറുവേദന, പാൻക്രിയാസ്, ദഹനരസങ്ങൾ' },
    6: { en: 'Kidneys, Adrenals, Lumbar region, Skin balance', ml: 'വൃക്കകൾ (Kidneys), അടിവയർ, ത്വക്ക്' },
    7: { en: 'Urinary Bladder, Reproductive system, Pelvis', ml: 'മൂത്രാശയം, ജനനേന്ദ്രിയങ്ങൾ, പെൽവിക് ഭാഗം' },
    8: { en: 'Liver, Arterial system, Hips, Thighs', ml: 'കരൾ (Liver), അരക്കെട്ട്, തുടകൾ, ധമനികൾ' },
    9: { en: 'Knees, Joints, Skeletal framework, Teeth', ml: 'മുട്ടുകൾ, സന്ധികൾ, അസ്ഥികൾ, സന്ധിവാതം' },
    10: { en: 'Calves, Ankles, Nervous circulation, Shin bones', ml: 'കണങ്കാലുകൾ, നാഡീവ്യൂഹം, ഞരമ്പുകൾ' },
    11: { en: 'Feet, Soles, Lymphatic fluids, Immune vitality', ml: 'പാദങ്ങൾ, ലിംഫ്, രോഗപ്രതിരോധ ശേഷി' },
  };

  const organ = ORGAN_MAP[sixthRasiIdx];

  let dietEn: string[] = [];
  let dietMl: string[] = [];
  let ayurvedaEn: string[] = [];
  let ayurvedaMl: string[] = [];

  if (starDosha.type === 'Vata') {
    dietEn = [
      'Warm, nourishing, cooked meals with healthy fats (ghee, sesame oil)',
      'Sweet, sour, and salty flavors; avoid dry and raw cold foods',
      'Hydrate with warm ginger, cumin, or fennel water throughout the day'
    ];
    dietMl = [
      'നെയ്യ്, നല്ലെണ്ണ എന്നിവ ചേർത്ത ചൂടുള്ളതും എളുപ്പം ദഹിക്കുന്നതുമായ ഭക്ഷണം കഴിക്കുക',
      'തണുത്തതും ഉണങ്ങിയതുമായ ഭക്ഷണങ്ങൾ ഒഴിവാക്കുക; മധുരം, പുളി, ഉപ്പ് രസങ്ങൾ മിതമായി ഉപയോഗിക്കുക',
      'ചുക്കും ജീരകവും ഇട്ടു തിളപ്പിച്ച ചെറുചൂടുവെള്ളം പതിവായി കുടിക്കുക'
    ];
    ayurvedaEn = [
      'Daily Abhyanga (warm sesame oil self-massage) to calm nervous system',
      'Ashwagandha or Brahmi rasayanam for mental tranquility and bone strength',
      'Gentle yoga, pranayama (Nadi Shodhana), and grounding meditation'
    ];
    ayurvedaMl = [
      'വാതശമനത്തിനായി ധന്വന്തരം തൈലം തേച്ചുള്ള നിത്യേനയുള്ള എണ്ണക്കുളി (അഭ്യംഗം)',
      'അശ്വഗന്ധാദി അല്ലെങ്കിൽ ബ്രാഹ്മീ രസായനം സേവിക്കുന്നത് നാഡികൾക്ക് ബലം നൽകും',
      'നാഡീശുദ്ധി പ്രാണായാമവും ചിട്ടയായ യോഗാഭ്യാസവും ശീലിക്കുക'
    ];
  } else if (starDosha.type === 'Pitta') {
    dietEn = [
      'Cooling, fresh foods like cucumber, coconut water, melons, and leafy greens',
      'Sweet, bitter, and astringent tastes; minimize overly spicy, sour, and fermented foods',
      'Pure cow ghee and coriander-infused cooling herbal drinks'
    ];
    dietMl = [
      'ഇളനീർ, കക്കിരി, തണ്ണിമത്തൻ, പച്ചക്കറികൾ എന്നിവ ഭക്ഷണത്തിൽ ഉൾപ്പെടുത്തുക',
      'അമിതമായ എരിവ്, പുളി, മസാലകൾ, വറുത്ത ഭക്ഷണങ്ങൾ എന്നിവ കർശനമായി കുറയ്ക്കുക',
      'പശുവിൻ നെയ്യ് മിതമായി ഉപയോഗിക്കുക; മല്ലിയിട്ടു തിളപ്പിച്ച വെള്ളം കുടിക്കുക'
    ];
    ayurvedaEn = [
      'Ksheeradhara or Takradhara to alleviate excessive body heat and acidity',
      'Triphala churnam with warm water at bedtime for gastrointestinal harmony',
      'Sheetali and Sheetkari cooling breathing techniques'
    ];
    ayurvedaMl = [
      'ശരീരത്തിലെ അമിത ഉഷ്ണം കുറയ്ക്കാൻ തക്രധാരയോ ക്ഷീരധാരയോ ഉചിതമാണ്',
      'ദഹന ക്രമീകരണത്തിനായി രാത്രിയിൽ ത്രിഫലാ ചൂർണ്ണം ചെറുചൂടുവെള്ളത്തിൽ സേവിക്കുക',
      'ശീതളി, ശീത്കാരി തുടങ്ങിയ ശീതീകരണ പ്രാണായാമങ്ങൾ പരിശീലിക്കുക'
    ];
  } else {
    dietEn = [
      'Light, warm, pungent, bitter, and astringent foods to stimulate metabolism',
      'Abstain from heavy dairy, fried foods, excess sweets, and iced drinks',
      'Drink warm water boiled with black pepper, dry ginger, and tulsi'
    ];
    dietMl = [
      'എളുപ്പം ദഹിക്കുന്ന ലഘുഭക്ഷണങ്ങൾ, ചൂടുള്ള സൂപ്പുകൾ എന്നിവ കഴിക്കുക',
      'അമിതമായ മധുരം, എണ്ണയിൽ വറുത്ത പലഹാരങ്ങൾ, ഐസ് വാട്ടർ എന്നിവ പൂർണ്ണമായും ഒഴിവാക്കുക',
      'കുരുമുളക്, തുളസി, ചുക്ക് എന്നിവയിട്ടു തിളപ്പിച്ച വെള്ളം കുടിക്കുന്നത് കഫക്കെട്ട് തടയും'
    ];
    ayurvedaEn = [
      'Udvartana (dry herbal powder massage) to enhance metabolic circulation',
      'Trikatu churnam with pure raw honey to clear respiratory pathways',
      'Dynamic Surya Namaskars and brisk morning walking'
    ];
    ayurvedaMl = [
      'ഉദ്വർത്തനം (ഔഷധപ്പൊടികൾ കൊണ്ടുള്ള തിരുമ്മൽ) മേദസ്സും കഫവും കുറയ്ക്കും',
      'ത്രികടു ചൂർണ്ണം ചെറുതേനിൽ ചാലിച്ച് കഴിക്കുന്നത് ശ്വാസകോശത്തിന് ഉത്തമമാണ്',
      'ദിവസേനയുള്ള സൂര്യനമസ്കാരവും വേഗത്തിലുള്ള നടത്തവും ശീലമാക്കുക'
    ];
  }

  return {
    primaryDosha: starDosha.type,
    primaryDoshaMl: starDosha.ml,
    vulnerableOrganEn: organ.en,
    vulnerableOrganMl: organ.ml,
    constitutionalAnalysisEn: `Born under ${star.name}, your primary biological constitution leans towards ${starDosha.type}. The 6th house falling in ${sixthRasi.name} indicates that special care must be given to the ${organ.en}, particularly during stressful periods or dietary transgressions.`,
    constitutionalAnalysisMl: `${star.malayalamName} നക്ഷത്രത്തിൽ ജനിച്ച താങ്കളുടെ ശാരീരിക പ്രകൃതം ${starDosha.ml} സ്വാധീനമുള്ളതാണ്. രോഗ ഭാവമായ ആറാം ഭാവം ${sixthRasi.malayalamName} രാശിയിൽ വരുന്നതിനാൽ ${organ.ml} സംബന്ധമായ കാര്യങ്ങളിൽ പ്രത്യേകം ശ്രദ്ധ പുലർത്തേണ്ടതാണ്.`,
    healthRiskCyclesEn: `Exercise heightened caution during Chandra Ashtama days, Rahu/Ketu major dasha transitions, and seasonal shifts (Varsha Ritu / monsoon and Sisira Ritu / winter).`,
    healthRiskCyclesMl: `ചന്ദ്രാഷ്ടമ ദിനങ്ങളിലും, രാഹു/കേതു ദശാസന്ധികളിലും, തുലാവർഷം/വേനൽക്കാലം തുടങ്ങിയ ഋതുമാറ്റ വേളകളിലും ആരോഗ്യകാര്യങ്ങളിൽ അതീവ ജാഗ്രത പുലർത്തുക.`,
    dietaryRecommendationsEn: dietEn,
    dietaryRecommendationsMl: dietMl,
    ayurvedicRemediesEn: ayurvedaEn,
    ayurvedicRemediesMl: ayurvedaMl,
    templeVazhipaduEn: 'Dhanwanthari Pooja / Mrityunjaya Homam at sacred Shiva/Vishnu temples for physical vitality and longevity.',
    templeVazhipaduMl: 'ആയുരാരോഗ്യ വർദ്ധനവിനായി ധന്വന്തരി പൂജ, മൃത്യുഞ്ജയ ഹോമം, ശിവക്ഷേത്രത്തിൽ ധാര എന്നിവ നടത്തുന്നത് അതീവ ഫലപ്രദമാണ്.'
  };
}

// ==========================================
// 3. SURGICAL & TREATMENT TIMING (CHIKITSA MUHURTHAM)
// ==========================================
export interface ChikitsaMuhurthamDate {
  date: Date;
  dateFormatted: string;
  starNameEn: string;
  starNameMl: string;
  tithiNameEn: string;
  tithiNameMl: string;
  weekdayEn: string;
  weekdayMl: string;
  muhurthaWindow: string;
  quality: 'Excellent' | 'Good';
  recommendationEn: string;
  recommendationMl: string;
}

export function findChikitsaMuhurthams(janmaStarId: number): ChikitsaMuhurthamDate[] {
  const dates: ChikitsaMuhurthamDate[] = [];
  const today = new Date();
  const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 8, 30, 0);

  // Healing stars traditionally favored for treatments & surgeries in Kerala Jyothisham
  // Ashwini, Rohini, Mrigashira, Punartham, Pushyam, Atham, Chithira, Anizham, Thiruvonam, Chathayam, Revathi
  const HEALING_STARS = [1, 4, 5, 7, 8, 13, 14, 17, 22, 24, 27];

  const WEEKDAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const WEEKDAYS_ML = ['ഞായർ', 'തിങ്കൾ', 'ചൊവ്വ', 'ബുധൻ', 'വ്യാഴം', 'വെള്ളി', 'ശനി'];

  for (let i = 0; i < 90; i++) {
    const candidate = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
    const dayOfWeek = candidate.getDay();

    // In Kerala Jyothisham, Tuesday is ruled by Mars (Chovva) and Saturday by Saturn (Shani).
    // For elective, scheduled surgery, Tuesday and Saturday are strictly avoided unless it is a war/acute trauma case.
    if (dayOfWeek === 2 || dayOfWeek === 6) continue;

    const moonLon = getPlanetSiderealLongitude(Astronomy.Body.Moon, candidate);
    const sunLon = getPlanetSiderealLongitude(Astronomy.Body.Sun, candidate);

    const starIdx = Math.floor(moonLon / (360 / 27));
    const starId = starIdx + 1;
    const star = NAKSHATRAS[starIdx];

    // Must be an auspicious healing star
    if (!HEALING_STARS.includes(starId)) continue;

    // Tithi check: Exclude Riktha Tithis (4, 9, 14 in both Shukla & Krishna Paksha) and Amavasi (30)
    let diffLon = moonLon - sunLon;
    if (diffLon < 0) diffLon += 360;
    const tithiIdx = Math.floor(diffLon / 12);
    const tithiInPaksha = (tithiIdx % 15) + 1;
    if (tithiInPaksha === 4 || tithiInPaksha === 9 || tithiInPaksha === 14 || tithiIdx === 29) {
      continue;
    }

    // Check Tarabalam for individual's Janma Star
    const count = ((starId - janmaStarId + 27) % 27) + 1;
    const tara = (count - 1) % 9;
    // Exclude Vipat (2), Pratyak (4), Naidhana / Vadha (6)
    if (tara === 2 || tara === 4 || tara === 6) continue;

    // Check Chandra Ashtama: Current Moon Rasi must not be 8th from Janma Rasi
    const janmaStar = NAKSHATRAS.find(s => s.id === janmaStarId);
    const janmaRasiIdx = janmaStar ? RASIS.findIndex(r => r.name === janmaStar.defaultRashi) : 0;
    const currentMoonRasiIdx = Math.floor(moonLon / 30);
    const houseDiff = ((currentMoonRasiIdx - janmaRasiIdx + 12) % 12) + 1;
    if (houseDiff === 8) continue; // Chandra Ashtamam! Absolutely forbidden for surgery!

    const isShukla = tithiIdx < 15;
    const pakshaStrEn = isShukla ? 'Shukla Paksha' : 'Krishna Paksha';
    const pakshaStrMl = isShukla ? 'വെളുത്ത പക്ഷം' : 'കറുത്ത പക്ഷം';

    const isEx = (tara === 1 || tara === 3 || tara === 5 || tara === 7 || tara === 8) && (dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 4);

    dates.push({
      date: candidate,
      dateFormatted: candidate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      starNameEn: star.name,
      starNameMl: star.malayalamName,
      tithiNameEn: `${pakshaStrEn} Tithi ${tithiInPaksha}`,
      tithiNameMl: `${pakshaStrMl} തിഥി ${tithiInPaksha}`,
      weekdayEn: WEEKDAYS_EN[dayOfWeek],
      weekdayMl: WEEKDAYS_ML[dayOfWeek],
      muhurthaWindow: '08:30 AM - 10:45 AM (Amritha Ghadika)',
      quality: isEx ? 'Excellent' : 'Good',
      recommendationEn: `Highly auspicious healing window under ${star.name}. Free from Riktha Thithi, Vishti Karana, and Chandra Ashtama.`,
      recommendationMl: `ചികിത്സയ്ക്കും ശസ്ത്രക്രിയയ്ക്കും ഉത്തമമായ ശുഭവേള. ${star.malayalamName} നക്ഷത്രവും അനുയോജ്യമായ തിഥിയും ചേർന്ന് രോഗശമനം വേഗത്തിലാക്കും.`
    });

    if (dates.length >= 5) break;
  }

  return dates;
}

// ==========================================
// 4. FINANCIAL & WEALTH FORECASTING (DHANA PHALAM & HORACHAKRAM)
// ==========================================
export interface FinancialForecastResult {
  wealthScore: number; // 0 - 100
  wealthLevelEn: string;
  wealthLevelMl: string;
  dhanaRasiEn: string;
  dhanaRasiMl: string;
  labhaRasiEn: string;
  labhaRasiMl: string;
  dhanaYogasEn: string[];
  dhanaYogasMl: string[];
  investmentStrategyEn: string;
  investmentStrategyMl: string;
  cashFlowCycleEn: string;
  cashFlowCycleMl: string;
  warningEn: string;
  warningMl: string;
}

export function calculateFinancialForecast(starId: number): FinancialForecastResult {
  const star = NAKSHATRAS.find(s => s.id === starId) || NAKSHATRAS[0];
  const janmaRasiIdx = RASIS.findIndex(r => r.name === star.defaultRashi);

  // 2nd house = Dhana Sthanam (Liquid wealth & savings)
  const secondRasiIdx = (janmaRasiIdx + 1) % 12;
  const dhanaRasi = RASIS[secondRasiIdx];

  // 11th house = Labha Sthanam (Profits & recurring income)
  const eleventhRasiIdx = (janmaRasiIdx + 10) % 12;
  const labhaRasi = RASIS[eleventhRasiIdx];

  // 9th house = Bhagya Sthanam (Fortune & speculative luck)
  const ninthRasiIdx = (janmaRasiIdx + 8) % 12;

  // Real-time planetary checks for Jupiter & Venus (wealth karakas)
  const now = new Date();
  const jupLon = getPlanetSiderealLongitude(Astronomy.Body.Jupiter, now);
  const venLon = getPlanetSiderealLongitude(Astronomy.Body.Venus, now);
  const jupRasi = Math.floor(jupLon / 30);
  const venRasi = Math.floor(venLon / 30);

  let score = 72;
  const yogasEn: string[] = ['Lakshmi Yoga resonance via strong 9th & 2nd bhava alignment'];
  const yogasMl: string[] = ['ഭാഗ്യ-ധന ഭാവങ്ങളുടെ അനുകൂലതയാൽ ലക്ഷ്മീ യോഗ സാന്നിധ്യം'];

  // Check Jupiter aspect/transit to 2nd, 9th, or 11th
  if (jupRasi === secondRasiIdx || jupRasi === eleventhRasiIdx || jupRasi === ninthRasiIdx) {
    score += 18;
    yogasEn.push('Guru Gocharam in wealth axis bringing auspicious financial expansion');
    yogasMl.push('വ്യാഴത്തിന്റെ ഗോചാര സ്വാധീനം ധന ഭാവത്തെ പോഷിപ്പിക്കുന്നതിനാൽ അപ്രതീക്ഷിത ലാഭം');
  }

  if (venRasi === secondRasiIdx || venRasi === eleventhRasiIdx) {
    score += 10;
    yogasEn.push('Shukra Balam enhancing liquid asset accumulation and luxury gains');
    yogasMl.push('ശുക്രബലം സമ്പാദ്യ വർദ്ധനവിനും ഐശ്വര്യത്തിനും കാരണമാകുന്നു');
  }

  score = Math.min(96, Math.max(50, score));

  let levelEn = 'High Prosperity & Steady Growth';
  let levelMl = 'ഉയർന്ന ധനസമൃദ്ധിയും സുസ്ഥിര വളർച്ചയും';
  if (score >= 85) {
    levelEn = 'Exceptional Wealth & Sovereign Abundance';
    levelMl = 'മഹാഭാഗ്യവും അത്യുന്നത സാമ്പത്തിക ഐശ്വര്യവും';
  } else if (score < 65) {
    levelEn = 'Moderate Cash Flow with Measured Expansion';
    levelMl = 'മിതമായ ധനവരവും സൂക്ഷ്മതയോടെയുള്ള വളർച്ചയും';
  }

  return {
    wealthScore: score,
    wealthLevelEn: levelEn,
    wealthLevelMl: levelMl,
    dhanaRasiEn: dhanaRasi.name,
    dhanaRasiMl: dhanaRasi.malayalamName,
    labhaRasiEn: labhaRasi.name,
    labhaRasiMl: labhaRasi.malayalamName,
    dhanaYogasEn: yogasEn,
    dhanaYogasMl: yogasMl,
    investmentStrategyEn: 'Prioritize diversified tangible assets (commercial land, gold sovereigns, diversified index funds). Avoid impulsive speculative day-trading during Mars retrograde cycles.',
    investmentStrategyMl: 'സ്ഥാവര ജംഗമ സ്വത്തുക്കൾ (ഭൂമി, സ്വർണ്ണം, സുരക്ഷിത നിക്ഷേപങ്ങൾ) എന്നിവയിൽ ദീർഘകാല നിക്ഷേപം നടത്തുക. അനാവശ്യ ഊഹക്കച്ചവടങ്ങൾ ഒഴിവാക്കുക.',
    cashFlowCycleEn: 'Strongest cash inflows manifest during the waxing lunar phase (Shukla Paksha) and when Jupiter transits trinal houses from your natal Moon.',
    cashFlowCycleMl: 'വെളുത്ത പക്ഷത്തിലും വ്യാഴം അനുകൂല ഭാവങ്ങളിൽ സഞ്ചരിക്കുന്ന കാലഘട്ടങ്ങളിലും ഏറ്റവും ഉയർന്ന ധനലാഭവും കടം തിരിച്ചടവും സാധ്യമാകും.',
    warningEn: 'Exercise financial frugality when Saturn transits the 12th or 2nd house (Ezharashani phase) to prevent unintended expenditures.',
    warningMl: 'ഏഴരശ്ശനി കാലഘട്ടങ്ങളിലും ശനി പന്ത്രണ്ടാം ഭാവത്തിൽ സഞ്ചരിക്കുമ്പോഴും അനാവശ്യ ധനച്ചെലവുകൾ ഒഴിവാക്കാൻ കർശന ബജറ്റ് പാലിക്കുക.'
  };
}

// ==========================================
// 5. REMEDIAL PRESCRIPTIONS (PARIHARA VIDHIKAL & VAZHIPADU)
// ==========================================
export interface RemedialPrescriptionResult {
  prescribedGemstoneEn: string;
  prescribedGemstoneMl: string;
  gemstoneWeight: string;
  gemstoneFingerEn: string;
  gemstoneFingerMl: string;
  gemstoneMetalEn: string;
  gemstoneMetalMl: string;
  primaryVazhipaduEn: string[];
  primaryVazhipaduMl: string[];
  sacredTempleEn: string;
  sacredTempleMl: string;
  chantingMantraEn: string;
  chantingMantraMl: string;
  daanamEn: string;
  daanamMl: string;
}

export function calculateRemedialPrescriptions(starId: number): RemedialPrescriptionResult {
  const star = NAKSHATRAS.find(s => s.id === starId) || NAKSHATRAS[0];
  
  // Traditional Kerala Nakshatra Gemstone & Temple Offering Prescriptions
  const GEM_MAP: Record<number, {
    gemEn: string;
    gemMl: string;
    weight: string;
    fingerEn: string;
    fingerMl: string;
    metalEn: string;
    metalMl: string;
    vazhipaduEn: string[];
    vazhipaduMl: string[];
    templeEn: string;
    templeMl: string;
    mantraEn: string;
    mantraMl: string;
    daanamEn: string;
    daanamMl: string;
  }> = {
    // 1-3
    1: { // Aswathi (Ketu)
      gemEn: 'Cat\'s Eye (Vaidooryam)', gemMl: 'വൈഡൂര്യം', weight: '3.5 - 5.5 Carats',
      fingerEn: 'Middle or Little finger of right hand', fingerMl: 'വലതുകൈ നടുവിരൽ അല്ലെങ്കിൽ ചെറുവിരൽ',
      metalEn: 'Silver or Panchaloham', metalMl: 'വെള്ളി അല്ലെങ്കിൽ പഞ്ചലോഹം',
      vazhipaduEn: ['Ganapathi Homam with Karuka grass and ghee', 'Motta Vazhipadu at Sastha Temple', 'Milk payasam offering'],
      vazhipaduMl: ['കറുകഹോമം അല്ലെങ്കിൽ അഷ്ടദ്രവ്യ ഗണപതി ഹോമം', 'ശാസ്താവിന് മുട്ടറുക്കലും നെയ്യഭിഷേകവും', 'ഗണപതിക്ക് അപ്പവും മോദകവും'],
      templeEn: 'Kottarakkara Sree Mahaganapathi Temple or Pazhavangadi Ganapathi',
      templeMl: 'കൊട്ടാരക്കര ശ്രീ മഹാഗണപതി ക്ഷേത്രം അല്ലെങ്കിൽ പഴവങ്ങാടി ഗണപതി ക്ഷേത്രം',
      mantraEn: 'Om Gam Ganapataye Namaha (108 times daily at sunrise)',
      mantraMl: 'ഓം ഗം ഗണപതയേ നമഃ (ദിവസവും രാവിലെ 108 തവണ)',
      daanamEn: 'Donate warm clothes or blankets to elderly ascetics on Tuesdays.',
      daanamMl: 'ചൊവ്വാഴ്ചകളിൽ സാധുക്കൾക്കോ വയോധികർക്കോ വസ്ത്രദാനം നടത്തുക.'
    },
    2: { // Bharani (Shukra)
      gemEn: 'Diamond or White Zircon (Vairam)', gemMl: 'വൈരം (ഡയമണ്ട്) അല്ലെങ്കിൽ വെളുത്ത സിർക്കോൺ', weight: '0.5 - 1.5 Carats',
      fingerEn: 'Ring finger of right hand', fingerMl: 'വലതുകൈ മോതിരവിരൽ',
      metalEn: 'Platinum or White Gold', metalMl: 'പ്ലാറ്റിനം അല്ലെങ്കിൽ വെള്ളി/സ്വർണ്ണം',
      vazhipaduEn: ['Bhagavathi Seva with red silk and flowers', 'Kumkumarchana at Devi Temple', 'Pattu Charthal for Goddess'],
      vazhipaduMl: ['ദേവീ ക്ഷേത്രത്തിൽ ഭഗവതി സേവ', 'പട്ടും താലിയും ചാർത്തൽ, കുങ്കുമാർച്ചന', 'ലളിതാ സഹസ്രനാമാർച്ചന'],
      templeEn: 'Chottanikkara Bhagavathy Temple or Kodungallur Sree Kurumba Bhagavathi',
      templeMl: 'ചോറ്റാനിക്കര ഭഗവതി ക്ഷേത്രം അല്ലെങ്കിൽ കൊടുങ്ങല്ലൂർ ശ്രീ കുരുംബ ഭഗവതി ക്ഷേത്രം',
      mantraEn: 'Om Hreem Shreem Shukraya Namaha',
      mantraMl: 'ഓം ഹ്രീം ശ്രീം ശുക്രായ നമഃ',
      daanamEn: 'Donate pure white rice, sugar, or white sweets to young girls on Fridays.',
      daanamMl: 'വെള്ളിയാഴ്ചകളിൽ പെൺകുട്ടികൾക്ക് പാൽപായസമോ മധുരപലഹാരങ്ങളോ നൽകുക.'
    },
    3: { // Karthika (Sun)
      gemEn: 'Ruby (Manikyam)', gemMl: 'മാണിക്യം (റൂബി)', weight: '3 - 5 Carats',
      fingerEn: 'Ring finger of right hand', fingerMl: 'വലതുകൈ മോതിരവിരൽ',
      metalEn: 'Yellow Gold or Copper', metalMl: 'തങ്കം (സ്വർണ്ണം) അല്ലെങ്കിൽ ചെമ്പ്',
      vazhipaduEn: ['Adithya Pooja and Surya Pongal', 'Nei Payasam at Subramanya Temple', 'Abhishekam with Panchamritam'],
      vazhipaduMl: ['ആദിത്യ പൂജയും സൂര്യ നമസ്കാരവും', 'സുബ്രഹ്മണ്യ ക്ഷേത്രത്തിൽ പഞ്ചാമൃതാഭിഷേകം', 'നെയ്യ് വിളക്ക് സമർപ്പണം'],
      templeEn: 'Haripad Sree Subrahmanya Swamy Temple or Kadampuzha Bhagavathi',
      templeMl: 'ഹരിപ്പാട് ശ്രീ സുബ്രഹ്മണ്യസ്വാമി ക്ഷേത്രം അല്ലെങ്കിൽ കടമ്പുഴ ഭഗവതി ക്ഷേത്രം',
      mantraEn: 'Om Hram Hreem Hroum Sah Sooryaya Namaha (Aditya Hridayam)',
      mantraMl: 'ഓം ഹ്രാം ഹ്രീം ഹ്രൗം സഃ സൂര്യായ നമഃ (ആദിത്യ ഹൃദയ സ്തോത്രം)',
      daanamEn: 'Donate wheat, jaggery, or copper vessels on Sundays.',
      daanamMl: 'ഞായറാഴ്ചകളിൽ ഗോതമ്പ്, ശർക്കര അല്ലെങ്കിൽ ചെമ്പ് പാത്രങ്ങൾ ദാനം ചെയ്യുക.'
    },
    4: { // Rohini (Moon)
      gemEn: 'Natural Pearl (Muthu)', gemMl: 'ശുദ്ധമായ മുത്ത് (Natural Pearl)', weight: '4 - 6 Carats',
      fingerEn: 'Little finger of right hand', fingerMl: 'വലതുകൈ ചെറുവിരൽ',
      metalEn: 'Pure Silver', metalMl: 'ശുദ്ധമായ വെള്ളി',
      vazhipaduEn: ['Dhara and Palpayasam at Shiva Temple', 'Thrikkayil Vennal offering for Lord Krishna', 'Chandanacharthu'],
      vazhipaduMl: ['ശിവക്ഷേത്രത്തിൽ ധാരയും കൂവളമാലയും', 'ഗുരുവായൂർ ക്ഷേത്രത്തിൽ തൃക്കൈവെണ്ണയും പാൽപ്പായസവും', 'ചന്ദനം ചാർത്തൽ'],
      templeEn: 'Guruvayur Sree Krishna Temple or Vaikom Mahadeva Temple',
      templeMl: 'ഗുരുവായൂർ ശ്രീകൃഷ്ണ ക്ഷേത്രം അല്ലെങ്കിൽ വൈക്കം മഹാദേവ ക്ഷേത്രം',
      mantraEn: 'Om Shram Shreem Shroum Sah Chandraya Namaha',
      mantraMl: 'ഓം ശ്രാം ശ്രീം ശ്രൗം സഃ ചന്ദ്രായ നമഃ',
      daanamEn: 'Donate milk, white rice, or silver ornaments on Mondays.',
      daanamMl: 'തിങ്കളാഴ്ചകളിൽ പശുവിൻ പാൽ അല്ലെങ്കിൽ അരി ദാനം ചെയ്യുക.'
    },
    5: { // Makayiram (Mars)
      gemEn: 'Red Coral (Pravazham)', gemMl: 'ചുവന്ന പവിഴം (Red Coral)', weight: '5 - 7 Carats',
      fingerEn: 'Ring finger of right hand', fingerMl: 'വലതുകൈ മോതിരവിരൽ',
      metalEn: 'Gold or Copper', metalMl: 'സ്വർണ്ണം അല്ലെങ്കിൽ ചെമ്പ്',
      vazhipaduEn: ['Raktha Pushpanjali at Bhadrakali Temple', 'Kadum Payasam offering', 'Chovva Vilakku'],
      vazhipaduMl: ['ഭദ്രകാളി ക്ഷേത്രത്തിൽ രക്തപുഷ്പാഞ്ജലി', 'കടുംപായസം നിവേദ്യം, ചൊവ്വാവിളക്ക്', 'സുബ്രഹ്മണ്യന് തുളസിമാലയും വേൽ പൂജയും'],
      templeEn: 'Malayalappuzha Bhagavathy Temple or Chettikulangara Devi Temple',
      templeMl: 'മലയാലപ്പുഴ ഭഗവതി ക്ഷേത്രം അല്ലെങ്കിൽ ചെട്ടികുളങ്ങര ഭഗവതി ക്ഷേത്രം',
      mantraEn: 'Om Kram Kreem Kroum Sah Bhaumaya Namaha',
      mantraMl: 'ഓം ക്രാം ക്രീം ക്രൗം സഃ ഭൗമായ നമഃ',
      daanamEn: 'Donate red lentils (masoor dal) or red garments on Tuesdays.',
      daanamMl: 'ചൊവ്വാഴ്ചകളിൽ തുവരപ്പരിപ്പ് അല്ലെങ്കിൽ ചുവന്ന വസ്ത്രം ദാനം ചെയ്യുക.'
    }
  };

  // Default fallback for any of the 27 nakshatras mapped to lord
  const defaultRemedy = {
    gemEn: 'Yellow Sapphire (Pushparagam) / Emerald (Marakatham)',
    gemMl: 'മഞ്ഞ പുഷ്യരാഗം അല്ലെങ്കിൽ മരതകം',
    weight: '4 - 6 Carats',
    fingerEn: 'Index or Ring finger',
    fingerMl: 'വലതുകൈ ചൂണ്ടുവിരൽ അല്ലെങ്കിൽ മോതിരവിരൽ',
    metalEn: 'Gold or Silver',
    metalMl: 'സ്വർണ്ണം അല്ലെങ്കിൽ വെള്ളി',
    vazhipaduEn: ['Mahaganapathi Homam for obstacle removal', 'Bhagavathi Seva with lighting lamps', 'Mrityunjaya Archana for longevity'],
    vazhipaduMl: ['വിഘ്നനിവാരണത്തിനായി മഹാഗണപതി ഹോമം', 'ദേവീ പ്രീതിക്കായി ഭഗവതി സേവയും വിളക്കും', 'ആയുർദോഷ നിവാരണത്തിന് മൃത്യുഞ്ജയ അർച്ചന'],
    templeEn: 'Guruvayur Sree Krishna Temple or Sabarimala Sree Dharma Sastha',
    templeMl: 'ഗുരുവായൂർ ശ്രീകൃഷ്ണസ്വാമി ക്ഷേത്രം അല്ലെങ്കിൽ ശബരിമല ശ്രീ ധർമ്മശാസ്താ ക്ഷേത്രം',
    mantraEn: 'Om Namo Bhagavate Vasudevaya / Om Namah Shivaya',
    mantraMl: 'ഓം നമോ ഭഗവതേ വാസുദേവായ / ഓം നമഃ ശിവായ',
    daanamEn: 'Feed cows with fresh green grass or donate grains to temples.',
    daanamMl: 'പശുക്കൾക്ക് തീറ്റപ്പുല്ലോ പഴങ്ങളോ നൽകുക; ക്ഷേത്രങ്ങളിൽ അന്നദാനം നടത്തുക.'
  };

  const selected = GEM_MAP[star.id] || defaultRemedy;

  return {
    prescribedGemstoneEn: selected.gemEn,
    prescribedGemstoneMl: selected.gemMl,
    gemstoneWeight: selected.weight,
    gemstoneFingerEn: selected.fingerEn,
    gemstoneFingerMl: selected.fingerMl,
    gemstoneMetalEn: selected.metalEn,
    gemstoneMetalMl: selected.metalMl,
    primaryVazhipaduEn: selected.vazhipaduEn,
    primaryVazhipaduMl: selected.vazhipaduMl,
    sacredTempleEn: selected.templeEn,
    sacredTempleMl: selected.templeMl,
    chantingMantraEn: selected.mantraEn,
    chantingMantraMl: selected.mantraMl,
    daanamEn: selected.daanamEn,
    daanamMl: selected.daanamMl
  };
}

// ==========================================
// 6. TRAVEL & MIGRATION TIMING (YATRA MUHURTHAM)
// ==========================================
export interface YatraMuhurthamDate {
  date: Date;
  dateFormatted: string;
  starNameEn: string;
  starNameMl: string;
  weekdayEn: string;
  weekdayMl: string;
  favorableDirectionsEn: string[];
  favorableDirectionsMl: string[];
  forbiddenDirectionEn: string;
  forbiddenDirectionMl: string;
  quality: 'Excellent' | 'Good';
  recommendationEn: string;
  recommendationMl: string;
}

export function findYatraMuhurthams(janmaStarId: number): YatraMuhurthamDate[] {
  const dates: YatraMuhurthamDate[] = [];
  const today = new Date();
  const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 7, 0, 0);

  // Preferred nakshatras for travel in Kerala Jyothisham
  // Aswathi, Mrigashira, Punartham, Pushyam, Atham, Chithira, Chothi, Anizham, Thiruvonam, Revathi
  const YATRA_STARS = [1, 5, 7, 8, 13, 14, 15, 17, 22, 27];

  // Vaara Shoola (Forbidden travel direction per weekday in classical Kerala Jyothisham)
  // Sunday (0): West, Monday (1): East, Tuesday (2): North, Wednesday (3): North,
  // Thursday (4): South, Friday (5): West, Saturday (6): East
  const SHOOLA_MAP: Record<number, { en: string; ml: string }> = {
    0: { en: 'West', ml: 'പടിഞ്ഞാറ്' },
    1: { en: 'East', ml: 'കിഴക്ക്' },
    2: { en: 'North', ml: 'വടക്ക്' },
    3: { en: 'North', ml: 'വടക്ക്' },
    4: { en: 'South', ml: 'തെക്ക്' },
    5: { en: 'West', ml: 'പടിഞ്ഞാറ്' },
    6: { en: 'East', ml: 'കിഴക്ക്' }
  };

  const WEEKDAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const WEEKDAYS_ML = ['ഞായർ', 'തിങ്കൾ', 'ചൊവ്വ', 'ബുധൻ', 'വ്യാഴം', 'വെള്ളി', 'ശനി'];

  for (let i = 0; i < 60; i++) {
    const candidate = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
    const dayOfWeek = candidate.getDay();

    const moonLon = getPlanetSiderealLongitude(Astronomy.Body.Moon, candidate);
    const sunLon = getPlanetSiderealLongitude(Astronomy.Body.Sun, candidate);

    const starIdx = Math.floor(moonLon / (360 / 27));
    const starId = starIdx + 1;
    const star = NAKSHATRAS[starIdx];

    if (!YATRA_STARS.includes(starId)) continue;

    // Tarabalam check
    const count = ((starId - janmaStarId + 27) % 27) + 1;
    const tara = (count - 1) % 9;
    if (tara === 2 || tara === 4 || tara === 6) continue;

    // Tithi check: exclude Riktha (4, 9, 14) and Amavasi (30)
    let diffLon = moonLon - sunLon;
    if (diffLon < 0) diffLon += 360;
    const tithiIdx = Math.floor(diffLon / 12);
    const tithiInPaksha = (tithiIdx % 15) + 1;
    if (tithiInPaksha === 4 || tithiInPaksha === 9 || tithiInPaksha === 14 || tithiIdx === 29) {
      continue;
    }

    const forbidden = SHOOLA_MAP[dayOfWeek];
    const allDirsEn = ['East', 'North', 'South', 'West', 'North-East', 'South-East', 'North-West', 'South-West'];
    const allDirsMl = ['കിഴക്ക്', 'വടക്ക്', 'തെക്ക്', 'പടിഞ്ഞാറ്', 'വടക്കുകിഴക്ക് (ഈശാനകോൺ)', 'തെക്കുകിഴക്ക് (അഗ്നികോൺ)', 'വടക്കുപടിഞ്ഞാറ് (വായുകോൺ)', 'തെക്കുപടിഞ്ഞാറ് (കന്നികോൺ)'];

    const favorableEn = allDirsEn.filter(d => !d.includes(forbidden.en));
    const favorableMl = allDirsMl.filter((_, idx) => !allDirsEn[idx].includes(forbidden.en));

    dates.push({
      date: candidate,
      dateFormatted: candidate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      starNameEn: star.name,
      starNameMl: star.malayalamName,
      weekdayEn: WEEKDAYS_EN[dayOfWeek],
      weekdayMl: WEEKDAYS_ML[dayOfWeek],
      favorableDirectionsEn: favorableEn.slice(0, 4),
      favorableDirectionsMl: favorableMl.slice(0, 4),
      forbiddenDirectionEn: forbidden.en,
      forbiddenDirectionMl: forbidden.ml,
      quality: (dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 4) ? 'Excellent' : 'Good',
      recommendationEn: `Smooth travel with zero obstacles. Avoid initiating departure towards the ${forbidden.en} (Vaara Shoola).`,
      recommendationMl: `തടസ്സങ്ങളില്ലാത്ത സുരക്ഷിത യാത്രയ്ക്ക് ഉത്തമം. എന്നാൽ ${forbidden.ml} ദിക്കിലേക്കുള്ള യാത്ര (വാരശൂല) ഒഴിവാക്കുക.`
    });

    if (dates.length >= 5) break;
  }

  return dates;
}

// ==========================================
// 7. SPIRITUAL INCLINATION & INITIATION (DIKSHA & ISHTA DEVATHA)
// ==========================================
export interface SpiritualForecastResult {
  ishtaDevathaEn: string;
  ishtaDevathaMl: string;
  ishtaDevathaDescEn: string;
  ishtaDevathaDescMl: string;
  spiritualStrengthScore: number; // 0 - 100
  dharmaRasiEn: string;
  dharmaRasiMl: string;
  mokshaRasiEn: string;
  mokshaRasiMl: string;
  recommendedPracticesEn: string[];
  recommendedPracticesMl: string[];
  initiationMuhurthaSummaryEn: string;
  initiationMuhurthaSummaryMl: string;
}

export function calculateSpiritualForecast(starId: number): SpiritualForecastResult {
  const star = NAKSHATRAS.find(s => s.id === starId) || NAKSHATRAS[0];
  const janmaRasiIdx = RASIS.findIndex(r => r.name === star.defaultRashi);

  // 9th house is Dharma Sthanam & Guru Sthanam
  const ninthRasiIdx = (janmaRasiIdx + 8) % 12;
  const ninthRasi = RASIS[ninthRasiIdx];

  // 12th house is Moksha Sthanam
  const twelfthRasiIdx = (janmaRasiIdx + 11) % 12;
  const twelfthRasi = RASIS[twelfthRasiIdx];

  // Authentic Kerala Ishta Devatha mapping based on 9th/12th lord and Star Deity
  const DEVATHA_MAP: Record<number, { en: string; ml: string; descEn: string; descMl: string }> = {
    0: { // Medam (Mars)
      en: 'Bhadrakali & Lord Murugan (Subramanya)',
      ml: 'ശ്രീ ഭദ്രകാളിയും സുബ്രഹ്മണ്യ സ്വാമിയും',
      descEn: 'Protective, fiery energy dispelling all inner fear and outer negative forces.',
      descMl: 'ഭയനിവാരണത്തിനും ശത്രുദോഷ ശമനത്തിനും ആത്മവീര്യത്തിനും ഉത്തമം.'
    },
    1: { // Edavam (Venus)
      en: 'Sree Maha Lakshmi & Annapoorneshwari',
      ml: 'ശ്രീ മഹാലക്ഷ്മിയും അന്നപൂർണ്ണേശ്വരിയും',
      descEn: 'Grace, peace, domestic abundance, and heart-centered devotional love.',
      descMl: 'ശാന്തി, ഐശ്വര്യം, കുടുംബ സൗഖ്യം എന്നിവ നൽകുന്ന മാതൃസ്വരൂപിണി.'
    },
    2: { // Mithunam (Mercury)
      en: 'Maha Vishnu & Guruvayurappan',
      ml: 'ശ്രീ മഹാവിഷ്ണുവും ഗുരുവായൂരപ്പനും',
      descEn: 'Supreme intellect, wisdom, righteous karmic path, and divine protection.',
      descMl: 'ജ്ഞാനവും സന്മാർഗ്ഗബോധവും സംരക്ഷണവും പ്രദാനം ചെയ്യുന്ന സർവ്വവ്യാപിയായ ഈശ്വരൻ.'
    },
    3: { // Karkidakam (Moon)
      en: 'Parvathi Devi & Lord Shiva (Ardhanareeshwara)',
      ml: 'ശ്രീ പാർവ്വതീ സമേതനായ പരമശിവൻ',
      descEn: 'Deep emotional tranquility, meditative stillness, and family harmony.',
      descMl: 'മാനസിക സമാധാനത്തിനും ദാമ്പത്യ ഐക്യത്തിനും ആത്മീയ പ്രകാശത്തിനും.'
    },
    4: { // Chingam (Sun)
      en: 'Lord Shiva & Surya Narayana',
      ml: 'പരമശിവനും സൂര്യനാരായണനും',
      descEn: 'Illumination of the soul, divine leadership, truth, and spiritual majesty.',
      descMl: 'ആത്മജ്ഞാനം, തേജസ്സ്, സത്യനിഷ്ഠ എന്നിവ ഉണർത്തുന്ന പ്രകാശരൂപം.'
    },
    5: { // Kanni (Mercury)
      en: 'Saraswathi Devi & Lord Krishna',
      ml: 'സരസ്വതീ ദേവിയും ശ്രീകൃഷ്ണ സ്വാമിയും',
      descEn: 'Higher creative intellect, memory, fine arts, and devotional surrendered bhakti.',
      descMl: 'വിദ്യാവിജയം, ബുദ്ധിശക്തി, കലകൾ, ഈശ്വരാർപ്പണ ബുദ്ധി എന്നിവ പ്രദാനം ചെയ്യുന്നു.'
    },
    6: { // Thulam (Venus)
      en: 'Durga Bhagavathi & Rajarajeshwari',
      ml: 'ശ്രീ ദുർഗ്ഗാ ഭഗവതിയും രാജരാജേശ്വരിയും',
      descEn: 'Universal balance, beauty, triumph of good over evil, and supreme cosmic grace.',
      descMl: 'സർവ്വമംഗളദായിനിയും ധർമ്മസംസ്ഥാപകയുമായ ജഗദീശ്വരി.'
    },
    7: { // Vrischikam (Mars)
      en: 'Lord Dharma Sastha (Ayyappan) & Narasimha Swamy',
      ml: 'ശ്രീ ധർമ്മശാസ്താവും (അയ്യപ്പൻ) നരസിംഹമൂർത്തിയും',
      descEn: 'Strict discipline, sensory control (brahmacharya), fearlessness, and moral triumph.',
      descMl: 'ഇന്ദ്രിയനിഗ്രഹത്തിനും ധർമ്മപരിപാലനത്തിനും ആപത്തുകളിൽ നിന്നുള്ള സംരക്ഷണത്തിനും.'
    },
    8: { // Dhanu (Jupiter)
      en: 'Lord Dakshinamurthy & Maha Vishnu',
      ml: 'ശ്രീ ദക്ഷിണാമൂർത്തിയും മഹാവിഷ്ണുവും',
      descEn: 'Supreme guru lineage, Vedic knowledge, scriptural revelation, and enlightenment.',
      descMl: 'പരമഗുരുവും വേദശാസ്ത്ര ജ്ഞാനവും മോക്ഷമാർഗ്ഗവും തെളിക്കുന്ന ജ്ഞാനമൂർത്തി.'
    },
    9: { // Makaram (Saturn)
      en: 'Lord Sastha & Vana Sastha',
      ml: 'വനശാസ്താവും അയ്യപ്പസ്വാമിയും',
      descEn: 'Patience, endurance, grounding in nature, and liberation from karmic debt.',
      descMl: 'കർമ്മബന്ധങ്ങളിൽ നിന്നുള്ള മോചനത്തിനും ശാന്തിക്കും ക്ഷമാശീലത്തിനും.'
    },
    10: { // Kumbham (Saturn)
      en: 'Lord Shiva (Mahadeva) & Hanuman Swamy',
      ml: 'മഹാദേവനും ശ്രീ ഹനുമാൻ സ്വാമിയും',
      descEn: 'Ascetic detachment, supreme selfless devotion, and destruction of all pride.',
      descMl: 'നിസ്വാർത്ഥ ഭക്തിയും വൈരാഗ്യവും അഹംകാരനാശവും നൽകുന്ന ആരാധനാമൂർത്തി.'
    },
    11: { // Meenam (Jupiter)
      en: 'Maha Vishnu (Ananthapadmanabha)',
      ml: 'ശ്രീ അനന്തപദ്മനാഭസ്വാമി',
      descEn: 'Dissolution of ego in the ocean of divine consciousness, ultimate moksha.',
      descMl: 'സംസാരസാഗരത്തിൽ നിന്ന് മുക്തിയും പരമാനന്ദവും നൽകുന്ന പരബ്രഹ്മസ്വരൂപം.'
    }
  };

  const devatha = DEVATHA_MAP[ninthRasiIdx];

  return {
    ishtaDevathaEn: devatha.en,
    ishtaDevathaMl: devatha.ml,
    ishtaDevathaDescEn: devatha.descEn,
    ishtaDevathaDescMl: devatha.descMl,
    spiritualStrengthScore: 84,
    dharmaRasiEn: ninthRasi.name,
    dharmaRasiMl: ninthRasi.malayalamName,
    mokshaRasiEn: twelfthRasi.name,
    mokshaRasiMl: twelfthRasi.malayalamName,
    recommendedPracticesEn: [
      'Daily morning prayer facing East lighting a bronze oil lamp (Nilavilakku)',
      'Nama Japa of your Ishta Devatha (108 times at twilight/sandhyavela)',
      'Observing Ekadashi, Pradosham, or Sasthi vratam based on your lunar alignment'
    ],
    recommendedPracticesMl: [
      'രാവിലെ നിലവിളക്ക് കൊളുത്തി കിഴക്കോട്ട് നോക്കി പ്രാർത്ഥിക്കുക',
      'സന്ധ്യാവേളയിൽ ഇഷ്ടദേവതാ നാമജപം 108 തവണ ഉരുവിടുക',
      'ഏകാദശിയോ പ്രദോഷമോ കൃത്യമായി വ്രതമനുഷ്ഠിച്ച് ആചരിക്കുക'
    ],
    initiationMuhurthaSummaryEn: 'Auspicious timing for sacred thread (Upanayanam), Mantra Diksha, or spiritual initiation occurs during Shukla Paksha on Thursday (Guru Vaaram) or Monday (Soma Vaaram) during Pushya, Rohini, or Thiruvonam nakshatras.',
    initiationMuhurthaSummaryMl: 'മന്ത്രോപദേശത്തിനും ദീക്ഷയ്ക്കും വിദ്യാരംഭത്തിനും വെളുത്ത പക്ഷത്തിലെ തിങ്കൾ, വ്യാഴം ദിവസങ്ങളിൽ രോഹിണി, പൂയം, തിരുവോണം നക്ഷത്രങ്ങൾ ചേരുന്ന വേള അതിവിശിഷ്ടമാണ്.'
  };
}

// ==========================================
// 8. ASTROMETEOROLOGY & NHATTUVELA (MAZHA PHALAM)
// ==========================================
export interface AstrometeorologyResult {
  currentNhattuvelaEn: string;
  currentNhattuvelaMl: string;
  nhattuvelaSpan: string;
  rainProbabilityScore: number; // 0 - 100
  rainfallStatusEn: string;
  rainfallStatusMl: string;
  agriculturalAdviceEn: string;
  agriculturalAdviceMl: string;
  traditionalSayingEn: string;
  traditionalSayingMl: string;
  varshaPhalamSummaryEn: string;
  varshaPhalamSummaryMl: string;
}

export function calculateAstrometeorology(date: Date = new Date()): AstrometeorologyResult {
  // Real astronomical Sun sidereal longitude determines current Nhattuvela in Kerala
  const sunLon = getPlanetSiderealLongitude(Astronomy.Body.Sun, date);
  const nhattuvelaIdx = Math.floor(sunLon / (360 / 27));
  const currentStar = NAKSHATRAS[nhattuvelaIdx];

  // Specific famous Kerala Nhattuvela rain lore:
  // Thiruvathira Nhattuvela (index 5) is the legendary monsoon peak ("തിരുവാതിര ഞാറ്റുവേലയിൽ തിരിമുറിയാതെ മഴ")
  // Makayiram Nhattuvela (index 4) - Early monsoon arrival
  // Punartham Nhattuvela (index 6) - "പുണർതം പൂഴി വിതയ്ക്കാം"
  // Pooyam Nhattuvela (index 7) - "പൂയം ഞാറ്റുവേല പെയ്താൽ പുഴുവും ചാവും"
  // Aayilyam (index 8) - Heavy gushing downpours
  // Atham (index 12) - Onam sunshine & sporadic harvest showers

  let rainScore = 40;
  let rainEn = 'Moderate Seasonal Showers & Balmy Breeze';
  let rainMl = 'മിതമായ ഇടവിട്ടുള്ള മഴയും തെളിഞ്ഞ കാലാവസ്ഥയും';
  let agriEn = 'Ideal for general planting, compost enriching, and routine orchard maintenance.';
  let agriMl = 'വിത്തുകൾ പാകാനും തോട്ടം പരിപാലനത്തിനും വളപ്രയോഗത്തിനും അനുകൂലം.';
  let proverbEn = 'Auspicious celestial cycle supporting growth and earth vitality.';
  let proverbMl = 'മണ്ണും പ്രകൃതിയും സമൃദ്ധിയുടെ പുത്തൻ ഉണർവ് നേടുന്ന കാലം.';

  if (nhattuvelaIdx === 5) { // Thiruvathira
    rainScore = 95;
    rainEn = 'Torrential Continuous Monsoons (Legendary Thiruvathira Showers)';
    rainMl = 'തിരിമുറിയാതെ പെയ്യുന്ന തോരാമഴ (തിരുവാതിര ഞാറ്റുവേല)';
    agriEn = 'Peak season for planting black pepper vines, coconut saplings, and all plant varieties. Every cutting struck in this Nhattuvela takes root effortlessly.';
    agriMl = 'കുരുമുളക് വള്ളികൾ നടാനും തെങ്ങിൻ തൈകൾ വെക്കാനും ഏറ്റവും ഉത്തമം. തിരുവാതിര ഞാറ്റുവേലയിൽ എന്തു നട്ടാലും വേരുപിടിക്കുമെന്നാണ് വിശ്വാസം.';
    proverbEn = '"Thiruvathira Nhattuvela brings torrential, ceaseless rain."';
    proverbMl = '"തിരുവാതിര ഞാറ്റുവേലയിൽ തിരിമുറിയാതെ മഴ പെയ്യും."';
  } else if (nhattuvelaIdx === 4) { // Makayiram
    rainScore = 80;
    rainEn = 'Strong Southwest Monsoon Ingress & Gusty Winds';
    rainMl = 'ഇടവപ്പാതിയുടെ ശക്തിപ്രാപിക്കലും കാറ്റോടുകൂടിയ മഴയും';
    agriEn = 'Prepare drainage ridges and reinforce tree bases against heavy soil erosion.';
    agriMl = 'നീരൊഴുക്ക് ക്രമീകരിക്കാനും മണ്ണൊലിപ്പ് തടയാനും കൃഷിയിടങ്ങളിൽ തടമെടുക്കുക.';
    proverbEn = '"Makayiram heralds the majestic ingress of monsoon."';
    proverbMl = '"മകയിരം ഞാറ്റുവേല മഴയുടെ ആരംഭം കുറിക്കുന്നു."';
  } else if (nhattuvelaIdx === 6) { // Punartham
    rainScore = 70;
    rainEn = 'Heavy Periodic Rains Interspersed with Bright Sunshine';
    rainMl = 'വെയിലും മഴയും ഇടകലർന്നു പെയ്യുന്ന കാലാവസ്ഥ';
    agriEn = 'Excellent for second crop paddy sowing and tuber plantation.';
    agriMl = 'രണ്ടാംവിള നെൽകൃഷിക്കും ചേന, ചേമ്പ് തുടങ്ങിയ കിഴങ്ങുവർഗ്ഗങ്ങൾക്കും അനുകൂലം.';
    proverbEn = '"In Punartham, sow seeds even in dust."';
    proverbMl = '"പുണർതത്തിൽ പൂഴിയിലും വിതയ്ക്കാം."';
  } else if (nhattuvelaIdx === 7) { // Pooyam
    rainScore = 85;
    rainEn = 'Drenching Monsoon Rains Cleansing Agriculture Fields';
    rainMl = 'കനത്ത മഴയും കാർഷിക കീടനശീകരണവും';
    agriEn = 'Natural rain washes away agricultural pests and rejuvenates groundwater reserves.';
    agriMl = 'കനത്ത മഴയിൽ കീടങ്ങൾ നശിക്കുകയും ഭൂഗർഭ ജലനിരപ്പ് ഉയരുകയും ചെയ്യും.';
    proverbEn = '"Pooyam rains will eradicate pests and insects."';
    proverbMl = '"പൂയം ഞാറ്റുവേല പെയ്താൽ പുഴുവും ചാവും."';
  } else if (nhattuvelaIdx === 12) { // Atham
    rainScore = 35;
    rainEn = 'Pleasant Sunshine with Passing Evening Showers (Onam Season)';
    rainMl = 'ഓണക്കാലത്തെ തെളിഞ്ഞ വെയിലും ചിങ്ങവെയിലും';
    agriEn = 'Harvesting vegetables, flowers, and paddy crops.';
    agriMl = 'ഓണവിളവെടുപ്പിനും പച്ചക്കറികൾക്കും പൂകൃഷിക്കും ഏറ്റവും യോജിച്ച സമയം.';
    proverbEn = '"Atham brings shining warmth and golden harvests."';
    proverbMl = '"അത്തം വെളുത്താൽ അച്ചിങ്ങയും കായ്ക്കും."';
  }

  return {
    currentNhattuvelaEn: `${currentStar.name} Nhattuvela`,
    currentNhattuvelaMl: `${currentStar.malayalamName} ഞാറ്റുവേല`,
    nhattuvelaSpan: '13.5 Solar Days per Nhattuvela',
    rainProbabilityScore: rainScore,
    rainfallStatusEn: rainEn,
    rainfallStatusMl: rainMl,
    agriculturalAdviceEn: agriEn,
    agriculturalAdviceMl: agriMl,
    traditionalSayingEn: proverbEn,
    traditionalSayingMl: proverbMl,
    varshaPhalamSummaryEn: `The Sun's transit through ${currentStar.name} sets the rhythmic pulse of Kerala's lush climate, dictating river replenishment and soil fecundity.`,
    varshaPhalamSummaryMl: `സൂര്യൻ ${currentStar.malayalamName} നക്ഷത്രത്തിൽ സഞ്ചരിക്കുന്ന ഈ കാലം കേരളത്തിന്റെ തനിമയാർന്ന കാലാവസ്ഥയെയും ജലസംഭരണത്തെയും കൃഷിരീതികളെയും നിർണ്ണയിക്കുന്നു.`
  };
}

// ==========================================
// 9. LITIGATION & CONFLICT STRATEGY (SHATRU VIJAYAM)
// ==========================================
export interface LitigationStrategyResult {
  settlementProbabilityScore: number; // 0 - 100
  victoryProbabilityScore: number; // 0 - 100
  advocacyStrengthsEn: string[];
  advocacyStrengthsMl: string[];
  favorableFilingDaysEn: string;
  favorableFilingDaysMl: string;
  conflictResolutionTacticsEn: string;
  conflictResolutionTacticsMl: string;
  protectiveVazhipaduEn: string;
  protectiveVazhipaduMl: string;
}

export function calculateLitigationStrategy(starId: number): LitigationStrategyResult {
  const star = NAKSHATRAS.find(s => s.id === starId) || NAKSHATRAS[0];
  const janmaRasiIdx = RASIS.findIndex(r => r.name === star.defaultRashi);

  // 6th house is Shatru & Vyavahara Sthanam (Disputes, rivals, litigation)
  const sixthRasiIdx = (janmaRasiIdx + 5) % 12;

  // 3rd house is Parakrama Sthanam (Valour, courage, assertive defense)
  const thirdRasiIdx = (janmaRasiIdx + 2) % 12;

  // Mars & Jupiter Gocharam check
  const now = new Date();
  const marsLon = getPlanetSiderealLongitude(Astronomy.Body.Mars, now);
  const marsRasi = Math.floor(marsLon / 30);

  let victoryScore = 70;
  let settlementScore = 65;

  if (marsRasi === thirdRasiIdx || marsRasi === sixthRasiIdx) {
    victoryScore += 20;
    settlementScore -= 10;
  }

  victoryScore = Math.min(95, Math.max(45, victoryScore));
  settlementScore = Math.min(95, Math.max(35, settlementScore));

  return {
    victoryProbabilityScore: victoryScore,
    settlementProbabilityScore: settlementScore,
    advocacyStrengthsEn: [
      'Documentary evidence and methodical factual presentation',
      'Strategic endurance in protracted negotiations',
      'Moral uprightness commanding judicial credibility'
    ],
    advocacyStrengthsMl: [
      'കൃത്യമായ രേഖകളും വസ്തുതാപരമായ വാദമുഖങ്ങളും',
      'ദീർഘകാലം നീണ്ടുനിൽക്കുന്ന ഒത്തുതീർപ്പ് ചർച്ചകളിലെ ക്ഷമ',
      'നീതിപൂർവ്വമായ നിലപാടുകൾ നൽകുന്ന നിയമപരമായ മേൽക്കൈ'
    ],
    favorableFilingDaysEn: 'File petitions and crucial legal briefs on Wednesday or Thursday during waxing moon (Shukla Paksha). Strictly avoid Rahu Kaal, Gulika Kaal, and Vishti Karana.',
    favorableFilingDaysMl: 'കോടതി വ്യവഹാരങ്ങൾ ഫയൽ ചെയ്യുന്നതിനും സുപ്രധാന ചർച്ചകൾക്കും വെളുത്ത പക്ഷത്തിലെ ബുധൻ, വ്യാഴം ദിവസങ്ങൾ തിരഞ്ഞെടുക്കുക. രാഹുകാലവും ഗുളികകാലവും കർശനമായി ഒഴിവാക്കുക.',
    conflictResolutionTacticsEn: 'Prioritize out-of-court mediation when Jupiter aspects your 6th house. If arbitration fails, aggressive evidentiary presentation under favorable transit yields decisive victory.',
    conflictResolutionTacticsMl: 'വ്യാഴത്തിന്റെ അനുഗ്രഹമുള്ള വേളകളിൽ കോടതിക്ക് പുറത്തുള്ള മധ്യസ്ഥ ചർച്ചകളിലൂടെ തർക്കങ്ങൾ രമ്യമായി പരിഹരിക്കുക. അല്ലാത്തപക്ഷം സത്യസന്ധമായ തെളിവുകൾ നിരത്തി വിജയം നേടുക.',
    protectiveVazhipaduEn: 'Chovva Vilakku and Raktha Pushpanjali at Bhadrakali Temple or Sudarshana Homam for triumph over adversities and false claims.',
    protectiveVazhipaduMl: 'ശത്രുദോഷ ശമനത്തിനും കേസ് വിജയത്തിനുമായി ഭദ്രകാളി ക്ഷേത്രത്തിൽ രക്തപുഷ്പാഞ്ജലി അല്ലെങ്കിൽ സുദർശന ഹോമം നടത്തുക.'
  };
}

// ==========================================
// 10. ASTROCARTOGRAPHY & RELOCATION (DIG-BALA PHALAM)
// ==========================================
export interface AstrocartographyResult {
  mostFavorableDirectionEn: string;
  mostFavorableDirectionMl: string;
  careerDirectionEn: string;
  careerDirectionMl: string;
  wealthDirectionEn: string;
  wealthDirectionMl: string;
  peaceDirectionEn: string;
  peaceDirectionMl: string;
  challengingDirectionEn: string;
  challengingDirectionMl: string;
  relocationAdviceEn: string;
  relocationAdviceMl: string;
}

export function calculateAstrocartography(starId: number): AstrocartographyResult {
  const star = NAKSHATRAS.find(s => s.id === starId) || NAKSHATRAS[0];
  const janmaRasiIdx = RASIS.findIndex(r => r.name === star.defaultRashi);

  // Dig-Bala mapping (Directional strength of planets in Kerala Vastu & Jyothisham)
  // East: Jupiter & Mercury (1st house / Lagna)
  // South: Sun & Mars (10th house / Midheaven)
  // West: Saturn (7th house / Descendant)
  // North: Moon & Venus (4th house / Nadir)
  
  // Directions based on element of Janma Rasi
  // Fire signs (Medam, Chingam, Dhanu): South & East
  // Earth signs (Edavam, Kanni, Makaram): South & West
  // Air signs (Mithunam, Thulam, Kumbham): West & North
  // Water signs (Karkidakam, Vrischikam, Meenam): North & East

  const elem = janmaRasiIdx % 4; // 0: Fire, 1: Earth, 2: Air, 3: Water

  if (elem === 0) { // Fire
    return {
      mostFavorableDirectionEn: 'South and South-East (Southern Zenith)',
      mostFavorableDirectionMl: 'തെക്ക്, തെക്കുകിഴക്ക് (അഗ്നികോൺ)',
      careerDirectionEn: 'South (Ruled by Sun & Mars - Peak Executive Power)',
      careerDirectionMl: 'തെക്ക് (സൂര്യ-ചൊവ്വാ സ്വാധീനം - അധികാര പദവികൾ)',
      wealthDirectionEn: 'South-East & East (Commerce & Enterprise)',
      wealthDirectionMl: 'തെക്കുകിഴക്ക് & കിഴക്ക് (വ്യാപാര അഭിവൃദ്ധി)',
      peaceDirectionEn: 'North-East (Ishan - Divine Tranquility)',
      peaceDirectionMl: 'വടക്കുകിഴക്ക് (ഈശാനകോൺ - മനഃസമാധാനം)',
      challengingDirectionEn: 'Direct West (Saturnian resistance)',
      challengingDirectionMl: 'പടിഞ്ഞാറ് (തടസ്സങ്ങൾക്കും കാലതാമസത്തിനും സാധ്യത)',
      relocationAdviceEn: 'Relocating towards southern or south-eastern cities stimulates dynamic career velocity and institutional recognition.',
      relocationAdviceMl: 'ജന്മദേശത്തിന് തെക്കോട്ടോ തെക്കുകിഴക്കോട്ടോ ഉള്ള സ്ഥലങ്ങളിലേക്ക് മാറുന്നത് തൊഴിൽ വളർച്ചയ്ക്കും നേതൃപദവികൾക്കും വഴിതുറക്കും.'
    };
  } else if (elem === 1) { // Earth
    return {
      mostFavorableDirectionEn: 'South-West and West (Solid Foundation)',
      mostFavorableDirectionMl: 'തെക്കുപടിഞ്ഞാറ് (കന്നികോൺ), പടിഞ്ഞാറ്',
      careerDirectionEn: 'South-West (Prithvi Tattva - Industrial Stability)',
      careerDirectionMl: 'തെക്കുപടിഞ്ഞാറ് (സുസ്ഥിരമായ നിർമ്മാണ-തൊഴിൽ മേഖല)',
      wealthDirectionEn: 'West & North-West (Trading & Real Estate)',
      wealthDirectionMl: 'പടിഞ്ഞാറ്, വടക്കുപടിഞ്ഞാറ് (റിയൽ എസ്റ്റേറ്റ്, സമ്പാദ്യം)',
      peaceDirectionEn: 'East & North-East (Spiritual Sanctuary)',
      peaceDirectionMl: 'കിഴക്ക്, വടക്കുകിഴക്ക് (ആത്മീയ ശാന്തി)',
      challengingDirectionEn: 'North (Excessive fluidity)',
      challengingDirectionMl: 'വടക്ക് (അസ്ഥിരതയ്ക്ക് സാധ്യതയുള്ള ദിശ)',
      relocationAdviceEn: 'Western and south-western geographies provide immense grounded wealth, asset creation, and domestic stability.',
      relocationAdviceMl: 'പടിഞ്ഞാറൻ, തെക്കുപടിഞ്ഞാറൻ പ്രദേശങ്ങളിലെ വാസം സാമ്പത്തിക സുരക്ഷിതത്വവും ശാശ്വത സ്വത്തുക്കളും സമ്മാനിക്കും.'
    };
  } else if (elem === 2) { // Air
    return {
      mostFavorableDirectionEn: 'West and North-West (Intellect & Innovation)',
      mostFavorableDirectionMl: 'പടിഞ്ഞാറ്, വടക്കുപടിഞ്ഞാറ് (വായുകോൺ)',
      careerDirectionEn: 'North-West (Communications, Tech, Global Trade)',
      careerDirectionMl: 'വടക്കുപടിഞ്ഞാറ് (സാങ്കേതികവിദ്യ, ആഗോള വ്യാപാരം)',
      wealthDirectionEn: 'North & West (Capital Markets & Consultancy)',
      wealthDirectionMl: 'വടക്ക്, പടിഞ്ഞാറ് (കൺസൾട്ടൻസി, ഓഹരി നിക്ഷേപം)',
      peaceDirectionEn: 'North-East (Higher Consciousness)',
      peaceDirectionMl: 'വടക്കുകിഴക്ക് (ഈശ്വരാധീനമുള്ള ദിശ)',
      challengingDirectionEn: 'Direct South (Heavy friction)',
      challengingDirectionMl: 'തെക്ക് (സമ്മർദ്ദങ്ങൾ വർദ്ധിക്കാൻ സാധ്യത)',
      relocationAdviceEn: 'Moving westward or northwestward unlocks unprecedented networking opportunities, intellectual breakthroughs, and multinational success.',
      relocationAdviceMl: 'പടിഞ്ഞാറൻ ദിശകളിലേക്കുള്ള മാറ്റം അന്താരാഷ്ട്ര ബന്ധങ്ങൾക്കും ഐടി/വിജ്ഞാന മേഖലകളിലെ വൻ വിജയത്തിനും കാരണമാകും.'
    };
  } else { // Water
    return {
      mostFavorableDirectionEn: 'North and North-East (Intuition & Abundance)',
      mostFavorableDirectionMl: 'വടക്ക്, വടക്കുകിഴക്ക് (ഈശാനകോൺ)',
      careerDirectionEn: 'North (Ruled by Mercury & Moon - Research & Care)',
      careerDirectionMl: 'വടക്ക് (ഗവേഷണം, അക്കാദമിക്, ആരോഗ്യ മേഖലകൾ)',
      wealthDirectionEn: 'East (Surya-Guru Grace)',
      wealthDirectionMl: 'കിഴക്ക് (ധനസമൃദ്ധിയും സൽക്കീർത്തിയും)',
      peaceDirectionEn: 'North-East (Pure Divine Bliss)',
      peaceDirectionMl: 'വടക്കുകിഴക്ക് (ദൈവസാന്നിധ്യവും സമാധാനവും)',
      challengingDirectionEn: 'Direct South-East (Excess heat)',
      challengingDirectionMl: 'തെക്കുകിഴക്ക് (മാനസിക സംഘർഷങ്ങൾക്ക് സാധ്യത)',
      relocationAdviceEn: 'Northern and coastal or riverine cities amplify your emotional well-being, creative flourishing, and family serenity.',
      relocationAdviceMl: 'വടക്കൻ ദിശകളിലും ജലാശയ സാമീപ്യമുള്ള പ്രദേശങ്ങളിലും താമസിക്കുന്നത് കുടുംബ സൗഖ്യവും സർഗ്ഗാത്മകതയും വർദ്ധിപ്പിക്കും.'
    };
  }
}
