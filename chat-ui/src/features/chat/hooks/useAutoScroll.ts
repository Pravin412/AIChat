import { useEffect, useLayoutEffect, useRef } from 'react';

export function useAutoScroll(revision: string) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const nearBottom = useRef(true);
  const frame = useRef(0);
  useEffect(() => {
    const scroll = scrollRef.current;
    const content = contentRef.current;
    if (!scroll || !content) return;
    const track = () => {
      nearBottom.current =
        scroll.scrollHeight - scroll.scrollTop - scroll.clientHeight < 100;
    };
    const resize = () => {
      cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => {
        if (nearBottom.current) scroll.scrollTop = scroll.scrollHeight;
      });
    };
    scroll.addEventListener('scroll', track, { passive: true });
    const observer = new ResizeObserver(resize);
    observer.observe(content);
    return () => {
      scroll.removeEventListener('scroll', track);
      observer.disconnect();
      cancelAnimationFrame(frame.current);
    };
  }, []);
  useLayoutEffect(() => {
    const scroll = scrollRef.current;
    if (scroll && nearBottom.current) scroll.scrollTop = scroll.scrollHeight;
  }, [revision]);
  return { scrollRef, contentRef };
}
