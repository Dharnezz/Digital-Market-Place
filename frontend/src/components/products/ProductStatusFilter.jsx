export const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PENDING_APPROVAL', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'ARCHIVED', label: 'Archived' },
]

export const statusLabel = (status) =>
  STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status

export default function ProductStatusFilter({ active, onChange }) {
  return (
    <div
      className="flex gap-2 overflow-x-auto pb-1"
      role="tablist"
      aria-label="Filter products by status"
    >
      {STATUS_OPTIONS.map((option) => {
        const isActive = option.value === active
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(option.value)}
            className={`whitespace-nowrap rounded-full px-3 py-1 text-sm font-medium ${
              isActive
                ? 'bg-indigo-600 text-white'
                : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}