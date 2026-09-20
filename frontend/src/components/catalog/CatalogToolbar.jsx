import { SORT_OPTIONS } from './catalogSort'

export default function CatalogToolbar({ total, shown, query, searching, onQueryChange, onClear, sort, onSortChange }) {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="mt-1 text-sm text-gray-500">Browse approved digital products from verified sellers.</p>
        </div>
        <p className="text-sm text-gray-500" aria-live="polite">
          {searching ? 'Searching…' : `${shown} of ${total} ${total === 1 ? 'product' : 'products'}`}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-3">
        <div className="w-full max-w-md flex-1">
          <label htmlFor="catalog-search" className="sr-only">
            Search products
          </label>
          <div className="relative">
            <input
              id="catalog-search"
              type="search"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Search by name, seller, or category"
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 pr-16 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            {query ? (
              <button
                type="button"
                onClick={onClear}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 hover:text-gray-600"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            ) : null}
          </div>
        </div>

        <div>
          <label htmlFor="catalog-sort" className="sr-only">
            Sort products
          </label>
          <select
            id="catalog-sort"
            value={sort}
            onChange={(event) => onSortChange(event.target.value)}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}