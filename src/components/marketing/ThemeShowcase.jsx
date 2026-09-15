import { useEffect, useState } from 'react';
import SplitText from '../reactbits/SplitText.jsx';
import AnimatedContent from '../reactbits/AnimatedContent.jsx';
import PixelSwap from '../reactbits/PixelSwap.jsx';
import FadeContent from '../reactbits/FadeContent.jsx';

export default function ThemeShowcase() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const lightSvg = dashboardSvg({ dark: false });
  const darkSvg = dashboardSvg({ dark: true });

  return (
    <section className="py-20 lg:py-28 bg-navy text-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-xs font-bold tracking-[0.2em] text-violet uppercase mb-3">Your Vibe. Your Way.</p>
          <SplitText
            as="h2"
            text="Light mode. Dark mode. You pick."
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight"
            delay={30}
          />
          <FadeContent>
            <p className="text-gray-400 mt-4 max-w-xl mx-auto leading-relaxed">
              Switch anytime. Every chart, card and screen adapts with comfortable contrast.
            </p>
          </FadeContent>
        </div>

        <AnimatedContent distance={60} className="mt-14 flex justify-center">
          <PixelSwap
            imgSrc1={lightSvg}
            imgSrc2={darkSvg}
            width={520}
            height={340}
            pixelSize={40}
            animationDuration={1200}
            pixelDuration={450}
            pattern="diagonal"
            firstImgAlt="Light mode dashboard"
            secondImgAlt="Dark mode dashboard"
            text=""
            className="rounded-2xl shadow-2xl shadow-purple/20 max-w-full"
          />
        </AnimatedContent>
      </div>
    </section>
  );
}

function dashboardSvg({ dark }) {
  const bg = dark ? '#0B1020' : '#F7F8FC';
  const card = dark ? '#12182B' : '#FFFFFF';
  const text = dark ? '#FFFFFF' : '#0B1020';
  const sub = dark ? '#9CA3AF' : '#6B7280';
  const border = dark ? '#1f2a45' : '#E5E7EB';
  const inner = `
    <rect width="520" height="340" rx="20" fill="${bg}"/>
    <rect x="0" y="0" width="520" height="46" fill="${card}"/>
    <rect x="18" y="14" width="24" height="18" rx="6" fill="#6C4BFF"/>
    <text x="52" y="29" font-size="14" font-weight="700" fill="${text}">Pocket Money</text>
    <rect x="470" y="16" width="8" height="8" rx="4" fill="#10B981"/>
    <rect x="16" y="62" width="120" height="170" rx="12" fill="${card}" stroke="${border}" stroke-width="1"/>
    ${['Dashboard','Expenses','Income','Budgets','Savings'].map((l, i) =>
      `<text x="30" y="${90 + i * 30}" font-size="11" fill="${i === 0 ? '#FFFFFF' : sub}">${i === 0 ? '▦' : ''} ${l}</text>`
    ).join('')}
    <rect x="148" y="62" width="356" height="34" rx="8" fill="${card}" stroke="${border}" stroke-width="1"/>
    <text x="160" y="84" font-size="12" font-weight="700" fill="${text}">Your Money Overview</text>
    <rect x="148" y="106" width="108" height="64" rx="12" fill="${card}" stroke="${border}" stroke-width="1"/>
    <text x="160" y="126" font-size="9" fill="${sub}">POCKET MONEY</text>
    <text x="160" y="150" font-size="16" font-weight="700" fill="${text}">₹5,000</text>
    <rect x="264" y="106" width="108" height="64" rx="12" fill="${card}" stroke="${border}" stroke-width="1"/>
    <text x="276" y="126" font-size="9" fill="${sub}">SPENT</text>
    <text x="276" y="150" font-size="16" font-weight="700" fill="#FF2D7A">₹3,250</text>
    <rect x="380" y="106" width="112" height="64" rx="12" fill="${card}" stroke="${border}" stroke-width="1"/>
    <text x="392" y="126" font-size="9" fill="${sub}">REMAINING</text>
    <text x="392" y="150" font-size="16" font-weight="700" fill="#10B981">₹1,750</text>
    <rect x="148" y="184" width="220" height="90" rx="12" fill="${card}" stroke="${border}" stroke-width="1"/>
    <text x="160" y="206" font-size="10" fill="${sub}">DAILY SPENDING</text>
    ${[180,120,250,160,220,140,200].map((v, i) => {
      const h = v / 3;
      return `<rect x="${162 + i * 30}" y="${262 - h}" width="18" height="${h}" rx="4" fill="#6C4BFF"/>`;
    }).join('')}
    <rect x="380" y="184" width="124" height="90" rx="12" fill="${card}" stroke="${border}" stroke-width="1"/>
    <text x="392" y="206" font-size="10" fill="${sub}">CATEGORIES</text>
    <circle cx="442" cy="238" r="32" fill="none" stroke="#E5E7EB" stroke-width="10"/>
    <circle cx="442" cy="238" r="32" fill="none" stroke="#8B35FF" stroke-width="10" stroke-linecap="round" stroke-dasharray="60 140" transform="rotate(-90 442 238)"/>
    <rect x="148" y="286" width="356" height="38" rx="10" fill="${card}" stroke="${border}" stroke-width="1"/>
    <text x="234" y="310" font-size="12" font-weight="700" fill="#FFFFFF">+ Add Expense</text>
    <rect x="378" y="296" width="116" height="20" rx="6" fill="#0B1020" stroke="#1f2a45" stroke-width="1"/>
  `;
  const markup = `<svg xmlns="http://www.w3.org/2000/svg" width="520" height="340" viewBox="0 0 520 340" style="font-family:Inter,system-ui,-apple-system,sans-serif;">${inner}</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(markup)}`;
}