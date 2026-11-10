import { NAKSHATRAS, RASIS, PLANETARY_FRIENDSHIP, YONI_ENEMIES, YONI_FRIENDS, VASYA_MAPPING, Nakshatra, getRasiFromNakshatraPada } from './astroData';
import * as Astronomy from 'astronomy-engine';
import { getPlanetSiderealLongitude, getAyanamsa, calculateSiderealAscendant } from './astronomy';

// ----------------------------------------------------------------------
// DATA TYPES & SCHEMAS (Conforms to Specification JSON Schema)
// ----------------------------------------------------------------------

export interface PersonProfile {
  name: string;
  nakshatra: string;
  nakshatra_index?: number; // 1-27
  pada: number; // 1-4
  chandra_rasi: string;
  lagna_rasi?: string;
  dob?: string; // YYYY-MM-DD
  time?: string; // HH:MM
}

export interface MatchmakingInputProfile {
  girl: PersonProfile;
  boy: PersonProfile;
}

export type PoruthamStatus = 'Good' | 'Satisfactory' | 'Not Satisfactory';

export interface PoruthamItem {
  id: string;
  name: string;
  malayalamName: string;
  score: number;
  maxScore: number;
  status: PoruthamStatus;
  traditionalStatus: 'Uthamam' | 'Madhyamam' | 'Adhamam';
  description: string;
  isFatalVeto?: boolean;
}

export interface PoruthamBreakdown {
  dina: PoruthamStatus;
  gana: PoruthamStatus;
  mahendra: PoruthamStatus;
  stree_deergha: PoruthamStatus;
  yoni: PoruthamStatus;
  veda: PoruthamStatus;
  rajju: PoruthamStatus;
  rasi: PoruthamStatus;
  rasyadhipathi: PoruthamStatus;
  vasya: PoruthamStatus;
}

export interface PapasamyaResult {
  girl_points: number;
  boy_points: number;
  difference: number;
  status: 'UTTHAMAM' | 'MADHYAMAM' | 'DEFICIT';
  description: string;
  details: {
    girlLagna: number;
    girlMoon: number;
    girlVenus: number;
    boyLagna: number;
    boyMoon: number;
    boyVenus: number;
  };
}

export interface ChovvaDoshaResult {
  girl_status: 'NO_DOSHA' | 'ACTIVE_DOSHA' | 'DOSHA_CANCELLED';
  boy_status: 'NO_DOSHA' | 'ACTIVE_DOSHA' | 'DOSHA_CANCELLED';
  girl_reason?: string;
  boy_reason?: string;
  overall_check: 'COMPATIBLE' | 'NEUTRALIZED' | 'INCOMPATIBLE';
  description: string;
}

export interface DasaSandhiResult {
  status: 'EXCELLENT_NO_COLLISION' | 'SATISFACTORY_ACCEPTABLE' | 'NOT_RECOMMENDED_CRITICAL_COLLISION';
  min_gap_days: number;
  description: string;
  closestGirlTransition?: string;
  closestBoyTransition?: string;
}

export interface FinalVerdict {
  recommendation: 'RECOMMENDED' | 'NOT_RECOMMENDED';
  summary: string;
  detailed_reasons: string[];
}

export interface KeralaMatchEvaluationReport {
  dashakoota_score: number;
  porutham_breakdown: PoruthamBreakdown;
  porutham_items: PoruthamItem[];
  papasamya_result: PapasamyaResult;
  chovva_dosha_result: ChovvaDoshaResult;
  dasa_sandhi_result: DasaSandhiResult;
  final_verdict: FinalVerdict;
}

// ----------------------------------------------------------------------
// HELPER UTILITIES
// ----------------------------------------------------------------------

export function findNakshatra(query: string | number): Nakshatra | undefined {
  if (typeof query === 'number') {
    return NAKSHATRAS.find(n => n.id === query);
  }
  const normalized = query.trim().toLowerCase();
  return NAKSHATRAS.find(n => 
    n.name.toLowerCase() === normalized || 
    n.malayalamName.toLowerCase() === normalized ||
    n.name.toLowerCase().includes(normalized) ||
    n.malayalamName.includes(query)
  );
}

export function getRasiId(rasiName: string): number {
  const clean = rasiName.trim().toLowerCase();
  const rasiMap: Record<string, number> = {
    'medam': 1, 'aries': 1, 'mesha': 1,
    'edavam': 2, 'taurus': 2, 'vrishabha': 2,
    'mithunam': 3, 'gemini': 3, 'mithuna': 3,
    'karkidakam': 4, 'cancer': 4, 'karka': 4, 'karkata': 4,
    'chingam': 5, 'leo': 5, 'simha': 5,
    'kanni': 6, 'virgo': 6, 'kanya': 6,
    'thulam': 7, 'libra': 7, 'tula': 7,
    'vrischikam': 8, 'scorpio': 8, 'vrischika': 8,
    'dhanu': 9, 'sagittarius': 9, 'dhanus': 9,
    'makaram': 10, 'capricorn': 10, 'makara': 10,
    'kumbham': 11, 'aquarius': 11, 'kumbha': 11,
    'meenam': 12, 'pisces': 12, 'meena': 12
  };
  return rasiMap[clean] || (RASIS.findIndex(r => r.name.toLowerCase() === clean) + 1) || 1;
}

export function getRasiLord(rasiName: string): string {
  const id = getRasiId(rasiName);
  return RASIS[id - 1]?.lord || 'Chovva';
}

// ----------------------------------------------------------------------
// MODULE 1: DASA PORUTHAM (10 KOOTA EVALUATION MATRIX)
// ----------------------------------------------------------------------

