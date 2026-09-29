import { Cloud, Database, FileText, PiggyBank, Wallet, HardDrive } from 'lucide-react';
import SplitText from '../reactbits/SplitText.jsx';
import AnimatedContent from '../reactbits/AnimatedContent.jsx';
import SpotlightCard from '../reactbits/SpotlightCard.jsx';

const storageItems = [
  { icon: Cloud, label: 'Supabase Storage', status: '✓ Connected', color: 'text-success' },
  { icon: Database, label: 'Pocket Money Data', status: '✓ Synced', color: 'text-success' },
  { icon: FileText, label: 'Expenses', status: '✓ Saved', color: 'text-success' },
  { icon: Wallet, label: 'Budgets', status: '✓ Saved', color: 'text-success' },
  { icon: PiggyBank, label: 'Savings', status: '✓ Saved', color: 'text-success' },
  { icon: HardDrive, label: 'Backup', status: '✓ Available', color: 'text-success' },
];

export default function DriveStorageShowcase() {
  return (
    <section className="py-20 lg:py-28 bg-white dark:bg-navy-light">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <p className="text-xs font-bold tracking-[0.2em] text-violet uppercase mb-3">Storage & Privacy</p>
          <SplitText
            as="h2"
            text="Your tracker. Your storage."
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy dark:text-white leading-tight"
            delay={30}
          />
          <p className="text-gray-500 dark:text-gray-400 mt-4 max-w-xl leading-relaxed">
            Pocket Money stores its application data inside your Supabase PostgreSQL project - secure server-side access with row level security enabled.
          </p>
        </div>

        <AnimatedContent distance={50}>
          <SpotlightCard
            className="rounded-3xl bg-gray-50 dark:bg-navy border border-gray-100 dark:border-white/10 p-6"
            spotlightColor="rgba(108,75,255,0.08)"
          >
            <div className="flex items-center gap-3 mb-5">
              <Cloud className="text-violet" size={20} />
              <h3 className="font-semibold text-navy dark:text-white">Storage Sync Status</h3>
              <span className="ml-auto text-xs font-medium text-success bg-success/10 px-2.5 py-1 rounded-full">Live</span>
            </div>
            <div className="space-y-2">
              {storageItems.map(({ icon: Icon, label, status, color }) => (
                <div key={label} className="flex items-center gap-3 rounded-xl bg-white dark:bg-navy-light px-4 py-3 border border-gray-100 dark:border-white/5">
                  <Icon size={16} className="text-gray-400" />
                  <span className="text-sm text-navy dark:text-white flex-1">{label}</span>
                  <span className={`text-sm font-medium ${color}`}>{status}</span>
                </div>
              ))}
            </div>
          </SpotlightCard>
        </AnimatedContent>
      </div>
    </section>
  );
}