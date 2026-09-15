import { useRef, useEffect, useState } from 'react';

/**
 * ScrollExpand - scales a small preview into a fullscreen hero as the user
 * scrolls. Matches reactbits.dev/ScrollExpand behavior.
 *
 * Props:
 *  - children: the media/dashboard preview (required)
 *  - overlayContent: fullscreen content to reveal once fully expanded
 *  - initialOverlay: content positioned above the small preview (fades out)
 *  - startWidth/startHeight: initial preview size (px)
 *  - startRadius/endRadius: border radius during expansion (px)
 *  - mediaZoom: how much inner media zooms
 *  - scrollDistance/holdDistance: scroll pacing
 *  - smoothing: easing
 *  - overlayScrim: dark overlay strength once expanded
 *  - useWindowScroll
 *  - containerHeight: total scroll length (px). Default computed = preview + ~250%.
 */
export default function ScrollExpand({
  children,
  overlayContent,
  initialOverlay,
  startWidth = 1080,
  startHeight = 640,
  startRadius = 28,
  endRadius = 0,
  mediaZoom = 1.3,
  scrollDistance = 1.2,
  holdDistance = 0.3,
  smoothing = 0.1,
  overlayScrim = 0.45,
  useWindowScroll = true,
  containerHeight,
}) {
  const targetRef = useRef(null);
  const [offset, setOffset] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = () => setReducedMotion(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const totalDistance = scrollDistance + holdDistance;

    const update = () => {
      const el = targetRef.current;
      if (!el) return;
      let distance = 0;
      if (useWindowScroll) {
        const rect = el.getBoundingClientRect();
        distance = window.innerHeight / 2 - rect.top - rect.height / 2;
      }
      const progress = Math.min(Math.max(distance / startHeight, 0), totalDistance);
      const t = Math.min(progress, 1);
      setOffset(t);
      setIsExpanded(progress >= scrollDistance);
    };

    if (reducedMotion) {
      setOffset(1);
      setIsExpanded(true);
      return;
    }

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [useWindowScroll, scrollDistance, holdDistance, startHeight, reducedMotion]);

  const eased = 1 - Math.pow(1 - offset, smoothing);
  const vw = typeof window !== 'undefined' ? window.innerWidth : startWidth;
  const vh = typeof window !== 'undefined' ? window.innerHeight : startHeight;

  const mediaScale = 1 + (mediaZoom - 1) * (1 - eased);
  const cardWidth = startWidth + eased * (vw - startWidth);
  const cardHeight = startHeight + eased * (vh - startHeight);
  const radius = startRadius + eased * (endRadius - startRadius);
  const initialOpacity = 1 - easingToOpacity(offset);

  const height = containerHeight || vh + startHeight * 2.2;

  return (
    <div className="relative w-full overflow-hidden" style={{ height: reducedMotion ? '100vh' : height }}>
      <div
        ref={targetRef}
        className="sticky top-0 left-0 w-full flex flex-col items-center justify-center px-4"
        style={{ height: '100vh', overflow: 'hidden' }}
      >
        {initialOverlay && (
          <div
            className="z-20 px-4 flex flex-col items-center text-center transition-all duration-300 pointer-events-auto"
            style={{
              opacity: initialOverlayOpacity(offset),
              filter: `blur(${offset * 16}px)`,
              transform: `translateY(${offset * -60}px) scale(${1 - offset * 0.15})`,
              marginBottom: `${(1 - eased) * 24}px`,
            }}
          >
            {initialOverlay}
          </div>
        )}

        <div
          className="relative overflow-hidden shrink-0"
          style={{
            width: reducedMotion ? '100vw' : cardWidth,
            height: reducedMotion ? '100vh' : cardHeight,
            borderRadius: `${reducedMotion ? endRadius : radius}px`,
            boxShadow: offset > 0 ? '0 40px 120px -40px rgba(0,0,0,0.6)' : '0 30px 90px -30px rgba(108,75,255,0.5)',
          }}
        >
          <div
            className="w-full h-full"
            style={{
              transform: `scale(${mediaScale})`,
              transformOrigin: 'center center',
            }}
          >
            {children}
          </div>

          {isExpanded && !reducedMotion && (
            <div
              className="absolute inset-0 z-10 flex items-center justify-center transition-opacity"
              style={{
                backgroundColor: `rgba(11,16,32,${overlayScrim})`,
                opacity: Math.min((offset - (scrollDistance - 0.15)) / 0.15, 1),
              }}
            >
              {overlayContent}
            </div>
          )}
          {reducedMotion && overlayContent && (
            <div className="absolute inset-0 z-10 flex items-center justify-center" style={{ backgroundColor: `rgba(11,16,32,${overlayScrim})` }}>
              {overlayContent}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function easingToOpacity(offset) {
  return offset > 0.55 ? Math.max(0, 1 - (offset - 0.55) / 0.45) : 1;
}

function initialOverlayOpacity(offset) {
  return Math.max(0, 1 - offset * 1.2);
}