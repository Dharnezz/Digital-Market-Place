export default function ModerationToolbar({ count, refreshing, onRefresh }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Moderation Queue</h1>
        <p className="mt-1 text-sm text-gray-500">
          Review products submitted by sellers and decide whether to publish them.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
          {count} pending
        </span>
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          className="rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
    </div>
  )
}