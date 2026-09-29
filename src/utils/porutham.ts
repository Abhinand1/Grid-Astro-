import { NAKSHATRAS, Nakshatra } from './astroData';
import { evaluateDasaPorutham, PoruthamBreakdown, PoruthamItem } from './keralaMatchEngine';

export interface PoruthamResult {
  name: string;
  malayalamName: string;
  status: 'Uthamam' | 'Madhyamam' | 'Adhamam';
  score: number;
  maxScore: number;
  description: string;
  isFatalVeto?: boolean;
}

export interface MatchReport {
  totalScore: number;
  results: PoruthamResult[];
  isMatch: boolean;
  overallRecommendation: string;
  breakdown?: PoruthamBreakdown;
}

export function calculatePorutham(
  girlStarId: number, 
  boyStarId: number, 
  girlPada: number = 1, 
  boyPada: number = 1,
  girlRasi?: string,
  boyRasi?: string
): MatchReport {
  const girlStar = NAKSHATRAS.find(n => n.id === girlStarId);
  const boyStar = NAKSHATRAS.find(n => n.id === boyStarId);

  if (!girlStar || !boyStar) {
    throw new Error("Invalid Star ID");
  }

  const evaluation = evaluateDasaPorutham(
    girlStar,
    boyStar,
    girlPada,
    boyPada,
    girlRasi,
    boyRasi
  );

  const results: PoruthamResult[] = evaluation.items.map(item => ({
    name: item.name,
    malayalamName: item.malayalamName,
    status: item.traditionalStatus,
    score: item.score,
    maxScore: item.maxScore,
    description: item.description,
    isFatalVeto: item.isFatalVeto
  }));

  const isMatch = !evaluation.vetoRajju && !evaluation.vetoVedha && evaluation.totalScore >= 5.0;

  let overallRecommendation = "";
  if (evaluation.vetoRajju || evaluation.vetoVedha) {
    overallRecommendation = "Not Recommended: Mandatory VETO conditions (Rajju or Vedha) failed. Match is strictly discouraged regardless of score.";
  } else if (evaluation.totalScore >= 8.0) {
    overallRecommendation = "Ulkrishtam (Excellent): 8-10 poruthams pass, Rajju and Vedha are both clear. Highly recommended match.";
  } else if (evaluation.totalScore >= 6.0) {
    overallRecommendation = "Madhyamam (Good): 6-7 poruthams pass, Rajju and Vedha are both clear. Good match.";
  } else if (evaluation.totalScore >= 5.0) {
    overallRecommendation = "Borderline Acceptable: 5 poruthams pass. Check Papasamyam and consult an astrologer.";
  } else {
    overallRecommendation = `Not Recommended: Dashakoota score is below threshold (${evaluation.totalScore}/10).`;
  }

  return {
    totalScore: evaluation.totalScore,
    results,
    isMatch,
    overallRecommendation,
    breakdown: evaluation.breakdown
  };
}
