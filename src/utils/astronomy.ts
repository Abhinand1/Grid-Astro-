import * as Astronomy from 'astronomy-engine';
import { NAKSHATRAS, RASIS } from './astroData';

export function getAyanamsa(date: Date): number {
  // Precise Lahiri (Chitra Paksha) Ayanamsa calculation
  const j2000 = new Date(Date.UTC(2000, 0, 1, 12, 0, 0));
  const daysSinceJ2000 = (date.getTime() - j2000.getTime()) / (1000 * 60 * 60 * 24);
  const yearsSinceJ2000 = daysSinceJ2000 / 365.25;
  
  // Base Lahiri Ayanamsa at J2000.0 is 23° 51' 11" = 23.8530555
  const baseAyanamsa = 23.8530555;
  // Precession rate is approx 50.290966 arcseconds per year
  const precessionRate = 50.290966 / 3600;
  
  return baseAyanamsa + (yearsSinceJ2000 * precessionRate);
}

export function getPlanetSiderealLongitude(planet: Astronomy.Body | 'Rahu' | 'Ketu', date: Date = new Date()): number {
  const time = Astronomy.MakeTime(date);
  const ayanamsa = getAyanamsa(date);
  let tropicalLon = 0;

  if (planet === 'Rahu' || planet === 'Ketu') {
    const T = time.ut / 36525;
    let omega = (125.04452 - 1934.136261 * T) % 360;
    if (omega < 0) omega += 360;
    
    tropicalLon = planet === 'Rahu' ? omega : (omega + 180) % 360;
  } else if (planet === Astronomy.Body.Moon) {
    const ecliptic = Astronomy.EclipticGeoMoon(time);
    tropicalLon = ecliptic.lon;
  } else {
    const vec = Astronomy.GeoVector(planet, time, true);
    const ecl = Astronomy.Ecliptic(vec);
    tropicalLon = ecl.elon;
  }

  let siderealLon = tropicalLon - ayanamsa;
  if (siderealLon < 0) siderealLon += 360;
  
  return siderealLon;
}

export function getSiderealMoonLongitude(date: Date = new Date()): number {
  return getPlanetSiderealLongitude(Astronomy.Body.Moon, date);
}

export function getCurrentNakshatraIndex(date: Date = new Date()): number {
  const lon = getSiderealMoonLongitude(date);
  // Each Nakshatra is 13 degrees 20 minutes = 13.333333 degrees
  const index = Math.floor(lon / (360 / 27));
  return index; // 0 to 26
}

export function getCurrentNakshatra(date: Date = new Date()) {
  const index = getCurrentNakshatraIndex(date);
  return NAKSHATRAS[index];
}

export function getCurrentRasiIndex(date: Date = new Date()): number {
  const lon = getSiderealMoonLongitude(date);
  // Each Rasi is 30 degrees
  const index = Math.floor(lon / 30);
  return index; // 0 to 11
}

export function getSiderealSunLongitude(date: Date = new Date()): number {
  return getPlanetSiderealLongitude(Astronomy.Body.Sun, date);
}

// Kerala Reference Observer (Central Kerala: Thrissur / Kochi ~10.0° N, 76.3° E)
export function getKeralaObserver(lat = 10.0, lon = 76.3, elevation = 10): Astronomy.Observer {
  return new Astronomy.Observer(lat, lon, elevation);
}

// Astronomical Sunrise and Sunset in Kerala for a given date
export function getKeralaSunTimes(targetDate: Date = new Date(), lat = 10.0, lon = 76.3) {
  const observer = getKeralaObserver(lat, lon);
  // IST offset is UTC + 5:30
  const istOffsetMs = 5.5 * 3600 * 1000;
  const istDate = new Date(targetDate.getTime() + istOffsetMs);
  const y = istDate.getUTCFullYear();
  const m = istDate.getUTCMonth();
  const d = istDate.getUTCDate();
  
  // Midnight IST in UTC
  const midnightUtc = new Date(Date.UTC(y, m, d, 0, 0, 0) - istOffsetMs);
  
  const sunrise = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, +1, Astronomy.MakeTime(midnightUtc), 1);
  const sunriseDate = sunrise ? sunrise.date : new Date(midnightUtc.getTime() + 6 * 3600 * 1000 + 13 * 60 * 1000);
  
  const sunset = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, -1, Astronomy.MakeTime(sunriseDate), 1);
  const sunsetDate = sunset ? sunset.date : new Date(midnightUtc.getTime() + 18 * 3600 * 1000 + 16 * 60 * 1000);
  
  return { sunriseDate, sunsetDate, midnightUtc };
}

