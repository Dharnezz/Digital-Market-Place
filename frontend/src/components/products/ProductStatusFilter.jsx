import { useRef } from 'react'

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

export default function ProductStatusFilter({ active, onChange, counts }) {
  const tabRefs = useRef([])

  const handleKeyDown = (event) => {
    const currentIndex = STATUS_OPTIONS.findIndex((option) => option.value === active)
    let nextIndex = -1
    if (event.key === 'ArrowRight') {
      nextIndex = (currentIndex + 1) % STATUS_OPTIONS.length
    } else if (event.key === 'ArrowLeft') {
      nextIndex = (currentIndex - 1 + STATUS_OPTIONS.length) % STATUS_OPTIONS.length
    } else if (event.key === 'Home') {
      nextIndex = 0
    } else if (event.key === 'End') {
      nextIndex = STATUS_OPTIONS.length - 1
    }
    if (nextIndex === -1) {
      return
    }
    event.preventDefault()
    onChange(STATUS_OPTIONS[nextIndex].value)
    tabRefs.current[nextIndex]?.focus()
  }

  return (
    <div
      className="flex gap-2 overflow-x-auto pb-1"
      role="tablist"
      aria-label="Filter products by status"
    >
      {STATUS_OPTIONS.map((option, index) => {
        const isActive = option.value === active
        const count = counts?.[option.value]
        return (
          <button
            key={option.value}
            ref={(element) => {
              tabRefs.current[index] = element
            }}
            type="button"
            role="tab"
            tabIndex={isActive ? 0 : -1}
            aria-selected={isActive}
            aria-label={`${option.label}${typeof count === 'number' ? ` (${count})` : ''}`}
            onClick={() => onChange(option.value)}
            onKeyDown={handleKeyDown}
            className={`whitespace-nowrap rounded-full px-3 py-1 text-sm font-medium ${
              isActive
                ? 'bg-indigo-600 text-white'
                : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            {option.label}
            {typeof count === 'number' ? (
              <span
                aria-hidden="true"
                className={`ml-1.5 rounded-full px-1.5 py-0.5 text-xs ${
                  isActive ? 'bg-white/20' : 'bg-gray-100 text-gray-500'
                }`}
              >
                {count}
              </span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}