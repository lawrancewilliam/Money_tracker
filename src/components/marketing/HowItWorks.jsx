import { Wallet, Receipt, Lightbulb } from 'lucide-react';
import AnimatedContent from '../reactbits/AnimatedContent.jsx';
import SpotlightCard from '../reactbits/SpotlightCard.jsx';
import SplitText from '../reactbits/SplitText.jsx';

const steps = [
  {
    icon: Wallet,
    num: '01',
    title: 'Set Your Pocket Money',
    desc: 'Enter your monthly pocket money and choose a spending limit.',
  },
  {
    icon: Receipt,
    num: '02',
    title: 'Track What You Spend',
    desc: 'Add expenses, income and savings in seconds.',
  },
  {
    icon: Lightbulb,
    num: '03',
    title: 'Understand & Improve',
    desc: 'See budgets, analytics and smart AI-powered insights.',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 lg:py-28 bg-light-bg dark:bg-navy">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-xs font-bold tracking-[0.2em] text-violet uppercase mb-3">Three Easy Steps</p>
          <SplitText
            as="h2"
            text="From pocket money to better savings in minutes."
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy dark:text-white leading-tight"
            delay={30}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-14">
          {steps.map(({ icon: Icon, num, title, desc }, i) => (
            <AnimatedContent key={num} delay={i * 150} distance={50}>
              <SpotlightCard
                className="h-full rounded-2xl bg-white dark:bg-navy-light border border-gray-100 dark:border-white/5 p-8 hover:shadow-xl transition-shadow"
                spotlightColor="rgba(108,75,255,0.08)"
              >
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl gradient-bg flex items-center justify-center text-white shadow-lg shadow-purple/25">
                    <Icon size={22} />
                  </div>
                  <span className="text-5xl font-extrabold text-gray-100 dark:text-white/5">{num}</span>
                </div>
                <h3 className="text-lg font-bold text-navy dark:text-white mt-6">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">{desc}</p>
              </SpotlightCard>
            </AnimatedContent>
          ))}
        </div>
      </div>
    </section>
  );
}