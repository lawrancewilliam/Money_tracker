export default function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start sm:items-center justify-between gap-4">
      <div>
        <h1 className="font-semibold text-navy dark:text-white text-xl lg:text-2xl">{title}</h1>
        {subtitle && <p className="text-gray-400 text-sm mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
