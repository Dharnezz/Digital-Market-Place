export default function StatisticCard({ label, value, icon, iconClassName }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconClassName}`}>
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            {icon}
          </svg>
        </span>
        <div className="min-w-0">
          <p className="text-2xl font-bold leading-none text-gray-900">{value}</p>
          <p className="mt-1 truncate text-sm text-gray-500">{label}</p>
        </div>
      </div>
    </div>
  )
}