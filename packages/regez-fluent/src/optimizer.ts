import type { Token } from './tokens';
import { escapeRegex } from './utils';

export function compileTokens(tokens: Token[]): string {
  const parts: string[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    switch (token.type) {
      case 'literal':
        parts.push(escapeRegex(token.value));
        break;

      case 'anchor':
        parts.push(token.kind === 'start' ? '^' : token.kind === 'end' ? '$' : '\\b');
        break;

      case 'shorthand':
        parts.push(
          token.kind === 'digit' ? '\\d' :
          token.kind === 'word' ? '\\w' :
          token.kind === 'whitespace' ? '\\s' :
          '.'
        );
        break;

      case 'charClass': {
        const inner = token.chars.map(c => escapeCharClass(c)).join('');
        parts.push(token.negated ? `[^${inner}]` : `[${inner}]`);
        break;
      }

      case 'quantifier': {
        // Apply to previous part
        if (parts.length === 0) break;
        const prev = parts.pop()!;
        const base = needsGroup(prev) ? `(?:${prev})` : prev;
        const suffix =
          token.kind === 'maybe' ? '?' :
          token.kind === 'oneOrMore' ? '+' :
          token.kind === 'zeroOrMore' ? '*' :
          token.kind === 'exactly' ? `{${token.count}}` :
          token.kind === 'between' ? `{${token.min},${token.max}}` :
          '';
        parts.push(base + suffix);
        break;
      }

      case 'capture': {
        const inner = compileTokens(token.tokens);
        parts.push(token.name ? `(?<${token.name}>${inner})` : `(${inner})`);
        break;
      }

      case 'raw':
        parts.push(token.pattern);
        break;
    }
  }

  return parts.join('');
}

function escapeCharClass(char: string): string {
  // Escape characters that have special meaning inside a character class.
  // Includes '[' for compatibility with unicode mode (u/v flags).
  if (char === ']' || char === '\\' || char === '^' || char === '-' || char === '[') {
    return '\\' + char;
  }
  return char;
}

/**
 * Determines if a pattern segment needs a non-capturing group
 * before a quantifier is applied.
 */
function needsGroup(segment: string): boolean {
  // Single characters don't need grouping
  if (segment.length === 1) return false;
  // Escaped single chars like \d, \w, \s, \., etc.
  if (segment.length === 2 && segment[0] === '\\') return false;
  // Character classes [...] — find the matching closing bracket
  if (segment[0] === '[') {
    const close = findClosingBracket(segment);
    if (close === segment.length - 1) return false;
  }
  // Already a single group (...) or (?:...) or (?<name>...)
  if (segment[0] === '(') {
    const close = findClosingParen(segment);
    if (close === segment.length - 1) return false;
  }
  return true;
}

/**
 * Find the index of the closing ']' that matches the opening '[' at index 0,
 * accounting for escaped characters.
 */
function findClosingBracket(segment: string): number {
  // First char after '[' can be '^' and/or ']' without closing the class
  let i = 1;
  if (i < segment.length && segment[i] === '^') i++;
  if (i < segment.length && segment[i] === ']') i++;
  for (; i < segment.length; i++) {
    if (segment[i] === '\\' && i + 1 < segment.length) {
      i++; // skip escaped char
    } else if (segment[i] === ']') {
      return i;
    }
  }
  return -1;
}

/**
 * Find the index of the closing ')' that matches the opening '(' at index 0,
 * accounting for nesting and escaped characters.
 */
function findClosingParen(segment: string): number {
  let depth = 0;
  for (let i = 0; i < segment.length; i++) {
    if (segment[i] === '\\' && i + 1 < segment.length) {
      i++; // skip escaped char
    } else if (segment[i] === '[') {
      // Skip character class — brackets inside don't count as groups
      const close = findClosingBracket(segment.slice(i));
      if (close !== -1) i += close;
    } else if (segment[i] === '(') {
      depth++;
    } else if (segment[i] === ')') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}
