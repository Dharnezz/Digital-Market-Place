import { Link } from 'react-router-dom'
import EmptyState from './EmptyState'

export default function ModulePlaceholder({
  title = '',
  description = 'This module will be implemented in the next Sprint 1 task.',
  nextModule,
  backRoute = '/seller',
  backLabel = 'Back to Dashboard',
}) {
  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">{title}</h1>
        {nextModule ? (
          <span className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700">
            Up next: {nextModule}
          </span>
        ) : null}
      </div>

      <div className="mt-6">
        <EmptyState title="Coming Soon" message={description}>
          <Link
            to={backRoute}
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            {backLabel}
          </Link>
        </EmptyState>
      </div>
    </div>
  )
}