import { Inbox } from 'lucide-react';

export function EmptyState({ title, message, action, icon: Icon = Inbox }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-4">
      <div className="w-16 h-16 rounded-2xl bg-purple/10 text-purple flex items-center justify-center mb-4">
        <Icon size={28} />
      </div>
      <h3 className="font-semibold text-navy dark:text-white text-lg">{title}</h3>
      {message && <p className="text-sm text-gray-400 mt-1 max-w-sm">{message}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
