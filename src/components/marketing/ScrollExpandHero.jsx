import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Wallet, ArrowRight, Play, ShieldCheck } from 'lucide-react';
import ScrollExpand from '../reactbits/ScrollExpand.jsx';
import SplitText from '../reactbits/SplitText.jsx';
import GradientText from '../reactbits/GradientText.jsx';
import BlurText from '../reactbits/BlurText.jsx';
import CountUp from '../reactbits/CountUp.jsx';
import FadeContent from '../reactbits/FadeContent.jsx';
import Magnet from '../reactbits/Magnet.jsx';
import { formatINR } from '../../utils/format.js';

export default function ScrollExpandHero() {
  const [videoMode, setVideoMode] = useState(false);

  return (
    <div className="relative bg-navy">
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(60% 60% at 50% 0%, rgba(108,75,255,0.18), transparent 70%), radial-gradient(50% 50% at 80% 100%, rgba(217,0,200,0.12), transparent 70%), radial-gradient(50% 50% at 20% 100%, rgba(255,45,122,0.10), transparent 70%)' }} />
      <ScrollExpand
        startWidth={960}
        startHeight={420}
        startRadius={24}
        endRadius={0}
        mediaZoom={1.3}
        scrollDistance={1.15}
        holdDistance={0.4}
        smoothing={0.1}
        overlayScrim={0.45}
        initialOverlay={<InitialCopy />}
        overlayContent={<FullscreenCopy />}
        containerHeight={typeof window !== 'undefined' ? window.innerHeight + 900 : 1500}
      >
        {videoMode ? (
          <div className="w-full h-full">
            <video
              className="w-full h-full object-cover"
              src="/hero-demo.mp4"
              autoPlay
              muted
              loop
              playsInline
            />
          </div>
        ) : (
          <DashboardPreview onPlay={() => setVideoMode(true)} />
        )}
      </ScrollExpand>
    </div>
  );
}

function InitialCopy() {
  return (
    <div className="max-w-3xl mx-auto">
      <SplitText
        text="TRACK YOUR POCKET MONEY,"
        className="block text-3xl sm:text-4xl lg:text-6xl font-extrabold text-white leading-tight drop-shadow-lg"
        delay={40}
      />
      <GradientText
        className="block text-3xl sm:text-4xl lg:text-6xl font-extrabold leading-tight mt-1"
        animate={false}
      >
        SPEND SMARTER EVERY DAY.
      </GradientText>
      <BlurText
        text="A simple pocket money tracker that helps you understand where your money goes, control your budget and build better saving habits."
        className="block mx-auto max-w-2xl text-sm sm:text-base text-white/80 mt-4 leading-relaxed"
        delay={30}
      />
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
        <Magnet magnetStrength={20}>
          <Link
            to="/app/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-bg text-white text-sm font-semibold shadow-lg shadow-purple/40"
          >
            Start Tracking Free <ArrowRight size={16} />
          </Link>
        </Magnet>
        <a
          href="#how-it-works"
          onClick={(e) => { e.preventDefault(); document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }); }}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white text-sm font-semibold glass hover:bg-white/10 transition"
        >
          <Play size={15} /> See It In Action
        </a>
      </div>
      <div className="flex items-center justify-center gap-2 mt-5 text-white/70 text-xs">
        <ShieldCheck size={14} />
        <span>Securely stored in the configured Google Drive.</span>
      </div>
    </div>
  );
}

function FullscreenCopy() {
  return (
    <div className="max-w-3xl mx-auto px-4 text-center">
      <FadeContent delay={100}>
        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
          YOUR MONEY.
          <GradientText animate={false} className="block">
            FINALLY UNDERSTOOD.
          </GradientText>
        </h2>
        <p className="text-white/80 mt-4 text-base sm:text-lg">
          See where it goes. Know what remains. Build better habits.
        </p>
      </FadeContent>

      <div className="grid grid-cols-3 gap-3 sm:gap-6 mt-10 max-w-xl mx-auto">
        <Stat label="Available" value={5500} color="text-success" />
        <Stat label="Spent" value={3250} color="text-pink" />
        <Stat label="Remaining" value={2250} color="text-violet" />
      </div>

      <FadeContent delay={400}>
        <Magnet magnetStrength={25}>
          <Link
            to="/app/dashboard"
            className="mt-10 inline-flex items-center gap-2 px-8 py-3.5 rounded-xl gradient-bg text-white text-base font-semibold shadow-xl shadow-purple/40"
          >
            Start Tracking <ArrowRight size={18} />
          </Link>
        </Magnet>
      </FadeContent>
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div className="rounded-2xl glass px-3 py-5">
      <p className={`text-xl sm:text-3xl lg:text-4xl font-bold ${color}`}>
        <CountUp end={value} duration={1500} prefix="₹" />
      </p>
      <p className="text-[11px] sm:text-xs text-white/70 mt-1 uppercase tracking-wide">{label}</p>
    </div>
  );
}