export function evaluateDasaPorutham(girlStar: Nakshatra, boyStar: Nakshatra, girlPada: number = 1, boyPada: number = 1, girlRasiName?: string, boyRasiName?: string): {
  totalScore: number;
  breakdown: PoruthamBreakdown;
  items: PoruthamItem[];
  vetoRajju: boolean;
  vetoVedha: boolean;
} {
  const gRasi = girlRasiName || getRasiFromNakshatraPada(girlStar.id, girlPada) || girlStar.defaultRashi;
  const bRasi = boyRasiName || getRasiFromNakshatraPada(boyStar.id, boyPada) || boyStar.defaultRashi;
  const gRasiId = getRasiId(gRasi);
  const bRasiId = getRasiId(bRasi);

  const items: PoruthamItem[] = [];

  // 1. Dina Porutham
  // Counting from Girl to Boy inclusive
  const dinaCount = ((boyStar.id - girlStar.id) % 27 + 27) % 27 + 1;
  const dinaRem = dinaCount % 9;
  let dinaScore = 0.0;
  let dinaStatus: PoruthamStatus = 'Not Satisfactory';
  let dinaTraditional: 'Uthamam' | 'Madhyamam' | 'Adhamam' = 'Adhamam';
  let dinaDesc = `Count from Girl (${girlStar.name}) to Boy (${boyStar.name}) is ${dinaCount} (Remainder ${dinaRem}). `;

  const auspiciousRemainders = [2, 4, 6, 8, 0]; // 0 is 9 (Parama Mitra)
  if (auspiciousRemainders.includes(dinaRem)) {
    dinaScore = 1.0;
    dinaStatus = 'Good';
    dinaTraditional = 'Uthamam';
    const names = { 2: 'Sampat (Wealth)', 4: 'Kshema (Prosperity)', 6: 'Sadhana (Accomplishment)', 8: 'Mitra (Friendly)', 0: 'Parama Mitra (Supreme Harmony)' };
    dinaDesc += `${names[dinaRem as keyof typeof names] || 'Auspicious'}. Good health, peace, and longevity.`;
  } else if (dinaCount === 1) {
    // Eka Nakshatra (Same star) sub-rules: Allowed for select stars
    const allowedSameStars = [4, 5, 6, 10, 13, 16, 22, 26, 27]; // Rohini, Makayiram, Thiruvathira, Makam, Atham, Vishakham, Thiruvonam, Uthrattathi, Revathi
    if (allowedSameStars.includes(girlStar.id) && girlPada !== boyPada) {
      dinaScore = 0.5;
      dinaStatus = 'Satisfactory';
      dinaTraditional = 'Madhyamam';
      dinaDesc += `Same Nakshatra permitted with differing Padas (Girl Pada ${girlPada}, Boy Pada ${boyPada}).`;
    } else {
      dinaDesc += `Janma Nakshatra collision. Not recommended for marriage harmony.`;
    }
  } else {
    const inauspicious = { 1: 'Janma (Obstacle)', 3: 'Vipat (Accidents/Misfortune)', 5: 'Pratyak (Enmity/Obstruction)', 7: 'Naidhana/Vadha (Severe discord)' };
    dinaDesc += `${inauspicious[dinaRem as keyof typeof inauspicious] || 'Inauspicious'}.`;
  }

  items.push({
    id: 'dina',
    name: 'Dina',
    malayalamName: 'ദിനം',
    score: dinaScore,
    maxScore: 1.0,
    status: dinaStatus,
    traditionalStatus: dinaTraditional,
    description: dinaDesc
  });

  // 2. Gana Porutham
  // Temperament & Character: Deva, Manushya, Rakshasa
  let ganaScore = 0.0;
  let ganaStatus: PoruthamStatus = 'Not Satisfactory';
  let ganaTraditional: 'Uthamam' | 'Madhyamam' | 'Adhamam' = 'Adhamam';
  let ganaDesc = `Girl: ${girlStar.gana}, Boy: ${boyStar.gana}. `;

  if (girlStar.gana === boyStar.gana) {
    ganaScore = 1.0;
    ganaStatus = 'Good';
    ganaTraditional = 'Uthamam';
    ganaDesc += `Identical Gana grants emotional harmony, mutual empathy, and shared values.`;
  } else if (girlStar.gana === 'Deva' && boyStar.gana === 'Manushya') {
    ganaScore = 1.0;
    ganaStatus = 'Good';
    ganaTraditional = 'Uthamam';
    ganaDesc += `Deva bride with Manushya groom is auspicious and peaceful.`;
  } else if (boyStar.gana === 'Deva' && girlStar.gana === 'Manushya') {
    ganaScore = 1.0;
    ganaStatus = 'Good';
    ganaTraditional = 'Uthamam';
    ganaDesc += `Deva groom with Manushya bride is classic Uthamam in Kerala tradition.`;
  } else if (boyStar.gana === 'Rakshasa' && girlStar.gana === 'Manushya') {
    // Secondary tolerance if distance is high
    if (dinaCount > 14) {
      ganaScore = 0.5;
      ganaStatus = 'Satisfactory';
      ganaTraditional = 'Madhyamam';
      ganaDesc += `Rakshasa groom with Manushya bride mitigated by distance (> 14).`;
    } else {
      ganaDesc += `Temperamental friction between Rakshasa and Manushya.`;
    }
  } else if (boyStar.gana === 'Rakshasa' && girlStar.gana === 'Deva') {
    // Secondary tolerance if distance is high
    if (dinaCount > 14) {
      ganaScore = 0.5;
      ganaStatus = 'Satisfactory';
      ganaTraditional = 'Madhyamam';
      ganaDesc += `Rakshasa groom with Deva bride mitigated by distance (> 14).`;
    } else {
      ganaDesc += `Temperamental friction between Rakshasa and Deva.`;
    }
  } else if (girlStar.gana === 'Rakshasa') {
    ganaScore = 0.0;
    ganaStatus = 'Not Satisfactory';
    ganaTraditional = 'Adhamam';
    ganaDesc += `Rakshasa bride with non-Rakshasa groom is considered inauspicious (Stree Rakshasa Dosham).`;
  } else {
    ganaDesc += `Gana incompatibility. Possible temperamental friction.`;
  }

  items.push({
    id: 'gana',
    name: 'Gana',
    malayalamName: 'ഗണം',
    score: ganaScore,
    maxScore: 1.0,
    status: ganaStatus,
    traditionalStatus: ganaTraditional,
    description: ganaDesc
  });

  // 3. Mahendra Porutham
  // Progeny and wealth booster: counts 4, 7, 10, 13, 16, 19, 22, 25
  const mahendraCounts = [4, 7, 10, 13, 16, 19, 22, 25];
  const isMahendra = mahendraCounts.includes(dinaCount);
  items.push({
    id: 'mahendra',
    name: 'Mahendra',
    malayalamName: 'മഹേന്ദ്രം',
    score: isMahendra ? 1.0 : 0.0,
    maxScore: 1.0,
    status: isMahendra ? 'Good' : 'Not Satisfactory',
    traditionalStatus: isMahendra ? 'Uthamam' : 'Adhamam',
    description: isMahendra 
      ? `Position count is ${dinaCount} (Mahendra Present). Promotes progeny growth, happiness, and family wealth.`
      : `Position count is ${dinaCount} (Mahendra Absent). Secondary factor, not a fatal impediment.`
  });

  // 4. Stree Deergha Porutham
  // Groom's star distance from bride's star > 13 is Uthamam; 7-13 Madhyamam; < 7 Adhamam
  let sdScore = 0.0;
  let sdStatus: PoruthamStatus = 'Not Satisfactory';
  let sdTraditional: 'Uthamam' | 'Madhyamam' | 'Adhamam' = 'Adhamam';
  if (dinaCount > 13) {
    sdScore = 1.0;
    sdStatus = 'Good';
    sdTraditional = 'Uthamam';
  } else if (dinaCount >= 7) {
    sdScore = 0.5;
    sdStatus = 'Satisfactory';
    sdTraditional = 'Madhyamam';
  }

  items.push({
    id: 'stree_deergha',
    name: 'Stree Deergha',
    malayalamName: 'സ്ത്രീ ദീർഘം',
    score: sdScore,
    maxScore: 1.0,
    status: sdStatus,
    traditionalStatus: sdTraditional,
    description: `Distance from Girl to Boy is ${dinaCount} stars. ${
      sdScore === 1.0 ? 'Distance > 13 ensures prosperity, long life, and welfare of the bride.' :
      sdScore === 0.5 ? 'Moderate distance (7-13) confers acceptable stability.' :
      'Distance < 7 is short; compensated if Rasi/Rajju are strong.'
    }`
  });

  // 5. Yoni Porutham
  // Physical harmony, intimate rapport, absence of natural enmity
  let yoniScore = 0.0;
  let yoniStatus: PoruthamStatus = 'Not Satisfactory';
  let yoniTraditional: 'Uthamam' | 'Madhyamam' | 'Adhamam' = 'Adhamam';
  const gYoni = girlStar.yoni;
  const bYoni = boyStar.yoni;
  const isSwornEnemy = YONI_ENEMIES[gYoni] === bYoni || YONI_ENEMIES[bYoni] === gYoni;
  const isMaleMale = girlStar.yoniGender === 'Male' && boyStar.yoniGender === 'Male';

  if (isSwornEnemy || isMaleMale) {
    yoniScore = 0.0;
    yoniStatus = 'Not Satisfactory';
    yoniTraditional = 'Adhamam';
  } else if (gYoni === bYoni) {
    yoniScore = 1.0;
    yoniStatus = 'Good';
    yoniTraditional = 'Uthamam';
  } else if (YONI_FRIENDS[gYoni]?.includes(bYoni) || YONI_FRIENDS[bYoni]?.includes(gYoni)) {
    yoniScore = 0.5;
    yoniStatus = 'Satisfactory';
    yoniTraditional = 'Madhyamam';
  } else {
    // Neutral pairs without sworn enmity
    yoniScore = 0.5;
    yoniStatus = 'Satisfactory';
    yoniTraditional = 'Madhyamam';
  }

  items.push({
    id: 'yoni',
    name: 'Yoni',
    malayalamName: 'യോനി',
    score: yoniScore,
    maxScore: 1.0,
    status: yoniStatus,
    traditionalStatus: yoniTraditional,
    description: `Girl: ${gYoni} (${girlStar.yoniGender}), Boy: ${bYoni} (${boyStar.yoniGender}). ${
      isSwornEnemy ? `Sworn enemy Yonis (${gYoni} vs ${bYoni}) cause marital friction.` :
      isMaleMale ? `Male-Male Yoni conflict creates persistent discord.` :
      gYoni === bYoni ? `Same Yoni animal ensures deepest physical and emotional harmony.` :
      `Compatible animal signs with no sworn enmity.`
    }`
  });

  // 6. Veda (Vedha) Porutham - FATAL GATEKEEPER
  // Severe planetary repulsion between specific Nakshatra pairs
  const isVedha = girlStar.vedha.includes(boyStar.id) || boyStar.vedha.includes(girlStar.id);
  const vedaScore = isVedha ? 0.0 : 1.0;
  const vedaStatus: PoruthamStatus = isVedha ? 'Not Satisfactory' : 'Good';
  const vedaTraditional = isVedha ? 'Adhamam' : 'Uthamam';

  items.push({
    id: 'veda',
    name: 'Veda',
    malayalamName: 'വേധ',
    score: vedaScore,
    maxScore: 1.0,
    status: vedaStatus,
    traditionalStatus: vedaTraditional,
    isFatalVeto: isVedha,
    description: isVedha 
      ? `FATAL VETO: Severe Vedha repulsion present between ${girlStar.name} and ${boyStar.name}. This is an insurmountable astrological flaw in Kerala tradition.`
      : `No Vedha affliction between stars. Harmony and protection assured.`
  });

  // 7. Rajju Porutham - FATAL GATEKEEPER
  // Longevity & Mangalya strength. Same Rajju is a fatal flaw in Kerala Jyothisham
  const hasRajjuDosha = girlStar.rajju === boyStar.rajju;

  const rajjuScore = hasRajjuDosha ? 0.0 : 1.0;
  const rajjuStatus: PoruthamStatus = hasRajjuDosha ? 'Not Satisfactory' : 'Good';
  const rajjuTraditional = hasRajjuDosha ? 'Adhamam' : 'Uthamam';

  let rajjuDesc = `Girl: ${girlStar.rajju} Rajju, Boy: ${boyStar.rajju} Rajju. `;
  if (hasRajjuDosha) {
    rajjuDesc += `FATAL VETO: Rajju Dosha present (Same ${girlStar.rajju} Rajju). `;
    if (girlStar.rajju === 'Siro') rajjuDesc += 'Shiro Rajju threatens the longevity of the husband.';
    else if (girlStar.rajju === 'Kanta') rajjuDesc += 'Kantha Rajju threatens the longevity of the wife.';
    else if (girlStar.rajju === 'Udara') rajjuDesc += 'Udara/Nabhi Rajju threatens progeny and fertility.';
    else if (girlStar.rajju === 'Kati') rajjuDesc += 'Kati Rajju threatens wealth and financial stability.';
    else if (girlStar.rajju === 'Pada') rajjuDesc += 'Pada Rajju causes wandering, separation, or accidents.';
  } else {
    rajjuDesc += 'Different Rajjus. Free from Rajju Dosham; grants unbroken longevity and marital bliss.';
  }

  items.push({
    id: 'rajju',
    name: 'Rajju',
    malayalamName: 'രജ്ജു',
    score: rajjuScore,
    maxScore: 1.0,
    status: rajjuStatus,
    traditionalStatus: rajjuTraditional,
    isFatalVeto: hasRajjuDosha,
    description: rajjuDesc
  });

  // 8. Rasi Porutham
  // Distance from Girl Rasi to Boy Rasi: 7 (Sama Saptama), 11 (Ekadasa), 10 (Dasama), 3 (Triteeya) are Uthamam
  // 6/8 (Sashtashtaka) & 2/12 (Dwirdwadasa) are flawed
  const rasiCount = ((bRasiId - gRasiId) % 12 + 12) % 12 + 1;
  let rasiScore = 0.0;
  let rasiStatus: PoruthamStatus = 'Not Satisfactory';
  let rasiTraditional: 'Uthamam' | 'Madhyamam' | 'Adhamam' = 'Adhamam';
  let rasiDesc = `Girl Rasi: ${gRasi}, Boy Rasi: ${bRasi} (Position ${rasiCount} from Girl). `;

  const gLord = getRasiLord(gRasi);
  const bLord = getRasiLord(bRasi);
  const areLordsFriends = gLord === bLord || 
    (PLANETARY_FRIENDSHIP[gLord]?.friends.includes(bLord) && PLANETARY_FRIENDSHIP[bLord]?.friends.includes(gLord));

  if ([7, 11, 10, 3].includes(rasiCount)) {
    rasiScore = 1.0;
    rasiStatus = 'Good';
    rasiTraditional = 'Uthamam';
    rasiDesc += `Favorable Rasi relationship (${rasiCount === 7 ? 'Sama-Saptama' : rasiCount === 11 ? 'Ekadasa' : 'Auspicious'}). Family harmony and progeny flourish.`;
  } else if (rasiCount === 1) {
    rasiScore = 1.0;
    rasiStatus = 'Good';
    rasiTraditional = 'Uthamam';
    rasiDesc += `Same Janma Rasi. Favorable when Nakshatras differ.`;
  } else if ([4, 5, 9].includes(rasiCount)) {
    rasiScore = 0.5;
    rasiStatus = 'Satisfactory';
    rasiTraditional = 'Madhyamam';
    rasiDesc += `Neutral / Trikona placement (${rasiCount === 4 ? 'Chaturtha' : 'Navapanchama'}). Acceptable with general harmony.`;
  } else if (rasiCount === 6 || rasiCount === 8) {
    // Sashtashtaka
    if (areLordsFriends || (gRasi === 'Medam' && bRasi === 'Vrischikam') || (gRasi === 'Edavam' && bRasi === 'Thulam')) {
      rasiScore = 0.5;
      rasiStatus = 'Satisfactory';
      rasiTraditional = 'Madhyamam';
      rasiDesc += `Preethi Sashtashtaka (6/8) mitigated by shared/friendly lordship (${gLord}).`;
    } else {
      rasiScore = 0.0;
      rasiStatus = 'Not Satisfactory';
      rasiTraditional = 'Adhamam';
      rasiDesc += `Mrityu Sashtashtakam (6/8 axis). Major discord and vulnerability.`;
    }
  } else if (rasiCount === 2 || rasiCount === 12) {
    // Dwirdwadasa
    if (areLordsFriends || (gRasi === 'Makaram' && bRasi === 'Kumbham')) {
      rasiScore = 0.5;
      rasiStatus = 'Satisfactory';
      rasiTraditional = 'Madhyamam';
      rasiDesc += `Dwirdwadasa (2/12) mitigated by friendly or common planetary lordship.`;
    } else {
      rasiScore = 0.0;
      rasiStatus = 'Not Satisfactory';
      rasiTraditional = 'Adhamam';
      rasiDesc += `Dwirdwadasa (2/12 axis). Risk of financial drain or estrangement.`;
    }
  }

  items.push({
    id: 'rasi',
    name: 'Rasi',
    malayalamName: 'രാശി',
    score: rasiScore,
    maxScore: 1.0,
    status: rasiStatus,
    traditionalStatus: rasiTraditional,
    description: rasiDesc
  });

  // 9. Rasyadhipathi (Rasi Lord) Porutham
  // Planetary friendship between Moon sign rulers
  let lordScore = 0.0;
  let lordStatus: PoruthamStatus = 'Not Satisfactory';
  let lordTraditional: 'Uthamam' | 'Madhyamam' | 'Adhamam' = 'Adhamam';

  if (gLord === bLord) {
    lordScore = 1.0;
    lordStatus = 'Good';
    lordTraditional = 'Uthamam';
  } else {
    const bFriends = PLANETARY_FRIENDSHIP[bLord]?.friends || [];
    const bEnemies = PLANETARY_FRIENDSHIP[bLord]?.enemies || [];
    const gFriends = PLANETARY_FRIENDSHIP[gLord]?.friends || [];
    const gEnemies = PLANETARY_FRIENDSHIP[gLord]?.enemies || [];

    const bViewsG = bFriends.includes(gLord) ? 'Friend' : (bEnemies.includes(gLord) ? 'Enemy' : 'Neutral');
    const gViewsB = gFriends.includes(bLord) ? 'Friend' : (gEnemies.includes(bLord) ? 'Enemy' : 'Neutral');

    if (bViewsG === 'Friend' && gViewsB === 'Friend') {
      lordScore = 1.0;
      lordStatus = 'Good';
      lordTraditional = 'Uthamam';
    } else if ((bViewsG === 'Friend' && gViewsB === 'Neutral') || (gViewsB === 'Friend' && bViewsG === 'Neutral')) {
      lordScore = 1.0;
      lordStatus = 'Good';
      lordTraditional = 'Uthamam';
    } else if (bViewsG === 'Neutral' && gViewsB === 'Neutral') {
      lordScore = 0.5;
      lordStatus = 'Satisfactory';
      lordTraditional = 'Madhyamam';
    } else if (bViewsG === 'Friend' || gViewsB === 'Friend') {
      lordScore = 0.5;
      lordStatus = 'Satisfactory';
      lordTraditional = 'Madhyamam';
    } else {
      lordScore = 0.0;
      lordStatus = 'Not Satisfactory';
      lordTraditional = 'Adhamam';
    }
  }

  items.push({
    id: 'rasyadhipathi',
    name: 'Rasyadhipathi',
    malayalamName: 'രാശ്യാധിപതി',
    score: lordScore,
    maxScore: 1.0,
    status: lordStatus,
    traditionalStatus: lordTraditional,
    description: `Girl Lord: ${gLord}, Boy Lord: ${bLord}. ${
      lordScore === 1.0 ? 'Mutual friendship or common ruler fosters deep psychological connection.' :
      lordScore === 0.5 ? 'Neutral planetary disposition ensures balanced domestic life.' :
      'Planetary enmity causes differences in temperament and worldviews.'
    }`
  });

  // 10. Vasya Porutham
  // Mutual attraction and amenability
  const bVasyaToG = VASYA_MAPPING[bRasi]?.includes(gRasi);
  const gVasyaToB = VASYA_MAPPING[gRasi]?.includes(bRasi);
  const isVasya = bVasyaToG || gVasyaToB;

  items.push({
    id: 'vasya',
    name: 'Vasya',
    malayalamName: 'വശ്യം',
    score: isVasya ? 1.0 : 0.0,
    maxScore: 1.0,
    status: isVasya ? 'Good' : 'Not Satisfactory',
    traditionalStatus: isVasya ? 'Uthamam' : 'Adhamam',
    description: isVasya
      ? `Vasya attraction present between ${gRasi} and ${bRasi}. Mutual dedication and affection assured.`
      : `Vasya attraction absent. Neutral secondary factor.`
  });

  const totalScore = Number(items.reduce((acc, curr) => acc + curr.score, 0).toFixed(1));

  const breakdown: PoruthamBreakdown = {
    dina: items.find(i => i.id === 'dina')!.status,
    gana: items.find(i => i.id === 'gana')!.status,
    mahendra: items.find(i => i.id === 'mahendra')!.status,
    stree_deergha: items.find(i => i.id === 'stree_deergha')!.status,
    yoni: items.find(i => i.id === 'yoni')!.status,
    veda: items.find(i => i.id === 'veda')!.status,
    rajju: items.find(i => i.id === 'rajju')!.status,
    rasi: items.find(i => i.id === 'rasi')!.status,
    rasyadhipathi: items.find(i => i.id === 'rasyadhipathi')!.status,
    vasya: items.find(i => i.id === 'vasya')!.status
  };

  return {
    totalScore,
    breakdown,
    items,
    vetoRajju: hasRajjuDosha,
    vetoVedha: isVedha
  };
}

