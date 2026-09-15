import { useEffect, useState } from 'react';
import PixelSwap from '../reactbits/PixelSwap.jsx';
import SplitText from '../reactbits/SplitText.jsx';
import AnimatedContent from '../reactbits/AnimatedContent.jsx';

function svg(inner) {
  const markup = `<svg xmlns="http://www.w3.org/2000/svg" width="460" height="320" viewBox="0 0 460 320" style="font-family:Inter,system-ui,-apple-system,sans-serif;">${inner}</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(markup)}`;
}

function expenseFormSvg() {
  return svg(`
    <rect width="460" height="320" rx="20" fill="#12182B"/>
    <text x="230" y="42" text-anchor="middle" font-size="13" font-weight="700" letter-spacing="3" fill="#8B35FF">ADD AN EXPENSE</text>
    <rect x="30" y="70" width="400" height="50" rx="12" fill="#0B1020"/>
    <text x="52" y="100" font-size="16" fill="#FFFFFF">Lunch</text>
    <rect x="30" y="130" width="180" height="40" rx="10" fill="#0B1020"/>
    <text x="52" y="156" font-size="15" fill="#9CA3AF">Amount</text>
    <text x="150" y="156" font-size="16" font-weight="700" fill="#FFFFFF">₹120</text>
    <rect x="220" y="130" width="210" height="40" rx="10" fill="#0B1020"/>
    <rect x="240" y="137" width="52" height="26" rx="13" fill="#6C4BFF"/>
    <text x="266" y="155" text-anchor="middle" font-size="12" fill="#FFFFFF">Food</text>
    <rect x="300" y="137" width="52" height="26" rx="13" fill="#0B1020" stroke="#374151" stroke-width="1"/>
    <text x="326" y="155" text-anchor="middle" font-size="12" fill="#E5E7EB">UPI</text>
    <rect x="30" y="195" width="400" height="46" rx="12" fill="url(#g1)"/>
    <defs><linearGradient id="g1" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#6C4BFF"/><stop offset="0.5" stop-color="#8B35FF"/><stop offset="1" stop-color="#D900C8"/>
    </linearGradient></defs>
    <text x="230" y="224" text-anchor="middle" font-size="15" font-weight="700" fill="#FFFFFF">Save Expense</text>
    <circle cx="230" cy="265" r="20" fill="#F59E0B" opacity="0.15"/>
    <text x="230" y="271" text-anchor="middle" font-size="10" fill="#F59E0B">Quick &amp; easy</text>
  `);
}

function expenseSavedSvg() {
  return svg(`
    <rect width="460" height="320" rx="20" fill="#12182B"/>
    <text x="230" y="42" text-anchor="middle" font-size="13" font-weight="700" letter-spacing="3" fill="#10B981">EXPENSE SAVED</text>
    <circle cx="230" cy="88" r="22" fill="#10B981"/>
    <path d="M220 88 L227 95 L242 79" stroke="#FFFFFF" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="30" y="130" width="400" height="46" rx="12" fill="#0B1020"/>
    <text x="52" y="158" font-size="15" fill="#FFFFFF">Lunch</text>
    <text x="330" y="158" font-size="16" font-weight="700" fill="#FF2D7A">−₹120</text>
    <rect x="30" y="188" width="400" height="40" rx="10" fill="#0B1020"/>
    <text x="52" y="214" font-size="13" fill="#9CA3AF">Category</text>
    <text x="170" y="214" font-size="14" fill="#FFFFFF">Food</text>
    <text x="280" y="214" font-size="13" fill="#9CA3AF">Remaining</text>
    <text x="372" y="214" font-size="14" font-weight="700" fill="#10B981">₹2,130</text>
    <rect x="30" y="248" width="120" height="30" rx="15" fill="#10B981" opacity="0.15"/>
    <text x="90" y="268" text-anchor="middle" font-size="12" font-weight="700" fill="#10B981">✓  Saved</text>
    <text x="230" y="280" text-anchor="middle" font-size="10" fill="#4B5563">Your balance updated automatically</text>
  `);
}

export default function ExpensePixelSwap() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <section className="py-20 lg:py-28 bg-white dark:bg-navy-light">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <p className="text-xs font-bold tracking-[0.2em] text-violet uppercase mb-3">Hover to see it</p>
          <SplitText
            as="h2"
            text="Add an expense in seconds."
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy dark:text-white leading-tight"
            delay={30}
          />
          <p className="text-gray-500 dark:text-gray-400 mt-4 max-w-xl leading-relaxed">
            Typing, saving, done. Every expense updates your balance, budget progress and analytics instantly.
            Try the demo — hover or tap to watch an expense get saved in a flash.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            {['Instant sync', 'Balance recalculation', 'Budget tracking'].map((chip) => (
              <span key={chip} className="px-3 py-1.5 rounded-full text-xs font-medium bg-purple/10 text-purple">
                {chip}
              </span>
            ))}
          </div>
        </div>

        <AnimatedContent direction="horizontal" reverse distance={40}>
          <div className="flex justify-center lg:justify-end">
            <PixelSwap
              imgSrc1={expenseFormSvg()}
              imgSrc2={expenseSavedSvg()}
              width={460}
              height={320}
              pixelSize={56}
              animationDuration={1200}
              pixelDuration={450}
              pattern="diagonal"
              text=""
              firstImgAlt="Add expense form"
              secondImgAlt="Expense saved"
              className="rounded-2xl shadow-2xl shadow-purple/20 max-w-full"
            />
          </div>
        </AnimatedContent>
      </div>
    </section>
  );
}