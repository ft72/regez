import { describe, it, expect } from 'vitest';
import { numberRangePattern } from '../number-range';

/**
 * Helper: brute-force validate that every integer in [checkMin, checkMax]
 * matches iff it's in [rangeMin, rangeMax].
 */
function bruteForceValidate(rangeMin: number, rangeMax: number, checkMin: number, checkMax: number) {
  const pattern = numberRangePattern(rangeMin, rangeMax);
  const re = new RegExp(`^${pattern}$`);
  for (let i = checkMin; i <= checkMax; i++) {
    const expected = i >= rangeMin && i <= rangeMax;
    if (re.test(String(i)) !== expected) {
      throw new Error(
        `numberRange(${rangeMin}, ${rangeMax}): value ${i} — expected ${expected}, got ${!expected}. Pattern: ${pattern}`
      );
    }
  }
}

describe('numberRangePattern', () => {
  describe('edge cases', () => {
    it('min === max returns literal', () => {
      expect(numberRangePattern(5, 5)).toBe('5');
      expect(numberRangePattern(42, 42)).toBe('42');
      expect(numberRangePattern(0, 0)).toBe('0');
      expect(numberRangePattern(1000, 1000)).toBe('1000');
    });

    it('adjacent values', () => {
      const p = numberRangePattern(5, 6);
      const re = new RegExp(`^${p}$`);
      expect(re.test('5')).toBe(true);
      expect(re.test('6')).toBe(true);
      expect(re.test('4')).toBe(false);
      expect(re.test('7')).toBe(false);
    });

    it('0-0 returns literal "0"', () => {
      expect(numberRangePattern(0, 0)).toBe('0');
    });
  });

  describe('input validation', () => {
    it('throws for min > max', () => {
      expect(() => numberRangePattern(10, 5)).toThrow('min (10) must be <= max (5)');
    });

    it('throws for negative numbers', () => {
      expect(() => numberRangePattern(-1, 5)).toThrow('negative');
      expect(() => numberRangePattern(0, -1)).toThrow('negative');
    });

    it('throws for non-integer min', () => {
      expect(() => numberRangePattern(1.5, 5)).toThrow('integer');
    });

    it('throws for non-integer max', () => {
      expect(() => numberRangePattern(0, 3.7)).toThrow('integer');
    });

    it('throws for NaN', () => {
      expect(() => numberRangePattern(NaN, 5)).toThrow('integer');
    });

    it('throws for Infinity', () => {
      expect(() => numberRangePattern(0, Infinity)).toThrow('integer');
    });
  });

  describe('single digit ranges', () => {
    it('3-7', () => bruteForceValidate(3, 7, 0, 9));
    it('0-9', () => bruteForceValidate(0, 9, 0, 15));
    it('0-0', () => bruteForceValidate(0, 0, 0, 5));
    it('0-1', () => bruteForceValidate(0, 1, 0, 5));
    it('8-9', () => bruteForceValidate(8, 9, 0, 15));
  });

  describe('two digit ranges', () => {
    it('10-99', () => bruteForceValidate(10, 99, 0, 110));
    it('11-22', () => bruteForceValidate(11, 22, 0, 30));
    it('19-21', () => bruteForceValidate(19, 21, 15, 25));
    it('55-55', () => bruteForceValidate(55, 55, 50, 60));
  });

  describe('cross-digit-count ranges', () => {
    it('0-255 (IPv4 octet)', () => bruteForceValidate(0, 255, 0, 300));
    it('1-12 (months)', () => bruteForceValidate(1, 12, 0, 15));
    it('1-31 (days)', () => bruteForceValidate(1, 31, 0, 40));
    it('0-99', () => bruteForceValidate(0, 99, 0, 110));
    it('5-15', () => bruteForceValidate(5, 15, 0, 20));
    it('0-100', () => bruteForceValidate(0, 100, 0, 110));
    it('99-100', () => bruteForceValidate(99, 100, 95, 105));
  });

  describe('three digit ranges', () => {
    it('100-999', () => bruteForceValidate(100, 999, 90, 1050));
    it('65-128', () => bruteForceValidate(65, 128, 0, 200));
    it('100-255', () => bruteForceValidate(100, 255, 90, 300));
    it('200-249', () => bruteForceValidate(200, 249, 195, 260));
    it('250-255', () => bruteForceValidate(250, 255, 245, 260));
  });

  describe('four digit ranges', () => {
    it('1900-2099 (years)', () => bruteForceValidate(1900, 2099, 1890, 2110));
    it('1000-9999', () => bruteForceValidate(1000, 9999, 990, 10010));
    it('2000-2024', () => bruteForceValidate(2000, 2024, 1995, 2030));
  });

  describe('pattern does not match strings with leading zeros', () => {
    it('numberRange(0, 255) rejects "00"', () => {
      const re = new RegExp(`^${numberRangePattern(0, 255)}$`);
      expect(re.test('00')).toBe(false);
      expect(re.test('01')).toBe(false);
      expect(re.test('001')).toBe(false);
    });
  });

  describe('pattern does not match non-numeric strings', () => {
    it('rejects alphabetic strings', () => {
      const re = new RegExp(`^${numberRangePattern(0, 255)}$`);
      expect(re.test('abc')).toBe(false);
      expect(re.test('')).toBe(false);
      expect(re.test(' ')).toBe(false);
      expect(re.test('1a')).toBe(false);
    });
  });
});