// ----------------------------------------------------------------------
// MODULE 2: PAPASAMYA (QUANTITATIVE MALEFIC DOSHA BALANCE)
// ----------------------------------------------------------------------

function calculatePersonPapaPoints(date: Date, lagnaRasiIndex?: number): { total: number; lagna: number; moon: number; venus: number; marsInfo: { houseFromLagna: number; houseFromMoon: number; houseFromVenus: number; rasiIndex: number; isConjunctRahu: boolean; hasJupiterAspect: boolean } } {
  const papaBodies = [
    Astronomy.Body.Sun,
    Astronomy.Body.Mars,
    Astronomy.Body.Saturn,
    'Rahu' as const,
    'Ketu' as const
  ];

  const moonLon = getPlanetSiderealLongitude(Astronomy.Body.Moon, date);
  const venusLon = getPlanetSiderealLongitude(Astronomy.Body.Venus, date);
  const jupiterLon = getPlanetSiderealLongitude(Astronomy.Body.Jupiter, date);
  const marsLon = getPlanetSiderealLongitude(Astronomy.Body.Mars, date);
  const rahuLon = getPlanetSiderealLongitude('Rahu', date);

  const moonRasi = Math.floor(moonLon / 30);
  const venusRasi = Math.floor(venusLon / 30);
  const marsRasi = Math.floor(marsLon / 30);
  const rahuRasi = Math.floor(rahuLon / 30);
  const jupiterRasi = Math.floor(jupiterLon / 30);

  // Calculate precise astronomical Sidereal Lagna (Ascendant) if not explicitly provided
  let lagnaRasi = lagnaRasiIndex !== undefined ? lagnaRasiIndex : 0;
  if (lagnaRasiIndex === undefined) {
    const ascLon = calculateSiderealAscendant(date);
    lagnaRasi = Math.floor(ascLon / 30);
  }

  const doshaHouses = [1, 2, 4, 7, 8, 12];
  let lagnaPoints = 0;
  let moonPoints = 0;
  let venusPoints = 0;

  const getHouse = (planetRasi: number, refRasi: number) => {
    return ((planetRasi - refRasi) % 12 + 12) % 12 + 1;
  };

  // Classical Kerala Papasamyam planet weighting:
  // Mars and Saturn are full malefics (1.0). Sun, Rahu, and Ketu carry half weight (0.5).
  const planetWeights: Record<string, number> = {
    [Astronomy.Body.Mars]: 1.0,
    [Astronomy.Body.Saturn]: 1.0,
    [Astronomy.Body.Sun]: 0.5,
    'Rahu': 0.5,
    'Ketu': 0.5
  };

  for (const body of papaBodies) {
    const pLon = getPlanetSiderealLongitude(body, date);
    const pRasi = Math.floor(pLon / 30);
    const pWeight = planetWeights[body] ?? 1.0;

    const hLagna = getHouse(pRasi, lagnaRasi);
    const hMoon = getHouse(pRasi, moonRasi);
    const hVenus = getHouse(pRasi, venusRasi);

    // Classical Kerala reference weighting:
    // Afflictions from Lagna have full strength (1.0), Moon half strength (0.5), Venus quarter strength (0.25).
    if (doshaHouses.includes(hLagna)) lagnaPoints += 1.0 * pWeight;
    if (doshaHouses.includes(hMoon)) moonPoints += 0.5 * pWeight;
    if (doshaHouses.includes(hVenus)) venusPoints += 0.25 * pWeight;
  }

  const marsHouseLagna = getHouse(marsRasi, lagnaRasi);
  const marsHouseMoon = getHouse(marsRasi, moonRasi);
  const marsHouseVenus = getHouse(marsRasi, venusRasi);

  // Jupiter 5th, 7th, 9th aspect or conjunction
  const jupFromMars = getHouse(jupiterRasi, marsRasi);
  const hasJupiterAspect = [1, 5, 7, 9].includes(jupFromMars);
  const isConjunctRahu = marsRasi === rahuRasi;

  const total = Number((lagnaPoints + moonPoints + venusPoints).toFixed(2));

  return {
    total,
    lagna: Number(lagnaPoints.toFixed(2)),
    moon: Number(moonPoints.toFixed(2)),
    venus: Number(venusPoints.toFixed(2)),
    marsInfo: {
      houseFromLagna: marsHouseLagna,
      houseFromMoon: marsHouseMoon,
      houseFromVenus: marsHouseVenus,
      rasiIndex: marsRasi,
      isConjunctRahu,
      hasJupiterAspect
    }
  };
}

