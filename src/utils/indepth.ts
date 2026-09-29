import { evaluateMarriageMatch, KeralaMatchEvaluationReport } from './keralaMatchEngine';
import { NAKSHATRAS } from './astroData';

export interface IndepthReport {
  papasamyam: {
    boyScore: number;
    girlScore: number;
    isCompatible: boolean;
    description: string;
  };
  chovvaDosham: {
    hasDosham: boolean;
    description: string;
  };
  dasaSandhi: {
    hasIssue: boolean;
    description: string;
  };
  madhamaranju: {
    hasIssue: boolean;
    description: string;
  };
  overallRecommendation: string;
  evaluationReport?: KeralaMatchEvaluationReport;
}

export async function calculateIndepth(boy: any, girl: any): Promise<IndepthReport> {
  const boyStar = NAKSHATRAS.find(n => n.id === boy.starId) || NAKSHATRAS[0];
  const girlStar = NAKSHATRAS.find(n => n.id === girl.starId) || NAKSHATRAS[0];

  const report = evaluateMarriageMatch({
    girl: {
      name: girl.name || 'Bride',
      nakshatra: girlStar.name,
      nakshatra_index: girlStar.id,
      pada: girl.pada || 1,
      chandra_rasi: girl.rasi || girlStar.defaultRashi,
      dob: girl.dob,
      time: girl.time
    },
    boy: {
      name: boy.name || 'Groom',
      nakshatra: boyStar.name,
      nakshatra_index: boyStar.id,
      pada: boy.pada || 1,
      chandra_rasi: boy.rasi || boyStar.defaultRashi,
      dob: boy.dob,
      time: boy.time
    }
  });

  const boyScore = report.papasamya_result.boy_points;
  const girlScore = report.papasamya_result.girl_points;
  const isPapasamyamCompatible = report.papasamya_result.status !== 'DEFICIT' || Math.abs(report.papasamya_result.difference) <= 1.0;

  const hasChovvaDosham = report.chovva_dosha_result.girl_status === 'ACTIVE_DOSHA' || report.chovva_dosha_result.boy_status === 'ACTIVE_DOSHA';
  const hasDasaSandhi = report.dasa_sandhi_result.status === 'NOT_RECOMMENDED_CRITICAL_COLLISION';

  // Madhamaranju Dosha:
  // In classical Kerala Jyothisham, Madhamaranju occurs if Makam and Pooram marry (Chingam stars) or specific star pairs under single sign affliction.
  const hasMadhamaranju = (boyStar.id === 10 && girlStar.id === 11) || (boyStar.id === 11 && girlStar.id === 10);

  return {
    papasamyam: {
      boyScore,
      girlScore,
      isCompatible: isPapasamyamCompatible,
      description: report.papasamya_result.description
    },
    chovvaDosham: {
      hasDosham: hasChovvaDosham,
      description: report.chovva_dosha_result.description
    },
    dasaSandhi: {
      hasIssue: hasDasaSandhi,
      description: report.dasa_sandhi_result.description
    },
    madhamaranju: {
      hasIssue: hasMadhamaranju,
      description: hasMadhamaranju
        ? 'മദമറഞ്ഞു ദോഷം കാണുന്നു (Madhamaranju Dosha: Makam-Pooram friction).'
        : 'മദമറഞ്ഞു ദോഷം ഇല്ല (No Madhamaranju dosha detected).'
    },
    overallRecommendation: report.final_verdict.summary,
    evaluationReport: report
  };
}
