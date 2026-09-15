import { Wallet, Utensils, Bus, Film, Briefcase, PiggyBank } from 'lucide-react';
import ScrollStack from '../reactbits/ScrollStack.jsx';
import SplitText from '../reactbits/SplitText.jsx';
import CountUp from '../reactbits/CountUp.jsx';
import AnimatedContent from '../reactbits/AnimatedContent.jsx';

const cards = [
  { icon: Wallet, name: 'Pocket Money', sub: 'Monthly income', amount: '+₹5,000', sign: 'positive', color: 'text-success', bg: 'bg-success/10' },
  { icon: Utensils, name: 'Lunch', sub: 'Food', amount: '−₹120', sign: 'negative', color: 'text-danger', bg: 'bg-danger/10' },
  { icon: Bus, name: 'College Travel', sub: 'Travel', amount: '−₹80', sign: 'negative', color: 'text-danger', bg: 'bg-danger/10' },
  { icon: Film, name: 'Movie Night', sub: 'Entertainment', amount: '−₹250', sign: 'negative', color: 'text-danger', bg: 'bg-danger/10' },
  { icon: Briefcase, name: 'Freelance Work', sub: 'Income', amount: '+₹500', sign: 'positive', color: 'text-success', bg: 'bg-success/10' },
  { icon: PiggyBank, name: 'Savings', sub: 'Allocated to goal', amount: '−₹500', sign: 'negative', color: 'text-pink', bg: 'bg-pink/10' },
];

export default function MoneyStory() {
  return (
    <section className="py-20 lg:py-28 bg-white dark:bg-navy-light overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <div>
          <p className="text-xs font-bold tracking-[0.2em] text-violet uppercase mb-3">Money Story</p>
          <SplitText
            as="h2"
            text="Every expense tells a story."
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy dark:text-white leading-tight"
            delay={30}
          />
          <p className="text-gray-500 dark:text-gray-400 mt-4 max-w-xl leading-relaxed">
            Scroll through a typical month. Every purchase builds your story — and your balance updates with each one.
          </p>
        </div>

        <AnimatedContent distance={60}>
          <div className="max-w-md mx-auto">
            <ScrollStack itemHeight={336}>
              {cards.map((c, i) => (
                <StoryCard key={c.name} {...c} index={i} />
              ))}
              <div className="rounded-2xl gradient-bg text-white p-6 shadow-xl shadow-purple/30">
                <p className="text-xs font-semibold uppercase tracking-wide text-white/80">Balance</p>
                <div className="text-3xl font-extrabold mt-1">
                  <CountUp end={4550} prefix="₹" startOnView={false} duration={1600} />
                </div>
                <p className="text-sm text-white/80 mt-2">You're still on track.</p>
              </div>
            </ScrollStack>
          </div>
        </AnimatedContent>
      </div>
    </section>
  );
}

function StoryCard({ icon: Icon, name, sub, amount, color, bg, index }) {
  return (
    <div className={`flex items-center gap-4 rounded-2xl bg-white dark:bg-navy-light border border-gray-100 dark:border-white/10 p-5 ${index === 6 ? 'gradient-bg' : ''}`}>
      <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center shrink-0`}>
        <Icon size={22} className={color} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-navy dark:text-white truncate">{name}</p>
        <p className="text-xs text-gray-400">{sub}</p>
      </div>
      <span className={`font-bold text-sm whitespace-nowrap ${color}`}>{amount}</span>
    </div>
  );
}