import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getLibrary, getDownloadAuthorization } from '../services/library'
import { getProducts } from '../services/products'
import { formatDate, formatFileSize } from '../utils/format'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import ErrorState from '../components/ui/ErrorState'
import EmptyState from '../components/ui/EmptyState'

export default function LibraryPage() {
  const [items, setItems] = useState([])
  const [catalog, setCatalog] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [downloadingId, setDownloadingId] = useState(null)
  const [downloads, setDownloads] = useState({})

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [libraryItems, products] = await Promise.all([getLibrary(), getProducts()])
      const catalogMap = {}
      for (const product of products) {
        catalogMap[product.id] = product
      }
      setCatalog(catalogMap)
      setItems(libraryItems)
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to load your library. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleDownload = async (productId) => {
    setDownloadingId(productId)
    try {
      const result = await getDownloadAuthorization(productId)
      setDownloads((current) => ({ ...current, [productId]: { ok: true, data: result } }))
    } catch (err) {
      setDownloads((current) => ({
        ...current,
        [productId]: { ok: false, message: err.response?.data?.detail || 'Download not authorized.' },
      }))
    } finally {
      setDownloadingId(null)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Your Library</h1>
        {!loading && !error ? (
          <p className="text-sm text-gray-500">{items.length} product{items.length === 1 ? '' : 's'}</p>
        ) : null}
      </div>
      <p className="mt-1 text-sm text-gray-500">
        Products you have purchased, with verified download access.
      </p>

      <div className="mt-6">
        {loading ? (
          <LoadingSpinner label="Loading your library..." />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : items.length === 0 ? (
          <EmptyState
            title="Your library is empty"
            message="Products you purchase will appear here with authorized download access."
          >
            <Link
              to="/products"
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Browse products
            </Link>
          </EmptyState>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => {
              const download = downloads[item.productId]
              return (
                <div key={item.id} className="flex flex-col rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <Link
                      to={`/products/${item.productId}`}
                      className="text-base font-semibold text-gray-900 hover:text-indigo-700"
                    >
                      {item.productTitle}
                    </Link>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                    <span>
                      Category: <span className="text-gray-700">{catalog[item.productId]?.categoryName || '—'}</span>
                    </span>
                    <span>
                      Purchased: <span className="text-gray-700">{formatDate(item.grantedAt)}</span>
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-gray-100 pt-4">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                      Access granted
                    </span>
                    <button
                      type="button"
                      disabled={downloadingId === item.productId}
                      onClick={() => handleDownload(item.productId)}
                      className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {downloadingId === item.productId ? 'Checking...' : 'Download'}
                    </button>
                  </div>

                  {download ? (
                    <div className="mt-3">
                      {download.ok ? (
                        <div
                          role="status"
                          className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
                        >
                          <p className="font-medium">Download authorized</p>
                          <p className="mt-0.5 text-xs">
                            {download.data.fileName} · {formatFileSize(download.data.fileSize)}
                            {download.data.fileType ? ` · ${download.data.fileType}` : ''}
                          </p>
                        </div>
                      ) : (
                        <div
                          role="alert"
                          className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                        >
                          {download.message}
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}