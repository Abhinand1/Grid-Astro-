import { evaluateMarriageMatch, PersonProfile } from './keralaMatchEngine';
import { getSiderealMoonLongitude, calculateSiderealAscendant, getPlanetSiderealLongitude } from './astronomy';
import { NAKSHATRAS, RASIS, getRasiFromNakshatraPada } from './astroData';
import * as Astronomy from 'astronomy-engine';

export interface ForceMatchResult {
  success: boolean;
  failureReason?: string;
  originalBoy: PersonProfile;
  adjustedBoy?: PersonProfile;
  timeDifferenceMinutes?: number;
  timeDifferenceText?: string;
  matchReport?: any;
  planets?: { name: string; malayalam: string; rasi: string; rasiMalayalam: string; nakshatra: string; pada: number; degree: string }[];
  originalMatchReport?: any;
}

export function searchBestMatchingTime(
  girl: PersonProfile,
  boy: PersonProfile,
  lat = 10.0,
  lon = 76.3
): ForceMatchResult {
  const originalReport = evaluateMarriageMatch({ girl, boy });

  // Parse boy's original time
  const [origH, origM] = (boy.time || '12:00').split(':').map(Number);
  const origMinutes = (origH || 0) * 60 + (origM || 0);

  // Generate candidate time offsets sorted by absolute deviation
  const candidateOffsets: number[] = [];
  
  // Phase 1: Small adjustments (-120 to +120 mins in 5-min steps)
  for (let delta = 5; delta <= 120; delta += 5) {
    candidateOffsets.push(delta);
    candidateOffsets.push(-delta);
  }
  // Phase 2: Moderate adjustments (+-120 to +-360 mins in 10-min steps)
  for (let delta = 130; delta <= 360; delta += 10) {
    candidateOffsets.push(delta);
    candidateOffsets.push(-delta);
  }
  // Phase 3: Full 24-hour scan (any remaining minute of the day)
  for (let m = 0; m < 1440; m += 15) {
    const diff = m - origMinutes;
    if (!candidateOffsets.includes(diff)) {
      candidateOffsets.push(diff);
    }
  }

  // Sort candidate offsets by absolute distance
  candidateOffsets.sort((a, b) => Math.abs(a) - Math.abs(b));

  interface MatchCandidate {
    offset: number;
    minutes: number;
    timeStr: string;
    boyProfile: PersonProfile;
    report: any;
    score: number;
  }

  const passingCandidates: MatchCandidate[] = [];

  for (const offset of candidateOffsets) {
    const totalM = origMinutes + offset;
    if (totalM < 0 || totalM >= 1440) continue; // stay within the same birth date

    const h = Math.floor(totalM / 60);
    const m = totalM % 60;
    const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

    // Astronomical date for IST (UTC+5:30)
    const [by, bm, bd] = (boy.dob || '1995-01-01').split('-').map(Number);
    const utcDate = new Date(Date.UTC(by, bm - 1, bd, h - 5, m - 30));

    // Calculate Moon & Lagna
    const moonLon = getSiderealMoonLongitude(utcDate);
    const starIdx = Math.floor(moonLon / (360 / 27));
    const pada = Math.floor((moonLon % (360 / 27)) / (360 / 108)) + 1;
    const star = NAKSHATRAS[starIdx];
    const chandraRasi = getRasiFromNakshatraPada(star.id, pada);

    const lagnaLon = calculateSiderealAscendant(utcDate, lat, lon);
    const lagnaIdx = Math.floor(lagnaLon / 30);
    const lagnaRasi = RASIS[lagnaIdx]?.name || 'Medam';

    const candidateBoy: PersonProfile = {
      name: boy.name,
      nakshatra: star.name,
      nakshatra_index: star.id,
      pada,
      chandra_rasi: chandraRasi,
      lagna_rasi: lagnaRasi,
      dob: boy.dob,
      time: timeStr
    };

    const report = evaluateMarriageMatch({ girl, boy: candidateBoy });

    // Criteria for Definite Match:
    // 1. Rajju & Vedha must NOT be Not Satisfactory (Fatal Vetoes)
    const hasRajju = report.porutham_breakdown.rajju === 'Not Satisfactory';
    const hasVedha = report.porutham_breakdown.veda === 'Not Satisfactory';
    if (hasRajju || hasVedha) continue;

    // 2. Dashakoota score >= 6.0
    if (report.dashakoota_score < 6.0) continue;

    // 3. Chovva Dosham must not be incompatible
    if (report.chovva_dosha_result.overall_check === 'INCOMPATIBLE') continue;

    // 4. Papasamyam difference must be manageable (<= 1.5)
    if (Math.abs(report.papasamya_result.difference) > 1.5 && report.papasamya_result.status === 'DEFICIT') continue;

    // 5. Overall recommendation must be RECOMMENDED or CONDITIONAL_ACCEPTANCE
    if (report.final_verdict.recommendation === 'NOT_RECOMMENDED') continue;

    passingCandidates.push({
      offset,
      minutes: totalM,
      timeStr,
      boyProfile: candidateBoy,
      report,
      score: report.dashakoota_score
    });

    // If we find an excellent match with very small offset (<= 30 mins) and score >= 7.5, we can stop early
    if (Math.abs(offset) <= 30 && report.dashakoota_score >= 7.5) {
      break;
    }
  }

  if (passingCandidates.length === 0) {
    return {
      success: false,
      failureReason: `ഈ ജനന തീയതിയിൽ (${boy.dob}) ജനന സമയം മാത്രം മാറ്റി പൊരുത്തം ഉണ്ടാക്കുവാൻ സാധ്യമല്ല. ഈ ദിവസം മുഴുവൻ ചന്ദ്രൻ സഞ്ചരിക്കുന്നത് വധുവിന്റെ നക്ഷത്രവുമായി (${girl.nakshatra}) രജ്ജു/വേധ ദോഷങ്ങൾ ഉള്ള നക്ഷത്രത്തിലൂടെയാണ്. (Cannot force match with just born time on this date. The Moon's transit creates an unavoidable Rajju/Vedha affliction with the bride's star throughout this day.)`,
      originalBoy: boy,
      originalMatchReport: originalReport
    };
  }

  // Sort passing candidates:
  // We prefer smallest absolute time offset. If offset is within 15 mins, pick highest score.
  passingCandidates.sort((a, b) => {
    const absA = Math.abs(a.offset);
    const absB = Math.abs(b.offset);
    if (Math.abs(absA - absB) <= 20) {
      return b.score - a.score; // prioritize higher score if time difference is negligible
    }
    return absA - absB; // otherwise prioritize smallest time change
  });

  const best = passingCandidates[0];

  // Calculate planetary positions at the adjusted time
  const [by, bm, bd] = (best.boyProfile.dob || '1995-01-01').split('-').map(Number);
  const [bh, bmin] = (best.boyProfile.time || '12:00').split(':').map(Number);
  const adjUtcDate = new Date(Date.UTC(by, bm - 1, bd, bh - 5, bmin - 30));

  const planetConfigs = [
    { name: 'Sun', malayalam: 'സൂര്യൻ', body: Astronomy.Body.Sun },
    { name: 'Moon', malayalam: 'ചന്ദ്രൻ', body: Astronomy.Body.Moon },
    { name: 'Mars', malayalam: 'ചൊവ്വ', body: Astronomy.Body.Mars },
    { name: 'Mercury', malayalam: 'ബുധൻ', body: Astronomy.Body.Mercury },
    { name: 'Jupiter', malayalam: 'വ്യാഴം', body: Astronomy.Body.Jupiter },
    { name: 'Venus', malayalam: 'ശുക്രൻ', body: Astronomy.Body.Venus },
    { name: 'Saturn', malayalam: 'ശനി', body: Astronomy.Body.Saturn },
    { name: 'Rahu', malayalam: 'രാഹു', body: 'Rahu' as any },
    { name: 'Ketu', malayalam: 'കേതു', body: 'Ketu' as any }
  ];

  const planets = planetConfigs.map(p => {
    const lon = getPlanetSiderealLongitude(p.body, adjUtcDate);
    const rasiIdx = Math.floor(lon / 30);
    const rasi = RASIS[rasiIdx];
    const starIdx = Math.floor(lon / (360 / 27));
    const star = NAKSHATRAS[starIdx];
    const pada = Math.floor((lon % (360 / 27)) / (360 / 108)) + 1;
    const deg = (lon % 30).toFixed(1);
    return {
      name: p.name,
      malayalam: p.malayalam,
      rasi: rasi?.name || '',
      rasiMalayalam: rasi?.malayalamName || '',
      nakshatra: star?.name || '',
      pada,
      degree: deg
    };
  });

  const diffMin = best.offset;
  const diffSign = diffMin >= 0 ? '+' : '';
  const diffText = diffMin === 0 ? 'No time change required' : `${diffSign}${diffMin} minutes (${best.timeStr})`;

  return {
    success: true,
    originalBoy: boy,
    adjustedBoy: best.boyProfile,
    timeDifferenceMinutes: diffMin,
    timeDifferenceText: diffText,
    matchReport: best.report,
    planets,
    originalMatchReport: originalReport
  };
}
