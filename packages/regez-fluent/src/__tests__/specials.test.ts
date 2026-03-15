import { describe, it, expect } from 'vitest';
import { regez } from '../regez';

describe('specials', () => {
  describe('email', () => {
    it('matches valid emails', () => {
      const re = regez().start().email().end().build();
      expect(re.test('user@example.com')).toBe(true);
      expect(re.test('first.last+tag@sub.domain.org')).toBe(true);
      expect(re.test('user123@test.co')).toBe(true);
      expect(re.test('a@b.cd')).toBe(true);
    });

    it('rejects invalid emails', () => {
      const re = regez().start().email().end().build();
      expect(re.test('not-an-email')).toBe(false);
      expect(re.test('@no-user.com')).toBe(false);
      expect(re.test('user@')).toBe(false);
      expect(re.test('')).toBe(false);
      expect(re.test('user@.com')).toBe(false);
      expect(re.test('user@domain.c')).toBe(false); // TLD too short
    });
  });

  describe('ipv4', () => {
    it('matches valid IPs', () => {
      const re = regez().start().ipv4().end().build();
      expect(re.test('192.168.1.1')).toBe(true);
      expect(re.test('0.0.0.0')).toBe(true);
      expect(re.test('255.255.255.255')).toBe(true);
      expect(re.test('10.0.0.1')).toBe(true);
      expect(re.test('1.1.1.1')).toBe(true);
    });

    it('rejects invalid IPs', () => {
      const re = regez().start().ipv4().end().build();
      expect(re.test('256.0.0.0')).toBe(false);
      expect(re.test('1.2.3')).toBe(false);
      expect(re.test('abc.def.ghi.jkl')).toBe(false);
      expect(re.test('1.2.3.4.5')).toBe(false);
      expect(re.test('')).toBe(false);
      expect(re.test('999.999.999.999')).toBe(false);
    });

    it('rejects octets with leading zeros', () => {
      const re = regez().start().ipv4().end().build();
      expect(re.test('01.02.03.04')).toBe(false);
      expect(re.test('001.002.003.004')).toBe(false);
    });
  });

  describe('date', () => {
    it('matches YYYY-MM-DD', () => {
      const re = regez().start().date('YYYY-MM-DD').end().build();
      expect(re.test('2024-01-15')).toBe(true);
      expect(re.test('2024-1-5')).toBe(true);
      expect(re.test('1999-12-31')).toBe(true);
      expect(re.test('1900-01-01')).toBe(true);
      expect(re.test('2099-12-31')).toBe(true);
    });

    it('rejects invalid YYYY-MM-DD dates', () => {
      const re = regez().start().date('YYYY-MM-DD').end().build();
      expect(re.test('2024-13-01')).toBe(false);
      expect(re.test('2024-00-15')).toBe(false);
      expect(re.test('2024-01-00')).toBe(false);
      expect(re.test('2024-01-32')).toBe(false);
      expect(re.test('1899-01-01')).toBe(false);
      expect(re.test('2100-01-01')).toBe(false);
    });

    it('matches MM/DD/YYYY', () => {
      const re = regez().start().date('MM/DD/YYYY').end().build();
      expect(re.test('01/15/2024')).toBe(true);
      expect(re.test('12/31/1999')).toBe(true);
    });

    it('matches DD.MM.YYYY', () => {
      const re = regez().start().date('DD.MM.YYYY').end().build();
      expect(re.test('15.01.2024')).toBe(true);
      expect(re.test('31.12.1999')).toBe(true);
    });

    it('defaults to YYYY-MM-DD for unknown format', () => {
      const re1 = regez().start().date().end().build();
      const re2 = regez().start().date('YYYY-MM-DD').end().build();
      expect(re1.source).toBe(re2.source);
    });
  });

  describe('numberRange via regez', () => {
    it('0-255 via builder', () => {
      const re = regez().start().numberRange(0, 255).end().build();
      expect(re.test('0')).toBe(true);
      expect(re.test('255')).toBe(true);
      expect(re.test('256')).toBe(false);
    });

    it('validates integer input', () => {
      expect(() => regez().numberRange(1.5, 3)).toThrow('integer');
    });
  });
});
