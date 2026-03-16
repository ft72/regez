import { useState, useCallback, useRef } from 'react';
import type { editor } from 'monaco-editor';
import { EditorPane } from './components/EditorPane';
import { OutputPane } from './components/OutputPane';
import { TestStringInput } from './components/TestStringInput';
import { Toolbox } from './components/Toolbox';
import { useRegezCompiler } from './hooks/useRegezCompiler';
import { DEFAULT_CODE, EXAMPLES } from './lib/examples';

export default function App() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [testString, setTestString] = useState('123');
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const result = useRegezCompiler(code);

  const handleEditorMount = useCallback((ed: editor.IStandaloneCodeEditor) => {
    editorRef.current = ed;
  }, []);

  const handleInsert = useCallback((fragment: string) => {
    const ed = editorRef.current;
    if (!ed) return;
    const position = ed.getPosition();
    if (!position) return;
    ed.executeEdits('toolbox', [
      {
        range: {
          startLineNumber: position.lineNumber,
          startColumn: position.column,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        },
        text: fragment,
      },
    ]);
    ed.focus();
  }, []);

  const handleExampleSelect = useCallback((name: string) => {
    const example = EXAMPLES[name];
    if (example) setCode(example);
  }, []);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface-raised)] shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold tracking-tight">
            <span className="text-[var(--color-accent)]">regez</span>
            <span className="text-[var(--color-text-muted)]">-fluent</span>
          </h1>
          <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/20">
            playground
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--color-text-muted)]">Examples:</span>
          <select
            onChange={(e) => handleExampleSelect(e.target.value)}
            className="text-xs px-2 py-1 rounded-md bg-[var(--color-surface-overlay)] border border-[var(--color-border)] text-[var(--color-text-muted)] outline-none cursor-pointer"
            defaultValue="Digits Only"
          >
            {Object.keys(EXAMPLES).map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex min-h-0">
        {/* Left: Editor */}
        <div className="w-1/2 border-r border-[var(--color-border)] flex flex-col min-h-0">
          <EditorPane
            code={code}
            onChange={setCode}
            onEditorMount={handleEditorMount}
          />
        </div>

        {/* Right: Output + Test + Toolbox */}
        <div className="w-1/2 flex flex-col min-h-0 overflow-y-auto">
          <div className="p-4 space-y-4">
            <OutputPane pattern={result.pattern} error={result.error} />
            <TestStringInput
              testString={testString}
              onChange={setTestString}
              regex={result.regex}
            />
            <Toolbox onInsert={handleInsert} />
          </div>
        </div>
      </div>
    </div>
  );
}
