import { numberRangePattern } from './number-range';

export function emailPattern(): string {
  return '[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}';
}

export function ipv4Pattern(): string {
  const octet = numberRangePattern(0, 255);
  return `${octet}\\.${octet}\\.${octet}\\.${octet}`;
}

export function datePattern(format: string = 'YYYY-MM-DD'): string {
  const year = numberRangePattern(1900, 2099);
  const month = numberRangePattern(1, 12);
  const day = numberRangePattern(1, 31);

  switch (format) {
    case 'YYYY-MM-DD':
      return `${year}-${padded(month)}-${padded(day)}`;
    case 'MM/DD/YYYY':
      return `${padded(month)}/${padded(day)}/${year}`;
    case 'DD.MM.YYYY':
      return `${padded(day)}\\.${padded(month)}\\.${year}`;
    default:
      return `${year}-${padded(month)}-${padded(day)}`;
  }
}

/** Wrap a pattern to allow optional leading zero for single/double digit values */
function padded(pattern: string): string {
  return `0?${pattern}`;
}