export function evaluatePapasamya(girlDate: Date, boyDate: Date, girlLagna?: string, boyLagna?: string): PapasamyaResult {
  const gLagnaIdx = girlLagna ? getRasiId(girlLagna) - 1 : undefined;
  const bLagnaIdx = boyLagna ? getRasiId(boyLagna) - 1 : undefined;

  const gPapa = calculatePersonPapaPoints(girlDate, gLagnaIdx);
  const bPapa = calculatePersonPapaPoints(boyDate, bLagnaIdx);

  const diff = Number((bPapa.total - gPapa.total).toFixed(2));
  let status: 'UTTHAMAM' | 'MADHYAMAM' | 'DEFICIT' = 'DEFICIT';
  let description = '';

  // Mandatory rule in Kerala tradition: Boy Papa Points >= Girl Papa Points
  if (bPapa.total > gPapa.total) {
    status = 'UTTHAMAM';
    description = `Boy's Papa points (${bPapa.total}) exceed Girl's (${gPapa.total}). The groom possesses the necessary threshold to absorb and withstand planetary afflictions (Utthamam).`;
  } else if (bPapa.total === gPapa.total) {
    status = 'MADHYAMAM';
    description = `Boy and Girl have equal Papa points (${bPapa.total}). Balanced planetary affliction (Madhyamam).`;
  } else {
    status = 'DEFICIT';
    description = `Girl's Papa points (${gPapa.total}) exceed Boy's (${bPapa.total}) by ${Math.abs(diff)} points. In Kerala tradition, an affliction deficit on the groom's side requires remedial scrutiny.`;
  }

  return {
    girl_points: gPapa.total,
    boy_points: bPapa.total,
    difference: diff,
    status,
    description,
    details: {
      girlLagna: gPapa.lagna,
      girlMoon: gPapa.moon,
      girlVenus: gPapa.venus,
      boyLagna: bPapa.lagna,
      boyMoon: bPapa.moon,
      boyVenus: bPapa.venus
    }
  };
}

