import { NAKSHATRAS, RASIS, PLANETARY_FRIENDSHIP, YONI_ENEMIES, YONI_FRIENDS, VASYA_MAPPING, Nakshatra } from './astroData';

export interface PoruthamResult {
  name: string;
  malayalamName: string;
  status: 'Uthamam' | 'Madhyamam' | 'Adhamam';
  score: number;
  maxScore: number;
  description: string;
}

export interface MatchReport {
  totalScore: number;
  results: PoruthamResult[];
  isMatch: boolean;
  overallRecommendation: string;
}

const getRasiId = (rasiName: string) => RASIS.findIndex(r => r.name === rasiName) + 1;
const getRasiLord = (rasiName: string) => RASIS.find(r => r.name === rasiName)?.lord || '';

// 1. RAJJU PORUTHAM (VETO)
function checkRajju(girlStar: Nakshatra, boyStar: Nakshatra): PoruthamResult {
  const isSame = girlStar.rajju === boyStar.rajju;
  let desc = `Girl: ${girlStar.rajju}, Boy: ${boyStar.rajju}. `;
  
  if (isSame) {
    if (girlStar.rajju === 'Siro') desc += "Husband's longevity severely affected.";
    else if (girlStar.rajju === 'Kanta') desc += "Wife's longevity affected.";
    else if (girlStar.rajju === 'Udara') desc += "Progeny and children affected.";
    else if (girlStar.rajju === 'Kati') desc += "Risk of poverty.";
    else if (girlStar.rajju === 'Pada') desc += "Separation, wandering, accidents.";
  } else {
    desc += "Different Rajju groups (Uthamam).";
  }

  return {
    name: 'Rajju',
    malayalamName: 'രജ്ജു',
    status: isSame ? 'Adhamam' : 'Uthamam',
    score: isSame ? 0 : 1,
    maxScore: 1,
    description: desc
  };
}

// 2. VEDHA PORUTHAM (VETO)
function checkVedha(girlStar: Nakshatra, boyStar: Nakshatra): PoruthamResult {
  const isVedha = girlStar.vedha.includes(boyStar.id) || boyStar.vedha.includes(girlStar.id);
  
  return {
    name: 'Vedha',
    malayalamName: 'വേധ',
    status: isVedha ? 'Adhamam' : 'Uthamam',
    score: isVedha ? 0 : 1,
    maxScore: 1,
    description: isVedha ? `Vedha dosham present between ${girlStar.name} and ${boyStar.name}.` : "No Vedha dosham (Uthamam)."
  };
}

// 3. DINA PORUTHAM
function checkDina(girlStar: Nakshatra, boyStar: Nakshatra): PoruthamResult {
  const getCount = (from: number, to: number) => {
    let count = to - from + 1;
    if (count <= 0) count += 27;
    return count;
  };

  const evaluateRemainder = (rem: number) => {
    // Dina porutham remainders: 2, 4, 6, 8 are good.
    // 0 (remainder 9) is bad in Kerala astrology.
    if ([2, 4, 6, 8].includes(rem)) return 'Good';
    return 'Bad';
  };

  // Distance from Girl to Boy
  const countGtoB = getCount(girlStar.id, boyStar.id);
  const remGtoB = countGtoB % 9;
  const resGtoB = evaluateRemainder(remGtoB);

  // Distance from Boy to Girl
  const countBtoG = getCount(boyStar.id, girlStar.id);
  const remBtoG = countBtoG % 9;
  const resBtoG = evaluateRemainder(remBtoG);

  let status: 'Uthamam' | 'Madhyamam' | 'Adhamam' = 'Adhamam';
  // Check both directions
  if (resGtoB === 'Good' && resBtoG === 'Good') status = 'Uthamam';
  else if (resGtoB === 'Good' || resBtoG === 'Good') status = 'Madhyamam';

  return {
    name: 'Dina',
    malayalamName: 'ദിനം',
    status,
    score: status === 'Uthamam' ? 1 : (status === 'Madhyamam' ? 0.5 : 0),
    maxScore: 1,
    description: `Girl to Boy: Rem ${remGtoB || 9} (${resGtoB}). Boy to Girl: Rem ${remBtoG || 9} (${resBtoG}).`
  };
}

