const SPECIAL_CHARS = /[.*+?^${}()|[\]\\]/g;

export function escapeRegex(str: string): string {
  return str.replace(SPECIAL_CHARS, '\\$&');
}
