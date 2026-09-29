import * as Astronomy from 'astronomy-engine';
import { NAKSHATRAS, RASIS } from './astroData';
import { getPlanetSiderealLongitude } from './astronomy';

export interface VahanaMuhurthamDate {
  date: Date;
  dateFormatted: string;
  weekday: string;
  weekdayMalayalam: string;
  star: string;
  starMalayalam: string;
  tithi: string;
  tithiMalayalam: string;
  tarabalam: string;
  tarabalamMalayalam: string;
  score: number;
  quality: 'Excellent' | 'Good' | 'Average';
  qualityMalayalam: 'ഉത്തമം' | 'മധ്യമം' | 'സാധാരണം';
  auspiciousTimeWindow: string;
  recommendedVehicleColors: string[];
  recommendedVehicleColorsMalayalam: string[];
  poojaAdvice: string;
  poojaAdviceMalayalam: string;
}

const VAHANA_FAVORED_STARS = [
  'Aswathi', 'Rohini', 'Makayiram', 'Punartham', 'Pooyam', 
  'Atham', 'Chithira', 'Chothi', 'Anizham', 'Thiruvonam', 'Avittam', 'Revathi'
];

const TITHI_NAMES = [
  { en: 'Prathama', ml: 'പ്രഥമ' },
  { en: 'Dwitiya', ml: 'ദ്വിതീയ' },
  { en: 'Tritiya', ml: 'തൃതീയ' },
  { en: 'Chaturthi', ml: 'ചതുർത്ഥി' },
  { en: 'Panchami', ml: 'പഞ്ചമി' },
  { en: 'Shashti', ml: 'ഷഷ്ഠി' },
  { en: 'Saptami', ml: 'സപ്തമി' },
  { en: 'Ashtami', ml: 'അഷ്ടമി' },
  { en: 'Navami', ml: 'നവമി' },
  { en: 'Dashami', ml: 'ദശമി' },
  { en: 'Ekadashi', ml: 'ഏകാദശി' },
  { en: 'Dwadashi', ml: 'ദ്വാദശി' },
  { en: 'Trayodashi', ml: 'ത്രയോദശി' },
  { en: 'Chaturdashi', ml: 'ചതുർദ്ദശി' },
  { en: 'Purnima', ml: 'പൗർണ്ണമി' },
  { en: 'Amavasya', ml: 'അമാവാസി' }
];

const WEEKDAY_NAMES_ML = ['ഞായർ', 'തിങ്കൾ', 'ചൊവ്വ', 'ബുധൻ', 'വ്യാഴം', 'വെള്ളി', 'ശനി'];

