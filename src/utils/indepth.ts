import * as Astronomy from 'astronomy-engine';
import { getPlanetSiderealLongitude } from './astronomy';

export interface IndepthReport {
  papasamyam: {
    boyScore: number;
    girlScore: number;
    isCompatible: boolean;
    description: string;
  };
  chovvaDosham: {
    hasDosham: boolean;
    description: string;
  };
  dasaSandhi: {
    hasIssue: boolean;
    description: string;
  };
  madhamaranju: {
    hasIssue: boolean;
    description: string;
  };
  overallRecommendation: string;
}

function parseDate(dob: string, time: string): Date {
  const [year, month, day] = dob.split('-').map(Number);
  const [hours, minutes] = time.split(':').map(Number);
  // Assuming IST (+05:30)
  return new Date(Date.UTC(year, month - 1, day, hours - 5, minutes - 30));
}

function getRasi(longitude: number): number {
  return Math.floor(longitude / 30);
}

function getHouse(planetRasi: number, referenceRasi: number): number {
  let house = planetRasi - referenceRasi + 1;
  if (house <= 0) house += 12;
  return house;
}

function calculatePapasamyam(date: Date) {
  const papaPlanets = [
    Astronomy.Body.Sun,
    Astronomy.Body.Mars,
    Astronomy.Body.Saturn,
    'Rahu' as const,
    'Ketu' as const
  ];

  const moonLon = getPlanetSiderealLongitude(Astronomy.Body.Moon, date);
  const venusLon = getPlanetSiderealLongitude(Astronomy.Body.Venus, date);
  
  const moonRasi = getRasi(moonLon);
  const venusRasi = getRasi(venusLon);

  let score = 0;
  let hasChovvaDosham = false;

  const doshaHouses = [1, 2, 4, 7, 8, 12];

  for (const planet of papaPlanets) {
    const lon = getPlanetSiderealLongitude(planet, date);
    const rasi = getRasi(lon);

    const houseFromMoon = getHouse(rasi, moonRasi);
    const houseFromVenus = getHouse(rasi, venusRasi);

    if (doshaHouses.includes(houseFromMoon)) {
      score += 1; // 1 point from Moon
      if (planet === Astronomy.Body.Mars && [7, 8].includes(houseFromMoon)) {
        hasChovvaDosham = true;
      }
    }
    
    if (doshaHouses.includes(houseFromVenus)) {
      score += 0.5; // 0.5 points from Venus
    }
  }

  return { score, hasChovvaDosham };
}

// Dasa Sandhi: Check if the couple's Dasa changes happen within 1 year of each other.
// A simple approximation based on birth star and date.
function calculateDasaSandhi(boyDate: Date, girlDate: Date, boyStarId: number, girlStarId: number) {
  // Dasa sequence and their years
  const dasaYears = [
    7,  // Ketu
    20, // Venus
    6,  // Sun
    10, // Moon
    7,  // Mars
    18, // Rahu
    16, // Jupiter
    19, // Saturn
    17  // Mercury
  ];

  // Star ID 1 is Ashwini (Ketu dasa). 
  // Dasa index = Math.floor((starId - 1) / 3) % 9
  // Wait, Ashwini, Makam, Moolam are Ketu.
  // Star IDs: 1, 10, 19 -> (1-1)%9 = 0, (10-1)%9 = 0, (19-1)%9 = 0.
  // So dasaIndex = (starId - 1) % 9;
  
  const getDasaEndAges = (starId: number, birthDate: Date) => {
    const dasaIndex = (starId - 1) % 9;
    const currentDasaYears = dasaYears[dasaIndex];
    
    // Approximate remaining dasa at birth (randomized based on star for this demo, 
    // real calculation needs exact moon longitude within the star)
    // Let's use a deterministic fraction based on the date so it's consistent.
    const fraction = (birthDate.getTime() % 1000) / 1000; 
    let remainingYears = currentDasaYears * (0.1 + fraction * 0.8); // 10% to 90%
    
    const endAges = [];
    let currentAge = remainingYears;
    endAges.push(currentAge);
    
    for (let i = 1; i < 5; i++) { // Next 4 dasas
      const nextDasaIndex = (dasaIndex + i) % 9;
      currentAge += dasaYears[nextDasaIndex];
      endAges.push(currentAge);
    }
    return endAges;
  };

  const boyAges = getDasaEndAges(boyStarId, boyDate);
  const girlAges = getDasaEndAges(girlStarId, girlDate);
  
  const boyBirthYear = boyDate.getFullYear();
  const girlBirthYear = girlDate.getFullYear();

  let hasIssue = false;
  
  // Check if any dasa end year is within 1 year of each other
  for (const bAge of boyAges) {
    const bYear = boyBirthYear + bAge;
    for (const gAge of girlAges) {
      const gYear = girlBirthYear + gAge;
      if (Math.abs(bYear - gYear) <= 1.5) { // 1.5 years threshold
        hasIssue = true;
        break;
      }
    }
    if (hasIssue) break;
  }

  return hasIssue;
}

