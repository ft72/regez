import { useMemo } from 'react';

interface TestStringInputProps {
  testString: string;
  onChange: (value: string) => void;
  regex: RegExp | null;
}

export function TestStringInput({ testString, onChange, regex }: TestStringInputProps) {
  const matchResult = useMemo(() => {
    if (!regex || !testString) return null;
    try {
      const fullMatch = new RegExp(`^${regex.source}$`, regex.flags);
      return fullMatch.test(testString);
    } catch {
      return null;
    }
  }, [testString, regex]);

  const borderColor =
    matchResult === null
      ? 'border-[var(--color-border)]'
      : matchResult
        ? 'border-[var(--color-success)]'
        : 'border-[var(--color-error)]';

  const bgGlow =
    matchResult === null
      ? ''
      : matchResult
        ? 'shadow-[0_0_12px_-4px_var(--color-success)]'
        : 'shadow-[0_0_12px_-4px_var(--color-error)]';

  return (
    <div className="border border-[var(--color-border)] rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--color-border)] bg-[var(--color-surface-raised)]">
        <span className="text-sm font-medium text-[var(--color-text-muted)]">Test String</span>
        {matchResult !== null && (
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              matchResult
                ? 'bg-green-500/15 text-[var(--color-success)]'
                : 'bg-red-500/15 text-[var(--color-error)]'
            }`}
          >
            {matchResult ? 'Match' : 'No Match'}
          </span>
        )}
      </div>
      <div className="p-2">
        <input
          type="text"
          value={testString}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type a test string..."
          className={`w-full px-3 py-2.5 rounded-md bg-[var(--color-surface)] border ${borderColor} ${bgGlow} text-[var(--color-text)] font-mono text-sm outline-none transition-all focus:border-[var(--color-border-focus)] placeholder:text-[var(--color-text-muted)]/50`}
        />
      </div>
    </div>
  );
}
