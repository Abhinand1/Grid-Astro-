import * as Astronomy from 'astronomy-engine';
import { NAKSHATRAS, RASIS } from './astroData';
import { getPlanetSiderealLongitude } from './astronomy';

export type BusinessCategory = 'retail' | 'tech_startup' | 'services' | 'manufacturing';

export interface VyaparMuhurthamDate {
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
  quality: 'Excellent' | 'Good';
  qualityMalayalam: string;
  score: number;
  launchWindow: string;
  favorableLagna: string;
  favorableLagnaMalayalam: string;
  openingRitualsEn: string;
  openingRitualsMl: string;
}

const BUSINESS_STARS = [1, 4, 5, 8, 13, 14, 15, 17, 21, 22, 27]; // Ashwini, Rohini, Mrigashira, Pushya, Hasta, Chitra, Swati, Anuradha, Uttara Ashadha, Shravana, Revati
const INAUSPICIOUS_TITHIS = [4, 9, 14, 19, 24, 29, 30]; // Riktha and Amavasya

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

export function calculateVyaparMuhurthams(
  founderStarId: number,
  category: BusinessCategory,
  monthsAhead: number = 6
): VyaparMuhurthamDate[] {
  const results: VyaparMuhurthamDate[] = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 2);

  const totalDays = monthsAhead * 30;

  for (let d = 0; d < totalDays; d++) {
    const checkDate = new Date(startDate);
    checkDate.setDate(startDate.getDate() + d);

    const weekdayNum = checkDate.getDay();

    // Prefer Wednesday (Mercury - trade), Thursday (Jupiter - expansion), Friday (Venus - wealth), Monday (Moon)
    if (![1, 3, 4, 5].includes(weekdayNum)) continue;

    const moonLon = getPlanetSiderealLongitude(Astronomy.Body.Moon, checkDate);
    const sunLon = getPlanetSiderealLongitude(Astronomy.Body.Sun, checkDate);

    const starIndex = Math.floor(moonLon / (360 / 27));
    const starId = starIndex + 1;
    const starObj = NAKSHATRAS[starIndex];

    if (!BUSINESS_STARS.includes(starId)) continue;

    let tithiDiff = moonLon - sunLon;
    if (tithiDiff < 0) tithiDiff += 360;
    const tithiNum = Math.floor(tithiDiff / 12) + 1;

    if (INAUSPICIOUS_TITHIS.includes(tithiNum)) continue;

    // Tarabalam from Founder's Nakshatra
    const starDiff = ((starId - founderStarId + 27) % 27) + 1;
    const taraNumber = ((starDiff - 1) % 9) + 1;

    // Reject inauspicious Tarabalam: Janma (1), Vipat (3), Pratyak (5), Naidhana (7)
    if ([1, 3, 5, 7].includes(taraNumber)) continue;

    let baseScore = 76;
    if (weekdayNum === 3) baseScore += 12; // Wednesday ruled by Mercury (Budha - Business Lord)
    if (weekdayNum === 4) baseScore += 10; // Thursday ruled by Jupiter
    if (weekdayNum === 5) baseScore += 8;  // Friday ruled by Venus
    if ([2, 4, 6, 8, 9].includes(taraNumber)) baseScore += 6;

    const score = Math.min(98, baseScore);
    const quality = score >= 88 ? 'Excellent' : 'Good';
    const qualityMalayalam = quality === 'Excellent' ? 'അതിവിശിഷ്ടം' : 'ഉത്തമം';

    const taraNamesEn = ['', 'Janma', 'Sampat (Profit & Wealth)', 'Vipat', 'Kshema (Stability)', 'Pratyak', 'Sadhaka (Achievement)', 'Naidhana', 'Mitra (Growth)', 'Parama Mitra (Supreme)'] ;
    const taraNamesMl = ['', 'ജന്മ', 'സമ്പത്ത് (ലാഭകരം)', 'വിപത്ത്', 'ക്ഷേമം (സ്ഥിരത)', 'പ്രത്യക്ക്', 'സാധകം (വിജയം)', 'നിധനം', 'മിത്രം', 'പരമമിത്രം'];

    let lagnaEn = 'Vrishabha (Taurus) / Simha (Leo) Fixed Lagna';
    let lagnaMl = 'ഇടവം / ചിങ്ങം സ്ഥിര ലഗ്നം';

    let ritualEn = 'Perform a Ganapati Puja and light the traditional Nilavilakku (lamp) facing East. Receive the first commercial sale or sign the master client contract during this window to anchor lasting financial abundance.';
    let ritualMl = 'കിഴക്കോട്ട് ദർശനമായി നിലവിളക്ക് കൊളുത്തി ഗണപതി ഹോമ പ്രസാദം വെയ്ക്കുക. ഈ മുഹൂർത്തത്തിൽ ആദ്യ വിൽപനയോ കരാർ ഒപ്പിടലോ നിർവ്വഹിക്കുന്നത് വ്യാപാര അഭിവൃദ്ധിക്ക് കാരണമാകും.';

    if (category === 'tech_startup') {
      ritualEn = 'Execute product deployment or publicly publish domain/app during this window. Dedicate the venture with prayers to Lord Ganesha and Goddess Saraswati for innovative scaling.';
      ritualMl = 'ഈ ശുഭ മുഹൂർത്തത്തിൽ കമ്പനി വെബ്‌സൈറ്റ് ലൈവാക്കുകയോ ഉൽപ്പന്നം ലോഞ്ച് ചെയ്യുകയോ ചെയ്യുക. ഗണപതി പൂജ നടത്തി ബിസിനസ്സ് വിപുലീകരണത്തിനായി പ്രാർത്ഥിക്കുക.';
    }

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
      star: starObj.name,
      starMalayalam: starObj.malayalamName,
      tithi: TITHI_NAMES[tithiNum - 1] || `Tithi ${tithiNum}`,
      tithiMalayalam: TITHI_NAMES[tithiNum - 1] || `തിഥി ${tithiNum}`,
      tarabalam: taraNamesEn[taraNumber] || 'Favorable',
      tarabalamMalayalam: taraNamesMl[taraNumber] || 'അനുകൂലം',
      quality,
      qualityMalayalam,
      score,
      launchWindow: '09:15 AM - 11:30 AM (Abhijit & Shubha Hora)',
      favorableLagna: lagnaEn,
      favorableLagnaMalayalam: lagnaMl,
      openingRitualsEn: ritualEn,
      openingRitualsMl: ritualMl
    });

    if (results.length >= 10) break;
  }

  return results;
}
