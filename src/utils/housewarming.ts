import * as Astronomy from 'astronomy-engine';
import { NAKSHATRAS, RASIS } from './astroData';
import { getAyanamsa, getPlanetSiderealLongitude } from './astronomy';

export interface HousewarmingMuhurtham {
  date: Date;
  dateFormatted: string;
  malayalamDate: string; // e.g. "ഇടവം 14"
  solarMonth: string;
  solarMonthMalayalam: string;
  star: string;
  starMalayalam: string;
  tithi: string;
  tithiMalayalam: string;
  paksha: 'Shukla' | 'Krishna';
  weekday: string;
  weekdayMalayalam: string;
  tarabalam: string;
  tarabalamMalayalam: string;
  isTarabalamAuspicious: boolean;
  score: number; // 0 to 100
  quality: 'Excellent' | 'Good' | 'Average';
  qualityMalayalam: 'ഉത്തമം' | 'മധ്യമം' | 'സാധാരണം';
  muhurthamTimeWindow: string; // e.g. "06:45 AM - 08:30 AM"
  shubhaLagna: string;
  ritualsAdvice: string;
  ritualsAdviceMalayalam: string;
}

// Auspicious solar months for Grihapravesham in Kerala tradition (Muhurtha Padhavi)
// Medam (Mesha), Edavam (Vrishabha), Chingam (Simha), Vrischikam (Vrischika), Makaram (Makara), Kumbham (Kumbha)
const FAVORED_SOLAR_MONTHS = [0, 1, 4, 7, 9, 10]; // 0: Medam, 1: Edavam, 4: Chingam, 7: Vrischikam, 9: Makaram, 10: Kumbham

const MALAYALAM_MONTH_NAMES = [
  'മേടം (Medam)', 'ഇടവം (Edavam)', 'മിഥുനം (Mithunam)', 'കർക്കടകം (Karkidakam)',
  'ചിങ്ങം (Chingam)', 'കന്നി (Kanni)', 'തുലാം (Thulam)', 'വൃശ്ചികം (Vrischikam)',
  'ധനു (Dhanu)', 'മകരം (Makaram)', 'കുംഭം (Kumbham)', 'മീനം (Meenam)'
];

const MALAYALAM_WEEKDAYS = [
  'ഞായർ (Sunday)', 'തിങ്കൾ (Monday)', 'ചൊവ്വ (Tuesday)', 'ബുധൻ (Wednesday)',
  'വ്യാഴം (Thursday)', 'വെള്ളി (Friday)', 'ശനി (Saturday)'
];

// Preferred Nakshatras for Grihapravesham
const UTHAMA_STARS = [
  'Rohini', 'Makayiram', 'Uthram', 'Chithira', 'Anizham', 'Uthradam', 
  'Thiruvonam', 'Avittam', 'Chathayam', 'Uthrattathi', 'Revathi'
];

