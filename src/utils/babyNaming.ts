import * as Astronomy from 'astronomy-engine';
import { NAKSHATRAS } from './astroData';
import { getPlanetSiderealLongitude } from './astronomy';

export interface BabyNamingResult {
  nakshatra: string;
  nakshatraMalayalam: string;
  pada: number;
  rulingPlanet: string;
  rulingPlanetMalayalam: string;
  syllables: string[]; // e.g. ["ചു (Chu)", "ചേ (Che)", "ചോ (Cho)", "ലാ (La)"]
  currentPadaSyllable: string;
  suggestedNames: Array<{
    name: string;
    meaning: string;
    gender: 'boy' | 'girl' | 'unisex';
  }>;
  namakaranaDates: Array<{
    dayNumber: number; // e.g. 28 (Irupathettu)
    title: string;
    titleMalayalam: string;
    dateFormatted: string;
    description: string;
    descriptionMalayalam: string;
  }>;
}

// Authentic 108 Nakshatra Pada Syllables (Kerala Jathaka Paddhati)
const PADA_SYLLABLES: Record<number, string[]> = {
  1: ['ചു (Chu)', 'ചേ (Che)', 'ചോ (Cho)', 'ലാ (La)'], // Aswathi
  2: ['ലീ (Lee)', 'ലൂ (Lu)', 'ലേ (Le)', 'ലോ (Lo)'], // Bharani
  3: ['അ (A)', 'ഈ (Ee)', 'ഉ (U)', 'എ (E)'], // Karthika
  4: ['ഓ (O)', 'വാ (Va)', 'വീ (Vi)', 'വൂ (Vu)'], // Rohini
  5: ['വേ (Ve)', 'വോ (Vo)', 'കാ (Ka)', 'കീ (Kee)'], // Makayiram
  6: ['കൂ (Koo)', 'ഘ (Gha)', 'ങ (Nga)', 'ഛ (Cha)'], // Thiruvathira
  7: ['കേ (Ke)', 'കോ (Ko)', 'ഹാ (Ha)', 'ഹീ (Hee)'], // Punartham
  8: ['ഹൂ (Hoo)', 'ഹേ (He)', 'ഹോ (Ho)', 'ഡാ (Da)'], // Pooyam
  9: ['ഡീ (Dee)', 'ഡൂ (Doo)', 'ഡേ (De)', 'ഡോ (Do)'], // Aayilyam
  10: ['മാ (Ma)', 'മീ (Mee)', 'മൂ (Moo)', 'മേ (Me)'], // Makam
  11: ['മോ (Mo)', 'ടാ (Ta)', 'ടീ (Tee)', 'ടൂ (Too)'], // Pooram
  12: ['ടേ (Te)', 'ടോ (To)', 'പാ (Pa)', 'പീ (Pee)'], // Uthram
  13: ['പൂ (Poo)', 'ഷ (Sha)', 'ണാ (Na)', 'ഠ (Tha)'], // Atham
  14: ['പേ (Pe)', 'പോ (Po)', 'രാ (Ra)', 'രീ (Ree)'], // Chithira
  15: ['രൂ (Roo)', 'രേ (Re)', 'രോ (Ro)', 'താ (Tha)'], // Chothi
  16: ['തീ (Thee)', 'തൂ (Thoo)', 'തേ (The)', 'തോ (Tho)'], // Vishakham
  17: ['നാ (Na)', 'നീ (Nee)', 'നൂ (Noo)', 'നേ (Ne)'], // Anizham
  18: ['നോ (No)', 'യാ (Ya)', 'യീ (Yee)', 'യൂ (Yoo)'], // Thrikketta
  19: ['യേ (Ye)', 'യോ (Yo)', 'ഭാ (Bha)', 'ഭീ (Bhee)'], // Moolam
  20: ['ഭൂ (Bhoo)', 'ധാ (Dha)', 'ഫാ (Pha)', 'ഢാ (Dha)'], // Pooradam
  21: ['ഭേ (Bhe)', 'ഭോ (Bho)', 'ജാ (Ja)', 'ജീ (Jee)'], // Uthradam
  22: ['ഖീ (Khee)', 'ഖൂ (Khoo)', 'ഖേ (Khe)', 'ഖോ (Kho)'], // Thiruvonam
  23: ['ഗാ (Ga)', 'ഗീ (Gee)', 'ഗൂ (Goo)', 'ഗേ (Ge)'], // Avittam
  24: ['ഗോ (Go)', 'സാ (Sa)', 'സീ (See)', 'സൂ (Soo)'], // Chathayam
  25: ['സേ (Se)', 'സോ (So)', 'ദാ (Da)', 'ദീ (Dee)'], // Poororuttathi
  26: ['ദൂ (Doo)', 'ഥാ (Tha)', 'ഝാ (Jha)', 'ഞാ (Na)'], // Uthrattathi
  27: ['ദേ (De)', 'ദോ (Do)', 'ചാ (Cha)', 'ചീ (Chee)'] // Revathi
};

