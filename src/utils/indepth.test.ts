import { describe, test, expect } from 'vitest';
import { getRasi, getHouse } from './indepth';

describe('getRasi', () => {
  test('calculates rasi correctly for various longitudes', () => {
    expect(getRasi(0)).toBe(0);
    expect(getRasi(29.9)).toBe(0);
    expect(getRasi(30)).toBe(1);
    expect(getRasi(59.9)).toBe(1);
    expect(getRasi(60)).toBe(2);
    expect(getRasi(359.9)).toBe(11);
  });
});

describe('getHouse', () => {
  test('calculates house correctly for positive differences', () => {
    // planetRasi 5, referenceRasi 2 -> house 5 - 2 + 1 = 4
    expect(getHouse(5, 2)).toBe(4);
    // planetRasi 2, referenceRasi 2 -> house 2 - 2 + 1 = 1
    expect(getHouse(2, 2)).toBe(1);
  });

  test('calculates house correctly for negative differences (circular logic)', () => {
    // planetRasi 1, referenceRasi 5 -> house 1 - 5 + 1 = -3. -3 + 12 = 9
    expect(getHouse(1, 5)).toBe(9);
    // planetRasi 0, referenceRasi 11 -> house 0 - 11 + 1 = -10. -10 + 12 = 2
    expect(getHouse(0, 11)).toBe(2);
  });
});