export async function calculateIndepth(boy: any, girl: any): Promise<IndepthReport> {
  // Simulate network/calculation delay for UI feedback
  await new Promise(resolve => setTimeout(resolve, 1500));

  const boyDate = parseDate(boy.dob, boy.time);
  const girlDate = parseDate(girl.dob, girl.time);
  
  const boyStarId = boy.starId || 1;
  const girlStarId = girl.starId || 1;
  
  const boyPapa = calculatePapasamyam(boyDate);
  const girlPapa = calculatePapasamyam(girlDate);
  
  // Boy should ideally have slightly more or equal papam than girl.
  const isPapasamyamCompatible = boyPapa.score >= girlPapa.score - 1.5;

  const hasChovvaDosham = boyPapa.hasChovvaDosham || girlPapa.hasChovvaDosham;
  const hasDasaSandhi = calculateDasaSandhi(boyDate, girlDate, boyStarId, girlStarId);
  
  // Madhamaranju is a specific dosha when certain stars marry.
  // E.g., Makam and Pooram, etc. We'll use a deterministic mock for this one.
  const combined = boyStarId + girlStarId;
  const hasMadhamaranju = combined % 7 === 0;

  let recommendation = '';
  if (isPapasamyamCompatible && !hasChovvaDosham && !hasDasaSandhi) {
    recommendation = 'വിവാഹം കഴിക്കാവുന്നതാണ് (Highly Recommended)';
  } else if (!isPapasamyamCompatible) {
    recommendation = 'പാപസാമ്യം ഇല്ലാത്തതിനാൽ ഒഴിവാക്കുക (Not Recommended due to Papasamyam)';
  } else {
    recommendation = 'കൂടുതൽ ജ്യോതിഷ പരിശോധനകൾ ആവശ്യമാണ് (Needs further expert consultation)';
  }

  return {
    papasamyam: {
      boyScore: boyPapa.score,
      girlScore: girlPapa.score,
      isCompatible: isPapasamyamCompatible,
      description: isPapasamyamCompatible 
        ? 'പാപസാമ്യം തൃപ്തികരമാണ് (Papasamyam is balanced)' 
        : 'പാപസാമ്യം പൊരുത്തപ്പെടുന്നില്ല (Papasamyam mismatch)'
    },
    chovvaDosham: {
      hasDosham: hasChovvaDosham,
      description: hasChovvaDosham 
        ? 'ചൊവ്വാ ദോഷം ഉണ്ട് (Chovva Dosham present)' 
        : 'ചൊവ്വാ ദോഷം ഇല്ല (No Chovva Dosham)'
    },
    dasaSandhi: {
      hasIssue: hasDasaSandhi,
      description: hasDasaSandhi 
        ? 'ദശാസന്ധി ദോഷം ഉണ്ട് (Dasa Sandhi issue present)' 
        : 'ദശാസന്ധി ദോഷം ഇല്ല (No Dasa Sandhi issue)'
    },
    madhamaranju: {
      hasIssue: hasMadhamaranju,
      description: hasMadhamaranju 
        ? 'മദമറഞ്ഞു ദോഷം കാണുന്നു (Madhamaranju issue detected)' 
        : 'മദമറഞ്ഞു ദോഷം ഇല്ല (No Madhamaranju issue)'
    },
    overallRecommendation: recommendation
  };
}
