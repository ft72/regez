# regez-fluent

A fluent, English-like JavaScript/TypeScript API for building regular expressions. Stop writing cryptic regex strings — chain readable methods instead.

```ts
import { regez } from 'regez-fluent';

// Instead of: /^\d{3}-\d{4}$/
const phoneRegex = regez()
  .start()
  .digit().exactly(3)
  .literal('-')
  .digit().exactly(4)
  .end()
  .build();

phoneRegex.test('555-1234'); // true
```

## Installation

```bash
npm install regez-fluent
```

Works with ESM, CommonJS, and TypeScript out of the box. Zero dependencies.

## Quick Start

```ts
import { regez } from 'regez-fluent';

// Match one or more digits
regez().digit().oneOrMore().build();          // /\d+/

// Match an email address
regez().start().email().end().build();        // full email regex

// Match an IPv4 address
regez().start().ipv4().end().build();         // validates 0-255 per octet

// Match a date
regez().start().date('YYYY-MM-DD').end().build();
```

## API Reference

Every method returns `this`, so all calls are chainable. Call `.build()` at the end to get a `RegExp`, or `.toString()` to get the pattern string.

### Factory

```ts
import { regez } from 'regez-fluent';

const r = regez(); // creates a new builder
```

### Anchors

| Method | Regex | Description |
|--------|-------|-------------|
| `.start()` | `^` | Start of string |
| `.end()` | `$` | End of string |
| `.boundary()` | `\b` | Word boundary |

```ts
regez().start().digit().oneOrMore().end().build(); // /^\d+$/
regez().boundary().literal('word').boundary().build(); // /\bword\b/
```

### Shorthands

| Method | Regex | Description |
|--------|-------|-------------|
| `.digit()` | `\d` | Any digit (0-9) |
| `.word()` | `\w` | Any word character (a-z, A-Z, 0-9, _) |
| `.whitespace()` | `\s` | Any whitespace |
| `.any()` | `.` | Any character except newline |

```ts
regez().digit().oneOrMore().build();     // /\d+/
regez().word().exactly(5).build();       // /\w{5}/
```

### Literal

```ts
.literal(str: string)
```

Matches the exact string. All regex special characters are automatically escaped.

```ts
regez().literal('$100').build();         // /\$100/
regez().literal('file.txt').build();     // /file\.txt/
regez().literal('(yes)').build();        // /\(yes\)/
```

### Quantifiers

Quantifiers apply to the **preceding** token.

| Method | Regex | Description |
|--------|-------|-------------|
| `.maybe()` | `?` | 0 or 1 |
| `.oneOrMore()` | `+` | 1 or more |
| `.zeroOrMore()` | `*` | 0 or more |
| `.exactly(n)` | `{n}` | Exactly n times |
| `.between(min, max)` | `{min,max}` | Between min and max times |

```ts
regez().literal('http').literal('s').maybe().literal('://').build();
// /https?:\/\//

regez().digit().between(2, 4).build();  // /\d{2,4}/
```

Multi-character tokens are automatically wrapped in a non-capturing group before quantifiers:

```ts
regez().literal('abc').oneOrMore().build(); // /(?:abc)+/
```

### Character Classes

```ts
.anyOf(chars: string[])    // [chars]  — match any of these
.except(chars: string[])   // [^chars] — match anything except these
```

Special characters inside classes are automatically escaped.

```ts
regez().anyOf(['a', 'b', 'c']).oneOrMore().build();  // /[abc]+/
regez().except(['0', '1', '2']).build();              // /[^012]/
regez().anyOf([']', '-', '\\']).build();              // /[\]\-\\]/
```

### Capture Groups

```ts
.capture(callback)              // unnamed group: (...)
.capture(name, callback)        // named group: (?<name>...)
```

Uses a callback pattern to prevent unclosed groups:

```ts
// Unnamed capture
regez()
  .capture(r => r.digit().oneOrMore())
  .build();
// /(\d+)/

// Named capture
regez()
  .capture('year', r => r.digit().exactly(4))
  .literal('-')
  .capture('month', r => r.digit().exactly(2))
  .build();
// /(?<year>\d{4})-(?<month>\d{2})/
```

### Raw

```ts
.raw(pattern: string)
```

Insert a raw regex pattern string. Use when you need something the builder doesn't cover.