// ----------------------------------------------------------------------
// MODULE 3: CHOVVA DOSHAM (KUJA DOSHAM) & CANCELLATION RULES
// ----------------------------------------------------------------------

export function evaluateChovvaDoshamForPerson(date: Date, lagnaName?: string): { status: 'NO_DOSHA' | 'ACTIVE_DOSHA' | 'DOSHA_CANCELLED'; reason: string } {
  const lagnaIdx = lagnaName ? getRasiId(lagnaName) - 1 : undefined;
  const papa = calculatePersonPapaPoints(date, lagnaIdx);
  const info = papa.marsInfo;

  const doshaHouses = [1, 2, 4, 7, 8, 12];
  const isPresentFromLagna = doshaHouses.includes(info.houseFromLagna);
  const isPresentFromMoon = doshaHouses.includes(info.houseFromMoon);
  const isPresentFromVenus = doshaHouses.includes(info.houseFromVenus);

  if (!isPresentFromLagna && !isPresentFromMoon && !isPresentFromVenus) {
    return {
      status: 'NO_DOSHA',
      reason: 'Mars is located outside the 1, 2, 4, 7, 8, 12 houses from Lagna, Moon, and Venus.'
    };
  }

  // CANCELLATION RULES (Authentic Kerala Jyothisham):
  // 1. Mars in Kumbha (Aquarius) in 1st house
  if (info.houseFromLagna === 1 && info.rasiIndex === 10) {
    return { status: 'DOSHA_CANCELLED', reason: 'Mars in Aquarius (Kumbha) in the 1st House nullifies Chovva Dosham.' };
  }
  // 2. Mars in Meena (Pisces) in 12th house
  if (info.houseFromLagna === 12 && info.rasiIndex === 11) {
    return { status: 'DOSHA_CANCELLED', reason: 'Mars in Pisces (Meena) in the 12th House nullifies Chovva Dosham.' };
  }
  // 3. Mars & Rahu conjunct in 1st house or any Kendra (1, 4, 7, 10)
  if (info.isConjunctRahu && [1, 4, 7, 10].includes(info.houseFromLagna)) {
    return { status: 'DOSHA_CANCELLED', reason: 'Mars conjunct Rahu in Kendra house cancels Chovva Dosham.' };
  }
  // 4. Jupiter (Guru) aspecting Mars or conjunct Mars
  if (info.hasJupiterAspect) {
    return { status: 'DOSHA_CANCELLED', reason: 'Jupiter (Guru) aspecting/conjunct Mars cancels Chovva Dosham (Guru-Mangala Yoga).' };
  }
  // 5. Mars in own sign (Mesha 0, Vrischikam 7) or exaltation (Makaram 9)
  if ([0, 7, 9].includes(info.rasiIndex)) {
    const signNames: Record<number, string> = { 0: 'Mesha', 7: 'Vrischika', 9: 'Makara (Exalted)' };
    return { status: 'DOSHA_CANCELLED', reason: `Mars in own/exaltation sign (${signNames[info.rasiIndex]}) nullifies Chovva Dosham.` };
  }
  // 6. Mars in 2nd house in Gemini (2) or Virgo (5) - Budha Rasi
  if (info.houseFromLagna === 2 && [2, 5].includes(info.rasiIndex)) {
    return { status: 'DOSHA_CANCELLED', reason: 'Mars in 2nd house in Mercury sign cancels Chovva Dosham.' };
  }
  // 7. Mars in 8th house in Sagittarius (8) or Pisces (11) - Guru Rasi
  if (info.houseFromLagna === 8 && [8, 11].includes(info.rasiIndex)) {
    return { status: 'DOSHA_CANCELLED', reason: 'Mars in 8th house in Jupiter sign cancels Chovva Dosham.' };
  }

  return {
    status: 'ACTIVE_DOSHA',
    reason: `Mars posited in House ${info.houseFromLagna} from Lagna / ${info.houseFromMoon} from Moon without primary cancellation.`
  };
}

