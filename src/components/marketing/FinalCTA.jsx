import { Link } from 'react-router-dom';
import { ArrowRight, Zap } from 'lucide-react';
import AnimatedContent from '../reactbits/AnimatedContent.jsx';
import Magnet from '../reactbits/Magnet.jsx';
import ClickSpark from '../reactbits/ClickSpark.jsx';
import SplitText from '../reactbits/SplitText.jsx';

export default function FinalCTA() {
  return (
    <section className="py-20 lg:py-28 bg-light-bg dark:bg-navy">
      <div className="max-w-5xl mx-auto px-4 md:px-6">
        <AnimatedContent distance={60}>
          <div className="relative overflow-hidden rounded-[2rem] gradient-bg p-10 sm:p-14 text-center text-white shadow-2xl shadow-purple/30">
            <div className="pointer-events-none absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-16 w-72 h-72 rounded-full bg-pink/20 blur-2xl" />

            <div className="relative">
              <ClickSpark sparkColor="#ffffff">
                <div>
                  <SplitText
                    as="h2"
                    text="Ready to master your money?"
                    className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight"
                    delay={30}
                  />
                  <p className="text-white/80 mt-4 max-w-xl mx-auto leading-relaxed">
                    Track expenses, control budgets and build better saving habits.
                  </p>
                  <div className="mt-8 flex justify-center">
                    <Magnet magnetStrength={30}>
                      <Link
                        to="/app/dashboard"
                        className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-navy font-bold text-base shadow-xl shadow-navy/20 hover:scale-[1.03] active:scale-[0.98] transition"
                      >
                        Start Tracking <ArrowRight size={18} />
                      </Link>
                    </Magnet>
                  </div>
                  <p className="mt-5 text-white/70 text-xs flex items-center justify-center gap-1.5">
                    <Zap size={12} /> Simple. Fast. No account required.
                  </p>
                </div>
              </ClickSpark>
            </div>
          </div>
        </AnimatedContent>
      </div>
    </section>
  );
}