import * as Astronomy from 'astronomy-engine';
import { NAKSHATRAS, RASIS } from './astroData';
import { getPlanetSiderealLongitude } from './astronomy';

export interface BhoomiPujaDate {
  date: Date;
  dateFormatted: string;
  weekday: string;
  weekdayMalayalam: string;
  solarMonth: string;
  solarMonthMalayalam: string;
  star: string;
  starMalayalam: string;
  tithi: string;
  tithiMalayalam: string;
  tarabalam: string;
  tarabalamMalayalam: string;
  quality: 'Excellent' | 'Good';
  qualityMalayalam: string;
  score: number;
  muhurthamTimeWindow: string;
  shubhaLagna: string;
  vastuDirection: string;
  vastuDirectionMalayalam: string;
  foundationRituals: string;
  foundationRitualsMalayalam: string;
}

// Preferred Nakshatras for Bhoomi Puja and Foundation Stone laying
const AUSPICIOUS_BHOOMI_STARS = [
  4,  // Rohini
  5,  // Mrigashira
  12, // Uttara Phalguni (Uthram)
  13, // Hasta (Atham)
  14, // Chitra (Chithira)
  15, // Swati (Chothi)
  17, // Anuradha (Anizham)
  21, // Uttara Ashadha (Uthradam)
  22, // Shravana (Thiruvonam)
  23, // Dhanishta (Avittom)
  24, // Shatabhisha (Chathayam)
  26, // Uttara Bhadrapada (Uthrattathi)
  27  // Revati
];

// Inauspicious Tithis (Riktha: 4, 9, 14, and Amavasya: 30, Pournami: 15)
const INAUSPICIOUS_TITHIS = [4, 9, 14, 15, 19, 24, 29, 30];

const MALAYALAM_WEEKDAYS: Record<number, string> = {
  0: 'ഞായർ',
  1: 'തിങ്കൾ',
  2: 'ചൊവ്വ',
  3: 'ബുധൻ',
  4: 'വ്യാഴം',
  5: 'വെള്ളി',
  6: 'ശനി'
};

const WEEKDAY_NAMES_EN: Record<number, string> = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday'
};

const TITHI_NAMES = [
  'Prathama (പ്രഥമ)', 'Dwitiya (ദ്വിതീയ)', 'Tritiya (തൃതീയ)', 'Chaturthi (ചതുർത്ഥി)',
  'Panchami (പഞ്ചമി)', 'Shashti (ഷഷ്ഠി)', 'Saptami (സപ്തമി)', 'Ashtami (അഷ്ടമി)',
  'Navami (നവമി)', 'Dashami (ദശമി)', 'Ekadashi (ഏകാദശി)', 'Dwadashi (ദ്വാദശി)',
  'Trayodashi (ത്രയോദശി)', 'Chaturdashi (ചതുർദ്ദശി)', 'Pournami (പൗർണ്ണമി)',
  'Prathama (പ്രഥമ)', 'Dwitiya (ദ്വിതീയ)', 'Tritiya (തൃതീയ)', 'Chaturthi (ചതുർത്ഥി)',
  'Panchami (പഞ്ചമി)', 'Shashti (ഷഷ്ഠി)', 'Saptami (സപ്തമി)', 'Ashtami (അഷ്ടമി)',
  'Navami (നവമി)', 'Dashami (ദശമി)', 'Ekadashi (ഏകാദശി)', 'Dwadashi (ദ്വാദശി)',
  'Trayodashi (ത്രയോദശി)', 'Chaturdashi (ചതുർദ്ദശി)', 'Amavasya (അമാവാസി)'
];

