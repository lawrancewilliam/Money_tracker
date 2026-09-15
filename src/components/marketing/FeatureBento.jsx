import {
  Receipt, ArrowDownCircle, PiggyBank, PieChart, CalendarDays,
  Bell, Sparkles, Repeat, HardDrive, Download,
} from 'lucide-react';
import MagicBento from '../reactbits/MagicBento.jsx';
import SpotlightCard from '../reactbits/SpotlightCard.jsx';
import SplitText from '../reactbits/SplitText.jsx';
import AnimatedContent from '../reactbits/AnimatedContent.jsx';

const features = [
  { icon: Receipt, title: 'Track Expenses', desc: 'Log what you spend in seconds. Cash, UPI or card.', accent: 'danger' },
  { icon: ArrowDownCircle, title: 'Track Income', desc: 'Pocket money plus part-time, freelance and gifts.', accent: 'success' },
  { icon: PiggyBank, title: 'Savings Goals', desc: 'Save toward headphones, trips and big purchases.', accent: 'pink' },
  { icon: PieChart, title: 'Smart Analytics', desc: 'Charts that show where your money actually goes.', accent: 'violet' },
  { icon: CalendarDays, title: 'Expense Calendar', desc: 'See your spending day by day each month.', accent: 'purple' },
  { icon: Bell, title: 'Budget Alerts', desc: 'Know before you blow past a budget limit.', accent: 'warning' },
  { icon: Sparkles, title: 'AI Insights', desc: 'Friendly explanations of your spending patterns.', accent: 'magenta' },
  { icon: Repeat, title: 'Recurring Expenses', desc: 'Subscriptions and bills, handled automatically.', accent: 'violet' },
  { icon: HardDrive, title: 'Automatic Backup', desc: 'Your data is backed up in Google Drive storage.', accent: 'success' },
  { icon: Download, title: 'Data Export', desc: 'Export everything as CSV or JSON anytime.', accent: 'purple' },
];

const accentMap = {
  danger: 'bg-danger/10 text-danger',
  success: 'bg-success/10 text-success',
  pink: 'bg-pink/10 text-pink',
  violet: 'bg-violet/10 text-violet',
  purple: 'bg-purple/10 text-purple',
  warning: 'bg-warning/10 text-warning',
  magenta: 'bg-magenta/10 text-magenta',
};

export default function FeatureBento() {
  return (
    <section className="py-20 lg:py-28 bg-navy text-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-xs font-bold tracking-[0.2em] text-violet uppercase mb-3">Everything You Need</p>
          <SplitText
            as="h2"
            text="One app. All your money tools."
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight"
            delay={30}
          />
        </div>

        <div className="mt-14">
          <MagicBento columns={3} gap={16}>
            {features.map(({ icon: Icon, title, desc, accent }, i) => (
              <AnimatedContent key={title} delay={i * 80} distance={40}>
                <SpotlightCard
                  className="h-full rounded-2xl bg-navy-light border border-white/5 p-6 hover:shadow-xl transition-shadow"
                  spotlightColor="rgba(139,53,255,0.12)"
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${accentMap[accent]}`}>
                    <Icon size={20} />
                  </div>
                  <h3 className="font-semibold text-white mt-4">{title}</h3>
                  <p className="text-sm text-gray-400 mt-1.5 leading-relaxed">{desc}</p>
                </SpotlightCard>
              </AnimatedContent>
            ))}
          </MagicBento>
        </div>
      </div>
    </section>
  );
}