export function evaluateChovvaDosham(girlDate: Date, boyDate: Date, girlLagna?: string, boyLagna?: string): ChovvaDoshaResult {
  const gResult = evaluateChovvaDoshamForPerson(girlDate, girlLagna);
  const bResult = evaluateChovvaDoshamForPerson(boyDate, boyLagna);

  let overallCheck: 'COMPATIBLE' | 'NEUTRALIZED' | 'INCOMPATIBLE' = 'COMPATIBLE';
  let description = '';

  const gHasActive = gResult.status === 'ACTIVE_DOSHA';
  const bHasActive = bResult.status === 'ACTIVE_DOSHA';

  if (gHasActive && bHasActive) {
    overallCheck = 'NEUTRALIZED';
    description = 'Both bride and groom possess active Chovva Dosham; the mutual dosham is completely neutralized (Kuja Dosha Samyam), making them highly compatible.';
  } else if (!gHasActive && !bHasActive) {
    overallCheck = 'COMPATIBLE';
    description = 'Neither partner has active Chovva Dosham. Auspicious marriage compatibility.';
  } else if (bHasActive && !gHasActive) {
    overallCheck = 'INCOMPATIBLE';
    description = "Groom has active Chovva Dosham while bride is free. Mars affliction in the groom's chart is un-neutralized; requires Papasamyam balance and remedial prayers.";
  } else {
    // Bride has active dosham, boy does not
    overallCheck = 'INCOMPATIBLE';
    description = 'Bride has active Chovva Dosham without corresponding Kuja placement in the groom’s chart. Requires remedial prayers or careful astrological scrutiny.';
  }

  return {
    girl_status: gResult.status,
    boy_status: bResult.status,
    girl_reason: gResult.reason,
    boy_reason: bResult.reason,
    overall_check: overallCheck,
    description
  };
}

