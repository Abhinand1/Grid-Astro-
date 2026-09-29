
export type Gana = 'Deva' | 'Manushya' | 'Rakshasa';
export type Yoni = 'Horse' | 'Elephant' | 'Goat' | 'Serpent' | 'Dog' | 'Cat' | 'Rat' | 'Cow' | 'Buffalo' | 'Tiger' | 'Deer' | 'Monkey' | 'Mongoose' | 'Lion';
export type YoniGender = 'Male' | 'Female';
export type Rajju = 'Siro' | 'Kanta' | 'Udara' | 'Kati' | 'Pada';
export type TriRajju = 'Prathama' | 'Madhyama' | 'Anthima';

export interface Nakshatra {
  id: number;
  name: string;
  malayalamName: string;
  defaultRashi: string;
  gana: Gana;
  yoni: Yoni;
  yoniGender: YoniGender;
  rajju: Rajju;
  triRajju: TriRajju;
  vedha: number[];
  rulingPlanet: string;
  rulingPlanetMalayalam: string;
}

export const NAKSHATRAS: Nakshatra[] = [
  { id: 1, name: "Aswathi", malayalamName: "അശ്വതി", defaultRashi: "Medam", gana: "Deva", yoni: "Horse", yoniGender: "Male", rajju: "Pada", triRajju: "Prathama", vedha: [18], rulingPlanet: "Ketu", rulingPlanetMalayalam: "കേതു" },
  { id: 2, name: "Bharani", malayalamName: "ഭരണി", defaultRashi: "Medam", gana: "Manushya", yoni: "Elephant", yoniGender: "Female", rajju: "Kati", triRajju: "Madhyama", vedha: [17], rulingPlanet: "Venus", rulingPlanetMalayalam: "ശുക്രൻ" },
  { id: 3, name: "Karthika", malayalamName: "കാർത്തിക", defaultRashi: "Edavam", gana: "Rakshasa", yoni: "Goat", yoniGender: "Female", rajju: "Udara", triRajju: "Anthima", vedha: [16], rulingPlanet: "Sun", rulingPlanetMalayalam: "സൂര്യൻ" },
  { id: 4, name: "Rohini", malayalamName: "രോഹിണി", defaultRashi: "Edavam", gana: "Manushya", yoni: "Serpent", yoniGender: "Male", rajju: "Kanta", triRajju: "Madhyama", vedha: [15], rulingPlanet: "Moon", rulingPlanetMalayalam: "ചന്ദ്രൻ" },
  { id: 5, name: "Makayiram", malayalamName: "മകയിരം", defaultRashi: "Mithunam", gana: "Deva", yoni: "Serpent", yoniGender: "Female", rajju: "Siro", triRajju: "Prathama", vedha: [14, 23], rulingPlanet: "Mars", rulingPlanetMalayalam: "ചൊവ്വ" },
  { id: 6, name: "Thiruvathira", malayalamName: "തിരുവാതിര", defaultRashi: "Mithunam", gana: "Manushya", yoni: "Dog", yoniGender: "Female", rajju: "Kanta", triRajju: "Anthima", vedha: [22], rulingPlanet: "Rahu", rulingPlanetMalayalam: "രാഹു" },
  { id: 7, name: "Punartham", malayalamName: "പുണർതം", defaultRashi: "Mithunam", gana: "Deva", yoni: "Cat", yoniGender: "Female", rajju: "Udara", triRajju: "Prathama", vedha: [21], rulingPlanet: "Jupiter", rulingPlanetMalayalam: "വ്യാഴം" },
  { id: 8, name: "Pooyam", malayalamName: "പൂയം", defaultRashi: "Karkidakam", gana: "Deva", yoni: "Goat", yoniGender: "Male", rajju: "Kati", triRajju: "Madhyama", vedha: [20], rulingPlanet: "Saturn", rulingPlanetMalayalam: "ശനി" },
  { id: 9, name: "Ayilyam", malayalamName: "ആയില്യം", defaultRashi: "Karkidakam", gana: "Rakshasa", yoni: "Cat", yoniGender: "Male", rajju: "Pada", triRajju: "Anthima", vedha: [19], rulingPlanet: "Mercury", rulingPlanetMalayalam: "ബുധൻ" },
  { id: 10, name: "Makam", malayalamName: "മകം", defaultRashi: "Chingam", gana: "Rakshasa", yoni: "Rat", yoniGender: "Male", rajju: "Pada", triRajju: "Anthima", vedha: [27], rulingPlanet: "Ketu", rulingPlanetMalayalam: "കേതു" },
  { id: 11, name: "Pooram", malayalamName: "പൂരം", defaultRashi: "Chingam", gana: "Manushya", yoni: "Rat", yoniGender: "Female", rajju: "Kati", triRajju: "Madhyama", vedha: [26], rulingPlanet: "Venus", rulingPlanetMalayalam: "ശുക്രൻ" },
  { id: 12, name: "Uthram", malayalamName: "ഉത്രം", defaultRashi: "Kanni", gana: "Manushya", yoni: "Cow", yoniGender: "Male", rajju: "Udara", triRajju: "Anthima", vedha: [25], rulingPlanet: "Sun", rulingPlanetMalayalam: "സൂര്യൻ" },
  { id: 13, name: "Atham", malayalamName: "അത്തം", defaultRashi: "Kanni", gana: "Deva", yoni: "Buffalo", yoniGender: "Female", rajju: "Kanta", triRajju: "Madhyama", vedha: [24], rulingPlanet: "Moon", rulingPlanetMalayalam: "ചന്ദ്രൻ" },
  { id: 14, name: "Chithira", malayalamName: "ചിത്തിര", defaultRashi: "Thulam", gana: "Rakshasa", yoni: "Tiger", yoniGender: "Female", rajju: "Siro", triRajju: "Prathama", vedha: [5, 23], rulingPlanet: "Mars", rulingPlanetMalayalam: "ചൊവ്വ" },
  { id: 15, name: "Chothi", malayalamName: "ചോതി", defaultRashi: "Thulam", gana: "Deva", yoni: "Buffalo", yoniGender: "Male", rajju: "Kanta", triRajju: "Madhyama", vedha: [4], rulingPlanet: "Rahu", rulingPlanetMalayalam: "രാഹു" },
  { id: 16, name: "Vishakham", malayalamName: "വിശാഖം", defaultRashi: "Vrischikam", gana: "Rakshasa", yoni: "Tiger", yoniGender: "Male", rajju: "Udara", triRajju: "Prathama", vedha: [3], rulingPlanet: "Jupiter", rulingPlanetMalayalam: "വ്യാഴം" },
  { id: 17, name: "Anizham", malayalamName: "അനിഴം", defaultRashi: "Vrischikam", gana: "Deva", yoni: "Deer", yoniGender: "Female", rajju: "Kati", triRajju: "Madhyama", vedha: [2], rulingPlanet: "Saturn", rulingPlanetMalayalam: "ശനി" },
  { id: 18, name: "Thrikketta", malayalamName: "തൃക്കേട്ട", defaultRashi: "Vrischikam", gana: "Rakshasa", yoni: "Deer", yoniGender: "Male", rajju: "Pada", triRajju: "Anthima", vedha: [1], rulingPlanet: "Mercury", rulingPlanetMalayalam: "ബുധൻ" },
  { id: 19, name: "Moolam", malayalamName: "മൂലം", defaultRashi: "Dhanu", gana: "Rakshasa", yoni: "Dog", yoniGender: "Male", rajju: "Pada", triRajju: "Anthima", vedha: [9], rulingPlanet: "Ketu", rulingPlanetMalayalam: "കേതു" },
  { id: 20, name: "Pooradam", malayalamName: "പൂരാടം", defaultRashi: "Dhanu", gana: "Manushya", yoni: "Monkey", yoniGender: "Male", rajju: "Kati", triRajju: "Anthima", vedha: [8], rulingPlanet: "Venus", rulingPlanetMalayalam: "ശുക്രൻ" },
  { id: 21, name: "Uthradam", malayalamName: "ഉത്രാടം", defaultRashi: "Makaram", gana: "Manushya", yoni: "Mongoose", yoniGender: "Male", rajju: "Udara", triRajju: "Anthima", vedha: [7], rulingPlanet: "Sun", rulingPlanetMalayalam: "സൂര്യൻ" },
  { id: 22, name: "Thiruvonam", malayalamName: "തിരുവോണം", defaultRashi: "Makaram", gana: "Deva", yoni: "Monkey", yoniGender: "Female", rajju: "Kanta", triRajju: "Madhyama", vedha: [6], rulingPlanet: "Moon", rulingPlanetMalayalam: "ചന്ദ്രൻ" },
  { id: 23, name: "Avittam", malayalamName: "അവിട്ടം", defaultRashi: "Kumbham", gana: "Rakshasa", yoni: "Lion", yoniGender: "Female", rajju: "Siro", triRajju: "Prathama", vedha: [5, 14], rulingPlanet: "Mars", rulingPlanetMalayalam: "ചൊവ്വ" },
  { id: 24, name: "Chathayam", malayalamName: "ചതയം", defaultRashi: "Kumbham", gana: "Rakshasa", yoni: "Horse", yoniGender: "Female", rajju: "Kanta", triRajju: "Anthima", vedha: [13], rulingPlanet: "Rahu", rulingPlanetMalayalam: "രാഹു" },
  { id: 25, name: "Pooruruttathi", malayalamName: "പൂരുരുട്ടാതി", defaultRashi: "Meenam", gana: "Manushya", yoni: "Lion", yoniGender: "Male", rajju: "Udara", triRajju: "Prathama", vedha: [12], rulingPlanet: "Jupiter", rulingPlanetMalayalam: "വ്യാഴം" },
  { id: 26, name: "Uthrattathi", malayalamName: "ഉത്രട്ടാതി", defaultRashi: "Meenam", gana: "Manushya", yoni: "Cow", yoniGender: "Female", rajju: "Kati", triRajju: "Madhyama", vedha: [11], rulingPlanet: "Saturn", rulingPlanetMalayalam: "ശനി" },
  { id: 27, name: "Revathi", malayalamName: "രേവതി", defaultRashi: "Meenam", gana: "Deva", yoni: "Elephant", yoniGender: "Male", rajju: "Pada", triRajju: "Anthima", vedha: [10], rulingPlanet: "Mercury", rulingPlanetMalayalam: "ബുധൻ" },
];