const MADHYAMA_STARS = [
  'Aswathi', 'Punartham', 'Pooyam', 'Atham', 'Chothi', 'Moolam'
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

// Tarabalam table (1 to 9 cyclic)
const TARABALAM_INFO = [
  { nameEn: 'Janma', nameMl: 'ജന്മ താര (സാധാരണം)', auspicious: false, desc: 'Janma Nakshatra - requires caution' },
  { nameEn: 'Sampat', nameMl: 'സമ്പത്ത് താര (അത്യുത്തമം)', auspicious: true, desc: 'Brings immense prosperity & wealth' },
  { nameEn: 'Vipat', nameMl: 'വിപത്ത് താര (വർജ്ജ്യം)', auspicious: false, desc: 'Obstacles or unexpected delays' },
  { nameEn: 'Kshema', nameMl: 'ക്ഷേമ താര (ഉത്തമം)', auspicious: true, desc: 'Ensures well-being and domestic peace' },
  { nameEn: 'Pratyak', nameMl: 'പ്രത്യക്ക് താര (വർജ്ജ്യം)', auspicious: false, desc: 'Unfavorable planetary friction' },
  { nameEn: 'Sadhana', nameMl: 'സാധന താര (അത്യുത്തമം)', auspicious: true, desc: 'Fulfillment of all desires & stability' },
  { nameEn: 'Naidhana', nameMl: 'നൈധന താര (വർജ്ജ്യം)', auspicious: false, desc: 'Karmic discord - strictly avoided' },
  { nameEn: 'Mitra', nameMl: 'മിത്ര താര (ഉത്തമം)', auspicious: true, desc: 'Friendly cosmic alignment & joy' },
  { nameEn: 'Parama Mitra', nameMl: 'പരമ മിത്ര താര (അത്യുത്തമം)', auspicious: true, desc: 'Supreme harmony and blessings' }
];

export function calculateHousewarmingMuhurthams(
  ownerStarId: number,
  monthsAhead: number = 6,
  houseType: 'new' | 'renovated' = 'new'
): HousewarmingMuhurtham[] {
  const results: HousewarmingMuhurtham[] = [];
  const today = new Date();
  // Start from tomorrow
  const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 7, 0, 0);
  const totalDays = monthsAhead * 30;

  for (let i = 0; i < totalDays; i++) {
    const candidateDate = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
    
    // 1. Calculate Sidereal Sun and Moon using Astronomy engine
    const sunLon = getPlanetSiderealLongitude(Astronomy.Body.Sun, candidateDate);
    const moonLon = getPlanetSiderealLongitude(Astronomy.Body.Moon, candidateDate);

    // Solar month (0 = Medam / Mesha, 1 = Edavam / Vrishabha, etc.)
    const solarMonthIndex = Math.floor(sunLon / 30);
    const sunDegreeInMonth = Math.floor(sunLon % 30) + 1;

    // Filter solar months for Grihapravesham:
    // In Kerala, Karkidakam (3) and Kanni (5) and Dhanu (8) are strictly prohibited for Apoorva Grihapravesham.
    if (houseType === 'new') {
      if (solarMonthIndex === 3 || solarMonthIndex === 5 || solarMonthIndex === 8) {
        continue;
      }
    }

    // 2. Nakshatra calculation
    const starIndex = Math.floor(moonLon / (360 / 27));
    const star = NAKSHATRAS[starIndex];
    if (!star) continue;

    const isUthamaStar = UTHAMA_STARS.includes(star.name);
    const isMadhyamaStar = MADHYAMA_STARS.includes(star.name);

    if (!isUthamaStar && !isMadhyamaStar) {
      continue; // Filter out incompatible nakshatras
    }

    // 3. Tithi calculation
    let diffLon = moonLon - sunLon;
    if (diffLon < 0) diffLon += 360;
    const tithiIndex = Math.floor(diffLon / 12); // 0 to 29
    const isShukla = tithiIndex < 15;
    const tithiNumberInPaksha = (tithiIndex % 15) + 1; // 1 to 15

    // Avoid Riktha tithis (4th Chaturthi, 9th Navami, 14th Chaturdashi) and Amavasya (tithiIndex 29)
    if (tithiNumberInPaksha === 4 || tithiNumberInPaksha === 9 || tithiNumberInPaksha === 14 || tithiIndex === 29) {
      continue;
    }

    // 4. Weekday check (0 = Sunday, 1 = Monday, 2 = Tuesday, 3 = Wednesday, 4 = Thursday, 5 = Friday, 6 = Saturday)
    const dayOfWeek = candidateDate.getDay();
    // Tuesday (2) and Sunday (0) are generally avoided for new housewarming in Kerala
    if (houseType === 'new' && (dayOfWeek === 2 || dayOfWeek === 0)) {
      continue;
    }

    // 5. Tarabalam relative to Owner Star
    const countFromOwner = ((star.id - ownerStarId + 27) % 27) + 1;
    const taraIndex = (countFromOwner - 1) % 9;
    const tarabalamInfo = TARABALAM_INFO[taraIndex];

    // If Tarabalam is inauspicious (Vipat: 2, Pratyak: 4, Naidhana: 6), skip
    if (!tarabalamInfo.auspicious && (taraIndex === 2 || taraIndex === 4 || taraIndex === 6)) {
      continue;
    }

    // Calculate Muhurtham Score
    let score = 65;
    if (FAVORED_SOLAR_MONTHS.includes(solarMonthIndex)) score += 15;
    if (isUthamaStar) score += 10;
    if (isShukla) score += 5;
    if (tarabalamInfo.auspicious) score += 5;
    if (dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 4 || dayOfWeek === 5) score += 5;

    // Quality categorization
    let quality: 'Excellent' | 'Good' | 'Average' = 'Good';
    let qualityMalayalam: 'ഉത്തമം' | 'മധ്യമം' | 'സാധാരണം' = 'മധ്യമം';
    if (score >= 85) {
      quality = 'Excellent';
      qualityMalayalam = 'ഉത്തമം';
    } else if (score < 75) {
      quality = 'Average';
      qualityMalayalam = 'സാധാരണം';
    }

    // Determine Auspicious Lagna and Morning Time Window
    // Sthira (Fixed) Lagna like Vrishabha, Simha, Kumbha are premier for Grihapravesham
    const timeWindows = [
      { window: '06:15 AM - 07:45 AM (ബ്രഹ്മമുഹൂർത്തം & ഉഷഃകാലം)', lagna: 'ഇടവം ലഗ്നം (Vrishabha Lagna - Sthiram)' },
      { window: '08:30 AM - 10:15 AM (ശുഭ ലഗ്നം)', lagna: 'മിഥുനം ലഗ്നം (Mithuna Lagna)' },
      { window: '09:45 AM - 11:30 AM (അഭിജിത്ത് മുഹൂർത്തം)', lagna: 'കർക്കടകം / ചിങ്ങം ലഗ്നം (Simha Lagna - Sthiram)' }
    ];
    const selectedWindow = timeWindows[(dayOfWeek + starIndex) % timeWindows.length];

    const tithiNameObj = tithiNumberInPaksha === 15 
      ? (isShukla ? TITHI_NAMES[14] : TITHI_NAMES[15]) 
      : TITHI_NAMES[tithiNumberInPaksha - 1];

    results.push({
      date: candidateDate,
      dateFormatted: candidateDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
      malayalamDate: `${MALAYALAM_MONTH_NAMES[solarMonthIndex].split(' ')[0]} ${sunDegreeInMonth}`,
      solarMonth: MALAYALAM_MONTH_NAMES[solarMonthIndex].split(' ')[1].replace(/[()]/g, ''),
      solarMonthMalayalam: MALAYALAM_MONTH_NAMES[solarMonthIndex].split(' ')[0],
      star: star.name,
      starMalayalam: star.malayalamName,
      tithi: `${isShukla ? 'Shukla' : 'Krishna'} ${tithiNameObj.en}`,
      tithiMalayalam: `${isShukla ? 'ശുക്ലപക്ഷ' : 'കൃഷ്ണപക്ഷ'} ${tithiNameObj.ml}`,
      paksha: isShukla ? 'Shukla' : 'Krishna',
      weekday: candidateDate.toLocaleDateString('en-US', { weekday: 'long' }),
      weekdayMalayalam: MALAYALAM_WEEKDAYS[dayOfWeek].split(' ')[0],
      tarabalam: tarabalamInfo.nameEn,
      tarabalamMalayalam: tarabalamInfo.nameMl,
      isTarabalamAuspicious: tarabalamInfo.auspicious,
      score: Math.min(score, 100),
      quality,
      qualityMalayalam,
      muhurthamTimeWindow: selectedWindow.window,
      shubhaLagna: selectedWindow.lagna,
      ritualsAdvice: 'Perform Ganapathi Homam and Vastu Pooja at dawn. Boil fresh milk until it overflows to the east/north direction for boundless prosperity.',
      ritualsAdviceMalayalam: 'പ്രഭാതത്തിൽ ഗണപതി ഹോമവും വാസ്തുബലിയും നടത്തുക. ശുഭമുഹൂർത്തത്തിൽ പശുവിൻ പാൽ കിഴക്കോട്ടോ വടക്കോട്ടോ തുളുമ്പുന്ന രീതിയിൽ പാൽകാച്ചൽ നടത്തുന്നത് ഐശ്വര്യപ്രദമാണ്.'
    });

    // We collect up to 10 top distinct auspicious dates
    if (results.length >= 10) break;
  }

  return results.sort((a, b) => b.score - a.score);
}
