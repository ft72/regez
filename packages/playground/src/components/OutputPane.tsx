import { useState } from 'react';

interface OutputPaneProps {
  pattern: string;
  error: string | null;
}

export function OutputPane({ pattern, error }: OutputPaneProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!pattern) return;
    await navigator.clipboard.writeText(pattern);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="border border-[var(--color-border)] rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--color-border)] bg-[var(--color-surface-raised)]">
        <span className="text-sm font-medium text-[var(--color-text-muted)]">Regex Output</span>
        {pattern && (
          <button
            onClick={handleCopy}
            className="text-xs px-2.5 py-1 rounded-md bg-[var(--color-surface-overlay)] hover:bg-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors cursor-pointer"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        )}
      </div>
      <div className="p-4 min-h-[60px] bg-[var(--color-surface)]">
        {error ? (
          <div className="text-[var(--color-error)] text-sm font-mono break-all">
            {error}
          </div>
        ) : pattern ? (
          <code className="text-lg font-mono text-[var(--color-accent-hover)] break-all select-all">
            /{pattern}/
          </code>
        ) : (
          <span className="text-[var(--color-text-muted)] text-sm italic">
            Write code in the editor to see the regex...
          </span>
        )}
      </div>
    </div>
  );
}
