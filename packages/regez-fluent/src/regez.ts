import type { Token } from './tokens';
import { compileTokens } from './optimizer';
import { numberRangePattern } from './number-range';
import { emailPattern, ipv4Pattern, datePattern } from './specials';

const VALID_FLAGS = new Set(['d', 'g', 'i', 'm', 's', 'u', 'v', 'y']);

export class Regez {
  private tokens: Token[] = [];
  private flags: string = '';

  // --- Anchors ---

  start(): this {
    this.tokens.push({ type: 'anchor', kind: 'start' });
    return this;
  }

  end(): this {
    this.tokens.push({ type: 'anchor', kind: 'end' });
    return this;
  }

  boundary(): this {
    this.tokens.push({ type: 'anchor', kind: 'boundary' });
    return this;
  }

  // --- Shorthands ---

  digit(): this {
    this.tokens.push({ type: 'shorthand', kind: 'digit' });
    return this;
  }

  word(): this {
    this.tokens.push({ type: 'shorthand', kind: 'word' });
    return this;
  }

  whitespace(): this {
    this.tokens.push({ type: 'shorthand', kind: 'whitespace' });
    return this;
  }

  any(): this {
    this.tokens.push({ type: 'shorthand', kind: 'any' });
    return this;
  }

  // --- Literal ---

  literal(str: string): this {
    this.tokens.push({ type: 'literal', value: str });
    return this;
  }

  // --- Quantifiers ---

  maybe(): this {
    this.tokens.push({ type: 'quantifier', kind: 'maybe' });
    return this;
  }

  oneOrMore(): this {
    this.tokens.push({ type: 'quantifier', kind: 'oneOrMore' });
    return this;
  }

  zeroOrMore(): this {
    this.tokens.push({ type: 'quantifier', kind: 'zeroOrMore' });
    return this;
  }

  exactly(count: number): this {
    if (!Number.isInteger(count) || count < 0) {
      throw new Error(`exactly() requires a non-negative integer, got ${count}`);
    }
    this.tokens.push({ type: 'quantifier', kind: 'exactly', count });
    return this;
  }

  between(min: number, max: number): this {
    if (!Number.isInteger(min) || !Number.isInteger(max) || min < 0 || max < 0) {
      throw new Error(`between() requires non-negative integers, got (${min}, ${max})`);
    }
    if (min > max) {
      throw new Error(`between() min (${min}) must be <= max (${max})`);
    }
    this.tokens.push({ type: 'quantifier', kind: 'between', min, max });
    return this;
  }

  // --- Character Classes ---

  anyOf(chars: string[]): this {
    if (chars.length === 0) {
      throw new Error('anyOf() requires at least one character');
    }
    this.tokens.push({ type: 'charClass', chars, negated: false });
    return this;
  }

  except(chars: string[]): this {
    if (chars.length === 0) {
      throw new Error('except() requires at least one character');
    }
    this.tokens.push({ type: 'charClass', chars, negated: true });
    return this;
  }

  // --- Capture ---

  capture(callback: (r: Regez) => void): this;
  capture(name: string, callback: (r: Regez) => void): this;
  capture(nameOrCallback: string | ((r: Regez) => void), callback?: (r: Regez) => void): this {
    let name: string | undefined;
    let cb: (r: Regez) => void;

    if (typeof nameOrCallback === 'function') {
      cb = nameOrCallback;
    } else {
      if (typeof callback !== 'function') {
        throw new Error('capture() requires a callback function');
      }
      name = nameOrCallback;
      cb = callback;
    }

    const sub = new Regez();
    cb(sub);
    this.tokens.push({ type: 'capture', name, tokens: sub.tokens });
    return this;
  }

  // --- Raw ---

  raw(pattern: string): this {
    this.tokens.push({ type: 'raw', pattern });
    return this;
  }

  // --- Specials ---

  email(): this {
    this.tokens.push({ type: 'raw', pattern: emailPattern() });
    return this;
  }

  ipv4(): this {
    this.tokens.push({ type: 'raw', pattern: ipv4Pattern() });
    return this;
  }

  date(format?: string): this {
    this.tokens.push({ type: 'raw', pattern: datePattern(format) });
    return this;
  }

  numberRange(min: number, max: number): this {
    this.tokens.push({ type: 'raw', pattern: numberRangePattern(min, max) });
    return this;
  }

  // --- Flags ---

  withFlags(flags: string): this {
    for (const flag of flags) {
      if (!VALID_FLAGS.has(flag)) {
        throw new Error(`Invalid regex flag: "${flag}". Valid flags: ${[...VALID_FLAGS].join(', ')}`);
      }
    }
    const unique = [...new Set(flags)];
    if (unique.length !== flags.length) {
      throw new Error('Duplicate regex flags are not allowed');
    }
    this.flags = flags;
    return this;
  }

  // --- Build ---

  toString(): string {
    return compileTokens(this.tokens);
  }

  build(): RegExp {
    return new RegExp(this.toString(), this.flags);
  }
}

export function regez(): Regez {
  return new Regez();
}