export function calculateVahanaMuhurthams(
  buyerStarId: number,
  vehicleType: 'two_wheeler' | 'four_wheeler' | 'commercial' = 'four_wheeler',
  daysAhead: number = 60
): VahanaMuhurthamDate[] {
  const results: VahanaMuhurthamDate[] = [];
  const today = new Date();
  const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 8, 0, 0);

  const buyerStar = NAKSHATRAS.find(s => s.id === buyerStarId) || NAKSHATRAS[0];

  // Colors recommended according to ruling planet
  const colorMap: Record<string, { en: string[]; ml: string[] }> = {
    Sun: { en: ['Pearl White', 'Golden Red', 'Copper'], ml: ['വെള്ള', 'ഗോൾഡൻ ചുവപ്പ്', 'ചെമ്പ്'] },
    Moon: { en: ['Silver', 'Pure White', 'Light Grey'], ml: ['വെള്ളി', 'ശുദ്ധമായ വെള്ള', 'ചാരനിറം'] },
    Mars: { en: ['Deep Crimson', 'Silver Grey', 'White'], ml: ['കടും ചുവപ്പ്', 'സിൽവർ ഗ്രേ', 'വെള്ള'] },
    Mercury: { en: ['Emerald Green', 'Deep Blue', 'Silver'], ml: ['പച്ച', 'നീല', 'വെള്ളി'] },
    Jupiter: { en: ['Golden Yellow', 'Bronze', 'Pearl White'], ml: ['സ്വർണ്ണനിറം', 'ബ്രോൺസ്', 'വെള്ള'] },
    Venus: { en: ['Diamond White', 'Silver', 'Glossy Black'], ml: ['ഡയമണ്ട് വൈറ്റ്', 'സിൽവർ', 'കറുപ്പ്'] },
    Saturn: { en: ['Steel Grey', 'Midnight Blue', 'Black'], ml: ['സ്റ്റീൽ ഗ്രേ', 'കടും നീല', 'കറുപ്പ്'] }
  };

  const defaultColors = colorMap[buyerStar.rulingPlanet] || colorMap['Venus'];

  for (let i = 0; i < daysAhead; i++) {
    const candidateDate = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
    
    // Astronomical calculations
    const sunLon = getPlanetSiderealLongitude(Astronomy.Body.Sun, candidateDate);
    const moonLon = getPlanetSiderealLongitude(Astronomy.Body.Moon, candidateDate);
    const venusLon = getPlanetSiderealLongitude(Astronomy.Body.Venus, candidateDate);

    // Nakshatra of the day
    const starIndex = Math.floor(moonLon / (360 / 27));
    const star = NAKSHATRAS[starIndex];
    if (!star || !VAHANA_FAVORED_STARS.includes(star.name)) {
      continue;
    }

    // Tithi
    let diffLon = moonLon - sunLon;
    if (diffLon < 0) diffLon += 360;
    const tithiIndex = Math.floor(diffLon / 12);
    const isShukla = tithiIndex < 15;
    const tithiNumberInPaksha = (tithiIndex % 15) + 1;

    // Avoid Riktha tithis (4, 9, 14) and Amavasya
    if (tithiNumberInPaksha === 4 || tithiNumberInPaksha === 9 || tithiNumberInPaksha === 14 || tithiIndex === 29) {
      continue;
    }

    // Weekday check: Wednesday, Thursday, Friday, Sunday are favorable. Tuesday is strictly avoided for vehicle delivery.
    const dayOfWeek = candidateDate.getDay();
    if (dayOfWeek === 2) continue; // Skip Tuesday

    // Tarabalam
    const starDiff = ((star.id - buyerStarId) + 27) % 9;
    const isTarabalamGood = (starDiff === 1 || starDiff === 3 || starDiff === 5 || starDiff === 7 || starDiff === 8);
    // 0 is Janma (avoid for vehicle delivery if possible), 2 is Vipat, 4 is Pratyak, 6 is Naidhana
    if (starDiff === 2 || starDiff === 4 || starDiff === 6) {
      continue;
    }

    // Shukra (Venus) dignity bonus
    let score = 70;
    if (isShukla) score += 10;
    if (dayOfWeek === 3 || dayOfWeek === 4 || dayOfWeek === 5) score += 10; // Wed, Thu, Fri
    if (isTarabalamGood) score += 10;

    let quality: 'Excellent' | 'Good' | 'Average' = 'Good';
    let qualityMalayalam: 'ഉത്തമം' | 'മധ്യമം' | 'സാധാരണം' = 'മധ്യമം';
    if (score >= 85) {
      quality = 'Excellent';
      qualityMalayalam = 'ഉത്തമം';
    }

    const tithiObj = tithiNumberInPaksha === 15 
      ? (isShukla ? TITHI_NAMES[14] : TITHI_NAMES[15]) 
      : TITHI_NAMES[tithiNumberInPaksha - 1];

    const tarabalamNames = ['ജന്മ താര', 'സമ്പത്ത് താര (ഉത്തമം)', 'വിപത്ത് താര', 'ക്ഷേമ താര (ഉത്തമം)', 'പ്രത്യക്ക് താര', 'സാധന താര (ഉത്തമം)', 'നൈധന താര', 'മിത്ര താര (ഉത്തമം)', 'പരമ മിത്ര താര (ഉത്തമം)'];
    const tarabalamNamesEn = ['Janma', 'Sampat (Auspicious)', 'Vipat', 'Kshema (Auspicious)', 'Pratyak', 'Sadhana (Auspicious)', 'Naidhana', 'Mitra (Auspicious)', 'Parama Mitra (Auspicious)'];

    results.push({
      date: candidateDate,
      dateFormatted: candidateDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
      weekday: candidateDate.toLocaleDateString('en-US', { weekday: 'long' }),
      weekdayMalayalam: WEEKDAY_NAMES_ML[dayOfWeek],
      star: star.name,
      starMalayalam: star.malayalamName,
      tithi: `${isShukla ? 'Shukla' : 'Krishna'} ${tithiObj.en}`,
      tithiMalayalam: `${isShukla ? 'ശുക്ലപക്ഷ' : 'കൃഷ്ണപക്ഷ'} ${tithiObj.ml}`,
      tarabalam: tarabalamNamesEn[starDiff],
      tarabalamMalayalam: tarabalamNames[starDiff],
      score: Math.min(score, 100),
      quality,
      qualityMalayalam,
      auspiciousTimeWindow: dayOfWeek === 5 ? '09:15 AM - 11:30 AM (ശുക്ര ഹോര)' : '10:00 AM - 12:15 PM (ശുഭ മുഹൂർത്തം)',
      recommendedVehicleColors: defaultColors.en,
      recommendedVehicleColorsMalayalam: defaultColors.ml,
      poojaAdvice: 'Perform Ganapathi Pooja and Vahana Pooja immediately after delivery. Place a small Ganesha idol and lime under all 4 tyres.',
      poojaAdviceMalayalam: 'വാഹനം കൈപ്പറ്റിയ ഉടൻ ഗണപതി ക്ഷേത്രത്തിൽ വാഹനപൂജ നടത്തുക. നാല് ടയറുകളുടെ അടിയിലും നാരങ്ങ വെച്ച് വാഹനം മുന്നോട്ട് എടുക്കുന്നത് ശുഭകരമാണ്.'
    });

    if (results.length >= 8) break;
  }

  return results.sort((a, b) => b.score - a.score);
}