// ----------------------------------------------------------------------
// MODULE 4: DASA SANDHI (MAHADASA TRANSITION COLLISION ANALYSIS)
// ----------------------------------------------------------------------

const DASA_ORDER = [
  { planet: 'Ketu', years: 7 },
  { planet: 'Venus', years: 20 },
  { planet: 'Sun', years: 6 },
  { planet: 'Moon', years: 10 },
  { planet: 'Mars', years: 7 },
  { planet: 'Rahu', years: 18 },
  { planet: 'Jupiter', years: 16 },
  { planet: 'Saturn', years: 19 },
  { planet: 'Mercury', years: 17 }
];

export function getMahadasaTransitions(birthDate: Date, starId: number): { planet: string; endDate: Date }[] {
  const startLordIndex = (starId - 1) % 9;
  const startDasa = DASA_ORDER[startLordIndex];

  // Exact balance of Dasa based on Moon's longitude within the Nakshatra
  const moonLon = getPlanetSiderealLongitude(Astronomy.Body.Moon, birthDate);
  const nakshatraSpan = 360 / 27; // 13.333333°
  const lonInStar = moonLon % nakshatraSpan;
  const fractionElapsed = Math.max(0, Math.min(1, lonInStar / nakshatraSpan));
  const remainingYears = startDasa.years * (1 - fractionElapsed);

  const transitions: { planet: string; endDate: Date }[] = [];
  let currentEnd = new Date(birthDate);
  currentEnd = new Date(currentEnd.getTime() + remainingYears * 365.25 * 24 * 60 * 60 * 1000);
  transitions.push({ planet: startDasa.planet, endDate: currentEnd });

  for (let i = 1; i <= 6; i++) {
    const nextIndex = (startLordIndex + i) % 9;
    const nextDasa = DASA_ORDER[nextIndex];
    currentEnd = new Date(currentEnd.getTime() + nextDasa.years * 365.25 * 24 * 60 * 60 * 1000);
    transitions.push({ planet: nextDasa.planet, endDate: currentEnd });
  }

  return transitions;
}

export function evaluateDasaSandhi(girlBirthDate: Date, boyBirthDate: Date, girlStarId: number, boyStarId: number): DasaSandhiResult {
  const gTransitions = getMahadasaTransitions(girlBirthDate, girlStarId);
  const bTransitions = getMahadasaTransitions(boyBirthDate, boyStarId);

  const now = new Date();
  const girlAgeNow = (now.getTime() - girlBirthDate.getTime()) / (365.25 * 24 * 3600 * 1000);
  const boyAgeNow = (now.getTime() - boyBirthDate.getTime()) / (365.25 * 24 * 3600 * 1000);

  let windowStart: Date;
  let windowEnd: Date;

  if (girlAgeNow >= 16 && girlAgeNow <= 60 && boyAgeNow >= 16 && boyAgeNow <= 60) {
    // Current prospective marriage window: from 1 year ago to 6 years ahead
    windowStart = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    windowEnd = new Date(now.getTime() + 6 * 365.25 * 24 * 60 * 60 * 1000);
  } else {
    // Canonical marriageable age window: 20 to 38 years of age
    const refBirth = Math.max(girlBirthDate.getTime(), boyBirthDate.getTime());
    windowStart = new Date(refBirth + 20 * 365.25 * 24 * 3600 * 1000);
    windowEnd = new Date(refBirth + 38 * 365.25 * 24 * 3600 * 1000);
  }

  const activeG = gTransitions.filter(t => t.endDate >= windowStart && t.endDate <= windowEnd);
  const activeB = bTransitions.filter(t => t.endDate >= windowStart && t.endDate <= windowEnd);

  let minGapDays = Infinity;
  let closestGirlDate = '';
  let closestBoyDate = '';

  for (const g of activeG) {
    for (const b of activeB) {
      const gapDays = Math.abs(Math.floor((g.endDate.getTime() - b.endDate.getTime()) / (1000 * 60 * 60 * 24)));
      if (gapDays < minGapDays) {
        minGapDays = gapDays;
        closestGirlDate = `${g.planet} ends ${g.endDate.toISOString().split('T')[0]}`;
        closestBoyDate = `${b.planet} ends ${b.endDate.toISOString().split('T')[0]}`;
      }
    }
  }

  let status: 'EXCELLENT_NO_COLLISION' | 'SATISFACTORY_ACCEPTABLE' | 'NOT_RECOMMENDED_CRITICAL_COLLISION';
  let description = '';

  if (minGapDays < 180) {
    status = 'NOT_RECOMMENDED_CRITICAL_COLLISION';
    description = `CRITICAL COLLISION: Gap between Mahadasa transitions in marriage window is only ${minGapDays} days (< 6 months). Both partners experiencing Dasa Sandhi simultaneously causes severe marital instability.`;
  } else if (minGapDays < 365) {
    status = 'SATISFACTORY_ACCEPTABLE';
    description = `Acceptable gap (${minGapDays} days, between 6 and 12 months) between major Dasa transitions in the prospective marriage period.`;
  } else if (minGapDays !== Infinity) {
    status = 'EXCELLENT_NO_COLLISION';
    description = `Excellent separation (${minGapDays} days, > 1 year). No Dasa Sandhi collision detected in the active marriage period.`;
  } else {
    status = 'EXCELLENT_NO_COLLISION';
    description = 'No Mahadasa transition overlaps detected during the active marriage period. Stable planetary periods assure domestic peace.';
  }

  return {
    status,
    min_gap_days: minGapDays === Infinity ? 9999 : minGapDays,
    description,
    closestGirlTransition: closestGirlDate || 'None in active window',
    closestBoyTransition: closestBoyDate || 'None in active window'
  };
}

