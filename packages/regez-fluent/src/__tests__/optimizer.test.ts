import { describe, it, expect } from 'vitest';
import { compileTokens } from '../optimizer';
import type { Token } from '../tokens';

describe('compileTokens', () => {
  it('compiles empty token array', () => {
    expect(compileTokens([])).toBe('');
  });

  it('compiles literal with escaping', () => {
    const tokens: Token[] = [{ type: 'literal', value: 'a.b' }];
    expect(compileTokens(tokens)).toBe('a\\.b');
  });

  it('compiles empty literal', () => {
    const tokens: Token[] = [{ type: 'literal', value: '' }];
    expect(compileTokens(tokens)).toBe('');
  });

  it('compiles anchors', () => {
    const tokens: Token[] = [
      { type: 'anchor', kind: 'start' },
      { type: 'anchor', kind: 'end' },
    ];
    expect(compileTokens(tokens)).toBe('^$');
  });

  it('compiles boundary anchor', () => {
    const tokens: Token[] = [{ type: 'anchor', kind: 'boundary' }];
    expect(compileTokens(tokens)).toBe('\\b');
  });

  it('compiles shorthands', () => {
    const tokens: Token[] = [
      { type: 'shorthand', kind: 'digit' },
      { type: 'shorthand', kind: 'word' },
      { type: 'shorthand', kind: 'whitespace' },
      { type: 'shorthand', kind: 'any' },
    ];
    expect(compileTokens(tokens)).toBe('\\d\\w\\s.');
  });

  it('compiles quantifier on shorthand', () => {
    const tokens: Token[] = [
      { type: 'shorthand', kind: 'digit' },
      { type: 'quantifier', kind: 'oneOrMore' },
    ];
    expect(compileTokens(tokens)).toBe('\\d+');
  });

  it('wraps multi-char literal before quantifier', () => {
    const tokens: Token[] = [
      { type: 'literal', value: 'ab' },
      { type: 'quantifier', kind: 'maybe' },
    ];
    expect(compileTokens(tokens)).toBe('(?:ab)?');
  });

  it('does not wrap single escaped char before quantifier', () => {
    const tokens: Token[] = [
      { type: 'literal', value: '.' },
      { type: 'quantifier', kind: 'oneOrMore' },
    ];
    // '.' is escaped to '\.', which is 2 chars but starts with \ — no wrap needed
    expect(compileTokens(tokens)).toBe('\\.+');
  });

  it('compiles named capture', () => {
    const tokens: Token[] = [
      {
        type: 'capture',
        name: 'digits',
        tokens: [
          { type: 'shorthand', kind: 'digit' },
          { type: 'quantifier', kind: 'oneOrMore' },
        ],
      },
    ];
    expect(compileTokens(tokens)).toBe('(?<digits>\\d+)');
  });

  it('compiles unnamed capture', () => {
    const tokens: Token[] = [
      {
        type: 'capture',
        tokens: [
          { type: 'shorthand', kind: 'digit' },
        ],
      },
    ];
    expect(compileTokens(tokens)).toBe('(\\d)');
  });

  it('compiles character classes', () => {
    const tokens: Token[] = [
      { type: 'charClass', chars: ['a', 'b', 'c'], negated: false },
    ];
    expect(compileTokens(tokens)).toBe('[abc]');
  });

  it('compiles negated character classes', () => {
    const tokens: Token[] = [
      { type: 'charClass', chars: ['0', '1'], negated: true },
    ];
    expect(compileTokens(tokens)).toBe('[^01]');
  });

  it('does not wrap char class before quantifier', () => {
    const tokens: Token[] = [
      { type: 'charClass', chars: ['a', 'b'], negated: false },
      { type: 'quantifier', kind: 'oneOrMore' },
    ];
    expect(compileTokens(tokens)).toBe('[ab]+');
  });

  it('does not wrap capture group before quantifier', () => {
    const tokens: Token[] = [
      { type: 'capture', tokens: [{ type: 'shorthand', kind: 'digit' }] },
      { type: 'quantifier', kind: 'oneOrMore' },
    ];
    expect(compileTokens(tokens)).toBe('(\\d)+');
  });

  it('wraps multi-group raw pattern before quantifier', () => {
    const tokens: Token[] = [
      { type: 'raw', pattern: '(a)(b)' },
      { type: 'quantifier', kind: 'oneOrMore' },
    ];
    expect(compileTokens(tokens)).toBe('(?:(a)(b))+');
  });

  it('does not wrap single-group raw pattern before quantifier', () => {
    const tokens: Token[] = [
      { type: 'raw', pattern: '(?:abc)' },
      { type: 'quantifier', kind: 'oneOrMore' },
    ];
    expect(compileTokens(tokens)).toBe('(?:abc)+');
  });

  it('does not wrap char class raw pattern before quantifier', () => {
    const tokens: Token[] = [
      { type: 'raw', pattern: '[A-Z]' },
      { type: 'quantifier', kind: 'oneOrMore' },
    ];
    expect(compileTokens(tokens)).toBe('[A-Z]+');
  });

  it('compiles raw token', () => {
    const tokens: Token[] = [{ type: 'raw', pattern: '(?:foo|bar)' }];
    expect(compileTokens(tokens)).toBe('(?:foo|bar)');
  });

  it('compiles zeroOrMore quantifier', () => {
    const tokens: Token[] = [
      { type: 'shorthand', kind: 'word' },
      { type: 'quantifier', kind: 'zeroOrMore' },
    ];
    expect(compileTokens(tokens)).toBe('\\w*');
  });

  it('compiles exactly quantifier', () => {
    const tokens: Token[] = [
      { type: 'shorthand', kind: 'digit' },
      { type: 'quantifier', kind: 'exactly', count: 4 },
    ];
    expect(compileTokens(tokens)).toBe('\\d{4}');
  });

  it('compiles between quantifier', () => {
    const tokens: Token[] = [
      { type: 'shorthand', kind: 'digit' },
      { type: 'quantifier', kind: 'between', min: 2, max: 5 },
    ];
    expect(compileTokens(tokens)).toBe('\\d{2,5}');
  });

  it('handles quantifier with no preceding token', () => {
    const tokens: Token[] = [
      { type: 'quantifier', kind: 'oneOrMore' },
    ];
    expect(compileTokens(tokens)).toBe('');
  });

  it('escapes ] \\ ^ - [ inside character classes', () => {
    const tokens: Token[] = [
      { type: 'charClass', chars: [']', '\\', '^', '-', '['], negated: false },
    ];
    expect(compileTokens(tokens)).toBe('[\\]\\\\\\^\\-\\[]');
  });
});
