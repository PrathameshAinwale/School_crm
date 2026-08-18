export default function ChartCard({ title, subtitle, children, className = '' }) {
  return (
    <div className={`bg-white rounded-xl p-5 border border-gray-100 shadow-card ${className}`}>
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      <div className="w-full">{children}</div>
    </div>
  );
}