// Rich curated Vedic & modern name database indexed by star
const NAMES_BY_STAR: Record<number, Array<{ name: string; meaning: string; gender: 'boy' | 'girl' | 'unisex' }>> = {
  1: [
    { name: 'അർജുൻ (Arjun)', meaning: 'Bright, pure and noble warrior', gender: 'boy' },
    { name: 'അശ്വിൻ (Ashwin)', meaning: 'Divine healer and star born', gender: 'boy' },
    { name: 'ലാവണ്യ (Lavanya)', meaning: 'Grace, divine beauty and elegance', gender: 'girl' },
    { name: 'ചിന്മയി (Chinmayi)', meaning: 'Full of blissful supreme consciousness', gender: 'girl' }
  ],
  2: [
    { name: 'ലോകേഷ് (Lokesh)', meaning: 'King of the worlds', gender: 'boy' },
    { name: 'ലീന (Leena)', meaning: 'Devoted, absorbed in truth', gender: 'girl' },
    { name: 'ലോഹിത് (Lohit)', meaning: 'Red, auspicious dawn', gender: 'boy' },
    { name: 'ലേഖ (Lekha)', meaning: 'Crescent moon, sacred writing', gender: 'girl' }
  ],
  3: [
    { name: 'ആദിത്യൻ (Adithyan)', meaning: 'The radiant Sun god', gender: 'boy' },
    { name: 'ഈശ്വർ (Ishwar)', meaning: 'Supreme Lord', gender: 'boy' },
    { name: 'അനന്യ (Ananya)', meaning: 'Unique, matchless grace', gender: 'girl' },
    { name: 'ഉമാദേവി (Uma)', meaning: 'Goddess Parvathi, divine light', gender: 'girl' }
  ],
  4: [
    { name: 'വാസുദേവ് (Vasudev)', meaning: 'Lord Krishna, supreme divinity', gender: 'boy' },
    { name: 'വിവേക് (Vivek)', meaning: 'Righteous discernment and wisdom', gender: 'boy' },
    { name: 'വർണ്ണിക (Varnika)', meaning: 'Purity of gold, radiant glow', gender: 'girl' },
    { name: 'വിസ്മയ (Vismaya)', meaning: 'Miracle of divine wonder', gender: 'girl' }
  ],
  5: [
    { name: 'കാർത്തിക് (Karthik)', meaning: 'Lord Murugan, embodiment of courage', gender: 'boy' },
    { name: 'വേദവ്യാസ് (Vedavyas)', meaning: 'Sage of highest wisdom', gender: 'boy' },
    { name: 'കല്യാണി (Kalyani)', meaning: 'Auspicious, bestower of prosperity', gender: 'girl' },
    { name: 'കാവ്യ (Kavya)', meaning: 'Poetry, creative elegance', gender: 'girl' }
  ]
};