// 4. GANA PORUTHAM
function checkGana(girlStar: Nakshatra, boyStar: Nakshatra): PoruthamResult {
  const g = girlStar.gana;
  const b = boyStar.gana;
  
  let status: 'Uthamam' | 'Madhyamam' | 'Adhamam' = 'Adhamam';

  if (b === 'Deva' && g === 'Deva') status = 'Uthamam';
  else if (b === 'Manushya' && g === 'Manushya') status = 'Uthamam';
  else if (b === 'Deva' && g === 'Manushya') status = 'Uthamam';
  else if (b === 'Manushya' && g === 'Deva') status = 'Madhyamam';
  else if (b === 'Rakshasa' && g === 'Rakshasa') status = 'Madhyamam';
  else if (b === 'Rakshasa' && g === 'Manushya') status = 'Madhyamam';
  else if (b === 'Manushya' && g === 'Rakshasa') status = 'Adhamam';
  else if (b === 'Deva' && g === 'Rakshasa') status = 'Adhamam';
  else if (b === 'Rakshasa' && g === 'Deva') status = 'Adhamam';

  return {
    name: 'Gana',
    malayalamName: 'ഗണം',
    status,
    score: status === 'Uthamam' ? 1 : (status === 'Madhyamam' ? 0.5 : 0),
    maxScore: 1,
    description: `Boy: ${b}, Girl: ${g}.`
  };
}

// 5. RASI PORUTHAM
function checkRasi(girlStar: Nakshatra, boyStar: Nakshatra): PoruthamResult {
  const gRasi = getRasiId(girlStar.defaultRashi);
  const bRasi = getRasiId(boyStar.defaultRashi);
  
  const getCount = (from: number, to: number) => {
    let count = to - from + 1;
    if (count <= 0) count += 12;
    return count;
  };

  const countGtoB = getCount(gRasi, bRasi);
  const countBtoG = getCount(bRasi, gRasi);

  let status: 'Uthamam' | 'Madhyamam' | 'Adhamam' = 'Madhyamam';

  if (countGtoB === 6 || countGtoB === 8 || countGtoB === 12 || countBtoG === 6 || countBtoG === 8 || countBtoG === 12) {
    status = 'Adhamam';
  } else if (countGtoB === 7) {
    status = 'Uthamam';
  } else if (countGtoB === 1) {
    status = 'Madhyamam';
  } else if ([2, 3, 4, 5, 6].includes(countGtoB)) {
    status = 'Madhyamam'; // Simplified, relies on Rasiyathipaty for lord check
  }

  return {
    name: 'Rasi',
    malayalamName: 'രാശി',
    status,
    score: status === 'Uthamam' ? 1 : (status === 'Madhyamam' ? 0.5 : 0),
    maxScore: 1,
    description: `G->B count: ${countGtoB}. B->G count: ${countBtoG}.`
  };
}

