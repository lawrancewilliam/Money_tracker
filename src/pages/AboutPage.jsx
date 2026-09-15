import SplitText from '../components/reactbits/SplitText.jsx';
import AnimatedContent from '../components/reactbits/AnimatedContent.jsx';
import SpotlightCard from '../components/reactbits/SpotlightCard.jsx';
import MarketingNavbar from '../components/marketing/MarketingNavbar.jsx';
import MarketingFooter from '../components/marketing/MarketingFooter.jsx';

const values = [
  { title: 'Simple', desc: 'Beautiful, no-nonsense tracking you actually want to open.' },
  { title: 'Private', desc: 'Your data lives in your Google Drive storage, not a shared server.' },
  { title: 'Honest', desc: 'Clear budgets and alerts that help you stay on track.' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-navy">
      <MarketingNavbar />
      <main className="pt-24 pb-16">
        <section className="py-14 lg:py-16 bg-light-bg dark:bg-navy">
          <div className="max-w-3xl mx-auto px-4 md:px-6">
            <p className="text-xs font-bold tracking-[0.2em] text-violet uppercase mb-3">About</p>
            <SplitText
              as="h1"
              text="Built to make money feel simpler."
              className="text-3xl sm:text-4xl font-extrabold text-navy dark:text-white leading-tight"
              delay={30}
            />
            <p className="text-gray-500 dark:text-gray-400 mt-4 max-w-2xl leading-relaxed">
              Pocket Money is a single-user, smart budget tracker made for students and young
              earners. It turns everyday tracking into something quick, visual and genuinely useful.
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {values.map((v, i) => (
                <AnimatedContent key={v.title} delay={i * 120} distance={40}>
                  <SpotlightCard
                    className="h-full rounded-2xl bg-white dark:bg-navy-light border border-gray-100 dark:border-white/5 p-8 text-center hover:shadow-xl transition-shadow"
                    spotlightColor="rgba(108,75,255,0.08)"
                  >
                    <span className="text-4xl">{['🧭', '🔐', '🎯'][i]}</span>
                    <h3 className="text-lg font-bold text-navy dark:text-white mt-4">{v.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">{v.desc}</p>
                  </SpotlightCard>
                </AnimatedContent>
              ))}
            </div>

            <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div>
                <h2 className="text-xl font-bold text-navy dark:text-white">Guiding principles</h2>
              </div>
              <div className="lg:col-span-2 space-y-4 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                <p>
                  Budgeting is often shown as intimidating spreadsheets and jargon. Pocket Money was built
                  to remove that friction. Track an expense in seconds, see your progress visually, and get
                  a gentle nudge before you overspend.
                </p>
                <p>
                  The entire app is single-user and stores its data in your own Google Drive storage through
                  secure server-side access — no traditional database required. That keeps things simple,
                  private and under your control.
                </p>
                <p>
                  Whether you're managing monthly pocket money, learning your first freelance income or saving
                  toward a big purchase, Pocket Money is here to make the whole thing feel a little easier.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}