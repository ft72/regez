import { useState, useEffect, useRef } from 'react';
import { compileCode, type CompileResult } from '../lib/compiler';

export function useRegezCompiler(code: string, debounceMs = 300) {
  const [result, setResult] = useState<CompileResult>({
    pattern: '',
    regex: null,
    error: null,
  });

  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setResult(compileCode(code));
    }, debounceMs);

    return () => clearTimeout(timeoutRef.current);
  }, [code, debounceMs]);

  return result;
}