// 6. RASIYATHIPATY PORUTHAM
function checkRasiyathipaty(girlStar: Nakshatra, boyStar: Nakshatra): PoruthamResult {
  const gLord = getRasiLord(girlStar.defaultRashi);
  const bLord = getRasiLord(boyStar.defaultRashi);

  if (gLord === bLord) {
    return { name: 'Rasiyathipaty', malayalamName: 'രാശ്യാധിപതി', status: 'Uthamam', score: 1, maxScore: 1, description: `Both lords are ${gLord}.` };
  }

  const bFriends = PLANETARY_FRIENDSHIP[bLord]?.friends || [];
  const bEnemies = PLANETARY_FRIENDSHIP[bLord]?.enemies || [];
  const gFriends = PLANETARY_FRIENDSHIP[gLord]?.friends || [];
  const gEnemies = PLANETARY_FRIENDSHIP[gLord]?.enemies || [];

  const bViewsG = bFriends.includes(gLord) ? 'Friend' : (bEnemies.includes(gLord) ? 'Enemy' : 'Neutral');
  const gViewsB = gFriends.includes(bLord) ? 'Friend' : (gEnemies.includes(bLord) ? 'Enemy' : 'Neutral');

  let status: 'Uthamam' | 'Madhyamam' | 'Adhamam' = 'Madhyamam';

  if (bViewsG === 'Friend' && gViewsB === 'Friend') status = 'Uthamam';
  else if (bViewsG === 'Enemy' && gViewsB === 'Enemy') status = 'Adhamam';
  else if ((bViewsG === 'Friend' && gViewsB === 'Neutral') || (gViewsB === 'Friend' && bViewsG === 'Neutral')) status = 'Uthamam';
  else if (bViewsG === 'Friend' || gViewsB === 'Friend') status = 'Madhyamam'; // One-way friend
  else if (bViewsG === 'Enemy' || gViewsB === 'Enemy') status = 'Adhamam'; // One-way enemy

  return {
    name: 'Rasiyathipaty',
    malayalamName: 'രാശ്യാധിപതി',
    status,
    score: status === 'Uthamam' ? 1 : (status === 'Madhyamam' ? 0.5 : 0),
    maxScore: 1,
    description: `Boy lord (${bLord}) views Girl lord (${gLord}) as ${bViewsG}. Girl views Boy as ${gViewsB}.`
  };
}

// 7. MAHENDRA PORUTHAM
function checkMahendra(girlStar: Nakshatra, boyStar: Nakshatra): PoruthamResult {
  let count = boyStar.id - girlStar.id + 1;
  if (count <= 0) count += 27;

  // Mahendra Porutham uthamam counts: 4, 7, 10, 13, 16, 19, 22, 25
  const goodCounts = [4, 7, 10, 13, 16, 19, 22, 25];
  const isPresent = goodCounts.includes(count);

  return {
    name: 'Mahendra',
    malayalamName: 'മഹേന്ദ്രം',
    status: isPresent ? 'Uthamam' : 'Adhamam',
    score: isPresent ? 1 : 0,
    maxScore: 1,
    description: `Count from Girl to Boy is ${count}. ${isPresent ? 'Present' : 'Absent'}.`
  };
}

// 8. STREE DEERGHA PORUTHAM
function checkStreeDeergha(girlStar: Nakshatra, boyStar: Nakshatra): PoruthamResult {
  // Distance from Girl to Boy star should be more than 13
  let count = boyStar.id - girlStar.id + 1;
  if (count <= 0) count += 27;

  const isGood = count >= 13;

  return {
    name: 'Stree Deergha',
    malayalamName: 'സ്ത്രീ ദീർഘം',
    status: isGood ? 'Uthamam' : 'Adhamam',
    score: isGood ? 1 : 0,
    maxScore: 1,
    description: `Count from Girl to Boy is ${count}.`
  };
}

// 9. YONI PORUTHAM
function checkYoni(girlStar: Nakshatra, boyStar: Nakshatra): PoruthamResult {
  const gYoni = girlStar.yoni;
  const bYoni = boyStar.yoni;

  let status: 'Uthamam' | 'Madhyamam' | 'Adhamam' = 'Madhyamam';

  if (gYoni === bYoni) {
    status = 'Uthamam';
  } else if (YONI_ENEMIES[gYoni] === bYoni || YONI_ENEMIES[bYoni] === gYoni) {
    status = 'Adhamam';
  } else if (YONI_FRIENDS[gYoni] === bYoni || YONI_FRIENDS[bYoni] === gYoni) {
    status = 'Madhyamam';
  }

  return {
    name: 'Yoni',
    malayalamName: 'യോനി',
    status,
    score: status === 'Uthamam' ? 1 : (status === 'Madhyamam' ? 0.5 : 0),
    maxScore: 1,
    description: `Boy: ${bYoni}, Girl: ${gYoni}.`
  };
}

