import { Link } from 'react-router-dom';
import { Wallet } from 'lucide-react';

export default function MarketingFooter() {
  return (
    <footer className="bg-navy text-white border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center text-white">
              <Wallet size={18} />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-bold">Pocket Money</span>
              <span className="text-[10px] text-gray-400 mt-0.5 tracking-wide">Smart Budget Tracker</span>
            </div>
          </div>

          <nav className="flex items-center gap-6 text-sm">
            <Link to="/features" className="text-gray-300 hover:text-white transition">Features</Link>
            <a href="/#how-it-works" className="text-gray-300 hover:text-white transition">How It Works</a>
            <Link to="/privacy" className="text-gray-300 hover:text-white transition">Privacy</Link>
            <Link to="/about" className="text-gray-300 hover:text-white transition">About</Link>
          </nav>
        </div>

        <p className="text-center text-sm text-gray-400 mt-8">Built for students &amp; young earners.</p>
      </div>
    </footer>
  );
}