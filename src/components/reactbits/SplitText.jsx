import { useRef, useEffect, useState, useCallback } from 'react';

/**
 * SplitText - Splits text into characters and animates them in.
 */
export default function SplitText({
  text = '',
  className = '',
  delay = 100,
  animationFrom = { opacity: 0, transform: 'translate3d(0,40px,0)' },
  animationTo = { opacity: 1, transform: 'translate3d(0,0,0)' },
  easing = 'easeOutCubic',
  threshold = 0.2,
  rootMargin = '-50px',
  startOnView = true,
  as: Tag = 'span',
  ...props
}) {
  const containerRef = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!startOnView) {
      setInView(true);
      return;
    }
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [startOnView, threshold, rootMargin]);

  const words = text.split(' ');
  let charCounter = 0;

  return (
    <Tag ref={containerRef} className={className} {...props}>
      {words.map((word, wIdx) => {
        const chars = word.split('');
        return (
          <span key={wIdx} style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>
            {chars.map((char) => {
              const charIndex = charCounter++;
              return (
                <span
                  key={charIndex}
                  aria-hidden="true"
                  style={{
                    display: 'inline-block',
                    opacity: inView ? 1 : 0,
                    transform: inView ? 'translate3d(0,0,0)' : 'translate3d(0,40px,0)',
                    transition: `opacity 0.6s cubic-bezier(0.22,1,0.36,1) ${charIndex * (delay / 1000)}s, transform 0.6s cubic-bezier(0.22,1,0.36,1) ${charIndex * (delay / 1000)}s`,
                  }}
                >
                  {char}
                </span>
              );
            })}
            {wIdx < words.length - 1 && <span>&nbsp;</span>}
          </span>
        );
      })}
    </Tag>
  );
}
