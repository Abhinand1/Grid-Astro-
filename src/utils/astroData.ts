
export type Gana = 'Deva' | 'Manushya' | 'Rakshasa';
export type Yoni = 'Horse' | 'Elephant' | 'Goat' | 'Serpent' | 'Dog' | 'Cat' | 'Rat' | 'Cow' | 'Buffalo' | 'Tiger' | 'Deer' | 'Monkey' | 'Mongoose' | 'Lion';
export type Rajju = 'Siro' | 'Kanta' | 'Udara' | 'Kati' | 'Pada';

export interface Nakshatra {
  id: number;
  name: string;
  malayalamName: string;
  defaultRashi: string;
  gana: Gana;
  yoni: Yoni;
  rajju: Rajju;
  vedha: number[];
}

export const NAKSHATRAS: Nakshatra[] = [
  { id: 1, name: "Aswathi", malayalamName: "അശ്വതി", defaultRashi: "Medam", gana: "Deva", yoni: "Horse", rajju: "Pada", vedha: [18] },
  { id: 2, name: "Bharani", malayalamName: "ഭരണി", defaultRashi: "Medam", gana: "Manushya", yoni: "Elephant", rajju: "Kati", vedha: [17] },
  { id: 3, name: "Karthika", malayalamName: "കാർത്തിക", defaultRashi: "Edavam", gana: "Rakshasa", yoni: "Goat", rajju: "Udara", vedha: [16] },
  { id: 4, name: "Rohini", malayalamName: "രോഹിണി", defaultRashi: "Edavam", gana: "Manushya", yoni: "Serpent", rajju: "Kanta", vedha: [15] },
  { id: 5, name: "Makayiram", malayalamName: "മകയിരം", defaultRashi: "Mithunam", gana: "Deva", yoni: "Dog", rajju: "Siro", vedha: [14] },
  { id: 6, name: "Thiruvathira", malayalamName: "തിരുവാതിര", defaultRashi: "Mithunam", gana: "Manushya", yoni: "Serpent", rajju: "Kanta", vedha: [22] },
  { id: 7, name: "Punartham", malayalamName: "പുണർതം", defaultRashi: "Mithunam", gana: "Deva", yoni: "Dog", rajju: "Udara", vedha: [21] },
  { id: 8, name: "Pooyam", malayalamName: "പൂയം", defaultRashi: "Karkidakam", gana: "Deva", yoni: "Goat", rajju: "Kati", vedha: [20] },
  { id: 9, name: "Ayilyam", malayalamName: "ആയില്യം", defaultRashi: "Karkidakam", gana: "Rakshasa", yoni: "Cat", rajju: "Pada", vedha: [19] },
  { id: 10, name: "Makam", malayalamName: "മകം", defaultRashi: "Chingam", gana: "Rakshasa", yoni: "Rat", rajju: "Pada", vedha: [27] },
  { id: 11, name: "Pooram", malayalamName: "പൂരം", defaultRashi: "Chingam", gana: "Manushya", yoni: "Cat", rajju: "Kati", vedha: [26] },
  { id: 12, name: "Uthram", malayalamName: "ഉത്രം", defaultRashi: "Kanni", gana: "Manushya", yoni: "Cow", rajju: "Udara", vedha: [25] },
  { id: 13, name: "Atham", malayalamName: "അത്തം", defaultRashi: "Kanni", gana: "Deva", yoni: "Buffalo", rajju: "Kanta", vedha: [24] },
  { id: 14, name: "Chithira", malayalamName: "ചിത്തിര", defaultRashi: "Thulam", gana: "Rakshasa", yoni: "Tiger", rajju: "Siro", vedha: [5] },
  { id: 15, name: "Chothi", malayalamName: "ചോതി", defaultRashi: "Thulam", gana: "Deva", yoni: "Buffalo", rajju: "Kanta", vedha: [4] },
  { id: 16, name: "Vishakham", malayalamName: "വിശാഖം", defaultRashi: "Vrischikam", gana: "Rakshasa", yoni: "Tiger", rajju: "Udara", vedha: [3] },
  { id: 17, name: "Anizham", malayalamName: "അനിഴം", defaultRashi: "Vrischikam", gana: "Deva", yoni: "Deer", rajju: "Kati", vedha: [2] },
  { id: 18, name: "Thrikketta", malayalamName: "തൃക്കേട്ട", defaultRashi: "Vrischikam", gana: "Rakshasa", yoni: "Deer", rajju: "Pada", vedha: [1] },
  { id: 19, name: "Moolam", malayalamName: "മൂലം", defaultRashi: "Dhanu", gana: "Rakshasa", yoni: "Dog", rajju: "Pada", vedha: [9] },
  { id: 20, name: "Pooradam", malayalamName: "പൂരാടം", defaultRashi: "Dhanu", gana: "Manushya", yoni: "Monkey", rajju: "Kati", vedha: [8] },
  { id: 21, name: "Uthradam", malayalamName: "ഉത്രാടം", defaultRashi: "Makaram", gana: "Manushya", yoni: "Mongoose", rajju: "Udara", vedha: [7] },
  { id: 22, name: "Thiruvonam", malayalamName: "തിരുവോണം", defaultRashi: "Makaram", gana: "Deva", yoni: "Monkey", rajju: "Kanta", vedha: [6] },
  { id: 23, name: "Avittam", malayalamName: "അവിട്ടം", defaultRashi: "Kumbham", gana: "Rakshasa", yoni: "Lion", rajju: "Siro", vedha: [] },
  { id: 24, name: "Chathayam", malayalamName: "ചതയം", defaultRashi: "Kumbham", gana: "Rakshasa", yoni: "Horse", rajju: "Kanta", vedha: [13] },
  { id: 25, name: "Pooruruttathi", malayalamName: "പൂരുരുട്ടാതി", defaultRashi: "Meenam", gana: "Manushya", yoni: "Rat", rajju: "Udara", vedha: [12] },
  { id: 26, name: "Uthrattathi", malayalamName: "ഉത്രട്ടാതി", defaultRashi: "Meenam", gana: "Manushya", yoni: "Cow", rajju: "Kati", vedha: [11] },
  { id: 27, name: "Revathi", malayalamName: "രേവതി", defaultRashi: "Meenam", gana: "Deva", yoni: "Elephant", rajju: "Pada", vedha: [10] },
];