function DashboardPreview({ onPlay }) {
  return (
    <div className="w-full h-full bg-light-bg dark:bg-navy relative flex flex-col">
      <div className="flex h-12 items-center gap-3 px-5 bg-white dark:bg-navy/90 border-b border-gray-100 dark:border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg gradient-bg flex items-center justify-center text-white"><Wallet size={14} /></div>
          <span className="text-sm font-bold text-navy dark:text-white">Pocket Money</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-success" />
          <span className="text-[10px] text-gray-400 hidden sm:block">Synced</span>
        </div>
      </div>

      <div className="flex-1 overflow-hidden grid grid-cols-[180px_1fr]">
        <div className="hidden sm:flex flex-col gap-1 p-3 bg-white dark:bg-navy/60 border-r border-gray-100 dark:border-white/5">
          {['Dashboard', 'Expenses', 'Income', 'Budgets', 'Savings', 'Analytics'].map((label, i) => (
            <div key={label} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium ${i === 0 ? 'gradient-bg text-white' : 'text-gray-400'}`}>
              {['▦', '₹', '↓', '▤', '🐷', '◔'][i]} {label}
            </div>
          ))}
        </div>
        <div className="p-4 sm:p-6 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-base font-bold text-navy dark:text-white">Your Money Overview</div>
              <div className="text-[10px] text-gray-400">Here's how your pocket money looks this month</div>
            </div>
            <button onClick={onPlay} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg gradient-bg text-white text-[11px] font-semibold">
              <Play size={12} /> Demo
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <MiniCard label="Pocket Money" value={5000} color="text-violet" />
            <MiniCard label="Spent" value={3250} color="text-danger" />
            <MiniCard label="Remaining" value={2250} color="text-success" />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-white dark:bg-navy-light border border-gray-100 dark:border-white/5 p-3">
              <div className="text-[10px] text-gray-400 mb-2">Monthly Spending Progress</div>
              <div className="h-2 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden">
                <div className="h-full w-[59%] gradient-bg rounded-full" />
              </div>
              <div className="flex justify-between mt-2 text-[10px] text-gray-400">
                <span>₹3,250</span><span>59%</span>
              </div>
            </div>
            <div className="rounded-xl bg-white dark:bg-navy-light border border-gray-100 dark:border-white/5 p-3">
              <div className="text-[10px] text-gray-400 mb-2">Savings Goal</div>
              <div className="flex items-center gap-2">
                <span className="text-lg">🎧</span>
                <div className="flex-1">
                  <div className="h-2 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden">
                    <div className="h-full w-[60%] bg-pink rounded-full" />
                  </div>
                </div>
              </div>
              <div className="text-[10px] text-gray-400 mt-2">₹1,800 / ₹3,000</div>
            </div>
          </div>

          <div className="mt-4 rounded-xl bg-white dark:bg-navy-light border border-gray-100 dark:border-white/5 p-3">
            <div className="text-[10px] text-gray-400 mb-2">Recent Transactions</div>
            <div className="space-y-2">
              {[
                { name: 'Lunch', cat: 'Food', amt: '−₹120', t: 'text-danger' },
                { name: 'College Travel', cat: 'Travel', amt: '−₹80', t: 'text-danger' },
                { name: 'Freelance Work', cat: 'Income', amt: '+₹500', t: 'text-success' },
              ].map((tx) => (
                <div key={tx.name} className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] ${tx.t === 'text-success' ? 'bg-success/10' : 'bg-danger/10'}`}>{tx.t === 'text-success' ? '↓' : '₹'}</div>
                  <div className="flex-1">
                    <div className="text-[11px] font-medium text-navy dark:text-white">{tx.name}</div>
                    <div className="text-[9px] text-gray-400">{tx.cat}</div>
                  </div>
                  <span className={`text-[11px] font-semibold ${tx.t}`}>{tx.amt}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniCard({ label, value, color }) {
  return (
    <div className="rounded-xl bg-white dark:bg-navy-light border border-gray-100 dark:border-white/5 p-3">
      <div className="text-[9px] text-gray-400 uppercase tracking-wide">{label}</div>
      <div className={`text-lg font-bold mt-1 ${color}`}>{formatINR(value)}</div>
    </div>
  );
}