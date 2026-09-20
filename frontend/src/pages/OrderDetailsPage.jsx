import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getOrder } from '../services/orders'
import { formatPrice, formatDate } from '../utils/format'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import ErrorState from '../components/ui/ErrorState'
import EmptyState from '../components/ui/EmptyState'
import StatusBadge from '../components/ui/StatusBadge'

export default function OrderDetailsPage() {
  const { orderId } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [notFound, setNotFound] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    setNotFound(false)
    try {
      setOrder(await getOrder(orderId))
    } catch (err) {
      if (err.response?.status === 404) {
        setNotFound(true)
      } else {
        setError(err.response?.data?.detail || 'Unable to load this order.')
      }
    } finally {
      setLoading(false)
    }
  }, [orderId])

  useEffect(() => {
    load()
  }, [load])

  if (loading) {
    return <LoadingSpinner label="Loading order..." />
  }

  if (error) {
    return <ErrorState message={error} onRetry={load} />
  }

  if (notFound || !order) {
    return (
      <EmptyState title="Order not found" message="This order does not exist or is not available.">
        <Link
          to="/orders"
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Back to orders
        </Link>
      </EmptyState>
    )
  }

  const isPending = order.status === 'PENDING'

  return (
    <div>
      <nav className="text-sm text-gray-500">
        <Link to="/orders" className="hover:text-indigo-600">
          Orders
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700">Order #{order.id}</span>
      </nav>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Order #{order.id}</h1>
        <StatusBadge status={order.status} />
      </div>

      <p className="mt-1 text-sm text-gray-500">Placed on {formatDate(order.createdAt)}</p>

      <div className="mt-4 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <ul className="divide-y divide-gray-200">
          {order.items.map((item) => (
            <li key={item.id} className="flex flex-wrap items-center justify-between gap-4 p-5">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900">{item.productTitle}</p>
                <p className="mt-1 text-sm text-gray-500">
                  {formatPrice(item.unitPrice)} × {item.quantity}
                </p>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {formatPrice(Number(item.unitPrice) * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-200 bg-gray-50 px-5 py-4">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-xl font-bold text-gray-900">{formatPrice(order.totalAmount)}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {isPending ? (
          <Link
            to={`/orders/${order.id}/pay`}
            className="rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Pay now
          </Link>
        ) : null}
        <Link
          to="/orders"
          className="rounded-md border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Back to orders
        </Link>
      </div>
    </div>
  )
}