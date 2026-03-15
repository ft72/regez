/**
 * Generates a regex pattern string that matches integers in [min, max].
 * Uses digit-by-digit decomposition into rectangular sub-ranges.
 */
export function numberRangePattern(min: number, max: number): string {
  if (!Number.isInteger(min) || !Number.isInteger(max)) {
    throw new Error('numberRange requires integer arguments');
  }
  if (min < 0 || max < 0) throw new Error('numberRange does not support negative numbers');
  if (min > max) throw new Error(`min (${min}) must be <= max (${max})`);
  if (min === max) return String(min);

  const subPatterns: string[] = [];

  // Split by digit count
  const minLen = String(min).length;
  const maxLen = String(max).length;

  for (let len = minLen; len <= maxLen; len++) {
    const lo = len === minLen ? min : Math.pow(10, len - 1);
    const hi = len === maxLen ? max : Math.pow(10, len) - 1;
    if (lo <= hi) {
      subPatterns.push(...decomposeRange(lo, hi, len));
    }
  }

  if (subPatterns.length === 1) return subPatterns[0];
  return '(?:' + subPatterns.join('|') + ')';
}

/**
 * Decompose [min, max] (same digit count) into rectangular sub-ranges
 * by splitting from the bottom up and top down, then merging the middle.
 */
function decomposeRange(min: number, max: number, length: number): string[] {
  if (min === max) return [rangeToPattern(min, max, length)];

  // Build ranges from the bottom (min upward) and top (max downward)
  const bottomRanges: [number, number][] = [];
  const topRanges: [number, number][] = [];

  let lo = min;
  let hi = max;

  while (lo <= hi) {
    // From the bottom: try to round up lo to next boundary
    const loUp = roundUp(lo, length);
    // From the top: try to round down hi to previous boundary
    const hiDown = roundDown(hi, length);

    if (loUp > hi) {
      // Remaining range is small, handle directly
      bottomRanges.push([lo, hi]);
      break;
    }

    if (lo < loUp) {
      bottomRanges.push([lo, loUp - 1]);
      lo = loUp;
    }

    if (hiDown < lo) {
      bottomRanges.push([lo, hi]);
      break;
    }

    if (hi > hiDown) {
      topRanges.unshift([hiDown + 1, hi]);
      hi = hiDown;
    }

    if (lo === hi) {
      bottomRanges.push([lo, hi]);
      break;
    }

    // Check if the middle range [lo, hi] is rectangular
    if (isRectangular(lo, hi, length)) {
      bottomRanges.push([lo, hi]);
      break;
    }
  }

  const allRanges = [...bottomRanges, ...topRanges];
  return allRanges.map(([a, b]) => rangeToPattern(a, b, length));
}

/**
 * Round lo up to the nearest number where trailing digits become 0.
 * E.g., 65 -> 70, 123 -> 130, 100 -> 100
 */
function roundUp(n: number, length: number): number {
  const s = String(n).padStart(length, '0');

  // Find rightmost non-zero trailing digit position
  for (let i = length - 1; i >= 1; i--) {
    if (s[i] !== '0') {
      // Round up: increment the prefix and zero out trailing digits
      const prefix = String(parseInt(s.slice(0, i), 10) + 1);
      const zeros = '0'.repeat(length - prefix.length);
      return parseInt(prefix + zeros, 10);
    }
  }
  return n; // Already rounded (e.g., 100)
}

/**
 * Round hi down to the nearest number where trailing digits become 9.
 * E.g., 128 -> 119, 255 -> 249, 199 -> 199
 */
function roundDown(n: number, length: number): number {
  const s = String(n).padStart(length, '0');

  for (let i = length - 1; i >= 1; i--) {
    if (s[i] !== '9') {
      const prefix = String(parseInt(s.slice(0, i), 10) - 1);
      const nines = '9'.repeat(length - prefix.length);
      return parseInt(prefix + nines, 10);
    }
  }
  return n; // Already at boundary (e.g., 199)
}

/**
 * Check if a range is rectangular: each digit position independently varies
 * between its lo and hi values.
 */
function isRectangular(lo: number, hi: number, length: number): boolean {
  const loStr = String(lo).padStart(length, '0');
  const hiStr = String(hi).padStart(length, '0');

  // Find first differing position
  let firstDiff = -1;
  for (let i = 0; i < length; i++) {
    if (loStr[i] !== hiStr[i]) {
      firstDiff = i;
      break;
    }
  }
  if (firstDiff === -1) return true; // Same number

  // After firstDiff, lo must have all 0s and hi must have all 9s
  for (let i = firstDiff + 1; i < length; i++) {
    if (loStr[i] !== '0' || hiStr[i] !== '9') return false;
  }
  return true;
}

/**
 * Convert a rectangular range [lo, hi] (same digit count) to a pattern.
 * E.g. [200, 249] -> "2[0-4][0-9]"
 */
function rangeToPattern(lo: number, hi: number, length: number): string {
  const loStr = String(lo).padStart(length, '0');
  const hiStr = String(hi).padStart(length, '0');
  let pattern = '';

  for (let i = 0; i < length; i++) {
    const loDigit = loStr[i];
    const hiDigit = hiStr[i];
    if (loDigit === hiDigit) {
      pattern += loDigit;
    } else if (loDigit === '0' && hiDigit === '9') {
      pattern += '[0-9]';
    } else {
      pattern += `[${loDigit}-${hiDigit}]`;
    }
  }

  return pattern;
}
