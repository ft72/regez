export type Token =
  | { type: 'literal'; value: string }
  | { type: 'anchor'; kind: 'start' | 'end' | 'boundary' }
  | { type: 'quantifier'; kind: 'maybe' | 'oneOrMore' | 'zeroOrMore' | 'exactly' | 'between'; count?: number; min?: number; max?: number }
  | { type: 'charClass'; chars: string[]; negated: boolean }
  | { type: 'capture'; name?: string; tokens: Token[] }
  | { type: 'raw'; pattern: string }
  | { type: 'shorthand'; kind: 'digit' | 'word' | 'whitespace' | 'any' };
