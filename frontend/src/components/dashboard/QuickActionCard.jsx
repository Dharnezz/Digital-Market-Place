export default function QuickActionCard() {
  return (
    <section className="mt-8">
      <div className="flex flex-col items-start gap-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Create New Product</h2>
          <p className="mt-1 text-sm text-gray-500">
            List a new digital product and submit it for approval.
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
          <button
            type="button"
            disabled
            title="Coming in Module 2"
            className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white opacity-60"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Create Product
          </button>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
            Coming in Module 2
          </span>
        </div>
      </div>
    </section>
  )
}