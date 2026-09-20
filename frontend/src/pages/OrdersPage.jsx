import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listOrders } from '../services/orders'
import { formatPrice, formatDate } from '../utils/format'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import ErrorState from '../components/ui/ErrorState'
import EmptyState from '../components/ui/EmptyState'
import StatusBadge from '../components/ui/StatusBadge'

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reload, setReload] = useState(0)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setOrders(await listOrders())
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to load your orders. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load, reload])

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Your Orders</h1>
        {!loading && !error ? (
          <p className="text-sm text-gray-500">{orders.length} order{orders.length === 1 ? '' : 's'}</p>
        ) : null}
      </div>

      <div className="mt-6">
        {loading ? (
          <LoadingSpinner label="Loading orders..." />
        ) : error ? (
          <ErrorState message={error} onRetry={() => setReload((count) => count + 1)} />
        ) : orders.length === 0 ? (
          <EmptyState
            title="No orders yet"
            message="When you complete a checkout, your orders will appear here."
          >
            <Link
              to="/products"
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Browse products
            </Link>
          </EmptyState>
        ) : (
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <ul className="divide-y divide-gray-200">
              {orders.map((order) => (
                <li key={order.id}>
                  <Link
                    to={`/orders/${order.id}`}
                    className="flex flex-wrap items-center justify-between gap-4 p-5 hover:bg-gray-50"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900">Order #{order.id}</p>
                      <p className="mt-1 text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <StatusBadge status={order.status} />
                      <span className="text-sm font-semibold text-gray-900">
                        {formatPrice(order.totalAmount)}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}