import { useState, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import AppSidebar from './AppSidebar.jsx';
import AppHeader from './AppHeader.jsx';
import MobileBottomNav from './MobileBottomNav.jsx';
import ExpenseForm from '../app/ExpenseForm.jsx';

export default function AppLayout({ children, onQuickAdd, storageStatus, syncEvent }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  const openQuickAdd = () => setQuickAddOpen(true);
  const handleSync = syncEvent;

  return (
    <div className="min-h-screen flex bg-light-bg dark:bg-navy text-navy dark:text-white">
      <AppSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} storageStatus={storageStatus} />
      <div className="flex-1 flex flex-col min-w-0">
        <AppHeader
          onMenuClick={() => setSidebarOpen(true)}
          onQuickAdd={onQuickAdd || openQuickAdd}
          storageStatus={storageStatus}
          syncEvent={handleSync}
        />
        <main className="flex-1 px-4 lg:px-6 py-6 lg:py-8 pb-24 lg:pb-8">
          <div className="max-w-5xl mx-auto">
            <Suspense fallback={<PageFallback />}>
              {children || <Outlet />}
            </Suspense>
          </div>
        </main>
      </div>
      <MobileBottomNav onQuickAdd={onQuickAdd || openQuickAdd} />
      {quickAddOpen && <ExpenseForm open onClose={() => setQuickAddOpen(false)} />}
    </div>
  );
}

function PageFallback() {
  return (
    <div className="py-12 flex justify-center">
      <div className="w-7 h-7 rounded-full border-2 border-purple/30 border-t-purple animate-spin" />
    </div>
  );
}