// ----------------------------------------------------------------------
// MODULE 5: AGGREGATION & FINAL RECOMMENDATION MATRIX
// ----------------------------------------------------------------------

export function evaluateMarriageMatch(profile: MatchmakingInputProfile): KeralaMatchEvaluationReport {
  const girlStar = findNakshatra(profile.girl.nakshatra_index || profile.girl.nakshatra) || NAKSHATRAS[0];
  const boyStar = findNakshatra(profile.boy.nakshatra_index || profile.boy.nakshatra) || NAKSHATRAS[0];

  const parseDOB = (dob?: string, time?: string) => {
    if (!dob) return new Date();
    const [y, m, d] = dob.split('-').map(Number);
    const [h, min] = (time || '12:00').split(':').map(Number);
    return new Date(Date.UTC(y, (m || 1) - 1, d || 1, (h || 12) - 5, (min || 0) - 30));
  };

  const gDate = parseDOB(profile.girl.dob, profile.girl.time);
  const bDate = parseDOB(profile.boy.dob, profile.boy.time);

  // Module 1: Dasa Porutham
  const dasaPorutham = evaluateDasaPorutham(
    girlStar,
    boyStar,
    profile.girl.pada || 1,
    profile.boy.pada || 1,
    profile.girl.chandra_rasi,
    profile.boy.chandra_rasi
  );

  // Module 2: Papasamya
  const papasamya = evaluatePapasamya(
    gDate,
    bDate,
    profile.girl.lagna_rasi,
    profile.boy.lagna_rasi
  );

  // Module 3: Chovva Dosham
  const chovvaDosha = evaluateChovvaDosham(
    gDate,
    bDate,
    profile.girl.lagna_rasi,
    profile.boy.lagna_rasi
  );

  // Module 4: Dasa Sandhi
  const dasaSandhi = evaluateDasaSandhi(
    gDate,
    bDate,
    girlStar.id,
    boyStar.id
  );

  // Module 5: Gatekeeper Arbitration Hierarchy
  const vetoReasons: string[] = [];
  let isRecommended = true;

  // 1. Rajju Dosham (FATAL VETO)
  if (dasaPorutham.vetoRajju) {
    isRecommended = false;
    vetoReasons.push('Fatal Veto: Rajju Dosha is present. In Kerala Jyothisham, Rajju Dosha is strictly insurmountable.');
  }

  // 2. Veda Dosham (FATAL VETO)
  if (dasaPorutham.vetoVedha) {
    isRecommended = false;
    vetoReasons.push('Fatal Veto: Vedha Dosha (mutual star affliction) is present.');
  }

  // 3. Dasa Sandhi Collision (< 6 months)
  if (dasaSandhi.status === 'NOT_RECOMMENDED_CRITICAL_COLLISION') {
    isRecommended = false;
    vetoReasons.push('Fatal Timing Collision: Dasa Sandhi gap is under 6 months.');
  }

  // 4. Dashakoota Score Threshold (< 5.0)
  if (dasaPorutham.totalScore < 5.0) {
    isRecommended = false;
    vetoReasons.push(`Dashakoota score is below threshold (${dasaPorutham.totalScore}/10). Minimum 5.0 passing points required.`);
  }

  // 5. Papasamya Deficit Warning
  if (papasamya.status === 'DEFICIT' && Math.abs(papasamya.difference) > 1.5) {
    vetoReasons.push(`Severe Papasamya deficit: Girl has ${Math.abs(papasamya.difference)} more Papa points than Boy.`);
  }

  // 6. Chovva Dosha Mismatch
  if (chovvaDosha.overall_check === 'INCOMPATIBLE') {
    if (chovvaDosha.girl_status === 'ACTIVE_DOSHA' && chovvaDosha.boy_status !== 'ACTIVE_DOSHA') {
      vetoReasons.push('Chovva Dosha mismatch: Bride has un-cancelled Mars affliction without balance in groom’s chart.');
    } else if (chovvaDosha.boy_status === 'ACTIVE_DOSHA' && chovvaDosha.girl_status !== 'ACTIVE_DOSHA') {
      vetoReasons.push('Chovva Dosha mismatch: Groom has un-cancelled Mars affliction without matching dosham in bride’s chart.');
    }
  }

  let summary = '';
  if (!isRecommended) {
    summary = `NOT RECOMMENDED. The alliance fails critical gatekeepers: ${vetoReasons.join(' ')}`;
  } else {
    if (dasaPorutham.totalScore >= 8.0 && papasamya.status === 'UTTHAMAM') {
      summary = `HIGHLY RECOMMENDED (Ulkrishtam). Superior Dashakoota score (${dasaPorutham.totalScore}/10), flawless Rajju & Vedha, balanced Papasamya, and clear Dasa timelines ensure enduring marital bliss.`;
    } else if (dasaPorutham.totalScore >= 6.0) {
      summary = `RECOMMENDED (Madhyamam). Favorable compatibility with ${dasaPorutham.totalScore}/10 Poruthams, passing Rajju/Vedha criteria, and compatible planetary dosha balance.`;
    } else {
      summary = `BORDERLINE ACCEPTABLE (${dasaPorutham.totalScore}/10). Meets the minimum Kerala criteria; auspicious when supported by strong natal horoscopes and traditional remedial observances.`;
    }
  }

  return {
    dashakoota_score: dasaPorutham.totalScore,
    porutham_breakdown: dasaPorutham.breakdown,
    porutham_items: dasaPorutham.items,
    papasamya_result: papasamya,
    chovva_dosha_result: chovvaDosha,
    dasa_sandhi_result: dasaSandhi,
    final_verdict: {
      recommendation: isRecommended ? 'RECOMMENDED' : 'NOT_RECOMMENDED',
      summary,
      detailed_reasons: vetoReasons
    }
  };
}
