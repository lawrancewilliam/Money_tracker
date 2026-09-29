import { useState, useEffect, useCallback, useRef } from 'react';
import { Moon, Sun, Monitor, Cloud, FileJson, FileDown, FileText, RefreshCw, Database, Trash2 } from 'lucide-react';
import { settingsService, backupService } from '../services/analyticsService.js';
import { useTheme } from '../hooks/useTheme.jsx';
import { useToast } from '../components/app/Toast.jsx';
import PageHeader from '../components/app/PageHeader.jsx';
import { SyncStatus } from '../components/app/SyncStatus.jsx';
import { ConfirmDialog } from '../components/app/Modal.jsx';
import api from '../services/api.js';

const SAVE_DEBOUNCE_MS = 600;
const TOAST_COOLDOWN_MS = 2500;

export default function SettingsPage() {
  const toast = useToast();
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState(null);
  const [syncStatus, setSyncStatus] = useState('idle');
  const [lastSync, setLastSync] = useState(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [pdfRange, setPdfRange] = useState('month');
  const [exportingPdf, setExportingPdf] = useState(false);

  const settingsRef = useRef(null);
  const serverRef = useRef(null);
  const pendingRef = useRef({});
  const timerRef = useRef(null);
  const savingRef = useRef(false);
  const lastToastRef = useRef(0);

  const showToast = useCallback((fn, message) => {
    const at = Date.now();
    if (at - lastToastRef.current < TOAST_COOLDOWN_MS) return;
    lastToastRef.current = at;
    fn(message);
  }, []);

  const load = useCallback(async () => {
    try {
      const s = await settingsService.get();
      settingsRef.current = s;
      serverRef.current = s;
      setSettings(s);
      setLastSync(new Date().toLocaleTimeString());
    } catch (e) {
      showToast(toast.error, `Could not load settings: ${e.message}`);
    }
  }, [toast, showToast]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => { settingsRef.current = settings; }, [settings]);

  const flushRef = useRef(null);

  const flush = useCallback(async () => {
    if (savingRef.current) {
      timerRef.current = setTimeout(() => flushRef.current && flushRef.current(), 200);
      return;
    }
    const patch = pendingRef.current;
    pendingRef.current = {};
    if (Object.keys(patch).length === 0) return;

    savingRef.current = true;
    setSyncStatus('saving');
    try {
      const updated = await settingsService.update(patch);
      serverRef.current = updated;
      settingsRef.current = updated;
      setSettings(prev => ({ ...(prev || {}), ...(updated || {}) }));
      setSyncStatus('saved');
      showToast(toast.success, 'Settings saved');
    } catch (e) {
      setSyncStatus('error');
      showToast(toast.error, `Could not save: ${e.message}`);
    } finally {
      savingRef.current = false;
      setTimeout(() => setSyncStatus(s => (s === 'saving' ? 'idle' : s)), 1500);
    }
  }, [toast, showToast]);

  useEffect(() => { flushRef.current = flush; }, [flush]);

  const update = useCallback((patch) => {
    const server = serverRef.current || {};
    Object.entries(patch).forEach(([key, value]) => {
      if (server[key] !== value) pendingRef.current[key] = value;
      else delete pendingRef.current[key];
    });
    setSettings(prev => ({ ...(prev || {}), ...patch }));
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => flushRef.current && flushRef.current(), SAVE_DEBOUNCE_MS);
  }, []);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const handleBackup = async () => {
    if (savingRef.current) return;
    savingRef.current = true;
    setSyncStatus('saving');
    try {
      await backupService.create();
      setSyncStatus('saved');
      setLastSync(new Date().toLocaleTimeString());
      lastToastRef.current = 0;
      showToast(toast.success, 'Backup completed to Supabase');
    } catch (e) {
      setSyncStatus('error');
      showToast(toast.error, `Backup failed: ${e.message}`);
    } finally {
      savingRef.current = false;
      setTimeout(() => setSyncStatus(s => (s === 'saving' ? 'idle' : s)), 1500);
    }
  };

  const exportCSV = async (dataset) => {
    try {
      const res = await backupService.export(dataset, 'csv');
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${dataset}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      showToast(toast.success, `${dataset}.csv downloaded`);
    } catch (e) {
      showToast(toast.error, `Export failed: ${e.message}`);
    }
  };

  const exportJSON = async () => {
    try {
      const res = await backupService.export('combined', 'json');
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'pocket-money-data.json';
      a.click();
      URL.revokeObjectURL(url);
      showToast(toast.success, 'JSON export downloaded');
    } catch (e) {
      showToast(toast.error, `Export failed: ${e.message}`);
    }
  };

  const exportPDF = async () => {
    if (exportingPdf) return;
    setExportingPdf(true);
    try {
      const { blob, filename } = await api.exportPdf(`/export?format=pdf&range=${pdfRange}`);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      showToast(toast.success, 'PDF report downloaded');
    } catch (e) {
      showToast(toast.error, `PDF export failed: ${e.message}`);
    } finally {
      setExportingPdf(false);
    }
  };

  const syncNow = async () => {
    if (savingRef.current) return;
    setSyncStatus('saving');
    try {
      await load();
      setSyncStatus('saved');
      lastToastRef.current = 0;
      showToast(toast.success, 'Storage refreshed');
      setTimeout(() => setSyncStatus(s => (s === 'saving' ? 'idle' : s)), 1500);
    } catch (e) {
      setSyncStatus('error');
      showToast(toast.error, `Refresh failed: ${e.message}`);
    }
  };

  const resetAll = async () => {
    setConfirmReset(false);
    lastToastRef.current = 0;
    showToast(toast.info, 'To reset all data, truncate the tables in your Supabase project. Default categories are recreated on next launch.');
  };

  const inputCls = "w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-navy text-navy dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple/40";
  const labelCls = "block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5";
  const sectionTitle = "font-semibold text-navy dark:text-white";
  const cardCls = "bg-white dark:bg-navy-light rounded-2xl p-6 border border-gray-100 dark:border-white/5";

  return (
    <div className="space-y-5">
      <PageHeader title="Settings" subtitle="Personalize Pocket Money your way." />

      <div className={`${cardCls} space-y-4`}>
        <h3 className={sectionTitle}>General</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls} htmlFor="set-name">Your Name</label>
            <input id="set-name" className={inputCls} placeholder="Your name" value={settings?.Name || ''} onChange={(e) => update({ Name: e.target.value })} />
          </div>
          <div>
            <label className={labelCls} htmlFor="set-currency">Currency</label>
            <select id="set-currency" className={inputCls} value={settings?.Currency || 'INR'} onChange={(e) => update({ Currency: e.target.value })}>
              <option value="INR">₹ INR</option>
              <option value="USD">$ USD</option>
              <option value="EUR">€ EUR</option>
            </select>
          </div>
          <div>
            <label className={labelCls} htmlFor="set-cycle">Pocket Money Cycle</label>
            <select id="set-cycle" className={inputCls} value={settings?.BudgetCycle || 'Monthly'} onChange={(e) => update({ BudgetCycle: e.target.value })}>
              <option>Monthly</option>
              <option>Weekly</option>
            </select>
          </div>
          <div>
            <label className={labelCls} htmlFor="set-pm-date">Pocket Money Date</label>
            <input id="set-pm-date" type="number" min="1" max="31" className={inputCls} value={settings?.PocketMoneyDate || '1'} onChange={(e) => update({ PocketMoneyDate: e.target.value })} />
          </div>
        </div>
      </div>

      <div className={cardCls}>
        <h3 className={sectionTitle}>Theme</h3>
        <p className="text-sm text-gray-400 mt-1 mb-4">Choose how Pocket Money looks.</p>
        <div className="flex flex-wrap gap-3">
          {[
            { key: 'Light', icon: Sun, label: 'Light Mode' },
            { key: 'Dark', icon: Moon, label: 'Dark Mode' },
            { key: 'System', icon: Monitor, label: 'System Mode' },
          ].map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => { setTheme(key.toLowerCase()); update({ Theme: key }); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition border ${
                theme === key.toLowerCase()
                  ? 'gradient-bg text-white border-transparent shadow-lg shadow-purple/25'
                  : 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
              }`}
            >
              <Icon size={16} /> {label}
            </button>
          ))}
        </div>
      </div>

      <div className={cardCls}>
        <h3 className={sectionTitle}>Storage</h3>
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between text-sm rounded-xl bg-gray-50 dark:bg-white/5 px-4 py-3">
            <span className="text-gray-500 dark:text-gray-400">Provider</span>
            <span className="font-medium text-navy dark:text-white flex items-center gap-2"><Cloud size={15} className="text-violet" /> Supabase</span>
          </div>
          <div className="flex items-center justify-between text-sm rounded-xl bg-gray-50 dark:bg-white/5 px-4 py-3">
            <span className="text-gray-500 dark:text-gray-400">Database</span>
            <span className="font-medium text-navy dark:text-white">Pocket Money Tracker</span>
          </div>
          <div className="flex items-center justify-between text-sm rounded-xl bg-gray-50 dark:bg-white/5 px-4 py-3">
            <span className="text-gray-500 dark:text-gray-400">Project URL</span>
            <span className="font-mono text-xs text-navy dark:text-white break-all">{settings?.projectUrl || '—'}</span>
          </div>
          <div className="flex items-center justify-between text-sm rounded-xl bg-gray-50 dark:bg-white/5 px-4 py-3">
            <span className="text-gray-500 dark:text-gray-400">Engine</span>
            <span className="font-medium text-navy dark:text-white">PostgreSQL</span>
          </div>
          <div className="flex items-center justify-between text-sm rounded-xl bg-gray-50 dark:bg-white/5 px-4 py-3">
            <span className="text-gray-500 dark:text-gray-400">Status</span>
            <span className="flex items-center gap-2">
              {settings?.status === 'connected' || settings?.status === undefined ? (
                <span className="inline-flex items-center gap-1.5 text-success text-sm font-medium">
                  <span className="w-2 h-2 rounded-full bg-success" /> Connected
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-danger text-sm font-medium">
                  <span className="w-2 h-2 rounded-full bg-danger" /> Disconnected
                </span>
              )}
            </span>
          </div>
          {lastSync && (
            <div className="flex items-center justify-between text-sm rounded-xl bg-gray-50 dark:bg-white/5 px-4 py-3">
              <span className="text-gray-500 dark:text-gray-400">Last Sync</span>
              <span className="font-medium text-navy dark:text-white">{lastSync}</span>
            </div>
          )}
          <div className="flex flex-wrap gap-3 pt-2">
            <button onClick={syncNow} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition">
              <RefreshCw size={15} /> Sync Now
            </button>
            <button onClick={handleBackup} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition">
              <Database size={15} /> Backup Now
            </button>
          </div>
          <div className="pt-1"><SyncStatus status={syncStatus} /></div>
        </div>
      </div>

      <div className={cardCls}>
        <h3 className={sectionTitle}>Export</h3>
        <p className="text-sm text-gray-400 mt-1 mb-4">Download your data anytime.</p>
        <div className="flex flex-wrap gap-3">
          <button onClick={exportJSON} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition">
            <FileJson size={15} /> Export JSON
          </button>
          <div className="inline-flex items-center gap-2">
            <select
              value={pdfRange}
              onChange={(e) => setPdfRange(e.target.value)}
              className="px-3 py-2 rounded-xl text-sm font-medium border border-gray-200 dark:border-white/10 bg-white dark:bg-navy-light text-gray-600 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple/40"
              aria-label="PDF report range"
            >
              <option value="month">This Month</option>
              <option value="all">All Time</option>
            </select>
            <button onClick={exportPDF} disabled={exportingPdf} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition disabled:opacity-50">
              <FileText size={15} /> {exportingPdf ? 'Generating...' : 'PDF Report'}
            </button>
          </div>
          <button onClick={() => exportCSV('expenses')} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition">
            <FileDown size={15} /> CSV Expenses
          </button>
          <button onClick={() => exportCSV('income')} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition">
            <FileDown size={15} /> CSV Income
          </button>
          <button onClick={() => exportCSV('budgets')} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition">
            <FileDown size={15} /> CSV Budgets
          </button>
          <button onClick={() => exportCSV('savingsGoals')} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition">
            <FileDown size={15} /> CSV Savings
          </button>
        </div>
      </div>

      <div className={cardCls}>
        <h3 className={`${sectionTitle} text-danger`}>Reset</h3>
        <p className="text-sm text-gray-400 mt-1">Remove all local settings. To fully erase tracker data, truncate the tables in your Supabase project.</p>
        <button onClick={() => setConfirmReset(true)} className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-danger border border-danger/30 hover:bg-danger/5 transition">
          <Trash2 size={15} /> Reset App Data
        </button>
      </div>

      <ConfirmDialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        onConfirm={resetAll}
        title="Reset App Data?"
        message="This clears local settings. Tracker data in Supabase will remain unless you truncate the tables."
        confirmLabel="Reset"
        danger={false}
      />
    </div>
  );
}
