import { regez, Regez, numberRangePattern } from 'regez-fluent';

export interface CompileResult {
  pattern: string;
  regex: RegExp | null;
  error: string | null;
}

export function compileCode(code: string): CompileResult {
  try {
    // Try to auto-return the last expression.
    // First attempt: prepend "return" so bare expressions work.
    // If that fails syntactically (e.g. multi-statement code with its own return),
    // fall back to running the code as-is.
    let fn: Function;
    try {
      fn = new Function('regez', 'Regez', 'numberRangePattern', `
        "use strict";
        return (function() {
          return ${code}
        })();
      `);
    } catch {
      fn = new Function('regez', 'Regez', 'numberRangePattern', `
        "use strict";
        return (function() {
          ${code}
        })();
      `);
    }

    const result = fn(regez, Regez, numberRangePattern);

    if (result instanceof RegExp) {
      return {
        pattern: result.source,
        regex: result,
        error: null,
      };
    }

    if (result instanceof Regez) {
      const built = result.build();
      return {
        pattern: built.source,
        regex: built,
        error: null,
      };
    }

    if (typeof result === 'string') {
      return {
        pattern: result,
        regex: new RegExp(result),
        error: null,
      };
    }

    return {
      pattern: '',
      regex: null,
      error: 'Code must return a RegExp, Regez instance, or string. Add .build() at the end.',
    };
  } catch (e) {
    return {
      pattern: '',
      regex: null,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}
