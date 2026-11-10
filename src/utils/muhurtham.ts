import * as Astronomy from 'astronomy-engine';
import { NAKSHATRAS } from './astroData';
import { getPlanetSiderealLongitude } from './astronomy';

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
  const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 9, 30, 0);

  for (let i = 0; i < 180; i++) {
    const candidateDate = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
    
    // Real astronomical Sidereal Moon & Sun position using Astronomy engine
    const moonLon = getPlanetSiderealLongitude(Astronomy.Body.Moon, candidateDate);
    const sunLon = getPlanetSiderealLongitude(Astronomy.Body.Sun, candidateDate);

    // Solar month check: In Kerala tradition, avoid Karkidakam (3) and Dhanu (8) for marriage
    const sunRasi = Math.floor(sunLon / 30);
    if (sunRasi === 3 || sunRasi === 8) {
      continue;
    }

    // Accurate Nakshatra
    const starIndex = Math.floor(moonLon / (360 / 27));
    const star = NAKSHATRAS[starIndex];
    if (!star || !PREFERRED_STARS.includes(star.name)) {
      continue;
    }

    // In classical marriage election (Muhurtha Padhavi), marriage on Janma Nakshatra of bride or groom is strictly prohibited
    if (star.id === girlStarId || star.id === boyStarId) {
      continue;
    }

    // Tithi check - avoid Riktha tithis (4, 9, 14) and Amavasya
    let diffLon = moonLon - sunLon;
    if (diffLon < 0) diffLon += 360;
    const tithiIndex = Math.floor(diffLon / 12);
    const tithiNum = (tithiIndex % 15) + 1;
    if (tithiNum === 4 || tithiNum === 9 || tithiNum === 14 || tithiIndex === 29) {
      continue;
    }

    // Weekday check - avoid Tuesday (2) for wedding muhurtham
    if (candidateDate.getDay() === 2) {
      continue;
    }

    // Check Tarabalam for both partners
    const countGirl = ((star.id - girlStarId + 27) % 27) + 1;
    const girlTarabalam = (countGirl - 1) % 9;
    const countBoy = ((star.id - boyStarId + 27) % 27) + 1;
    const boyTarabalam = (countBoy - 1) % 9;

    // Janma (0), Vipat (2), Pratyak (4), Naidhana (6) are inauspicious for marriage
    if (girlTarabalam === 0 || girlTarabalam === 2 || girlTarabalam === 4 || girlTarabalam === 6 ||
        boyTarabalam === 0 || boyTarabalam === 2 || boyTarabalam === 4 || boyTarabalam === 6) {
      continue;
    }

    const isExcellent = (girlTarabalam === 1 || girlTarabalam === 3 || girlTarabalam === 5 || girlTarabalam === 7 || girlTarabalam === 8) &&
                        (boyTarabalam === 1 || boyTarabalam === 3 || boyTarabalam === 5 || boyTarabalam === 7 || boyTarabalam === 8);

    muhurthams.push({
      date: candidateDate,
      star: star.name,
      malayalamStar: star.malayalamName,
      quality: isExcellent ? 'Excellent' : 'Good',
      description: `വിവാഹത്തിന് അനുയോജ്യമായ ശുഭദിനം (${star.malayalamName} നക്ഷത്രം, ശുഭ മുഹൂർത്തം).`
    });

    if (muhurthams.length >= 6) break;
  }

  return muhurthams;
}

