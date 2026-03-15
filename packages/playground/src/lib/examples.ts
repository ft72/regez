export const DEFAULT_CODE = `// Build a regex that matches one or more digits
regez()
  .start()
  .digit()
  .oneOrMore()
  .end()
  .build()`;

export const EXAMPLES: Record<string, string> = {
  'Digits Only': `regez()
  .start()
  .digit()
  .oneOrMore()
  .end()
  .build()`,

  'Email': `regez()
  .start()
  .email()
  .end()
  .build()`,

  'IPv4 Address': `regez()
  .start()
  .ipv4()
  .end()
  .build()`,

  'US Phone': `regez()
  .start()
  .literal("(")
  .digit().exactly(3)
  .literal(") ")
  .digit().exactly(3)
  .literal("-")
  .digit().exactly(4)
  .end()
  .build()`,

  'Date (YYYY-MM-DD)': `regez()
  .start()
  .date("YYYY-MM-DD")
  .end()
  .build()`,

  'Hex Color': `regez()
  .start()
  .literal("#")
  .anyOf("abcdefABCDEF0123456789".split(""))
  .exactly(6)
  .end()
  .build()`,
};