// 10. VASYA PORUTHAM
function checkVasya(girlStar: Nakshatra, boyStar: Nakshatra): PoruthamResult {
  const gRasi = girlStar.defaultRashi;
  const bRasi = boyStar.defaultRashi;

  const bVasyaToG = VASYA_MAPPING[bRasi]?.includes(gRasi);
  const gVasyaToB = VASYA_MAPPING[gRasi]?.includes(bRasi);

  let status: 'Uthamam' | 'Madhyamam' | 'Adhamam' = 'Adhamam';

  if (bVasyaToG && gVasyaToB) status = 'Uthamam';
  else if (bVasyaToG) status = 'Uthamam';
  else if (gVasyaToB) status = 'Madhyamam';

  return {
    name: 'Vasya',
    malayalamName: 'വശ്യം',
    status,
    score: status === 'Uthamam' ? 1 : (status === 'Madhyamam' ? 0.5 : 0),
    maxScore: 1,
    description: `Boy Rashi: ${bRasi}, Girl Rashi: ${gRasi}.`
  };
}

export function calculatePorutham(girlStarId: number, boyStarId: number): MatchReport {
  const girlStar = NAKSHATRAS.find(n => n.id === girlStarId);
  const boyStar = NAKSHATRAS.find(n => n.id === boyStarId);

  if (!girlStar || !boyStar) {
    throw new Error("Invalid Star ID");
  }

  const results: PoruthamResult[] = [
    checkRajju(girlStar, boyStar),
    checkVedha(girlStar, boyStar),
    checkDina(girlStar, boyStar),
    checkGana(girlStar, boyStar),
    checkRasi(girlStar, boyStar),
    checkRasiyathipaty(girlStar, boyStar),
    checkMahendra(girlStar, boyStar),
    checkStreeDeergha(girlStar, boyStar),
    checkYoni(girlStar, boyStar),
    checkVasya(girlStar, boyStar),
  ];

  let uthamamCount = 0;
  let madhyamamCount = 0;
  let totalScore = 0;

  results.forEach(r => {
    if (r.status === 'Uthamam') uthamamCount++;
    if (r.status === 'Madhyamam') madhyamamCount++;
    totalScore += r.score;
  });

  const rajju = results.find(r => r.name === 'Rajju');
  const vedha = results.find(r => r.name === 'Vedha');

  let isMatch = true;
  let overallRecommendation = "";

  const passedCount = uthamamCount + madhyamamCount;

  if (rajju?.status === 'Adhamam' || vedha?.status === 'Adhamam') {
    isMatch = false;
    overallRecommendation = "Not Recommended: Mandatory VETO conditions (Rajju or Vedha) failed. Match is highly discouraged regardless of other scores.";
  } else if (passedCount >= 8) {
    overallRecommendation = "Ulkrishtam (Excellent): 8-10 poruthams pass, Rajju and Vedha are both Uthamam. Highly recommended match.";
  } else if (passedCount >= 6) {
    overallRecommendation = "Madhyamam (Good): 6-7 poruthams pass, Rajju and Vedha are both Uthamam. Good match.";
  } else if (passedCount === 5) {
    isMatch = false;
    overallRecommendation = "Adhamam (Borderline): Only 5 poruthams pass. Consult an expert astrologer before deciding.";
  } else {
    isMatch = false;
    overallRecommendation = `Not Recommended: Less than 5 poruthams pass (${passedCount}/10).`;
  }

  return {
    totalScore, // Using actual float score
    results,
    isMatch,
    overallRecommendation
  };
}
