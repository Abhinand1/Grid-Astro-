import * as Astronomy from 'astronomy-engine';
import { NAKSHATRAS, RASIS } from './astroData';
import { getPlanetSiderealLongitude } from './astronomy';

export type SamskaraType = 'vidyarambha' | 'annaprashana';

export interface SamskaraMuhurthamDate {
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
  ceremonyTimeWindow: string;
  ritualStepsEn: string;
  ritualStepsMl: string;
}

const VIDYARAMBHA_STARS = [1, 4, 5, 7, 8, 13, 14, 15, 17, 22, 27]; // Ashwini, Rohini, Mrigashira, Punarvasu, Pushya, Hasta, Chitra, Swati, Anuradha, Shravana, Revati
const ANNAPRASHANA_STARS = [1, 4, 5, 7, 8, 12, 13, 14, 15, 17, 21, 22, 23, 24, 26, 27];

const INAUSPICIOUS_TITHIS = [4, 9, 14, 19, 24, 29, 30]; // Riktha tithis + Amavasya

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

export function calculateSamskaraMuhurthams(
  samskara: SamskaraType,
  childStarId: number,
  monthsAhead: number = 6
): SamskaraMuhurthamDate[] {
  const results: SamskaraMuhurthamDate[] = [];
  const targetStars = samskara === 'vidyarambha' ? VIDYARAMBHA_STARS : ANNAPRASHANA_STARS;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 3);

  const totalDays = monthsAhead * 30;

  for (let d = 0; d < totalDays; d++) {
    const checkDate = new Date(startDate);
    checkDate.setDate(startDate.getDate() + d);

    const weekdayNum = checkDate.getDay();

    if (samskara === 'vidyarambha') {
      // Best weekdays for learning: Wednesday (Budha), Thursday (Guru), Friday (Shukra), Sunday
      if (![0, 3, 4, 5].includes(weekdayNum)) continue;
    } else {
      // Annaprashana: Monday, Wednesday, Thursday, Friday
      if (![1, 3, 4, 5].includes(weekdayNum)) continue;
    }

    // Planetary positions
    const moonLon = getPlanetSiderealLongitude(Astronomy.Body.Moon, checkDate);
    const sunLon = getPlanetSiderealLongitude(Astronomy.Body.Sun, checkDate);

    const starIndex = Math.floor(moonLon / (360 / 27));
    const starId = starIndex + 1;
    const starObj = NAKSHATRAS[starIndex];

    if (!targetStars.includes(starId)) continue;

    // Tithi calculation
    let tithiDiff = moonLon - sunLon;
    if (tithiDiff < 0) tithiDiff += 360;
    const tithiNum = Math.floor(tithiDiff / 12) + 1;

    if (INAUSPICIOUS_TITHIS.includes(tithiNum)) continue;

    // Tarabalam from child's birth star
    const starDiff = ((starId - childStarId + 27) % 27) + 1;
    const taraNumber = ((starDiff - 1) % 9) + 1;

    // Reject inauspicious Tarabalam: Janma (1), Vipat (3), Pratyak (5), Naidhana (7)
    if ([1, 3, 5, 7].includes(taraNumber)) continue;

    let baseScore = 78;
    if (samskara === 'vidyarambha' && (weekdayNum === 3 || weekdayNum === 4)) baseScore += 12; // Mercury or Jupiter
    if (samskara === 'annaprashana' && (weekdayNum === 4 || weekdayNum === 1)) baseScore += 10;
    if ([2, 4, 6, 8, 9].includes(taraNumber)) baseScore += 6;

    const score = Math.min(97, baseScore);
    const quality = score >= 88 ? 'Excellent' : 'Good';
    const qualityMalayalam = quality === 'Excellent' ? 'അതിവിശിഷ്ടം' : 'ഉത്തമം';

    const taraNamesEn = ['', 'Janma', 'Sampat (Prosperity)', 'Vipat', 'Kshema (Safety)', 'Pratyak', 'Sadhaka (Accomplishment)', 'Naidhana', 'Mitra (Friendly)', 'Parama Mitra (Supreme)'];
    const taraNamesMl = ['', 'ജന്മ', 'സമ്പത്ത്', 'വിപത്ത്', 'ക്ഷേമം', 'പ്രത്യക്ക്', 'സാധകം', 'നിധനം', 'മിത്രം', 'പരമമിത്രം'];

    let ritualStepsEn = '';
    let ritualStepsMl = '';

    if (samskara === 'vidyarambha') {
      ritualStepsEn = 'Seat the child facing East. Write "Hari Sri Ganapataye Namah" on the child’s tongue with a gold ring dipped in honey, then guide the child’s index finger to trace the sacred mantra on a plate of raw rice (ari). Offer prayers to Goddess Saraswati and Lord Ganesha.';
      ritualStepsMl = 'കുട്ടിയെ കിഴക്കോട്ട് ഇരുത്തുക. സ്വർണ്ണമോതിരം തേനിൽ മുക്കി നാവിൽ "ഹരിഃ ശ്രീ ഗണപതയേ നമഃ" എന്ന് എഴുതുക. പിന്നീട് ഉണക്കലരിയിൽ ചൂണ്ടുവിരൽ പിടിച്ച് അക്ഷരങ്ങൾ എഴുതിക്കുക. സരസ്വതീ ദേവിക്കും ഗണപതിക്കും ദക്ഷിണ സമർപ്പിക്കുക.';
    } else {
      ritualStepsEn = 'Begin during morning hours after temple darshan. Feed the child the first spoonful of sweet milk kheer (payasam) or sanctified rice prasadam using a silver or gold spoon, invoking the blessings of Lord Guruvayurappan / Mahavishnu.';
      ritualStepsMl = 'ക്ഷേത്ര ദർശനത്തിന് ശേഷം ശുഭ മുഹൂർത്തത്തിൽ സ്വർണ്ണമോ വെള്ളി സ്പൂണോ കൊണ്ട് നെയ്പായസവും ചോറും കുട്ടിയുടെ നാവിൽ തൊടീക്കുക. ഗുരുവായൂരപ്പന്റെയോ ഇഷ്ടദേവന്റെയോ പ്രസാദം ആദ്യമായി നൽകി ദീർഘായുസ്സിനായി പ്രാർത്ഥിക്കുക.';
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
      ceremonyTimeWindow: '08:00 AM - 10:30 AM (Morning Shubha Vela)',
      ritualStepsEn,
      ritualStepsMl
    });

    if (results.length >= 10) break;
  }

  return results;
}