// Format a UTC date into IST 12-hour format "hh:mm AM/PM"
export function formatISTTime(date: Date): string {
  const ist = new Date(date.getTime() + 5.5 * 3600 * 1000);
  let h = ist.getUTCHours();
  const m = ist.getUTCMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  const hh = h < 10 ? '0' + h : '' + h;
  const mm = m < 10 ? '0' + m : '' + m;
  return `${hh}:${mm} ${ampm}`;
}

// Binary search to find exact time when Moon passes into next nakshatra
export function findNakshatraTransition(sunriseDate: Date, startNakIndex: number): Date {
  let low = sunriseDate.getTime();
  let high = low + 32 * 3600 * 1000; // Search up to 32 hours ahead
  
  for (let i = 0; i < 22; i++) {
    const mid = (low + high) / 2;
    const lonMid = getSiderealMoonLongitude(new Date(mid));
    let diff = (lonMid - startNakIndex * (360 / 27) + 360) % 360;
    if (diff >= (360 / 27)) {
      high = mid;
    } else {
      low = mid;
    }
  }
  return new Date((low + high) / 2);
}

// Authentic Vedic Tithi calculation based on Sun-Moon angular elongation
export function getKeralaTithi(date: Date = new Date()) {
  const time = Astronomy.MakeTime(date);
  const moon = Astronomy.EclipticGeoMoon(time);
  const sunVec = Astronomy.GeoVector(Astronomy.Body.Sun, time, true);
  const sun = Astronomy.Ecliptic(sunVec);
  
  let diff = (moon.lon - sun.elon + 360) % 360;
  const tithiIndex = Math.floor(diff / 12); // 0 to 29
  const paksha: 'Shukla' | 'Krishna' = diff < 180 ? 'Shukla' : 'Krishna';
  const pakshaMalayalam = diff < 180 ? 'ശുക്ലപക്ഷം' : 'കൃഷ്ണപക്ഷം';
  
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
    { en: 'Pournami', ml: 'പൗർണ്ണമി' },
  ];
  
  let nameEn = '';
  let nameMl = '';
  if (tithiIndex === 14) {
    nameEn = 'Pournami (Full Moon)';
    nameMl = 'പൗർണ്ണമി (വെളുത്തവാവ്)';
  } else if (tithiIndex === 29) {
    nameEn = 'Amavasya (New Moon)';
    nameMl = 'അമാവാസി (കറുത്തവാവ്)';
  } else {
    const subIdx = tithiIndex % 15;
    nameEn = `${paksha} ${TITHI_NAMES[subIdx].en}`;
    nameMl = `${pakshaMalayalam} ${TITHI_NAMES[subIdx].ml}`;
  }
  
  return {
    index: tithiIndex,
    paksha,
    pakshaMalayalam,
    nameEn,
    nameMl,
    diffDegrees: diff
  };
}

export const MALAYALAM_MONTHS = [
  { id: 1, en: 'Medam', ml: 'മേടം' },
  { id: 2, en: 'Edavam', ml: 'ഇടവം' },
  { id: 3, en: 'Mithunam', ml: 'മിഥുനം' },
  { id: 4, en: 'Karkidakam', ml: 'കർക്കടകം' },
  { id: 5, en: 'Chingam', ml: 'ചിങ്ങം' },
  { id: 6, en: 'Kanni', ml: 'കന്നി' },
  { id: 7, en: 'Thulam', ml: 'തുലാം' },
  { id: 8, en: 'Vrischikam', ml: 'വൃശ്ചികം' },
  { id: 9, en: 'Dhanu', ml: 'ധനു' },
  { id: 10, en: 'Makaram', ml: 'മകരം' },
  { id: 11, en: 'Kumbham', ml: 'കുംഭം' },
  { id: 12, en: 'Meenam', ml: 'മീനം' }
];

