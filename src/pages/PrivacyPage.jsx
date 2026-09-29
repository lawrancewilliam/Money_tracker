import { Link } from 'react-router-dom';
import SplitText from '../components/reactbits/SplitText.jsx';
import MarketingNavbar from '../components/marketing/MarketingNavbar.jsx';
import MarketingFooter from '../components/marketing/MarketingFooter.jsx';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-navy">
      <MarketingNavbar />
      <main className="pt-24 pb-16">
        <section className="py-14 lg:py-16 bg-light-bg dark:bg-navy">
          <div className="max-w-3xl mx-auto px-4 md:px-6">
            <p className="text-xs font-bold tracking-[0.2em] text-violet uppercase mb-3">Privacy Policy</p>
            <SplitText
              as="h1"
              text="Your tracker, your storage."
              className="text-3xl sm:text-4xl font-extrabold text-navy dark:text-white leading-tight"
              delay={30}
            />
            <p className="text-gray-500 dark:text-gray-400 mt-3">Effective date: September 2026</p>
          </div>
        </section>

        <section className="py-14">
          <div className="max-w-3xl mx-auto px-4 md:px-6 space-y-12">
            <PolicyBlock title="What We Store">
              <p>Pocket Money stores your personal financial app data in your Supabase PostgreSQL database. This includes your expenses, income, budgets, savings goals, recurring expenses, notifications and display settings. The data is stored in a single-user form — this app is designed for personal use, not shared accounts.</p>
            </PolicyBlock>

            <PolicyBlock title="How We Store It">
              <p>All application data is persisted through the Vercel serverless functions in a Supabase PostgreSQL database. Row Level Security is enabled on every table and the database credentials stay server-side.</p>
            </PolicyBlock>

            <PolicyBlock title="No Account Required">
              <p>There is no registration or sign-in. Because there is no user account, we do not maintain profile information, email addresses or passwords. The app is pre-configured with a single Supabase project for storage.</p>
            </PolicyBlock>

            <PolicyBlock title="AI Insights">
              <p>Optional AI insights may be sent to the Gemini API to generate friendly, practical explanations of your spending. If the AI service is unavailable, a local rule-based fallback is used instead. Insights are helpful suggestions only and are not professional financial advice.</p>
            </PolicyBlock>

            <PolicyBlock title="Analytics & Cookies">
              <p>Pocket Money is a demonstration tool and does not embed third-party analytics or track you for advertising. Your browsing and financial activity stay within your own app and storage.</p>
            </PolicyBlock>

            <PolicyBlock title="Keeping Your Data Safe">
              <p>We keep all Supabase database credentials server-side and never embed them in the frontend. Your data is yours; you can export or back it up at any time from the Settings area of the app.</p>
            </PolicyBlock>

            <PolicyBlock title="Changes To This Policy">
              <p>We may update this policy from time to time. Any changes will be reflected here with an updated effective date.</p>
            </PolicyBlock>

            <div className="pt-4 border-t border-gray-100 dark:border-white/10">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Questions? Visit the <Link to="/about" className="text-violet hover:underline">About</Link> page or the <Link to="/" className="text-violet hover:underline">home</Link> page.
              </p>
            </div>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}

function PolicyBlock({ title, children }) {
  return (
    <div>
      <h2 className="text-xl font-bold text-navy dark:text-white mb-2">{title}</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{children}</p>
    </div>
  );
}