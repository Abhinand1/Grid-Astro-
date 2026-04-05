import * as Astronomy from 'astronomy-engine';
import { NAKSHATRAS } from './astroData';
import { getPlanetSiderealLongitude, getSiderealMoonLongitude } from './astronomy';

export interface MuhurthamDate {
  date: Date;
  star: string;
  malayalamStar: string;
  quality: 'Excellent' | 'Good' | 'Average';
  description: string;
}

// Preferred stars for marriage in Kerala tradition
const PREFERRED_STARS = [
  'Rohini', 'Makayiram', 'Makam', 'Uthram', 'Atham', 'Chithira', 'Chothi',
  'Anizham', 'Moolam', 'Uthradam', 'Thiruvonam', 'Avittam', 'Chathayam', 
  'Uthrattathi', 'Revathi'
];

export function findMuhurthams(girlStarId: number, boyStarId: number): MuhurthamDate[] {
  const muhurthams: MuhurthamDate[] = [];
  const today = new Date();
  
  // Real Panchanga check for next 180 days
  for (let i = 1; i <= 180; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    date.setHours(10, 0, 0, 0); // Check around 10 AM for muhurtham
    
    // Kochi coordinates for sunrise calculation
    const lat = 9.9312;
    const lonCoordinate = 76.2673;
    const dateObj = Astronomy.MakeTime(date);
    const observer = new Astronomy.Observer(lat, lonCoordinate, 0);
    const sunriseObj = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, 1, dateObj, 300);
    
    let isRahuKaal = false;
    if (sunriseObj) {
      const sunriseTime = sunriseObj.date;
      // Rahu Kaal lengths per day in 1/8th of daytime
      // Sunday: 8th segment (16:30 - 18:00 roughly) -> factor 7
      // Monday: 2nd segment (07:30 - 09:00) -> factor 1
      // Tuesday: 7th segment (15:00 - 16:30) -> factor 6
      // Wednesday: 5th segment (12:00 - 13:30) -> factor 4
      // Thursday: 6th segment (13:30 - 15:00) -> factor 5
      // Friday: 4th segment (10:30 - 12:00) -> factor 3
      // Saturday: 3rd segment (09:00 - 10:30) -> factor 2
      const dayOfWeek = date.getDay();
      const rahuFactors = [7, 1, 6, 4, 5, 3, 2];
      const factor = rahuFactors[dayOfWeek];

      const dayLengthHours = 12; // Approximation for Kerala
      const segmentLength = dayLengthHours / 8;

      const rahuStartHours = factor * segmentLength;
      const rahuEndHours = (factor + 1) * segmentLength;

      const sunriseHours = sunriseTime.getHours() + sunriseTime.getMinutes() / 60;
      const checkHour = 10; // We are checking 10 AM
      
      const rahuStartAbs = sunriseHours + rahuStartHours;
      const rahuEndAbs = sunriseHours + rahuEndHours;

      if (checkHour >= rahuStartAbs && checkHour <= rahuEndAbs) {
        isRahuKaal = true;
      }
    }

    if (isRahuKaal) continue; // Reject if 10 AM falls in Rahu Kaal

    // Get sidereal longitudes
    const sunLon = getPlanetSiderealLongitude(Astronomy.Body.Sun, date);
    const moonLon = getSiderealMoonLongitude(date);

    // Karkidakam month block (Sun in Karkidakam Rasi, which is Rasi Index 3: 90° - 120°)
    const sunRasi = Math.floor(sunLon / 30);
    if (sunRasi === 3) continue; // Karkidakam month is strictly prohibited for Vivaha

    // Calculate Tithi (Moon - Sun)
    let tithiDiff = moonLon - sunLon;
    if (tithiDiff < 0) tithiDiff += 360;
    const tithi = Math.floor(tithiDiff / 12) + 1;

    // Reject Ashtami (8) and Navami (9) and Amavasya (30)
    if (tithi === 8 || tithi === 9 || tithi === 30) continue;

    // Calculate Nakshatra
    const nakshatraIndex = Math.floor(moonLon / (360 / 27));
    const starId = nakshatraIndex + 1;
    const star = NAKSHATRAS.find(s => s.id === starId);

    if (star && PREFERRED_STARS.includes(star.name)) {
      // Check Janma, Vipat, Pratyak, Nidhana dosham
      const isBadStar = (checkId: number, sid: number) => {
        let diff = sid - checkId + 1;
        if (diff <= 0) diff += 27;
        const rem = diff % 9;
        return [1, 3, 5, 7].includes(rem);
      };

      if (isBadStar(girlStarId, starId) || isBadStar(boyStarId, starId)) continue;

      // Gandanta check (Junctions of Revathi-Aswathi, Ayilyam-Makam, Thrikketta-Moolam)
      // They occur at 0°, 120°, 240°
      const gandantaZones = [0, 120, 240];
      let isGandanta = false;
      for (const zone of gandantaZones) {
        if (Math.abs(moonLon - zone) < 1 || Math.abs(moonLon - 360 - zone) < 1) {
          isGandanta = true;
          break;
        }
      }

      muhurthams.push({
        date,
        star: star.name,
        malayalamStar: star.malayalamName,
        quality: isGandanta ? 'Average' : 'Excellent',
        description: isGandanta ?
          `വിവാഹത്തിന് അനുയോജ്യമായ ദിവസം (${star.malayalamName} നക്ഷത്രം) പക്ഷെ ഗണ്ഡാന്ത ദോഷം ശ്രദ്ധിക്കുക.` :
          `വിവാഹത്തിന് ഏറ്റവും അനുയോജ്യമായ ദിവസം (${star.malayalamName} നക്ഷത്രം).`
      });
    }
    
    if (muhurthams.length >= 5) break;
  }

  return muhurthams;
}