export function getKeralaMalayalamDate(date: Date = new Date()) {
  const sunLon = getSiderealSunLongitude(date);
  const monthIdx = Math.floor(sunLon / 30);
  const degInMonth = sunLon % 30;
  const day = Math.floor(degInMonth) + 1;
  const gregYear = date.getUTCFullYear();
  // Kollavarsham year advances at 1st of Chingam (mid-August)
  const kollavarshamYear = monthIdx >= 4 ? gregYear - 824 : gregYear - 825;
  
  return {
    month: MALAYALAM_MONTHS[monthIdx].en,
    monthMalayalam: MALAYALAM_MONTHS[monthIdx].ml,
    day,
    year: kollavarshamYear,
    formattedEn: `${day} ${MALAYALAM_MONTHS[monthIdx].en} ${kollavarshamYear} ME`,
    formattedMl: `കൊല്ലവർഷം ${kollavarshamYear} ${MALAYALAM_MONTHS[monthIdx].ml} ${day}`
  };
}

export interface KeralaDayPanchang {
  dayNakshatra: typeof NAKSHATRAS[0];
  dayNakshatraIndex: number;
  transitionTime: Date;
  transitionTimeFormatted: string;
  durationFromSunriseMins: number;
  nazhikaDuration: string;
  nazhikaValue: number;
  nextNakshatra: typeof NAKSHATRAS[0];
  currentNakshatra: typeof NAKSHATRAS[0];
  currentNakshatraIndex: number;
  isTransitioned: boolean;
  sunrise: Date;
  sunset: Date;
  sunriseFormatted: string;
  sunsetFormatted: string;
  tithi: ReturnType<typeof getKeralaTithi>;
  malayalamDate: ReturnType<typeof getKeralaMalayalamDate>;
  explanation: {
    ml: string;
    en: string;
  };
}

// Computes complete authentic Kerala Panchangam for the day
export function getKeralaDayPanchang(targetDate: Date = new Date(), lat = 10.0, lon = 76.3): KeralaDayPanchang {
  const { sunriseDate, sunsetDate } = getKeralaSunTimes(targetDate, lat, lon);
  
  // Day Star is determined at Sunrise (Udaya Nakshatra)
  const sunriseMoonLon = getSiderealMoonLongitude(sunriseDate);
  const dayNakIndex = Math.floor(sunriseMoonLon / (360 / 27));
  const dayNakshatra = NAKSHATRAS[dayNakIndex];
  
  // Transition to next Nakshatra
  const transitionTime = findNakshatraTransition(sunriseDate, dayNakIndex);
  const transitionTimeFormatted = formatISTTime(transitionTime);
  
  const durationFromSunriseMins = Math.max(0, Math.round((transitionTime.getTime() - sunriseDate.getTime()) / (1000 * 60)));
  const nazhikaVal = durationFromSunriseMins / 24;
  const nazhikaWhole = Math.floor(nazhikaVal);
  const vinazhika = Math.round((nazhikaVal - nazhikaWhole) * 60);
  
  // Format nazhika nicely, e.g. "6¾ നാഴിക" or "7 നാഴിക 4 വിനാഴിക"
  let nazhikaDuration = `${nazhikaWhole} നാഴിക ${vinazhika} വിനാഴിക`;
  if (Math.abs(nazhikaVal - 6.75) < 0.2) {
    nazhikaDuration = `6¾ നാഴിക (${nazhikaWhole} നാഴിക ${vinazhika} വിനാഴിക)`;
  }
  
  const nextNakIndex = (dayNakIndex + 1) % 27;
  const nextNakshatra = NAKSHATRAS[nextNakIndex];
  
  // Current instantaneous Nakshatra
  const currentNakIndex = getCurrentNakshatraIndex(targetDate);
  const currentNakshatra = NAKSHATRAS[currentNakIndex];
  const isTransitioned = targetDate.getTime() >= transitionTime.getTime();
  
  const tithi = getKeralaTithi(targetDate);
  const malayalamDate = getKeralaMalayalamDate(targetDate);
  
  return {
    dayNakshatra,
    dayNakshatraIndex: dayNakIndex,
    transitionTime,
    transitionTimeFormatted,
    durationFromSunriseMins,
    nazhikaDuration,
    nazhikaValue: nazhikaVal,
    nextNakshatra,
    currentNakshatra,
    currentNakshatraIndex: currentNakIndex,
    isTransitioned,
    sunrise: sunriseDate,
    sunset: sunsetDate,
    sunriseFormatted: formatISTTime(sunriseDate),
    sunsetFormatted: formatISTTime(sunsetDate),
    tithi,
    malayalamDate,
    explanation: {
      ml: `കേരള ജ്യോതിഷ സമ്പ്രദായപ്രകാരം ദിവസ നാൾ (ദിവസ നക്ഷത്രം) നിർണ്ണയിക്കുന്നത് അന്നത്തെ പ്രാദേശിക സൂര്യോദയ സമയത്തെ (ഉദയനക്ഷത്രം) അടിസ്ഥാനമാക്കിയാണ്. ഇന്ന് സൂര്യോദയത്തിൽ ${dayNakshatra.malayalamName} നക്ഷത്രമായിരുന്നു (${transitionTimeFormatted} വരെ / ${nazhikaDuration}). അതിനുശേഷമാണ് ${nextNakshatra.malayalamName} നക്ഷത്രം ആരംഭിച്ചത്. ഇതുകൊണ്ടാണ് പരമ്പരാഗത മലയാള കലണ്ടറുകളിൽ (മാതൃഭൂമി, മനോരമ മുതലായവ) ഇന്നത്തെ ദിവസ നക്ഷത്രമായി '${dayNakshatra.malayalamName}' എന്ന് രേഖപ്പെടുത്തുന്നത്.`,
      en: `In authentic Kerala Jyothisham, the Star of the Day (ദിവസ നാൾ) is determined by the Udaya Nakshatra prevailing at local sunrise. Today at sunrise, ${dayNakshatra.name} prevailed until ${transitionTimeFormatted} IST (${nazhikaVal.toFixed(1)} Nazhika), after which ${nextNakshatra.name} began. This is why traditional Malayalam calendars record today's star as ${dayNakshatra.name}.`
    }
  };
}

