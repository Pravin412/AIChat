import { useCallback, useEffect, useRef, useState } from 'react';

export function useCopyText() {
  const [status, setStatus] = useState<'idle' | 'copied' | 'error'>('idle');
  const mounted = useRef(true);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);
  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      if (!mounted.current) return;
      setStatus('copied');
    } catch {
      if (!mounted.current) return;
      setStatus('error');
    }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      if (mounted.current) setStatus('idle');
    }, 2_000);
  }, []);
  return { status, copy };
}
