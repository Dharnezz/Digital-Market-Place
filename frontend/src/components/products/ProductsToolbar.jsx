import { Link } from 'react-router-dom'
import ProductStatusFilter from './ProductStatusFilter'

export default function ProductsToolbar({ activeStatus, onStatusChange }) {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">My Products</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage, edit, and submit your products for approval.
          </p>
        </div>

        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          <input
            type="search"
            disabled
            placeholder="Search products — coming soon"
            title="Search will be available in a later task"
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-500 shadow-sm disabled:cursor-not-allowed disabled:bg-gray-100"
          />
          <Link
            to="/seller/create-product"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Create Product
          </Link>
        </div>
      </div>

      <div className="mt-4">
        <ProductStatusFilter active={activeStatus} onChange={onStatusChange} />
      </div>
    </div>
  )
}