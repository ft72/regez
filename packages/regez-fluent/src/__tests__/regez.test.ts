import { describe, it, expect } from 'vitest';
import { regez, Regez } from '../regez';

describe('Regez builder', () => {
  describe('factory', () => {
    it('regez() returns a Regez instance', () => {
      expect(regez()).toBeInstanceOf(Regez);
    });
  });

  describe('anchors', () => {
    it('start and end', () => {
      expect(regez().start().digit().end().toString()).toBe('^\\d$');
    });

    it('boundary', () => {
      expect(regez().boundary().word().oneOrMore().boundary().toString()).toBe('\\b\\w+\\b');
    });
  });

  describe('shorthands', () => {
    it('digit', () => {
      expect(regez().digit().toString()).toBe('\\d');
    });

    it('word', () => {
      expect(regez().word().toString()).toBe('\\w');
    });

    it('whitespace', () => {
      expect(regez().whitespace().toString()).toBe('\\s');
    });

    it('any', () => {
      expect(regez().any().toString()).toBe('.');
    });
  });

  describe('literal', () => {
    it('escapes special characters', () => {
      expect(regez().literal('hello.world').toString()).toBe('hello\\.world');
    });

    it('escapes multiple specials', () => {
      expect(regez().literal('$100 (USD)').toString()).toBe('\\$100 \\(USD\\)');
    });

    it('handles empty string', () => {
      expect(regez().literal('').toString()).toBe('');
    });

    it('escapes all regex metacharacters', () => {
      expect(regez().literal('.*+?^${}()|[]\\').toString())
        .toBe('\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\');
    });
  });

  describe('quantifiers', () => {
    it('maybe', () => {
      expect(regez().digit().maybe().toString()).toBe('\\d?');
    });

    it('oneOrMore', () => {
      expect(regez().digit().oneOrMore().toString()).toBe('\\d+');
    });

    it('zeroOrMore', () => {
      expect(regez().digit().zeroOrMore().toString()).toBe('\\d*');
    });

    it('exactly', () => {
      expect(regez().digit().exactly(3).toString()).toBe('\\d{3}');
    });

    it('exactly(0) is valid', () => {
      expect(regez().digit().exactly(0).toString()).toBe('\\d{0}');
    });

    it('between', () => {
      expect(regez().digit().between(2, 4).toString()).toBe('\\d{2,4}');
    });

    it('between with equal min/max', () => {
      expect(regez().digit().between(3, 3).toString()).toBe('\\d{3,3}');
    });

    it('wraps multi-char literals in non-capturing group', () => {
      expect(regez().literal('abc').oneOrMore().toString()).toBe('(?:abc)+');
    });

    it('does not wrap single char', () => {
      expect(regez().literal('a').oneOrMore().toString()).toBe('a+');
    });

    it('quantifier with no preceding token is silently ignored', () => {
      expect(regez().oneOrMore().digit().toString()).toBe('\\d');
    });

    it('exactly throws for negative', () => {
      expect(() => regez().digit().exactly(-1)).toThrow('non-negative integer');
    });

    it('exactly throws for float', () => {
      expect(() => regez().digit().exactly(1.5)).toThrow('non-negative integer');
    });

    it('exactly throws for NaN', () => {
      expect(() => regez().digit().exactly(NaN)).toThrow('non-negative integer');
    });

    it('between throws for min > max', () => {
      expect(() => regez().digit().between(5, 2)).toThrow('min (5) must be <= max (2)');
    });

    it('between throws for negative', () => {
      expect(() => regez().digit().between(-1, 5)).toThrow('non-negative integers');
    });

    it('between throws for float', () => {
      expect(() => regez().digit().between(1.5, 3)).toThrow('non-negative integers');
    });
  });

  describe('character classes', () => {
    it('anyOf', () => {
      expect(regez().anyOf(['a', 'b', 'c']).toString()).toBe('[abc]');
    });

    it('except', () => {
      expect(regez().except(['0', '1']).toString()).toBe('[^01]');
    });

    it('escapes special chars in class', () => {
      expect(regez().anyOf([']', '-', '\\']).toString()).toBe('[\\]\\-\\\\]');
    });

    it('escapes [ in class for unicode mode compatibility', () => {
      expect(regez().anyOf(['[', 'a']).toString()).toBe('[\\[a]');
    });

    it('anyOf throws for empty array', () => {
      expect(() => regez().anyOf([])).toThrow('at least one character');
    });

    it('except throws for empty array', () => {
      expect(() => regez().except([])).toThrow('at least one character');
    });

    it('char class does not need wrapping before quantifier', () => {
      expect(regez().anyOf(['a', 'b']).oneOrMore().toString()).toBe('[ab]+');
    });
  });

  describe('capture', () => {
    it('unnamed capture', () => {
      const pattern = regez().capture(r => r.digit().oneOrMore()).toString();
      expect(pattern).toBe('(\\d+)');
    });

    it('named capture', () => {
      const pattern = regez().capture('num', r => r.digit().oneOrMore()).toString();
      expect(pattern).toBe('(?<num>\\d+)');
    });

    it('throws when name provided without callback', () => {
      expect(() => (regez() as any).capture('name')).toThrow('callback function');
    });

    it('nested capture', () => {
      const pattern = regez()
        .capture('outer', r => r.literal('a').capture('inner', r2 => r2.digit()))
        .toString();
      expect(pattern).toBe('(?<outer>a(?<inner>\\d))');
    });
  });

  describe('raw', () => {
    it('inserts raw pattern', () => {
      expect(regez().raw('[A-Z]').oneOrMore().toString()).toBe('[A-Z]+');
    });

    it('wraps complex raw pattern before quantifier', () => {
      expect(regez().raw('(a)(b)').oneOrMore().toString()).toBe('(?:(a)(b))+');
    });

    it('does not wrap already-grouped raw pattern', () => {
      expect(regez().raw('(?:abc)').oneOrMore().toString()).toBe('(?:abc)+');
    });
  });

  describe('flags', () => {
    it('withFlags sets valid flags', () => {
      const re = regez().digit().oneOrMore().withFlags('gi').build();
      expect(re.flags).toBe('gi');
    });

    it('withFlags throws for invalid flags', () => {
      expect(() => regez().withFlags('xyz')).toThrow('Invalid regex flag: "x"');
    });

    it('withFlags throws for duplicate flags', () => {
      expect(() => regez().withFlags('gg')).toThrow('Duplicate');
    });

    it('accepts all valid flags', () => {
      expect(() => regez().withFlags('dgimsuy')).not.toThrow();
    });
  });

  describe('build', () => {
    it('returns a RegExp', () => {
      const re = regez().start().digit().oneOrMore().end().build();
      expect(re).toBeInstanceOf(RegExp);
      expect(re.test('123')).toBe(true);
      expect(re.test('abc')).toBe(false);
    });

    it('empty builder produces empty regex', () => {
      const re = regez().build();
      expect(re.source).toBe('(?:)');
    });
  });

  describe('method chaining returns this', () => {
    it('all methods are chainable', () => {
      const r = regez();
      expect(r.start()).toBe(r);
      expect(r.end()).toBe(r);
      expect(r.boundary()).toBe(r);
      expect(r.digit()).toBe(r);
      expect(r.word()).toBe(r);
      expect(r.whitespace()).toBe(r);
      expect(r.any()).toBe(r);
      expect(r.literal('x')).toBe(r);
      expect(r.maybe()).toBe(r);
      expect(r.oneOrMore()).toBe(r);
      expect(r.zeroOrMore()).toBe(r);
      expect(r.exactly(1)).toBe(r);
      expect(r.between(1, 2)).toBe(r);
      expect(r.anyOf(['a'])).toBe(r);
      expect(r.except(['a'])).toBe(r);
      expect(r.capture(r2 => r2.digit())).toBe(r);
      expect(r.raw('x')).toBe(r);
      expect(r.email()).toBe(r);
      expect(r.ipv4()).toBe(r);
      expect(r.date()).toBe(r);
      expect(r.numberRange(0, 9)).toBe(r);
      expect(r.withFlags('g')).toBe(r);
    });
  });

  describe('complex chains', () => {
    it('US phone number pattern', () => {
      const re = regez()
        .start()
        .literal('(')
        .digit().exactly(3)
        .literal(') ')
        .digit().exactly(3)
        .literal('-')
        .digit().exactly(4)
        .end()
        .build();

      expect(re.test('(555) 123-4567')).toBe(true);
      expect(re.test('555-123-4567')).toBe(false);
    });

    it('hex color', () => {
      const re = regez()
        .start()
        .literal('#')
        .anyOf('abcdefABCDEF0123456789'.split('')).exactly(6)
        .end()
        .build();

      expect(re.test('#ff00aa')).toBe(true);
      expect(re.test('#FFFFFF')).toBe(true);
      expect(re.test('#xyz')).toBe(false);
    });

    it('simple URL', () => {
      const re = regez()
        .start()
        .literal('http')
        .literal('s').maybe()
        .literal('://')
        .word().oneOrMore()
        .end()
        .build();

      expect(re.test('https://example')).toBe(true);
      expect(re.test('http://test')).toBe(true);
      expect(re.test('ftp://test')).toBe(false);
    });
  });
});
