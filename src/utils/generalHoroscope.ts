import * as Astronomy from 'astronomy-engine';
import { NAKSHATRAS, RASIS } from './astroData';
import { getAyanamsa, getPlanetSiderealLongitude } from './astronomy';

export interface HoroscopeReading {
  name: string;
  dob: string;
  time: string;
  place: string;
  nakshatra: string;
  nakshatraMalayalam: string;
  pada: number;
  rasi: string;
  rasiMalayalam: string;
  lagna: string;
  lagnaMalayalam: string;
  rulingPlanet: string;
  rulingPlanetMalayalam: string;
  
  // Biological & Cosmic attributes
  nakshatraTree: string; // വൃക്ഷം
  nakshatraAnimal: string; // മൃഗം
  nakshatraBird: string; // പക്ഷി
  nakshatraElement: string; // ഭൂതം
  nakshatraGana: string; // ഗണം
  deity: string; // അധിദേവത
  luckyGem: string; // ഭാഗ്യരത്നം
  luckyColor: string; // ഭാഗ്യനിറം
  luckyNumber: number; // ഭാഗ്യസംഖ്യ
  luckyDay: string; // ഭാഗ്യദിനം
  luckyDirection: string; // ഭാഗ്യദിശ
  
  // In-depth Readings (English & Malayalam)
  personality: { en: string; ml: string };
  career: { en: string; ml: string };
  finance: { en: string; ml: string };
  marriage: { en: string; ml: string };
  health: { en: string; ml: string };
  remedies: { en: string; ml: string };
  
  // Planetary positions in chart
  planets: Array<{
    name: string;
    nameMalayalam: string;
    rasi: string;
    rasiMalayalam: string;
    longitude: number;
    house: number;
  }>;
}

