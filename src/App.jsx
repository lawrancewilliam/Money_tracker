import { lazy, Suspense, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './hooks/useTheme.jsx';
import { ToastProvider } from './components/app/Toast.jsx';
import useStorageStatus, { setStorageStatus } from './hooks/useStorageStatus.js';
import { initializeService as initSvc } from './services/analyticsService.js';
import AppLayout from './components/layout/AppLayout.jsx';
import InitializationScreen from './pages/InitializationScreen.jsx';

const LandingPage = lazy(() => import('./pages/LandingPage.jsx'));
const FeaturesPage = lazy(() => import('./pages/FeaturesPage.jsx'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage.jsx'));
const AboutPage = lazy(() => import('./pages/AboutPage.jsx'));
const DashboardPage = lazy(() => import('./pages/DashboardPage.jsx'));
const ExpensesPage = lazy(() => import('./pages/ExpensesPage.jsx'));
const TransactionsPage = lazy(() => import('./pages/TransactionsPage.jsx'));
const IncomePage = lazy(() => import('./pages/IncomePage.jsx'));
const BudgetsPage = lazy(() => import('./pages/BudgetsPage.jsx'));
const SavingsPage = lazy(() => import('./pages/SavingsPage.jsx'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage.jsx'));
const CalendarPage = lazy(() => import('./pages/CalendarPage.jsx'));
const RecurringPage = lazy(() => import('./pages/RecurringPage.jsx'));
const AIInsightsPage = lazy(() => import('./pages/AIInsightsPage.jsx'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage.jsx'));
const SettingsPage = lazy(() => import('./pages/SettingsPage.jsx'));

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-navy">
      <div className="w-8 h-8 rounded-full border-2 border-purple/30 border-t-purple animate-spin" />
    </div>
  );
}

export default function App() {
  const storageStatus = useStorageStatus();
  const [initState, setInitState] = useState('idle');
  const [initMessages, setInitMessages] = useState([]);

  const runInitialize = async () => {
    setInitState('running');
    setInitMessages([]);
    const steps = [
      ['Connecting to storage...', 'Connecting...'],
      ['Checking spreadsheet...', 'Locating spreadsheet...'],
      ['Preparing data...', 'Loading data...'],
      ['Calculating balance...', 'Calculating balance...'],
    ];
    setInitMessages([{ text: 'Preparing Pocket Money Tracker...', done: false }]);

    const report = (i) => setInitMessages((m) => [...m, { text: steps[i][1], done: false }]);

    try {
      const res = await initSvc.run();
      setStorageStatus(res.connected ? 'Connected' : 'Disconnected');
      setInitMessages((m) => [...m, { text: '✓ Ready', done: true }]);
      setInitState('ready');
      return res;
    } catch (e) {
      setInitState('error');
      setStorageStatus('Error');
      return { error: e.message };
    }
  };

  const syncEvent = async () => {
    try {
      const res = await initSvc.run();
      setStorageStatus(res.connected ? 'Connected' : 'Disconnected');
      return res;
    } catch (e) {
      setStorageStatus('Error');
      throw e;
    }
  };

  return (
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/features" element={<FeaturesPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route
                path="/app/initialize"
                element={
                  <InitializationScreen
                    state={initState}
                    messages={initMessages}
                    onRetry={runInitialize}
                  />
                }
              />
              <Route
                path="/app"
                element={
                  <AppLayout storageStatus={storageStatus} syncEvent={syncEvent} />
                }
              >
                <Route path="dashboard" element={<DashboardPage onInitialize={runInitialize} initState={initState} storageStatus={storageStatus} />} />
                <Route path="expenses" element={<ExpensesPage />} />
                <Route path="transactions" element={<TransactionsPage />} />
                <Route path="income" element={<IncomePage />} />
                <Route path="budgets" element={<BudgetsPage />} />
                <Route path="savings" element={<SavingsPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="calendar" element={<CalendarPage />} />
                <Route path="recurring" element={<RecurringPage />} />
                <Route path="ai-insights" element={<AIInsightsPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  );
}