export function calculateBabyNaming(params: {
  dob?: string;
  time?: string;
  starId: number;
  pada?: number;
  gender?: 'boy' | 'girl' | 'all';
}): BabyNamingResult {
  const { starId } = params;
  let pada = params.pada || 1;
  const star = NAKSHATRAS.find(s => s.id === starId) || NAKSHATRAS[0];

  const syllables = PADA_SYLLABLES[star.id] || ['അ', 'ആ', 'ഇ', 'ഈ'];
  const currentPadaSyllable = syllables[(pada - 1) % syllables.length];

  // Specific or generalized names
  const allNames = NAMES_BY_STAR[star.id] || [
    { name: 'ശ്രേയസ് (Shreyas)', meaning: 'Superior virtue and spiritual fortune', gender: 'boy' },
    { name: 'ശിവശങ്കർ (Sivashankar)', meaning: 'Auspicious Lord Shiva', gender: 'boy' },
    { name: 'ശ്രദ്ധ (Shraddha)', meaning: 'Pure reverence and faith', gender: 'girl' },
    { name: 'നിവേദ്യ (Nivedya)', meaning: 'Sacred divine offering', gender: 'girl' }
  ];

  const filteredNames = params.gender && params.gender !== 'all' 
    ? allNames.filter(n => n.gender === params.gender || n.gender === 'unisex')
    : allNames;

  // Calculate traditional Namakarana dates if DOB provided
  const namakaranaDates: BabyNamingResult['namakaranaDates'] = [];
  if (params.dob) {
    const [y, m, d] = params.dob.split('-').map(Number);
    const birth = new Date(y, m - 1, d);

    const milestoneDays = [
      { days: 11, title: '11-ാം ദിവസം (Ekadasha Dina)', mlTitle: 'പതിനൊന്നാം ദിവസം', desc: 'First traditional ceremony day in Vedic scriptures.' },
      { days: 12, title: '12-ാം ദിവസം (Dwadasha Dina)', mlTitle: 'പന്ത്രണ്ടാം ദിവസം', desc: 'Auspicious post-purification naming date.' },
      ...(params.gender === 'girl'
        ? [{ days: 27, title: '27-ാം ദിവസം (ഇരുപത്തിയേഴ് / പെൺകുട്ടികൾക്ക്)', mlTitle: 'ഇരുപത്തിയേഴാം ദിവസം (നൂലുകെട്ട്)', desc: 'Sacred traditional Kerala ceremony with waist-cord tying (Charadu Kettu) for baby girls.' }]
        : [{ days: 28, title: '28-ാം ദിവസം (ഇരുപത്തെട്ട് / Irupathettu)', mlTitle: 'ഇരുപത്തെട്ടാം ദിവസം (നൂലുകെട്ട്)', desc: 'Most sacred traditional Kerala ceremony with waist-cord tying (Charadu Kettu) for baby boys.' }]
      )
    ];

    for (const item of milestoneDays) {
      const targetDate = new Date(birth.getTime() + item.days * 24 * 60 * 60 * 1000);
      namakaranaDates.push({
        dayNumber: item.days,
        title: item.title,
        titleMalayalam: item.mlTitle,
        dateFormatted: targetDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
        description: item.desc,
        descriptionMalayalam: `${targetDate.toLocaleDateString('ml-IN', { month: 'long', day: 'numeric' })} തീയതിയിൽ ചടങ്ങ് നടത്താം. ${item.desc}`
      });
    }
  }

  return {
    nakshatra: star.name,
    nakshatraMalayalam: star.malayalamName,
    pada,
    rulingPlanet: star.rulingPlanet,
    rulingPlanetMalayalam: star.rulingPlanetMalayalam,
    syllables,
    currentPadaSyllable,
    suggestedNames: filteredNames,
    namakaranaDates
  };
}