// Classical Nakshatra Attributes (Kerala Jyothisham tradition)
const NAKSHATRA_BIO: Record<number, {
  tree: string;
  animal: string;
  bird: string;
  element: string;
  gana: string;
  deity: string;
  gem: string;
  color: string;
  number: number;
  day: string;
  direction: string;
  nature: string;
  careerFields: string[];
}> = {
  1: { tree: 'കാഞ്ഞിരം (Kanjiram)', animal: 'കുതിര (Horse)', bird: 'പുള്ള് (Pullu)', element: 'ഭൂമി (Prithvi)', gana: 'ദേവഗണം (Deva)', deity: 'അശ്വിനീദേവന്മാർ (Ashwini Kumaras)', gem: 'വൈഡൂര്യം (Cat\'s Eye)', color: 'ചുവപ്പ് (Crimson)', number: 9, day: 'ചൊവ്വ (Tuesday)', direction: 'കിഴക്ക് (East)', nature: 'ധീരത, കർമ്മോത്സുകത, ക്ഷിപ്രപ്രസാദം', careerFields: ['വൈദ്യം / സർജറി', 'സാങ്കേതികവിദ്യ', 'സൈന്യം / പോലീസ്', 'സംരംഭകത്വം'] },
  2: { tree: 'നെല്ലി (Nelli)', animal: 'ആന (Elephant)', bird: 'പുള്ള് (Pullu)', element: 'ഭൂമി (Prithvi)', gana: 'മനുഷ്യഗണം (Manushya)', deity: 'യമധർമ്മൻ (Yama)', gem: 'വൈരം (Diamond)', color: 'വെള്ള (White)', number: 6, day: 'വെള്ളി (Friday)', direction: 'തെക്ക് (South)', nature: 'സത്യസന്ധത, സ്ഥിരോത്സാഹം, പ്രായോഗിക ബുദ്ധി', careerFields: ['നിയമം / നീതിന്യായം', 'കൃഷി & ഭൂമി', 'ആർട്ട്സ് & സിനിമ', 'ഭരണകാര്യങ്ങൾ'] },
  3: { tree: 'അത്തി (Atthi)', animal: 'ആട് (Goat)', bird: 'പുള്ള് (Pullu)', element: 'ഭൂമി (Prithvi)', gana: 'രാക്ഷസഗണം (Rakshasa)', deity: 'അഗ്നിദേവൻ (Agni)', gem: 'മാണിക്യം (Ruby)', color: 'ഓറഞ്ച് / ചുവപ്പ്', number: 1, day: 'ഞായർ (Sunday)', direction: 'കിഴക്ക് (East)', nature: 'തീവ്രമായ ബുദ്ധിശക്തി, നേതൃപാടവം, പവിത്രത', careerFields: ['ഭരണനേതൃത്വം', 'പ്രതിരോധം', 'മെറ്റലർജി / അഗ്നി സംബന്ധം', 'ഗവേഷണം'] },
  4: { tree: 'ഞാവൽ (Njaval)', animal: 'സർപ്പം (Serpent)', bird: 'പുള്ള് (Pullu)', element: 'ഭൂമി (Prithvi)', gana: 'മനുഷ്യഗണം (Manushya)', deity: 'ബ്രഹ്മാവ് (Brahma)', gem: 'മുത്ത് (Pearl)', color: 'വെളുപ്പ് (Pearl White)', number: 2, day: 'തിങ്കൾ (Monday)', direction: 'കിഴക്ക് (East)', nature: 'ആകർഷണീയമായ രൂപം, സത്യസന്ധത, സ്ഥിരത', careerFields: ['കല, ഡിസൈൻ & ഫാഷൻ', 'ധനകാര്യം & ബാങ്കിംഗ്', 'ഹോട്ടൽ & ആതിഥ്യം', 'കൃഷി'] },
  5: { tree: 'കരിങ്ങാലി (Karingali)', animal: 'സർപ്പം (Serpent)', bird: 'പുള്ള് (Pullu)', element: 'ഭൂമി (Prithvi)', gana: 'ദേവഗണം (Deva)', deity: 'ചന്ദ്രൻ / സോമൻ (Soma)', gem: 'പവിഴം (Coral)', color: 'വെള്ളി / ചുവപ്പ്', number: 9, day: 'ചൊവ്വ (Tuesday)', direction: 'വടക്ക് (North)', nature: 'സൗമ്യത, അന്വേഷണാത്മക ബുദ്ധി, സാഹിത്യരുചി', careerFields: ['എഴുത്ത്, പത്രപ്രവർത്തനം', 'ഐടി & സോഫ്റ്റ്‌വെയർ', 'യാത്രാവിഭാഗം', 'വിദ്യാഭ്യാസം'] },
  6: { tree: 'കരിമരം (Karimaram)', animal: 'നായ (Dog)', bird: 'പുള്ള് (Pullu)', element: 'ജലം (Jala)', gana: 'മനുഷ്യഗണം (Manushya)', deity: 'രുദ്രൻ (Rudra)', gem: 'ഗോമേദകം (Hessonite)', color: 'കടും പച്ച (Deep Green)', number: 4, day: 'ബുധൻ (Wednesday)', direction: 'തെക്ക്-പടിഞ്ഞാറ് (South-West)', nature: 'തീവ്രത, ശാസ്ത്രജ്ഞാനം, വെല്ലുവിളികളെ അതിജീവിക്കൽ', careerFields: ['ശാസ്ത്രഗവേഷണം', 'കംപ്യൂട്ടർ പ്രോഗ്രാമിംഗ്', 'ഫാർമസ്യൂട്ടിക്കൽസ്', 'കമ്മ്യൂണിക്കേഷൻ'] },
  7: { tree: 'മുള (Mula)', animal: 'പൂച്ച (Cat)', bird: 'ഹംസം (Swan)', element: 'ജലം (Jala)', gana: 'ദേവഗണം (Deva)', deity: 'അദിതി (Aditi)', gem: 'മഞ്ഞ പുഷ്യരാഗം (Yellow Sapphire)', color: 'മഞ്ഞ (Yellow)', number: 3, day: 'വ്യാഴം (Thursday)', direction: 'വടക്ക് (North)', nature: 'ആത്മീയത, കാരുണ്യം, സമാധാനപ്രിയത', careerFields: ['അധ്യാപനം / പ്രൊഫസർ', 'കൗൺസിലിംഗ് / സൈക്കോളജി', 'പബ്ലിഷിംഗ്', 'ആത്മീയ രംഗം'] },
  8: { tree: 'അരയാൽ (Arayal)', animal: 'ആട് (Goat)', bird: 'കാക്ക (Crow)', element: 'ജലം (Jala)', gana: 'ദേവഗണം (Deva)', deity: 'ബൃഹസ്പതി (Brihaspati)', gem: 'നീലക്കല്ല് (Blue Sapphire)', color: 'കടും നീല (Navy Blue)', number: 8, day: 'ശനി (Saturday)', direction: 'വടക്ക് (North)', nature: 'പരോപകാരം, സദാചാരബോധം, ഈശ്വരഭക്തി', careerFields: ['ബാങ്കിംഗ് & ഓഡിറ്റിംഗ്', 'ഭരണനിർവ്വഹണം', 'ആതുരസേവനം', 'മതപരവും ജീവകാരുണ്യവുമായ പ്രവർത്തനങ്ങൾ'] },
  9: { tree: 'നാകം (Nakam)', animal: 'കരിമ്പൂച്ച (Black Cat)', bird: 'ചെമ്പോത്ത് (Pheasant)', element: 'ജലം (Jala)', gana: 'രാക്ഷസഗണം (Rakshasa)', deity: 'നാഗങ്ങൾ (Sarpas)', gem: 'മരതകം (Emerald)', color: 'പച്ച (Green)', number: 5, day: 'ബുധൻ (Wednesday)', direction: 'തെക്ക് (South)', nature: 'തന്ത്രജ്ഞത, ഏകാഗ്രത, നിഗൂഢശാസ്ത്ര താല്പര്യം', careerFields: ['രഹസ്യാന്വേഷണം / സിവിൽ സർവീസ്', 'അക്കൗണ്ടൻസി', 'സാഹിത്യം / തത്ത്വചിന്ത', 'ഫാർമസി'] },
  10: { tree: 'പേരാൽ (Peral)', animal: 'ആൺ എലി (Male Rat)', bird: 'ചെമ്പോത്ത് (Pheasant)', element: 'അഗ്നി (Agni)', gana: 'രാക്ഷസഗണം (Rakshasa)', deity: 'പിതൃക്കൾ (Pitrus)', gem: 'വൈഡൂര്യം (Cat\'s Eye)', color: 'മഞ്ഞ കലർന്ന ചുവപ്പ്', number: 7, day: 'ഞായർ (Sunday)', direction: 'കിഴക്ക് (East)', nature: 'രാജകീയ പ്രകൃതം, പാരമ്പര്യബഹുമാനം, കർക്കശത', careerFields: ['രാഷ്ട്രീയം & നേതൃത്വം', 'ബിസിനസ്സ് ഉടമസ്ഥത', 'ചരിത്രം / പുരാവസ്തു ഗവേഷണം', 'കൺസ്ട്രക്ഷൻ'] },
  11: { tree: 'ഇത്തി (Itthi)', animal: 'എലി (Rat)', bird: 'ചെമ്പോത്ത് (Pheasant)', element: 'അഗ്നി (Agni)', gana: 'മനുഷ്യഗണം (Manushya)', deity: 'ഭഗൻ (Bhaga)', gem: 'വൈരം (Diamond)', color: 'നീല (Sky Blue)', number: 6, day: 'വെള്ളി (Friday)', direction: 'വടക്ക് (North)', nature: 'ആഡംബരപ്രിയം, ഉദാരമനസ്കത, സൗഹൃദം', careerFields: ['കല, സംഗീതം, വിനോദം', 'ഹ്യൂമൻ റിസോഴ്സസ് (HR)', 'മാർക്കറ്റിംഗ്', 'റിയൽ എസ്റ്റേറ്റ്'] },
  12: { tree: 'പ്ലാശ് (Plash)', animal: 'പശു (Cow)', bird: 'കാക്ക (Crow)', element: 'അഗ്നി (Agni)', gana: 'മനുഷ്യഗണം (Manushya)', deity: 'ആര്യമാവ് (Aryama)', gem: 'മാണിക്യം (Ruby)', color: 'ചുവപ്പ് (Red)', number: 1, day: 'ഞായർ (Sunday)', direction: 'കിഴക്ക് (East)', nature: 'ധർമ്മബോധം, സത്യസന്ധത, സഹായമനസ്ഥിതി', careerFields: ['വിദ്യാഭ്യാസ സ്ഥാപനങ്ങൾ', 'സാമൂഹിക പ്രവർത്തനം', 'ഗവൺമെന്റ് അഡ്മിനിസ്ട്രേഷൻ', 'നിയമം'] },
  13: { tree: 'അമ്പാഴം (Ambazham)', animal: 'പോത്ത് (Buffalo)', bird: 'കോഴി (Cock)', element: 'അഗ്നി (Agni)', gana: 'ദേവഗണം (Deva)', deity: 'സൂര്യൻ (Savitr)', gem: 'മുത്ത് (Pearl)', color: 'വെള്ള (White)', number: 2, day: 'തിങ്കൾ (Monday)', direction: 'തെക്ക് (South)', nature: 'കൈത്തഴക്കം, വിവേകം, ശാന്തത, നർമ്മബോധം', careerFields: ['ശില്പകല / ആർക്കിടെക്ചർ', 'മെഡിസിൻ & നേഴ്സിംഗ്', 'അക്കൗണ്ടിംഗ്', 'കൈത്തൊഴിലുകൾ'] },
  14: { tree: 'കൂവളം (Koovalam)', animal: 'പെൺപുലി (Tigress)', bird: 'തൂക്കണാംകുരുവി', element: 'അഗ്നി (Agni)', gana: 'രാക്ഷസഗണം (Rakshasa)', deity: 'ത്വഷ്ടാവ് (Twashtar)', gem: 'പവിഴം (Red Coral)', color: 'കറുപ്പ് / ചുവപ്പ്', number: 9, day: 'ചൊവ്വ (Tuesday)', direction: 'പടിഞ്ഞാറ് (West)', nature: 'സൗന്ദര്യബോധം, വശീകരണശക്തി, വാക്ചാതുര്യം', careerFields: ['ഡിസൈൻ & ഫാഷൻ', 'എൻജിനീയറിംഗ്', 'ആഭരണ നിർമ്മാണം', 'ഇന്റീരിയർ ഡിസൈനിംഗ്'] },
  15: { tree: 'മരുത് (Maruthu)', animal: 'പോത്ത് (Buffalo)', bird: 'തൂക്കണാംകുരുവി', element: 'വായു (Vayu)', gana: 'ദേവഗണം (Deva)', deity: 'വായുദേവൻ (Vayu)', gem: 'ഗോമേദകം (Hessonite)', color: 'മഞ്ഞ (Yellow)', number: 4, day: 'വെള്ളി (Friday)', direction: 'വടക്ക് (North)', nature: 'സ്വാതന്ത്ര്യദാഹം, നീതിബോധം, ആത്മനിയന്ത്രണം', careerFields: ['വ്യോമയാനം / പൈലറ്റ്', 'ഇംപോർട്ട്-എക്സ്പോർട്ട്', 'വാണിജ്യം', 'സാഹിത്യം'] },
  16: { tree: 'ഇലഞ്ഞി (Ilanji)', animal: 'മാൻ (Deer)', bird: 'മയിൽ (Peacock)', element: 'വായു (Vayu)', gana: 'ദേവഗണം (Deva)', deity: 'മിത്രൻ (Mitra)', gem: 'നീലക്കല്ല് (Blue Sapphire)', color: 'കടും ചുവപ്പ് (Maroon)', number: 8, day: 'ശനി (Saturday)', direction: 'തെക്ക് (South)', nature: 'ദൃഢനിശ്ചയം, യാത്രാതാല്പര്യം, സൗഹൃദപ്രിയം', careerFields: ['വിദേശകാര്യം & എംബസി', 'സാമൂഹിക നന്മ', 'ഖനന വ്യവസായം', 'സംഗീതം'] },
  17: { tree: 'വെട്ടി (Vetti)', animal: 'മാൻ (Deer)', bird: 'ചെമ്പോത്ത് (Pheasant)', element: 'വായു (Vayu)', gana: 'രാക്ഷസഗണം (Rakshasa)', deity: 'ഇന്ദ്രൻ (Indra)', gem: 'മരതകം (Emerald)', color: 'പച്ച (Emerald Green)', number: 5, day: 'ബുധൻ (Wednesday)', direction: 'കിഴക്ക് (East)', nature: 'നേതൃപാടവം, ആത്മവിശ്വാസം, ജയദാഹം', careerFields: ['സൈനിക നേതൃത്വം', 'ബിസിനസ്സ് മാനേജ്‌മെന്റ്', 'കായികം (Sports)', 'സാങ്കേതിക ഗവേഷണം'] },
  18: { tree: 'പൈൻ (Pine)', animal: 'നായ (Dog)', bird: 'ചെമ്പോത്ത് (Pheasant)', element: 'വായു (Vayu)', gana: 'രാക്ഷസഗണം (Rakshasa)', deity: 'നിര്യതി (Nirriti)', gem: 'വൈഡൂര്യം (Cat\'s Eye)', color: 'മഞ്ഞ കലർന്ന പച്ച', number: 7, day: 'വ്യാഴം (Thursday)', direction: 'തെക്ക്-പടിഞ്ഞാറ് (South-West)', nature: 'ഗഹനമായ ചിന്ത, ധൈര്യം, തത്ത്വചിന്ത', careerFields: ['ഗവേഷണം / റിസർച്ച്', 'തത്ത്വശാസ്ത്രം & ജ്യോതിഷം', 'ഔഷധ നിർമ്മാണം', 'സൈക്കോളജി'] },
  19: { tree: 'ആച്ച (Aacha)', animal: 'കുരങ്ങ് (Monkey)', bird: 'ഹംസം (Swan)', element: 'വായു (Vayu)', gana: 'മനുഷ്യഗണം (Manushya)', deity: 'ജലം / വരുണൻ (Varuna)', gem: 'വൈരം (Diamond)', color: 'വെള്ള (Milky White)', number: 6, day: 'വെള്ളി (Friday)', direction: 'പടിഞ്ഞാറ് (West)', nature: 'ദയ, സൗമ്യത, വിട്ടുവീഴ്ചാമനോഭാവം', careerFields: ['സമുദ്രഗതാഗതം / നേവി', 'ജലവിതരണം & കൃഷി', 'മ്യൂസിക് & തിയേറ്റർ', 'ട്രാവൽ ഗൈഡ്'] },
  20: { tree: 'പ്ലാവ് (Plavu)', animal: 'കാള (Bull)', bird: 'ഹംസം (Swan)', element: 'ആകാശം (Akasha)', gana: 'മനുഷ്യഗണം (Manushya)', deity: 'വിശ്വദേവന്മാർ (Vishvadevas)', gem: 'മാണിക്യം (Ruby)', color: 'ചെമ്പ് നിറം (Copper)', number: 1, day: 'ഞായർ (Sunday)', direction: 'വടക്ക് (North)', nature: 'വിനയം, ഈശ്വരഭക്തി, ഉന്നത ചിന്താഗതി', careerFields: ['സിവിൽ സർവീസ് (IAS/IPS)', 'രാഷ്ട്രീയം', 'നിയമജ്ഞൻ / ജഡ്ജി', 'അക്കാദമിക്സ്'] },
  21: { tree: 'എരുക്ക് (Erukku)', animal: 'പെൺകുരങ്ങ് (Female Monkey)', bird: 'കോഴി (Cock)', element: 'ആകാശം (Akasha)', gana: 'ദേവഗണം (Deva)', deity: 'മഹാവിഷ്ണു (Maha Vishnu)', gem: 'മുത്ത് (Pearl)', color: 'ഇളം നീല (Cyan)', number: 2, day: 'തിങ്കൾ (Monday)', direction: 'വടക്ക് (North)', nature: 'സത്യനിഷ്ഠ, വിജ്ഞാനതൃഷ്ണ, ശുഭാപ്തിവിശ്വാസം', careerFields: ['മാധ്യമപ്രവർത്തനം / ആങ്കറിംഗ്', 'വിദ്യാഭ്യാസം & ലൈബ്രറി', 'ആതുരസേവനം', 'മതപ്രഭാഷണം'] },
  22: { tree: 'വഹ്നി (Vahni)', animal: 'പെൺസിംഹം (Lioness)', bird: 'മയിൽ (Peacock)', element: 'ആകാശം (Akasha)', gana: 'രാക്ഷസഗണം (Rakshasa)', deity: 'അഷ്ടവസുക്കൾ (Ashta Vasus)', gem: 'പവിഴം (Coral)', color: 'വെള്ളി / ചുവപ്പ്', number: 9, day: 'ചൊവ്വ (Tuesday)', direction: 'കിഴക്ക് (East)', nature: 'ധീരത, സംഗീതവാസന, ഔദാര്യം', careerFields: ['സംഗീതം & അഭിനയം', 'റിയൽ എസ്റ്റേറ്റ് & ഭൂമി', 'ശസ്ത്രക്രിയ', 'സാങ്കേതികവിദ്യ'] },
  23: { tree: 'കടമ്പ് (Kadambu)', animal: 'കുതിര (Horse)', bird: 'കാക്ക (Crow)', element: 'ആകാശം (Akasha)', gana: 'രാക്ഷസഗണം (Rakshasa)', deity: 'വരുണൻ (Varuna)', gem: 'ഗോമേദകം (Hessonite)', color: 'നീല കലർന്ന പച്ച', number: 4, day: 'ശനി (Saturday)', direction: 'തെക്ക് (South)', nature: 'സത്യസന്ധത, ശാസ്ത്രജ്ഞാനം, രഹസ്യസ്വഭാവം', careerFields: ['ആസ്ട്രോണമി & സ്പേസ്', 'വൈദ്യശാസ്ത്ര ഗവേഷണം', 'ഇലക്ട്രോണിക്സ്', 'സൈക്കോളജിക്കൽ റിസർച്ച്'] },
  24: { tree: 'തേന്മാവ് (Thenmavu)', animal: 'ആൺസിംഹം (Lion)', bird: 'മയിൽ (Peacock)', element: 'ആകാശം (Akasha)', gana: 'മനുഷ്യഗണം (Manushya)', deity: 'അജൈകപാദ് (Ajaikapada)', gem: 'മഞ്ഞ പുഷ്യരാഗം (Yellow Sapphire)', color: 'മഞ്ഞ (Yellow)', number: 3, day: 'വ്യാഴം (Thursday)', direction: 'വടക്ക് (North)', nature: 'ആദർശധീരത, ആത്മീയത, വാഗ്വൈഭവം', careerFields: ['അധ്യാപനം', 'ധനകാര്യ ഉപദേശം', 'ജ്യോതിഷം & വേദാന്തം', 'സാമൂഹിക നേതൃത്വം'] },
  25: { tree: 'കരിമ്പന (Karimpana)', animal: 'പശു (Cow)', bird: 'മയിൽ (Peacock)', element: 'ആകാശം (Akasha)', gana: 'മനുഷ്യഗണം (Manushya)', deity: 'അഹിർബുധ്ന്യൻ (Ahirbudhnya)', gem: 'നീലക്കല്ല് (Blue Sapphire)', color: 'കടും നീല / പർപ്പിൾ', number: 8, day: 'ശനി (Saturday)', direction: 'വടക്ക് (North)', nature: 'ശാന്തത, ദയ, വാക്ചാതുര്യം, കുടുംബസ്നേഹം', careerFields: ['നിയമ രംഗം', 'മെഡിസിൻ & കെയർ', 'ധനകാര്യം', 'ജീവകാരുണ്യ സ്ഥാപനങ്ങൾ'] },
  26: { tree: 'ഇരിപ്പ (Irippa)', animal: 'പെൺആന (Female Elephant)', bird: 'മയിൽ (Peacock)', element: 'ആകാശം (Akasha)', gana: 'ദേവഗണം (Deva)', deity: 'പൂഷാവ് (Pushan)', gem: 'മരതകം (Emerald)', color: 'തവിട്ട് / പച്ച', number: 5, day: 'ബുധൻ (Wednesday)', direction: 'കിഴക്ക് (East)', nature: 'സൗമ്യത, സഹായമനസ്കത, സ്വതന്ത്ര ചിന്ത', careerFields: ['ബാങ്കിംഗ് & ഓഡിറ്റിംഗ്', 'കല & സാഹിത്യം', 'വിദേശ വ്യാപാരം', 'ടൂറിസം'] },
  27: { tree: 'ഇരിപ്പ (Irippa)', animal: 'പെൺആന (Female Elephant)', bird: 'മയിൽ (Peacock)', element: 'ആകാശം (Akasha)', gana: 'ദേവഗണം (Deva)', deity: 'പൂഷാവ് (Pushan)', gem: 'മരതകം (Emerald)', color: 'തവിട്ട് / പച്ച', number: 5, day: 'ബുധൻ (Wednesday)', direction: 'കിഴക്ക് (East)', nature: 'സൗമ്യത, സഹായമനസ്കത, സ്വതന്ത്ര ചിന്ത', careerFields: ['ബാങ്കിംഗ് & ഓഡിറ്റിംഗ്', 'കല & സാഹിത്യം', 'വിദേശ വ്യാപാരം', 'ടൂറിസം'] }
};

