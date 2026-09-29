import * as Astronomy from 'astronomy-engine';
import { NAKSHATRAS } from './astroData';
import { getPlanetSiderealLongitude } from './astronomy';

export interface DasaPeriod {
  planet: string;
  malayalamPlanet: string;
  duration: number;
  startDate: Date;
  endDate: Date;
  startYear: string;
  endYear: string;
  isBalancePeriod?: boolean;
}

const DASA_ORDER = [
  { planet: 'Ketu', malayalam: 'കേതു', years: 7 },
  { planet: 'Venus', malayalam: 'ശുക്രൻ', years: 20 },
  { planet: 'Sun', malayalam: 'സൂര്യൻ', years: 6 },
  { planet: 'Moon', malayalam: 'ചന്ദ്രൻ', years: 10 },
  { planet: 'Mars', malayalam: 'ചൊവ്വ', years: 7 },
  { planet: 'Rahu', malayalam: 'രാഹു', years: 18 },
  { planet: 'Jupiter', malayalam: 'വ്യാഴം', years: 16 },
  { planet: 'Saturn', malayalam: 'ശനി', years: 19 },
  { planet: 'Mercury', malayalam: 'ബുധൻ', years: 17 },
];

const NAKSHATRA_LORDS: Record<number, string> = {
  1: 'Ketu', 10: 'Ketu', 19: 'Ketu',
  2: 'Venus', 11: 'Venus', 20: 'Venus',
  3: 'Sun', 12: 'Sun', 21: 'Sun',
  4: 'Moon', 13: 'Moon', 22: 'Moon',
  5: 'Mars', 14: 'Mars', 23: 'Mars',
  6: 'Rahu', 15: 'Rahu', 24: 'Rahu',
  7: 'Jupiter', 16: 'Jupiter', 25: 'Jupiter',
  8: 'Saturn', 17: 'Saturn', 26: 'Saturn',
  9: 'Mercury', 18: 'Mercury', 27: 'Mercury',
};

export function calculateDasaTimeline(
  starId: number, 
  dob: string, 
  time?: string, 
  pada?: number
): DasaPeriod[] {
  let birthDate = new Date(dob);
  if (isNaN(birthDate.getTime())) {
    birthDate = new Date();
  }
  if (time) {
    const [h, m] = time.split(':').map(Number);
    if (!isNaN(h) && !isNaN(m)) {
      birthDate.setHours(h, m, 0, 0);
    }
  }

  const startLord = NAKSHATRA_LORDS[starId] || 'Ketu';
  const startIndex = Math.max(0, DASA_ORDER.findIndex(d => d.planet === startLord));
  
  // Calculate Dasa Balance (ദശാശിഷ്ടം - Dasa Sesham) at birth
  // Each Nakshatra spans 13°20' (13.333333°). Balance is the remaining arc of the birth star.
  let remainingFraction = 0.5;
  try {
    const moonLon = getPlanetSiderealLongitude(Astronomy.Body.Moon, birthDate);
    const starSpan = 360 / 27; // 13.333333°
    const degreesInStar = ((moonLon % starSpan) + starSpan) % starSpan;
    const traversed = degreesInStar / starSpan;
    if (traversed >= 0 && traversed <= 1) {
      remainingFraction = Math.max(0.05, 1 - traversed);
    }
  } catch {
    if (pada && pada >= 1 && pada <= 4) {
      remainingFraction = Math.max(0.05, 1 - ((pada - 0.5) * 0.25));
    } else {
      remainingFraction = 0.5;
    }
  }

  const timeline: DasaPeriod[] = [];
  let currentDate = new Date(birthDate);

  for (let i = 0; i < DASA_ORDER.length; i++) {
    const index = (startIndex + i) % DASA_ORDER.length;
    const dasa = DASA_ORDER[index];
    
    const startDate = new Date(currentDate);
    let durationYears = dasa.years;
    let isBalance = false;

    if (i === 0) {
      // First Dasa has Dasa Sesham (remaining balance)
      durationYears = Number((dasa.years * remainingFraction).toFixed(1));
      if (durationYears <= 0.1) durationYears = 0.5;
      isBalance = true;
    }

    const durationDays = durationYears * 365.2425;
    const endDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
    
    timeline.push({
      planet: dasa.planet,
      malayalamPlanet: dasa.malayalam,
      duration: durationYears,
      startDate,
      endDate,
      startYear: startDate.getFullYear().toString(),
      endYear: endDate.getFullYear().toString(),
      isBalancePeriod: isBalance
    });
    
    currentDate = new Date(endDate);
  }

  return timeline;
}
