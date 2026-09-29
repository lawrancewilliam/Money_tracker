import SplitText from '../components/reactbits/SplitText.jsx';
import AnimatedContent from '../components/reactbits/AnimatedContent.jsx';
import SpotlightCard from '../components/reactbits/SpotlightCard.jsx';
import MarketingNavbar from '../components/marketing/MarketingNavbar.jsx';
import MarketingFooter from '../components/marketing/MarketingFooter.jsx';
import FinalCTA from '../components/marketing/FinalCTA.jsx';
import { Wallet, Receipt, ArrowDownCircle, PieChart, CalendarDays, Bell, Sparkles, Repeat, PiggyBank, HardDrive, Download, RefreshCw } from 'lucide-react';

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-navy">
      <MarketingNavbar />
      <main className="pt-24 pb-8">
        <section className="py-16 lg:py-20 bg-light-bg dark:bg-navy">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto">
              <p className="text-xs font-bold tracking-[0.2em] text-violet uppercase mb-3">Full Feature List</p>
              <SplitText
                as="h1"
                text="Powerful tools to track every rupee."
                className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy dark:text-white leading-tight"
                delay={30}
              />
              <p className="text-gray-500 dark:text-gray-400 mt-4 leading-relaxed">
                Everything fitted into one single-user budget tracker stored safely in your Supabase database.
              </p>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((cats, gi) => (
              <section key={gi} className="contents">
                {cats.items.map(({ icon: Icon, title, desc }, i) => (
                  <AnimatedContent key={title} delay={i * 80} distance={40}>
                    <SpotlightCard
                      className="h-full rounded-2xl bg-white dark:bg-navy-light border border-gray-100 dark:border-white/5 p-6 hover:shadow-xl transition-shadow"
                      spotlightColor="rgba(108,75,255,0.08)"
                    >
                      <div className="w-11 h-11 rounded-xl gradient-bg flex items-center justify-center text-white">
                        <Icon size={20} />
                      </div>
                      <h3 className="font-bold text-lg text-navy dark:text-white mt-4">{title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">{desc}</p>
                    </SpotlightCard>
                  </AnimatedContent>
                ))}
              </section>
            ))}
          </div>
        </section>
      </main>
      <FinalCTA />
      <MarketingFooter />
    </div>
  );
}

const FEATURES = [
  {
    category: 'Tracking',
    items: [
      { icon: Wallet, title: 'Pocket Money & Income', desc: 'Set monthly pocket money and add part-time, freelance or gift income.' },
      { icon: Receipt, title: 'Expense Tracking', desc: 'Record expenses by category with an intuitive form and all payment methods.' },
      { icon: ArrowDownCircle, title: 'Income Streams', desc: 'Separate income sources and track money coming in comfortably.' },
    ],
  },
  {
    category: 'Budgets & Savings',
    items: [
      { icon: PieChart, title: 'Budget Limits', desc: 'Set monthly limits per category and track spend against each one.' },
      { icon: PiggyBank, title: 'Savings Goals', desc: 'Save toward headphones, trips and big purchases with visual progress.' },
      { icon: Bell, title: 'Budget Alerts', desc: 'Get warnings before you approach or exceed your limits.' },
    ],
  },
  {
    category: 'Insights',
    items: [
      { icon: Sparkles, title: 'AI Insights', desc: 'Friendly, practical explanations of your spending patterns and predictions.' },
      { icon: CalendarDays, title: 'Expense Calendar', desc: 'See each day of the month at a glance, colour-coded by spending.' },
      { icon: Repeat, title: 'Recurring Expenses', desc: 'Subscriptions and bills on auto-pilot, created automatically each month.' },
    ],
  },
  {
    category: 'Storage & Data',
    items: [
      { icon: HardDrive, title: 'Supabase Storage', desc: 'Application data stored in a Supabase PostgreSQL database via server-side API.' },
      { icon: RefreshCw, title: 'Automatic Sync', desc: 'Changes sync automatically. Your data stays current across the app.' },
      { icon: Download, title: 'Export & Backup', desc: 'Export to CSV or JSON and download backup copies whenever you need.' },
    ],
  },
];

