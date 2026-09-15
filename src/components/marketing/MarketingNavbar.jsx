import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Wallet, ArrowRight, Menu, X } from 'lucide-react';
import { cn } from '../../utils/cn.js';
import Magnet from '../reactbits/Magnet.jsx';

const links = [
  { label: 'How It Works', to: '/#how-it-works' },
  { label: 'Features', to: '/features' },
  { label: 'Privacy', to: '/privacy' },
];

export default function MarketingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLink = (to) => {
    setMobileOpen(false);
    if (to.includes('#')) {
      const [path, anchor] = to.split('#');
      if (path === '' || path === '/') {
        if (location.pathname === '/') {
          document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.location.href = `/#${anchor}`;
        }
      }
    }
  };

  return (
    <header
      className={cn(
        'fixed top-0 inset-x-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-white/70 dark:bg-navy/70 backdrop-blur-xl border-b border-gray-100/80 dark:border-white/5 py-2.5'
          : 'bg-transparent py-4'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center text-white shadow-lg shadow-purple/25 group-hover:scale-105 transition">
            <Wallet size={18} />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-bold text-navy dark:text-white">Pocket Money</span>
            <span className="text-[10px] text-gray-400 mt-0.5 tracking-wide">Smart Budget Tracker</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.to}
              onClick={(e) => { e.preventDefault(); handleLink(l.to); }}
              className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-navy dark:hover:text-white hover:bg-gray-100/70 dark:hover:bg-white/5 transition"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Magnet disabled={false} magnetStrength={25}>
            <Link
              to="/app/dashboard"
              className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-bg text-white text-sm font-semibold shadow-lg shadow-purple/30 hover:shadow-xl hover:shadow-purple/40 active:scale-[0.98] transition-all"
            >
              Get Started <ArrowRight size={16} />
            </Link>
          </Magnet>
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden px-4 pt-2 pb-4 bg-white/95 dark:bg-navy/95 backdrop-blur-xl border-t border-gray-100 dark:border-white/5">
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.to}
                onClick={(e) => { e.preventDefault(); handleLink(l.to); }}
                className="px-4 py-3 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"
              >
                {l.label}
              </a>
            ))}
            <Link
              to="/app/dashboard"
              onClick={() => setMobileOpen(false)}
              className="mt-2 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl gradient-bg text-white text-sm font-semibold"
            >
              Get Started <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}