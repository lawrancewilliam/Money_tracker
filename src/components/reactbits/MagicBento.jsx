const STYLES = `
  .mb-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 16px;
    width: 100%;
  }
  .mb-grid.mb-2 { grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); }
  .mb-grid.mb-3 { grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); }
  .mb-grid.mb-4 { grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); }
  .mb-item {
    background: #fff;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  .mb-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04);
  }
  @media (max-width: 640px) {
    .mb-grid {
      grid-template-columns: 1fr;
    }
  }
`;

const COLUMN_CLASS_MAP = { 2: "mb-2", 3: "mb-3", 4: "mb-4" };

export default function MagicBento({
  children,
  className = "",
  columns,
  gap = 16,
  style = {},
  itemClassName = "",
}) {
  const colClass = COLUMN_CLASS_MAP[columns] || "";
  return (
    <>
      <style>{STYLES}</style>
      <div
        className={`mb-grid ${colClass} ${className}`}
        style={{ gap, ...style }}
      >
        {children}
      </div>
    </>
  );
}

export function MagicBentoItem({
  children,
  className = "",
  style = {},
}) {
  return (
    <div className={`mb-item ${className}`} style={style}>
      {children}
    </div>
  );
}