export function generateGeneralHoroscope(params: {
  name: string;
  dob: string;
  time: string;
  place: string;
  starId?: number;
  pada?: number;
}): HoroscopeReading {
  const { name, dob, time, place } = params;
  
  // Parse date and time
  const [year, month, day] = dob.split('-').map(Number);
  const [hours, minutes] = (time || '12:00').split(':').map(Number);
  const birthDate = new Date(Date.UTC(year, (month || 1) - 1, day || 1, hours || 12, minutes || 0, 0));

  // 1. Calculate Real Moon Sidereal Longitude using Astronomy Engine
  const moonLon = getPlanetSiderealLongitude(Astronomy.Body.Moon, birthDate);
  const calculatedStarIndex = Math.floor(moonLon / (360 / 27));
  const starId = params.starId || (calculatedStarIndex + 1);
  const star = NAKSHATRAS.find(s => s.id === starId) || NAKSHATRAS[0];

  // Pada calculation: Each Nakshatra (13°20' = 800') has 4 padas of 3°20' (200')
  const degreesInStar = moonLon % (360 / 27);
  const pada = params.pada || (Math.floor(degreesInStar / (360 / 108)) + 1);

  // Rasi calculation
  const moonRasiIndex = Math.floor(moonLon / 30);
  const rasi = RASIS[moonRasiIndex]?.name || star.defaultRashi;
  const defaultRasiObj = RASIS.find(r => r.name === star.defaultRashi);
  const rasiMalayalam = RASIS[moonRasiIndex]?.malayalamName || defaultRasiObj?.malayalamName || 'മേടം';

  // Lagna (Ascendant) approximation based on birth time & Sun
  const sunLon = getPlanetSiderealLongitude(Astronomy.Body.Sun, birthDate);
  const sunRasiIndex = Math.floor(sunLon / 30);
  // At sunrise (~6 AM), Lagna matches Sun sign; moves 1 sign every ~2 hours
  const hoursSinceSunrise = (hours - 6 + 24) % 24;
  const lagnaRasiIndex = (sunRasiIndex + Math.floor(hoursSinceSunrise / 2)) % 12;
  const lagna = RASIS[lagnaRasiIndex]?.name || 'Mesha';
  const lagnaMalayalam = RASIS[lagnaRasiIndex]?.malayalamName || 'മേടം';

  // Calculate positions of all 9 planets
  const planetList: Array<{ name: string; nameMl: string; body: Astronomy.Body | 'Rahu' | 'Ketu' }> = [
    { name: 'Sun', nameMl: 'സൂര്യൻ', body: Astronomy.Body.Sun },
    { name: 'Moon', nameMl: 'ചന്ദ്രൻ', body: Astronomy.Body.Moon },
    { name: 'Mars', nameMl: 'ചൊവ്വ', body: Astronomy.Body.Mars },
    { name: 'Mercury', nameMl: 'ബുധൻ', body: Astronomy.Body.Mercury },
    { name: 'Jupiter', nameMl: 'വ്യാഴം', body: Astronomy.Body.Jupiter },
    { name: 'Venus', nameMl: 'ശുക്രൻ', body: Astronomy.Body.Venus },
    { name: 'Saturn', nameMl: 'ശനി', body: Astronomy.Body.Saturn },
    { name: 'Rahu', nameMl: 'രാഹു', body: 'Rahu' },
    { name: 'Ketu', nameMl: 'കേതു', body: 'Ketu' }
  ];

  const planets = planetList.map(p => {
    const lon = getPlanetSiderealLongitude(p.body as any, birthDate);
    const pRasiIndex = Math.floor(lon / 30);
    // House relative to Lagna
    let house = pRasiIndex - lagnaRasiIndex + 1;
    if (house <= 0) house += 12;

    return {
      name: p.name,
      nameMalayalam: p.nameMl,
      rasi: RASIS[pRasiIndex].name,
      rasiMalayalam: RASIS[pRasiIndex].malayalamName,
      longitude: Number(lon.toFixed(2)),
      house
    };
  });

  const bio = NAKSHATRA_BIO[star.id] || NAKSHATRA_BIO[1];

  return {
    name: name || 'Jathakar',
    dob,
    time: time || '12:00',
    place: place || 'Kerala, India',
    nakshatra: star.name,
    nakshatraMalayalam: star.malayalamName,
    pada,
    rasi,
    rasiMalayalam,
    lagna,
    lagnaMalayalam,
    rulingPlanet: star.rulingPlanet,
    rulingPlanetMalayalam: star.rulingPlanetMalayalam,
    
    nakshatraTree: bio.tree,
    nakshatraAnimal: bio.animal,
    nakshatraBird: bio.bird,
    nakshatraElement: bio.element,
    nakshatraGana: bio.gana,
    deity: bio.deity,
    luckyGem: bio.gem,
    luckyColor: bio.color,
    luckyNumber: bio.number,
    luckyDay: bio.day,
    luckyDirection: bio.direction,

    personality: {
      en: `Born under the sacred star ${star.name} (${pada}th Pada) in ${rasi} Rasi, you possess ${bio.nature.toLowerCase()}. Your innate intellect and spiritual balance grant you a commanding aura. You value integrity, maintain an unyielding spirit in the face of adversity, and inspire trust in your community.`,
      ml: `${star.malayalamName} നക്ഷത്രത്തിൽ (${pada}-ാം പാദത്തിൽ), ${rasiMalayalam} രാശിയിൽ ജനിച്ച താങ്കൾ ${bio.nature} എന്നിവ ഒത്തിണങ്ങിയ പ്രകൃതമുള്ള വ്യക്തിയാണ്. സ്വാഭാവികമായ ധൈര്യവും നീതിബോധവും മറ്റുള്ളവർക്ക് താങ്കളിലുള്ള വിശ്വാസ്യത വർദ്ധിപ്പിക്കുന്നു. ആത്മാർത്ഥതയും കാര്യപ്രാപ്തിയും താങ്കളുടെ പ്രധാന സവിശേഷതകളാണ്.`
    },

    career: {
      en: `Your astrological combinations strongly support professional success in ${bio.careerFields.join(', ')}. Under ${star.rulingPlanet}'s governance, you are best suited for leadership positions, strategic decision-making, and specialized intellectual ventures where independence is valued.`,
      ml: `ജ്യോതിഷപരമായി താങ്കൾക്ക് ഏറ്റവും അനുയോജ്യമായ തൊഴിൽ മേഖലകൾ: ${bio.careerFields.join(', ')} എന്നിവയാണ്. ${star.rulingPlanetMalayalam}ന്റെ സ്വാധീനം കാരണം സ്വതന്ത്രമായി ചുമതലകൾ നിർവ്വഹിക്കാനും നേതൃസ്ഥാനങ്ങളിലിരിക്കാനും താങ്കൾക്ക് പ്രത്യേക പ്രാപ്തിയുണ്ടാകും.`
    },

    finance: {
      en: `Financial trajectory reveals steady growth with major gains through planned investments. Middle age brings notable prosperity and property accumulation. Exercising restraint during Mercury-Saturn or Rahu periods will safeguard your wealth.`,
      ml: `സാമ്പത്തികമായി ക്രമാനുഗതമായ പുരോഗതിയും സമ്പാദ്യ വർദ്ധനവും ഫലം. വസ്തുവകകളും ഗൃഹവും സ്വന്തമാക്കാൻ അനുകൂലമായ യോഗമുണ്ട്. അവിചാരിത ചെലവുകൾ നിയന്ത്രിക്കുകയും ദീർഘകാല നിക്ഷേപങ്ങളിൽ ശ്രദ്ധ കേന്ദ്രീകരിക്കുകയും ചെയ്യുന്നത് സാമ്പത്തിക ഭദ്രത ഉറപ്പാക്കും.`
    },

    marriage: {
      en: `Marital life will be characterized by mutual affection, emotional depth, and joint growth. Maintaining open communication and avoiding minor ego clashes during transit cycles will ensure harmony and longevity in relationships.`,
      ml: `ദാമ്പത്യജീവിതത്തിൽ സ്നേഹവും പരസ്പര ധാരണയും നിലനിൽക്കും. പങ്കാളിയുമായുള്ള തുറന്ന ആശയവിനിമയം കുടുംബത്തിൽ സമാധാനവും ഐശ്വര്യവും കൊണ്ടുവരും. ചെറിയ അഭിപ്രായവ്യത്യാസങ്ങൾ ചർച്ചകളിലൂടെ പരിഹരിക്കുന്നത് ദാമ്പത്യസൗഖ്യം വർദ്ധിപ്പിക്കും.`
    },

    health: {
      en: `Vitality remains strong throughout life. Pay periodic attention to digestion, seasonal shifts, and proper sleep hygiene. Daily meditation and mild physical discipline will harmonize bodily doshas (Vata, Pitta, Kapha).`,
      ml: `പൊതുവെ നല്ല ആരോഗ്യവും രോഗപ്രതിരോധശേഷിയും നിലനിൽക്കും. ഉദരസംബന്ധമായ കാര്യങ്ങളിലും ഭക്ഷണക്രമത്തിലും ചിട്ട പാലിക്കുന്നത് ഉത്തമം. കൃത്യമായ വ്യായാമവും പ്രാണായാമവും മാനസിക ഉന്മേഷവും ദീർഘായുസ്സും പ്രദാനം ചെയ്യും.`
    },

    remedies: {
      en: `Worship Lord ${bio.deity.split(' ')[0]} regularly. Light a sesame-oil or ghee lamp on ${bio.day.split(' ')[0]}s. Chanting the ${star.name} Gayatri Mantra and wearing ${bio.gem.split(' ')[0]} will bestow divine protection and all-round auspiciousness.`,
      ml: `${bio.deity}യെ നിത്യവും പ്രാർത്ഥിക്കുക. ${bio.day}തോറും നെയ്‌വിളക്ക് കൊളുത്തുന്നത് അതീവ ഗുണകരമാണ്. ജന്മനാളുകളിൽ ക്ഷേത്രത്തിൽ ഗണപതിഹോമവും പ്രത്യേക അർച്ചനയും നടത്തുന്നത് സർവ്വവിഘ്നങ്ങളും അകറ്റി ജീവിതത്തിൽ ഭാഗ്യം കൊണ്ടുവരും.`
    },

    planets
  };
}