```ts
regez().raw('[A-Z]').oneOrMore().build();  // /[A-Z]+/
regez().raw('(?:foo|bar)').build();        // /(?:foo|bar)/
```

### Specials

Built-in patterns for common formats.

#### `.email()`

Matches standard email addresses.

```ts
const re = regez().start().email().end().build();
re.test('user@example.com');        // true
re.test('first.last+tag@org.co');   // true
re.test('not-an-email');            // false
```

#### `.ipv4()`

Matches IPv4 addresses with proper 0-255 octet validation.

```ts
const re = regez().start().ipv4().end().build();
re.test('192.168.1.1');       // true
re.test('255.255.255.255');   // true
re.test('256.0.0.0');         // false
```

#### `.date(format?)`

Matches dates. Validates month (1-12) and day (1-31) ranges. Supports optional leading zeros.

| Format | Example |
|--------|---------|
| `'YYYY-MM-DD'` (default) | `2024-01-15` |
| `'MM/DD/YYYY'` | `01/15/2024` |
| `'DD.MM.YYYY'` | `15.01.2024` |

```ts
const re = regez().start().date('YYYY-MM-DD').end().build();
re.test('2024-01-15');   // true
re.test('2024-1-5');     // true (leading zeros optional)
re.test('2024-13-01');   // false (month > 12)
```

#### `.numberRange(min, max)`

Generates a regex that matches any integer in the range `[min, max]`. Handles multi-digit decomposition automatically.

```ts
regez().numberRange(0, 255).build();
// Matches "0", "1", ..., "255" — rejects "256", "999", "-1"

regez().numberRange(1900, 2099).build();
// Matches four-digit years in range
```

### Flags

```ts
.withFlags(flags: string)
```

Set regex flags. Validates that all flags are valid (`d`, `g`, `i`, `m`, `s`, `u`, `v`, `y`) and rejects duplicates.

```ts
regez().word().oneOrMore().withFlags('gi').build();  // /\w+/gi
```

### Build

| Method | Returns | Description |
|--------|---------|-------------|
| `.build()` | `RegExp` | Compile to a RegExp object |
| `.toString()` | `string` | Get the pattern string |

```ts
const re = regez().digit().oneOrMore().build();
re.test('123');           // true

const pattern = regez().digit().oneOrMore().toString();
console.log(pattern);     // "\d+"
```

## Real-World Examples

### US Phone Number

```ts
const phone = regez()
  .start()
  .literal('(')
  .digit().exactly(3)
  .literal(') ')
  .digit().exactly(3)
  .literal('-')
  .digit().exactly(4)
  .end()
  .build();

phone.test('(555) 123-4567'); // true
```

### Hex Color Code

```ts
const hex = regez()
  .start()
  .literal('#')
  .anyOf('abcdefABCDEF0123456789'.split(''))
  .exactly(6)
  .end()
  .build();

hex.test('#ff00aa'); // true
hex.test('#FFFFFF'); // true
```

### URL Protocol

```ts
const url = regez()
  .start()
  .literal('http')
  .literal('s').maybe()
  .literal('://')
  .word().oneOrMore()
  .build();

url.test('https://example'); // true
url.test('http://test');     // true
```

### Named Capture Groups

```ts
const dateRegex = regez()
  .start()
  .capture('year', r => r.digit().exactly(4))
  .literal('-')
  .capture('month', r => r.digit().exactly(2))
  .literal('-')
  .capture('day', r => r.digit().exactly(2))
  .end()
  .build();

const match = '2024-03-15'.match(dateRegex);
console.log(match?.groups);
// { year: '2024', month: '03', day: '15' }
```

### IPv4 in a Larger Pattern

```ts
const logLine = regez()
  .literal('[')
  .capture('ip', r => r.ipv4())
  .literal('] ')
  .capture('message', r => r.any().oneOrMore())
  .build();

const match = '[192.168.1.1] Connection established'.match(logLine);
console.log(match?.groups?.ip);      // '192.168.1.1'
console.log(match?.groups?.message); // 'Connection established'
```

## TypeScript

Full type definitions are included. The `Token` type is exported for advanced use cases:

```ts
import { regez, Regez, numberRangePattern } from 'regez-fluent';
import type { Token } from 'regez-fluent';
```

## Compatibility

- **Node.js** >= 18
- **Browsers**: All modern browsers (ES2022)
- **Module formats**: ESM, CommonJS
- **Zero dependencies**

## License

[MIT](./LICENSE)
