import { NAKSHATRAS } from './astroData';

export interface DasaPeriod {
  planet: string;
  malayalamPlanet: string;
  duration: number;
  startDate: Date;
  endDate: Date;
  startYear: string;
  endYear: string;
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

export function calculateDasaTimeline(starId: number, dob: string): DasaPeriod[] {
  const birthDate = new Date(dob);
  const startLord = NAKSHATRA_LORDS[starId];
  const startIndex = DASA_ORDER.findIndex(d => d.planet === startLord);
  
  const timeline: DasaPeriod[] = [];
  let currentDate = new Date(birthDate);

  // For simplicity, we assume the birth happens at the start of the Dasa.
  // In real astrology, we calculate the balance Dasa based on the Moon's longitude.
  // Here we'll show the full sequence starting from the birth Dasa.

  for (let i = 0; i < DASA_ORDER.length; i++) {
    const index = (startIndex + i) % DASA_ORDER.length;
    const dasa = DASA_ORDER[index];
    
    const startDate = new Date(currentDate);
    const endDate = new Date(currentDate);
    endDate.setFullYear(endDate.getFullYear() + dasa.years);
    
    timeline.push({
      planet: dasa.planet,
      malayalamPlanet: dasa.malayalam,
      duration: dasa.years,
      startDate,
      endDate,
      startYear: startDate.getFullYear().toString(),
      endYear: endDate.getFullYear().toString(),
    });
    
    currentDate = new Date(endDate);
  }

  return timeline;
}
