import * as Comlink from 'comlink';
import { calculateIndepth } from '../utils/indepth';
import { calculatePorutham } from '../utils/porutham';
import { calculateDasaTimeline } from '../utils/dasa';
import { findMuhurthams } from '../utils/muhurtham';

const astroWorker = {
  calculateIndepth: async (boy: any, girl: any) => {
    return await calculateIndepth(boy, girl);
  },
  calculatePorutham: (boyStarId: number, girlStarId: number) => {
    return calculatePorutham(boyStarId, girlStarId);
  },
  calculateDasaTimeline: (starId: number, dob: string) => {
    return calculateDasaTimeline(starId, dob);
  },
  findMuhurthams: (girlStarId: number, boyStarId: number) => {
    return findMuhurthams(girlStarId, boyStarId);
  }
};

export type AstroWorker = typeof astroWorker;
Comlink.expose(astroWorker);
