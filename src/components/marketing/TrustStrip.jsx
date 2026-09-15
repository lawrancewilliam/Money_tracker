import { Database, Cloud, RefreshCw, HardDrive, Download, ShieldCheck } from 'lucide-react';
import FadeContent from '../reactbits/FadeContent.jsx';

const items = [
  { icon: Database, label: 'No traditional database' },
  { icon: Cloud, label: 'Google Drive powered storage' },
  { icon: RefreshCw, label: 'Automatic sync' },
  { icon: HardDrive, label: 'Backup support' },
  { icon: Download, label: 'Export anytime' },
  { icon: ShieldCheck, label: 'Secure server-side access' },
];

export default function TrustStrip() {
  return (
    <section className="bg-white dark:bg-navy-light border-y border-gray-100 dark:border-white/5 py-5">
      <FadeContent delay={50}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {items.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Icon size={15} className="text-violet shrink-0" />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </FadeContent>
    </section>
  );
}