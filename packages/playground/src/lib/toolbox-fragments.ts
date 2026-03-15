export interface ToolboxFragment {
  label: string;
  code: string;
  category: string;
}

export const TOOLBOX_FRAGMENTS: ToolboxFragment[] = [
  {
    label: 'Start/End',
    code: '.start()\n  .end()',
    category: 'Anchors',
  },
  {
    label: 'Boundary',
    code: '.boundary()',
    category: 'Anchors',
  },
  {
    label: 'Digit',
    code: '.digit()',
    category: 'Shorthands',
  },
  {
    label: 'Word',
    code: '.word()',
    category: 'Shorthands',
  },
  {
    label: 'Whitespace',
    code: '.whitespace()',
    category: 'Shorthands',
  },
  {
    label: 'Any',
    code: '.any()',
    category: 'Shorthands',
  },
  {
    label: 'One or More',
    code: '.oneOrMore()',
    category: 'Quantifiers',
  },
  {
    label: 'Maybe',
    code: '.maybe()',
    category: 'Quantifiers',
  },
  {
    label: 'Exactly(n)',
    code: '.exactly(3)',
    category: 'Quantifiers',
  },
  {
    label: 'Email',
    code: '.email()',
    category: 'Specials',
  },
  {
    label: 'IPv4',
    code: '.ipv4()',
    category: 'Specials',
  },
  {
    label: 'Date',
    code: '.date("YYYY-MM-DD")',
    category: 'Specials',
  },
  {
    label: 'Range 0-255',
    code: '.numberRange(0, 255)',
    category: 'Specials',
  },
  {
    label: 'Capture',
    code: `.capture("name", r => r
    .digit().oneOrMore()
  )`,
    category: 'Groups',
  },
];