// Returns the authentic Kerala Day Star (Udaya Nakshatra)
export function getDayNakshatra(date: Date = new Date()) {
  const panchang = getKeralaDayPanchang(date);
  return panchang.dayNakshatra;
}

export function calculateDailyHoroscope(janmaStarId: number, date: Date = new Date()) {
  const janmaStar = NAKSHATRAS.find(n => n.id === janmaStarId);
  if (!janmaStar) throw new Error("Invalid Janma Star");

  const janmaRasiIndex = RASIS.findIndex(r => r.name === janmaStar.defaultRashi);
  const currentRasiIndex = getCurrentRasiIndex(date);

  let transitHouse = currentRasiIndex - janmaRasiIndex + 1;
  if (transitHouse <= 0) transitHouse += 12;

  let status = 'Average';
  let statusMalayalam = 'സാധാരണം';
  let prediction = '';
  let predictionMalayalam = '';
  let luckyColor = 'White';
  let luckyColorMalayalam = 'വെള്ള';
  let luckyNumber = 7;
  let remedy = 'Pray to Lord Ganesha.';
  let remedyMalayalam = 'ഗണപതി ഭഗവാനെ പ്രാർത്ഥിക്കുക.';

  switch (transitHouse) {
    case 1:
      status = 'Excellent';
      statusMalayalam = 'അതിവിശിഷ്ടം';
      prediction = 'Excellent day. You will experience happiness, good food, and overall well-being. A good time for new beginnings and social gatherings. Your confidence will be high, and you will receive respect from others.';
      predictionMalayalam = 'വളരെ നല്ല ദിവസം. സന്തോഷവും നല്ല ഭക്ഷണവും ലഭിക്കും. പുതിയ കാര്യങ്ങൾ തുടങ്ങാൻ ഉത്തമം. സാമൂഹികമായി അംഗീകാരം ലഭിക്കും. ആത്മവിശ്വാസം വർദ്ധിക്കുകയും മറ്റുള്ളവരിൽ നിന്ന് ബഹുമാനം ലഭിക്കുകയും ചെയ്യും.';
      luckyColor = 'Yellow';
      luckyColorMalayalam = 'മഞ്ഞ';
      luckyNumber = 3;
      remedy = 'Light a lamp in the morning.';
      remedyMalayalam = 'രാവിലെ നിലവിളക്ക് കൊളുത്തുക.';
      break;
    case 2:
      status = 'Bad';
      statusMalayalam = 'മോശം';
      prediction = 'Be careful with finances. Potential for minor losses or obstacles in your undertakings. Avoid arguments with family members. Watch your words as they might cause misunderstandings.';
      predictionMalayalam = 'സാമ്പത്തിക കാര്യങ്ങളിൽ ശ്രദ്ധിക്കുക. ചെറിയ നഷ്ടങ്ങൾക്കോ തടസ്സങ്ങൾക്കോ സാധ്യത. കുടുംബാംഗങ്ങളുമായി തർക്കങ്ങൾ ഒഴിവാക്കുക. സംസാരത്തിൽ മിതത്വം പാലിക്കുക, അല്ലെങ്കിൽ തെറ്റിദ്ധാരണകൾക്ക് ഇടയാക്കും.';
      luckyColor = 'Blue';
      luckyColorMalayalam = 'നീല';
      luckyNumber = 8;
      remedy = 'Donate some food to the needy.';
      remedyMalayalam = 'അശരണർക്ക് ഭക്ഷണം നൽകുക.';
      break;
    case 3:
      status = 'Good';
      statusMalayalam = 'നല്ലത്';
      prediction = 'Success in your efforts. You will feel courageous and may receive good news from siblings or close friends. Victory over competitors and success in short travels.';
      predictionMalayalam = 'പ്രയത്നങ്ങളിൽ വിജയം. ധൈര്യം വർദ്ധിക്കും, സഹോദരങ്ങളിൽ നിന്നോ സുഹൃത്തുക്കളിൽ നിന്നോ നല്ല വാർത്തകൾ കേൾക്കാൻ ഇടവരും. ശത്രുക്കൾക്ക് മേൽ വിജയം നേടാനും ചെറിയ യാത്രകൾ ഗുണകരമാകാനും സാധ്യതയുണ്ട്.';
      luckyColor = 'Green';
      luckyColorMalayalam = 'പച്ച';
      luckyNumber = 5;
      remedy = 'Visit a nearby temple.';
      remedyMalayalam = 'ക്ഷേത്രദർശനം നടത്തുക.';
      break;
    case 4:
      status = 'Bad';
      statusMalayalam = 'മോശം';
      prediction = 'Potential for fear, sorrow, or minor health issues related to stomach. Drive carefully and avoid disputes regarding property. You might feel a lack of domestic peace today.';
      predictionMalayalam = 'ഭയം, ദുഃഖം, അല്ലെങ്കിൽ ഉദരസംബന്ധമായ ചെറിയ ആരോഗ്യ പ്രശ്നങ്ങൾക്ക് സാധ്യത. വാഹനമോടിക്കുമ്പോൾ ശ്രദ്ധിക്കുക. വസ്തുവകകൾ സംബന്ധിച്ച തർക്കങ്ങൾ ഒഴിവാക്കുക. കുടുംബത്തിൽ സമാധാനക്കുറവ് അനുഭവപ്പെട്ടേക്കാം.';
      luckyColor = 'Red';
      luckyColorMalayalam = 'ചുവപ്പ്';
      luckyNumber = 9;
      remedy = 'Chant "Om Namah Shivaya".';
      remedyMalayalam = '"ഓം നമശിവായ" ജപിക്കുക.';
      break;
    case 5:
      status = 'Average';
      statusMalayalam = 'സാധാരണം';
      prediction = 'A day of mixed results. You might feel a bit sad or face minor obstacles regarding children or education. Focus on spiritual activities to gain mental peace.';
      predictionMalayalam = 'സമ്മിശ്ര ഫലങ്ങൾ നൽകുന്ന ദിവസം. കുട്ടികളെയോ വിദ്യാഭ്യാസത്തെയോ സംബന്ധിച്ച് ചെറിയ തടസ്സങ്ങളോ വിഷമങ്ങളോ നേരിടാം. മനഃസമാധാനത്തിനായി ആത്മീയ കാര്യങ്ങളിൽ ശ്രദ്ധ കേന്ദ്രീകരിക്കുക.';
      luckyColor = 'Orange';
      luckyColorMalayalam = 'ഓറഞ്ച്';
      luckyNumber = 1;
      remedy = 'Feed birds or animals.';
      remedyMalayalam = 'പക്ഷികൾക്കോ മൃഗങ്ങൾക്കോ ഭക്ഷണം നൽകുക.';
      break;
    case 6:
      status = 'Excellent';
      statusMalayalam = 'അതിവിശിഷ്ടം';
      prediction = 'Great day for health and wealth. You will overcome enemies and experience happiness and success. Pending legal issues might move in your favor. Good for competitive exams.';
      predictionMalayalam = 'ആരോഗ്യത്തിനും സമ്പത്തിനും വളരെ നല്ല ദിവസം. ശത്രുക്കളെ പരാജയപ്പെടുത്തും, സന്തോഷവും വിജയവും കൈവരിക്കും. കോടതി കാര്യങ്ങളിൽ അനുകൂലമായ തീരുമാനം ഉണ്ടായേക്കാം. മത്സരപരീക്ഷകളിൽ വിജയിക്കാൻ സാധിക്കും.';
      luckyColor = 'Pink';
      luckyColorMalayalam = 'പിങ്ക്';
      luckyNumber = 6;
      remedy = 'Help someone in need.';
      remedyMalayalam = 'ആവശ്യക്കാരെ സഹായിക്കുക.';
      break;
    case 7:
      status = 'Good';
      statusMalayalam = 'നല്ലത്';
      prediction = 'Good food, comfortable travel, and happiness in relationships. A favorable day for partnerships and business deals. You will enjoy quality time with your spouse.';
      predictionMalayalam = 'നല്ല ഭക്ഷണം, സുഖകരമായ യാത്ര, ബന്ധങ്ങളിൽ സന്തോഷം എന്നിവ ഫലം. പുതിയ പങ്കാളിത്തങ്ങൾക്കും ബിസിനസ്സ് ഇടപാടുകൾക്കും അനുകൂലമായ ദിവസം. പങ്കാളിയുമായി സന്തോഷകരമായ സമയം ചിലവഴിക്കാൻ സാധിക്കും.';
      luckyColor = 'Cream';
      luckyColorMalayalam = 'ക്രീം';
      luckyNumber = 2;
      remedy = 'Offer flowers at an altar.';
      remedyMalayalam = 'പൂക്കൾ അർപ്പിക്കുക.';
      break;
    case 8:
      status = 'Chandra Ashtamam';
      statusMalayalam = 'ചന്ദ്രാഷ്ടമം (അതീവ ജാഗ്രത)';
      prediction = 'Chandra Ashtama. Exercise extreme caution. Potential for misery, fear, illness, and arguments. Avoid important decisions and long-distance travels. Stay calm and patient.';
      predictionMalayalam = 'ചന്ദ്രാഷ്ടമം. അതീവ ശ്രദ്ധ ആവശ്യമാണ്. ദുഃഖം, ഭയം, രോഗം, തർക്കങ്ങൾ എന്നിവയ്ക്ക് സാധ്യത. പ്രധാന തീരുമാനങ്ങളും ദൂരയാത്രകളും മാറ്റിവെക്കുക. ക്ഷമയോടെയും ശാന്തമായും ഇരിക്കുക.';
      luckyColor = 'Grey';
      luckyColorMalayalam = 'ചാരനിറം';
      luckyNumber = 4;
      remedy = 'Meditate for 15 minutes.';
      remedyMalayalam = '15 മിനിറ്റ് ധ്യാനിക്കുക.';
      break;
    case 9:
      status = 'Bad';
      statusMalayalam = 'മോശം';
      prediction = 'Minor illnesses or obstacles in your path. Avoid long journeys if possible. You might feel a lack of luck today. Focus on routine tasks and avoid risk-taking.';
      predictionMalayalam = 'ചെറിയ അസുഖങ്ങൾക്കോ തടസ്സങ്ങൾക്കോ സാധ്യത. ദീർഘദൂര യാത്രകൾ ഒഴിവാക്കുക. ഭാഗ്യം കുറഞ്ഞതായി അനുഭവപ്പെട്ടേക്കാം. ദൈനംദിന കാര്യങ്ങളിൽ ശ്രദ്ധിക്കുക, സാഹസങ്ങൾ ഒഴിവാക്കുക.';
      luckyColor = 'Purple';
      luckyColorMalayalam = 'വയലറ്റ്';
      luckyNumber = 7;
      remedy = 'Read a spiritual book.';
      remedyMalayalam = 'ആത്മീയ ഗ്രന്ഥങ്ങൾ വായിക്കുക.';
      break;
    case 10:
      status = 'Good';
      statusMalayalam = 'നല്ലത്';
      prediction = 'Success in your profession and undertakings. Your efforts will be recognized by superiors. Good day for career advancement and starting new projects at work.';
      predictionMalayalam = 'തൊഴിലിലും പ്രയത്നങ്ങളിലും വിജയം. നിങ്ങളുടെ പ്രവർത്തനങ്ങൾ മേലധികാരികളാൽ അംഗീകരിക്കപ്പെടും. ഔദ്യോഗിക പുരോഗതിക്കും ജോലിയിൽ പുതിയ പദ്ധതികൾ തുടങ്ങാനും നല്ല ദിവസം.';
      luckyColor = 'Brown';
      luckyColorMalayalam = 'തവിട്ട്';
      luckyNumber = 8;
      remedy = 'Plant a sapling.';
      remedyMalayalam = 'ഒരു ചെടി നടുക.';
      break;
    case 11:
      status = 'Excellent';
      statusMalayalam = 'അതിവിശിഷ്ടം';
      prediction = 'Financial gains, happiness, and good news. You will enjoy the company of friends and fulfillment of long-cherished desires. A very profitable day for business people.';
      predictionMalayalam = 'സാമ്പത്തിക നേട്ടം, സന്തോഷം, നല്ല വാർത്തകൾ എന്നിവ ഫലം. സുഹൃത്തുക്കളോടൊപ്പം സമയം ചിലവഴിക്കും, ആഗ്രഹങ്ങൾ സഫലമാകും. ബിസിനസ്സ് ചെയ്യുന്നവർക്ക് ലാഭകരമായ ദിവസമായിരിക്കും.';
      luckyColor = 'Gold';
      luckyColorMalayalam = 'സ്വർണ്ണനിറം';
      luckyNumber = 1;
      remedy = 'Share sweets with children.';
      remedyMalayalam = 'കുട്ടികൾക്ക് മധുരം നൽകുക.';
      break;
    case 12:
      status = 'Bad';
      statusMalayalam = 'മോശം';
      prediction = 'Increased expenditure and potential for sorrow. You might feel restless or face sleep issues. Good for charity, spiritual pursuits, and introspection.';
      predictionMalayalam = 'ചെലവ് വർദ്ധിക്കാനും വിഷമങ്ങൾക്കും സാധ്യത. അസ്വസ്ഥതയോ ഉറക്കക്കുറവോ അനുഭവപ്പെടാം. ദാനധർമ്മങ്ങൾക്കും ആത്മീയ കാര്യങ്ങൾക്കും സ്വയം വിലയിരുത്തലിനും നല്ല സമയം.';
      luckyColor = 'Silver';
      luckyColorMalayalam = 'വെള്ളി';
      luckyNumber = 6;
      remedy = 'Listen to calming music.';
      remedyMalayalam = 'ശാന്തമായ സംഗീതം കേൾക്കുക.';
      break;
  }

  return {
    transitHouse,
    status,
    statusMalayalam,
    prediction,
    predictionMalayalam,
    luckyColor,
    luckyColorMalayalam,
    luckyNumber,
    remedy,
    remedyMalayalam,
    date: date.toISOString(),
    currentRasiIndex,
    janmaRasiIndex
  };
}

export function getCurrentPlanets() {
  const date = new Date();
  const ayanamsa = getAyanamsa(date);
  
  const planets = [
    { name: 'സൂര്യൻ', body: Astronomy.Body.Sun },
    { name: 'ചൊവ്വ', body: Astronomy.Body.Mars },
    { name: 'ബുധൻ', body: Astronomy.Body.Mercury },
    { name: 'വ്യാഴം', body: Astronomy.Body.Jupiter },
    { name: 'ശുക്രൻ', body: Astronomy.Body.Venus },
    { name: 'ശനി', body: Astronomy.Body.Saturn },
    { name: 'രാഹു', body: 'Rahu' },
    { name: 'കേതു', body: 'Ketu' }
  ];

  return planets.map(p => {
    const long = getPlanetSiderealLongitude(p.body as any, date);
    const rasiIndex = Math.floor(long / 30);
    return {
      name: p.name,
      rasi: RASIS[rasiIndex].name
    };
  });
}
