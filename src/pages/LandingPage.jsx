import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronUp, Sparkles, ArrowUp, Wallet, ShieldCheck } from 'lucide-react';
import SplitText from '../components/reactbits/SplitText.jsx';
import GradientText from '../components/reactbits/GradientText.jsx';
import AppLayout from '../components/layout/AppLayout.jsx';
import DashboardPage from './DashboardPage.jsx';

export default function LandingPage() {
  const navigate = useNavigate();
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const startYRef = useRef(0);
  const initialDragYRef = useRef(0);

  const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 800;

  const triggerComplete = () => {
    setIsCompleted(true);
    setDragY(screenHeight);
    setTimeout(() => {
      navigate('/app/dashboard');
    }, 400);
  };

  const handlePointerDown = (e) => {
    if (isCompleted) return;
    startYRef.current = e.clientY;
    initialDragYRef.current = dragY;
    setIsDragging(true);
  };

  const handlePointerMove = (e) => {
    if (!isDragging || isCompleted) return;
    const deltaY = startYRef.current - e.clientY;
    const newDrag = Math.max(0, Math.min(screenHeight, initialDragYRef.current + deltaY));
    setDragY(newDrag);
  };

  const handlePointerUp = () => {
    if (!isDragging || isCompleted) return;
    setIsDragging(false);
    if (dragY > screenHeight * 0.25 || dragY > 140) {
      triggerComplete();
    } else {
      setDragY(0);
    }
  };

  useEffect(() => {
    const handleWheel = (e) => {
      if (isCompleted) return;
      setDragY((prev) => {
        const next = Math.max(0, Math.min(screenHeight, prev + e.deltaY * 0.8));
        if (next > screenHeight * 0.3) {
          triggerComplete();
        }
        return next;
      });
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [screenHeight, isCompleted]);

  const progress = Math.min(Math.max(dragY / (screenHeight * 0.75), 0), 1);

  // Background Dashboard Blur-to-Clear Calculation (24px blur down to 0px)
  const bgBlur = (1 - progress) * 24;
  const bgOpacity = 0.35 + progress * 0.65;
  const bgScale = 0.96 + progress * 0.04;

  // Foreground Welcome Screen Translation (1:1 finger tracking, stop anywhere!)
  const fgTranslateY = -dragY;
  const fgOpacity = 1 - progress * 0.85;
  const fgBlur = progress * 14;

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className="fixed inset-0 overflow-hidden select-none bg-light-bg dark:bg-navy touch-none cursor-grab active:cursor-grabbing"
    >
      {/* Background Layer: Real AppLayout & DashboardPage with 1:1 Live Blur-to-Clear */}
      <div
        className="absolute inset-0 z-0 overflow-y-auto pointer-events-auto"
        style={{
          transform: `scale(${bgScale})`,
          opacity: bgOpacity,
          filter: `blur(${bgBlur}px)`,
          transition: isDragging ? 'none' : 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.45s ease-out, filter 0.45s ease-out',
          willChange: 'transform, opacity, filter',
        }}
      >
        <AppLayout storageStatus="Connected">
          <DashboardPage />
        </AppLayout>
      </div>

      {/* Foreground Layer: Welcome Screen Overlay (Follows finger 1:1, stops anywhere!) */}
      <div
        className="absolute inset-0 z-20 w-full h-full bg-navy text-white flex flex-col justify-between items-center p-6 shadow-2xl"
        style={{
          transform: `translateY(${fgTranslateY}px)`,
          opacity: fgOpacity,
          filter: `blur(${fgBlur}px)`,
          transition: isDragging ? 'none' : 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.45s ease-out, filter 0.45s ease-out',
          willChange: 'transform, opacity, filter',
        }}
      >
        {/* Background ambient lighting */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple/20 rounded-full blur-[140px] animate-pulse" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-pink/15 rounded-full blur-[110px]" />
          <div className="absolute top-10 left-10 w-80 h-80 bg-violet/15 rounded-full blur-[100px]" />
        </div>

        {/* Top Header */}
        <header className="w-full max-w-5xl flex items-center justify-between z-10 pt-2">
          <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-md">
            <div className="w-6 h-6 rounded-full gradient-bg flex items-center justify-center text-white text-xs font-bold">
              <Wallet size={13} />
            </div>
            <span className="text-xs font-semibold tracking-wider text-gray-300 uppercase">
              Pocket Money Tracker
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/50 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
            <ShieldCheck size={13} className="text-success" />
            <span>v2.0 • Secure</span>
          </div>
        </header>

        {/* Main Welcome Greeting */}
        <main className="flex flex-col items-center text-center z-10 max-w-2xl mx-auto my-auto py-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-purple mb-6 backdrop-blur-md shadow-lg shadow-purple/10">
            <Sparkles size={14} className="animate-spin" style={{ animationDuration: '8s' }} />
            <span>Personal Finance Workspace</span>
          </div>

          <SplitText
            text="Welcome,"
            className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight"
            delay={40}
          />

          <GradientText
            className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight mt-1 mb-6"
            colors={["#6C4BFF", "#8B35FF", "#D900C8", "#FF2D7A", "#6C4BFF"]}
            animationSpeed={6}
          >
            Lawrance William
          </GradientText>

          <p className="text-gray-300 text-sm sm:text-base max-w-md leading-relaxed">
            Your pocket money, expenses, budget limits and savings analytics are all organized and ready.
          </p>
        </main>

        {/* Swipe Up CTA Button */}
        <footer className="z-10 w-full flex flex-col items-center pb-8 gap-4">
          <button
            onClick={triggerComplete}
            className="group relative flex flex-col items-center gap-3 cursor-pointer focus:outline-none"
          >
            <div className="relative">
              <div className="absolute -inset-1 rounded-full gradient-bg opacity-50 blur-sm group-hover:opacity-100 transition duration-300 animate-pulse" />
              <div className="relative w-14 h-14 rounded-full gradient-bg flex items-center justify-center text-white shadow-2xl group-hover:scale-110 transition-transform duration-300">
                <ChevronUp size={28} strokeWidth={2.5} className="animate-bounce" />
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-white/90 uppercase tracking-widest bg-white/5 border border-white/10 px-5 py-2.5 rounded-full backdrop-blur-md group-hover:bg-white/10 transition shadow-lg">
              <span>Swipe up or click to enter</span>
              <ArrowUp size={13} className="group-hover:-translate-y-1 transition-transform duration-300 text-purple" />
            </div>
          </button>
        </footer>
      </div>
    </div>
  );
}