export function calculateBhoomiPujaMuhurthams(
  ownerStarId: number,
  monthsAhead: number = 6
): BhoomiPujaDate[] {
  const results: BhoomiPujaDate[] = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 2); // Start looking from day after tomorrow

  const totalDays = monthsAhead * 30;

  for (let d = 0; d < totalDays; d++) {
    const checkDate = new Date(startDate);
    checkDate.setDate(startDate.getDate() + d);

    const weekdayNum = checkDate.getDay();
    // Tuesday and Sunday are generally avoided for initial ground digging
    if (weekdayNum === 0 || weekdayNum === 2) continue;

    // Calculate real Sidereal Moon & Sun positions
    const moonLon = getPlanetSiderealLongitude(Astronomy.Body.Moon, checkDate);
    const sunLon = getPlanetSiderealLongitude(Astronomy.Body.Sun, checkDate);

    // Calculate Nakshatra
    const starIndex = Math.floor(moonLon / (360 / 27));
    const starId = starIndex + 1;
    const starObj = NAKSHATRAS[starIndex];

    if (!AUSPICIOUS_BHOOMI_STARS.includes(starId)) continue;

    // Calculate Tithi (1 to 30)
    let tithiDiff = moonLon - sunLon;
    if (tithiDiff < 0) tithiDiff += 360;
    const tithiNum = Math.floor(tithiDiff / 12) + 1;

    if (INAUSPICIOUS_TITHIS.includes(tithiNum)) continue;

    // Calculate Tarabalam from Owner's Star
    const starDiff = ((starId - ownerStarId + 27) % 27) + 1;
    const taraNumber = ((starDiff - 1) % 9) + 1;

    // Reject inauspicious Tarabalam: Janma (1), Vipat (3), Pratyak (5), Naidhana/Vadha (7)
    if ([1, 3, 5, 7].includes(taraNumber)) continue;

    // Solar month (Kollam Era / Rasi)
    const sunRasiIndex = Math.floor(sunLon / 30);
    const solarMonthObj = RASIS[sunRasiIndex];

    // Vastu Purusha awakening solar months (Edavam, Chingam, Kanni, Vrischikam, Kumbham, Medam)
    // 0: Medam, 1: Edavam, 4: Chingam, 5: Kanni, 7: Vrischikam, 10: Kumbham
    const isVastuAwakenedMonth = [0, 1, 4, 5, 7, 10].includes(sunRasiIndex);

    let baseScore = 75;
    if (isVastuAwakenedMonth) baseScore += 15;
    if ([2, 4, 6, 8, 9].includes(taraNumber)) baseScore += 5;
    if (weekdayNum === 4 || weekdayNum === 5) baseScore += 5; // Thursday / Friday

    const score = Math.min(96, baseScore);
    const quality = score >= 85 ? 'Excellent' : 'Good';
    const qualityMalayalam = quality === 'Excellent' ? 'അതിവിശിഷ്ടം' : 'ഉത്തമം';

    const taraNamesEn = ['', 'Janma', 'Sampat (Wealth)', 'Vipat', 'Kshema (Well-being)', 'Pratyak', 'Sadhaka (Success)', 'Naidhana', 'Mitra (Friendly)', 'Parama Mitra (Supreme)'];
    const taraNamesMl = ['', 'ജന്മ', 'സമ്പത്ത്', 'വിപത്ത്', 'ക്ഷേമം', 'പ്രത്യക്ക്', 'സാധകം', 'നിധനം', 'മിത്രം', 'പരമമിത്രം'];

    // Traditional Vastu Foundation ritual instructions
    const vastuDirections = [
      { en: 'North-East (Ishana Kon)', ml: 'വടക്കുകിഴക്ക് (ഈശാന കോൺ)' },
      { en: 'East (Kizhakku)', ml: 'കിഴക്ക് ദിശ' },
      { en: 'North (Vadakku)', ml: 'വടക്ക് ദിശ' }
    ];
    const vastuDir = vastuDirections[d % vastuDirections.length];

    results.push({
      date: checkDate,
      dateFormatted: checkDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }),
      weekday: WEEKDAY_NAMES_EN[weekdayNum],
      weekdayMalayalam: MALAYALAM_WEEKDAYS[weekdayNum],
      solarMonth: solarMonthObj.name,
      solarMonthMalayalam: solarMonthObj.malayalamName || solarMonthObj.name,
      star: starObj.name,
      starMalayalam: starObj.malayalamName,
      tithi: TITHI_NAMES[tithiNum - 1] || `Tithi ${tithiNum}`,
      tithiMalayalam: TITHI_NAMES[tithiNum - 1] || `തിഥി ${tithiNum}`,
      tarabalam: taraNamesEn[taraNumber] || 'Favorable',
      tarabalamMalayalam: taraNamesMl[taraNumber] || 'അനുകൂലം',
      quality,
      qualityMalayalam,
      score,
      muhurthamTimeWindow: '07:15 AM - 09:30 AM (Morning Shubha Vela)',
      shubhaLagna: `${solarMonthObj.name} / Rishabha Lagna`,
      vastuDirection: vastuDir.en,
      vastuDirectionMalayalam: vastuDir.ml,
      foundationRituals: 'Begin initial excavation at the North-East (Ishana) corner. Place fresh holy water, Navadhanya (nine grains), and clean Panchaloha coins before laying the foundational first stone.',
      foundationRitualsMalayalam: 'വടക്കുകിഴക്ക് (ഈശാന കോണിൽ) ആദ്യ തൂമ്പു കുത്തുക. ഗണപതി ഹോമ തീർത്ഥവും നവധാന്യങ്ങളും നാണയങ്ങളും സമർപ്പിച്ച് ശുഭമുഹൂർത്തത്തിൽ ആദ്യ കല്ല് (ശിലാസ്ഥാപനം) സ്ഥാപിക്കുക.'
    });

    if (results.length >= 10) break; // Maximum 10 prime verified dates
  }

  return results;
}
