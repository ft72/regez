import Editor, { type OnMount } from '@monaco-editor/react';
import { useRef, useCallback } from 'react';
import type { editor } from 'monaco-editor';

interface EditorPaneProps {
  code: string;
  onChange: (value: string) => void;
  onEditorMount?: (editor: editor.IStandaloneCodeEditor) => void;
}

export function EditorPane({ code, onChange, onEditorMount }: EditorPaneProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  const handleMount: OnMount = useCallback((editor) => {
    editorRef.current = editor;
    onEditorMount?.(editor);
  }, [onEditorMount]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--color-border)]">
        <span className="text-sm font-medium text-[var(--color-text-muted)]">Builder Code</span>
        <span className="text-xs px-2 py-0.5 rounded bg-[var(--color-surface-overlay)] text-[var(--color-text-muted)] font-mono">
          TypeScript
        </span>
      </div>
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          language="typescript"
          theme="vs-dark"
          value={code}
          onChange={(v) => onChange(v ?? '')}
          onMount={handleMount}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: "'JetBrains Mono', monospace",
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            padding: { top: 12 },
            renderLineHighlight: 'gutter',
            overviewRulerLanes: 0,
            hideCursorInOverviewRuler: true,
            scrollbar: {
              verticalScrollbarSize: 6,
              horizontalScrollbarSize: 6,
            },
            tabSize: 2,
            automaticLayout: true,
          }}
        />
      </div>
    </div>
  );
}