export const RASIS = [
  { id: 1, name: "Medam", malayalamName: "മേടം", lord: "Chovva", lordMalayalam: "ചൊവ്വ" },
  { id: 2, name: "Edavam", malayalamName: "ഇടവം", lord: "Shukran", lordMalayalam: "ശുക്രൻ" },
  { id: 3, name: "Mithunam", malayalamName: "മിഥുനം", lord: "Budhan", lordMalayalam: "ബുധൻ" },
  { id: 4, name: "Karkidakam", malayalamName: "കർക്കടകം", lord: "Chandran", lordMalayalam: "ചന്ദ്രൻ" },
  { id: 5, name: "Chingam", malayalamName: "ചിങ്ങം", lord: "Suryan", lordMalayalam: "സൂര്യൻ" },
  { id: 6, name: "Kanni", malayalamName: "കന്നി", lord: "Budhan", lordMalayalam: "ബുധൻ" },
  { id: 7, name: "Thulam", malayalamName: "തുലാം", lord: "Shukran", lordMalayalam: "ശുക്രൻ" },
  { id: 8, name: "Vrischikam", malayalamName: "വൃശ്ചികം", lord: "Chovva", lordMalayalam: "ചൊവ്വ" },
  { id: 9, name: "Dhanu", malayalamName: "ധനു", lord: "Vyazham", lordMalayalam: "വ്യാഴം" },
  { id: 10, name: "Makaram", malayalamName: "മകരം", lord: "Shani", lordMalayalam: "ശനി" },
  { id: 11, name: "Kumbham", malayalamName: "കുംഭം", lord: "Shani", lordMalayalam: "ശനി" },
  { id: 12, name: "Meenam", malayalamName: "മീനം", lord: "Vyazham", lordMalayalam: "വ്യാഴം" },
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
  "Lion": "Elephant",
  "Monkey": "Goat",
  "Goat": "Monkey"
};

export const YONI_FRIENDS: Record<string, string[]> = {
  "Horse": ["Elephant", "Monkey"],
  "Elephant": ["Horse", "Monkey"],
  "Goat": ["Cow"],
  "Cow": ["Goat"],
  "Cat": ["Serpent"],
  "Serpent": ["Cat"],
  "Rat": ["Dog"],
  "Dog": ["Rat"]
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
