import { Sparkles, Info } from 'lucide-react';
import SplitText from '../reactbits/SplitText.jsx';
import DecryptedText from '../reactbits/DecryptedText.jsx';
import AnimatedContent from '../reactbits/AnimatedContent.jsx';

const insights = [
  'Your Food spending is 23% higher than last month.',
  'You may exceed your Entertainment budget this week.',
  'Reducing Entertainment spending by ₹300 could help you reach your savings goal sooner.',
];

export default function AIShowcase() {
  return (
    <section className="py-20 lg:py-28 bg-light-bg dark:bg-navy">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <p className="text-xs font-bold tracking-[0.2em] text-violet uppercase mb-3">AI Insights</p>
          <SplitText
            as="h2"
            text="Your spending. Explained simply."
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy dark:text-white leading-tight"
            delay={30}
          />
          <p className="text-gray-500 dark:text-gray-400 mt-4 max-w-xl leading-relaxed">
            Get friendly, practical insights — not jargon. Understand your habits, spot
            overspending early, and act before the month ends.
          </p>
          <div className="flex items-start gap-2 mt-6 max-w-md">
            <Info size={15} className="text-gray-400 mt-0.5 shrink-0" />
            <p className="text-xs text-gray-400">Insights are helpful suggestions, not professional financial advice.</p>
          </div>
        </div>

        <div className="space-y-4">
          {insights.map((text, i) => (
            <AnimatedContent key={i} delay={i * 150} distance={40}>
              <div className="rounded-2xl bg-white dark:bg-navy-light border border-gray-100 dark:border-white/5 p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center text-white shrink-0">
                  <Sparkles size={18} />
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  <DecryptedText
                    text={text}
                    speed={35}
                    maxIterations={8}
                    sequential
                    characters="!<>-_\\/[]{}—=+*^?#________"
                  />
                </div>
              </div>
            </AnimatedContent>
          ))}
        </div>
      </div>
    </section>
  );
}