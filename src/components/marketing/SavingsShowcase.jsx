import { useEffect, useState } from 'react';
import SplitText from '../reactbits/SplitText.jsx';
import AnimatedContent from '../reactbits/AnimatedContent.jsx';
import CountUp from '../reactbits/CountUp.jsx';
import GlareHover from '../reactbits/GlareHover.jsx';

export default function SavingsShowcase() {
  const [celebrate, setCelebrate] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setCelebrate(true), 1800);
    const clear = setTimeout(() => setCelebrate(false), 4200);
    return () => { clearTimeout(t); clearTimeout(clear); };
  }, []);

  const pct = 60;

  return (
    <section className="py-20 lg:py-28 bg-navy text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <p className="text-xs font-bold tracking-[0.2em] text-violet uppercase mb-3">Savings Goals</p>
          <SplitText
            as="h2"
            text="Small savings. Big goals."
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight"
            delay={30}
          />
          <p className="text-gray-400 mt-4 max-w-xl leading-relaxed">
            Set a goal, watch the ring fill up, and stay motivated. Every rupee saved moves you closer.
          </p>
          <ul className="mt-6 space-y-2 text-gray-300 text-sm">
            {['Visual progress rings', 'Automatic savings tracking', 'Target date countdown'].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full gradient-bg" /> {item}
              </li>
            ))}
          </ul>
        </div>

        <AnimatedContent distance={60}>
          <GlareHover className="rounded-3xl bg-navy-light border border-white/10 p-8 max-w-md mx-auto text-center relative">
            {celebrate && (
              <div className="pointer-events-none absolute inset-0 overflow-hidden text-xl">
                {['🎉', '✨', '🎊', '💫', '🎈', '⭐'].map((e, i) => (
                  <span
                    key={i}
                    className="absolute animate-bounce"
                    style={{ left: `${10 + i * 15}%`, top: '-10px', animationDelay: `${i * 0.2}s` }}
                  >
                    {e}
                  </span>
                ))}
              </div>
            )}
            <span className="text-5xl">🎧</span>
            <h3 className="font-bold text-xl text-white mt-2">New Headphones</h3>
            <div className="relative w-40 h-40 mx-auto my-6">
              <div
                className="absolute inset-0 rounded-full"
                style={{ background: `conic-gradient(#6C4BFF, #8B35FF, #D900C8, #6C4BFF) ${pct * 3.6}deg` }}
              />
              <div className="absolute inset-3 rounded-full bg-navy-light flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold gradient-text"><CountUp end={pct} suffix="%" /></span>
                <span className="text-[11px] text-gray-400 mt-1">Complete</span>
              </div>
            </div>
            <p className="font-semibold text-white">
              <CountUp end={1800} prefix="₹" /> <span className="text-gray-400">/</span> <CountUp end={3000} prefix="₹" />
            </p>
            <p className="text-sm text-gray-400 mt-1"><CountUp end={1200} prefix="₹" /> remaining to reach your goal</p>
          </GlareHover>
        </AnimatedContent>
      </div>
    </section>
  );
}