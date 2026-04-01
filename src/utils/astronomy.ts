import * as Astronomy from 'astronomy-engine';
import { NAKSHATRAS, RASIS } from './astroData';

export function getAyanamsa(date: Date): number {
  const year = date.getUTCFullYear() + date.getUTCMonth() / 12 + date.getUTCDate() / 365;
  return 23.853 + (year - 2000) * (50.29 / 3600);
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
      status = 'Very Bad';
      statusMalayalam = 'വളരെ മോശം (അഷ്ടമ ശനി/ചന്ദ്രൻ)';
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
