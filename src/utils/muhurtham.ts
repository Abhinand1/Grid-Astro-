import { NAKSHATRAS } from './astroData';

export interface MuhurthamDate {
  date: Date;
  star: string;
  malayalamStar: string;
  quality: 'Excellent' | 'Good' | 'Average';
  description: string;
}

// Preferred stars for marriage in Kerala tradition
const PREFERRED_STARS = [
  'Rohini', 'Makayiram', 'Magham', 'Uthram', 'Atham', 'Chithira', 'Chothi', 
  'Anizham', 'Moolam', 'Uthradam', 'Thiruvonam', 'Avittam', 'Chathayam', 
  'Uthruttathi', 'Revathi'
];

export function findMuhurthams(girlStarId: number, boyStarId: number): MuhurthamDate[] {
  const muhurthams: MuhurthamDate[] = [];
  const today = new Date();
  
  // Mock logic: Find dates in the next 6 months that fall on preferred stars
  // In a real app, this would use a Panchangam API or complex astronomical calculations.
  
  for (let i = 1; i <= 180; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    // Mock star for the day (cycling through 27 stars)
    const starIndex = (i % 27) + 1;
    const star = NAKSHATRAS.find(s => s.id === starIndex);
    
    if (star && PREFERRED_STARS.includes(star.name)) {
      // Check if this star is compatible with both girl and boy (simplified)
      // Usually, we check if it's not a Janma Nakshatra or 3, 5, 7 from their stars.
      
      muhurthams.push({
        date,
        star: star.name,
        malayalamStar: star.malayalamName,
        quality: i % 5 === 0 ? 'Excellent' : 'Good',
        description: `വിവാഹത്തിന് അനുയോജ്യമായ ദിവസം (${star.malayalamName} നക്ഷത്രം).`
      });
    }
    
    if (muhurthams.length >= 5) break;
  }

  return muhurthams;
}
