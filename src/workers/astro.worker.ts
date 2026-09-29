import * as Comlink from 'comlink';
import { calculateIndepth } from '../utils/indepth';
import { calculatePorutham } from '../utils/porutham';
import { calculateDasaTimeline } from '../utils/dasa';
import { findMuhurthams } from '../utils/muhurtham';

const astroWorker = {
  calculateIndepth: async (boy: any, girl: any) => {
    return await calculateIndepth(boy, girl);
  },
  calculatePorutham: (
    girlStarId: number, 
    boyStarId: number,
    girlPada: number = 1,
    boyPada: number = 1,
    girlRasi?: string,
    boyRasi?: string
  ) => {
    return calculatePorutham(girlStarId, boyStarId, girlPada, boyPada, girlRasi, boyRasi);
  },
  calculateDasaTimeline: (starId: number, dob: string, time?: string, pada?: number) => {
    return calculateDasaTimeline(starId, dob, time, pada);
  },
  findMuhurthams: (girlStarId: number, boyStarId: number) => {
    return findMuhurthams(girlStarId, boyStarId);
  }
};

export type AstroWorker = typeof astroWorker;
Comlink.expose(astroWorker);