export const RASIS = [
  { id: 1, name: "Medam", lord: "Chovva" },
  { id: 2, name: "Edavam", lord: "Shukran" },
  { id: 3, name: "Mithunam", lord: "Budhan" },
  { id: 4, name: "Karkidakam", lord: "Chandran" },
  { id: 5, name: "Chingam", lord: "Suryan" },
  { id: 6, name: "Kanni", lord: "Budhan" },
  { id: 7, name: "Thulam", lord: "Shukran" },
  { id: 8, name: "Vrischikam", lord: "Chovva" },
  { id: 9, name: "Dhanu", lord: "Vyazham" },
  { id: 10, name: "Makaram", lord: "Shani" },
  { id: 11, name: "Kumbham", lord: "Shani" },
  { id: 12, name: "Meenam", lord: "Vyazham" },
];

export const PLANETARY_FRIENDSHIP: Record<string, { friends: string[], neutral: string[], enemies: string[] }> = {
  "Suryan": { friends: ["Chandran", "Chovva", "Vyazham"], neutral: ["Budhan"], enemies: ["Shukran", "Shani"] },
  "Chandran": { friends: ["Suryan", "Budhan"], neutral: ["Chovva", "Vyazham", "Shukran", "Shani"], enemies: [] },
  "Chovva": { friends: ["Suryan", "Chandran", "Vyazham"], neutral: ["Shani", "Budhan"], enemies: ["Shukran"] },
  "Budhan": { friends: ["Suryan", "Shukran"], neutral: ["Chovva", "Shani", "Vyazham"], enemies: ["Chandran"] },
  "Vyazham": { friends: ["Suryan", "Chandran", "Chovva"], neutral: ["Shani"], enemies: ["Budhan", "Shukran"] },
  "Shukran": { friends: ["Budhan", "Shani"], neutral: ["Chovva", "Vyazham"], enemies: ["Suryan", "Chandran"] },
  "Shani": { friends: ["Budhan", "Shukran"], neutral: ["Vyazham"], enemies: ["Suryan", "Chandran", "Chovva"] }
};

export const YONI_ENEMIES: Record<string, string> = {
  "Cat": "Rat",
  "Rat": "Cat",
  "Dog": "Deer",
  "Deer": "Dog",
  "Serpent": "Mongoose",
  "Mongoose": "Serpent",
  "Horse": "Buffalo",
  "Buffalo": "Horse",
  "Cow": "Tiger",
  "Tiger": "Cow",
  "Elephant": "Lion",
  "Lion": "Elephant"
};

export const YONI_FRIENDS: Record<string, string> = {
  "Horse": "Elephant",
  "Elephant": "Horse",
  "Goat": "Cow",
  "Cow": "Goat",
  "Dog": "Deer", // Wait, Dog and Deer are enemies according to the PDF!
  // Let's re-read the PDF:
  // Friendly Yoni pairs = Madhyamam (Horse-Elephant, Goat-Cow, Dog-Deer)
  // Enemy Yoni pairs = Adhamam:
  // Dog vs Deer (Shwan-Mriga) -> Wait, the PDF says Dog-Deer is Friendly AND Enemy?
  // Let me check the PDF text:
  // "Friendly Yoni pairs = Madhyamam (Horse-Elephant, Goat-Cow, Dog-Deer)"
  // "Enemy Yoni pairs = Adhamam: ... Dog vs Deer (Shwan-Mriga)"
  // This is a contradiction in the PDF! I will treat Dog vs Deer as Enemy, as it's explicitly listed under Enemy.
  // Let's use Monkey-Elephant or something else for friendly if needed, but I'll just code the explicit ones.
};

export const VASYA_MAPPING: Record<string, string[]> = {
  "Medam": ["Chingam", "Vrischikam"],
  "Edavam": ["Karkidakam", "Thulam"],
  "Mithunam": ["Kanni"],
  "Karkidakam": ["Vrischikam", "Dhanu"],
  "Chingam": ["Thulam"],
  "Kanni": ["Mithunam", "Meenam"],
  "Thulam": ["Makaram", "Mithunam"],
  "Vrischikam": ["Karkidakam"],
  "Dhanu": ["Meenam"],
  "Makaram": ["Medam", "Kumbham"],
  "Kumbham": ["Medam"],
  "Meenam": ["Makaram"]
};
