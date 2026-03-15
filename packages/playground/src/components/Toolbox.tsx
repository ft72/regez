import { TOOLBOX_FRAGMENTS } from '../lib/toolbox-fragments';

interface ToolboxProps {
  onInsert: (code: string) => void;
}

export function Toolbox({ onInsert }: ToolboxProps) {
  const categories = [...new Set(TOOLBOX_FRAGMENTS.map(f => f.category))];

  return (
    <div className="border border-[var(--color-border)] rounded-lg overflow-hidden">
      <div className="px-4 py-2 border-b border-[var(--color-border)] bg-[var(--color-surface-raised)]">
        <span className="text-sm font-medium text-[var(--color-text-muted)]">Toolbox</span>
      </div>
      <div className="p-3 space-y-3">
        {categories.map(cat => (
          <div key={cat}>
            <div className="text-xs font-medium text-[var(--color-text-muted)]/70 uppercase tracking-wider mb-1.5">
              {cat}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {TOOLBOX_FRAGMENTS.filter(f => f.category === cat).map(fragment => (
                <button
                  key={fragment.label}
                  onClick={() => onInsert(fragment.code)}
                  className="text-xs px-2.5 py-1.5 rounded-md bg-[var(--color-surface-overlay)] hover:bg-[var(--color-accent)]/20 border border-[var(--color-border)] hover:border-[var(--color-accent)]/40 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-all cursor-pointer"
                >
                  {fragment.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
