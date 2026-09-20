import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getOrder, payOrder } from '../services/orders'
import { formatPrice, formatDate } from '../utils/format'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import ErrorState from '../components/ui/ErrorState'
import EmptyState from '../components/ui/EmptyState'
import FlashMessage from '../components/ui/FlashMessage'
import StatusBadge from '../components/ui/StatusBadge'

export default function OrderPaymentPage() {
  const { orderId } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [paidFlash, setPaidFlash] = useState(false)
  const [payError, setPayError] = useState(null)

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

  const handlePay = async () => {
    setProcessing(true)
    setPayError(null)
    try {
      await payOrder(orderId)
      setPaidFlash(true)
      await load()
    } catch (err) {
      setPayError(err.response?.data?.detail || 'Payment could not be processed. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

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

  const total = Number(order.totalAmount)
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
        <h1 className="text-2xl font-bold text-gray-900">Pay for Order #{order.id}</h1>
        <StatusBadge status={order.status} />
      </div>

      {paidFlash ? (
        <div className="mt-4">
          <FlashMessage
            tone="success"
            title="Payment successful"
            message="Your payment was processed and the order is now paid."
            onDismiss={() => setPaidFlash(false)}
          />
        </div>
      ) : null}

      {payError ? (
        <div className="mt-4">
          <FlashMessage tone="error" title="Payment failed" message={payError} onDismiss={() => setPayError(null)} />
        </div>
      ) : null}

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm lg:col-span-2">
          <div className="border-b border-gray-200 px-5 py-3">
            <p className="text-sm font-medium text-gray-500">Placed {formatDate(order.createdAt)}</p>
          </div>
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
        </div>

        <div className="h-fit rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-medium text-gray-500">Payment</h2>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-gray-500">Amount due</span>
            <span className="text-lg font-bold text-indigo-600">{formatPrice(total)}</span>
          </div>

          {isPending ? (
            <>
              <p className="mt-4 text-sm text-gray-500">
                Payment is processed through the marketplace's demo provider. No real charge is made.
              </p>
              <button
                type="button"
                disabled={processing}
                onClick={handlePay}
                className="mt-5 w-full rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {processing ? 'Processing...' : `Pay ${formatPrice(total)}`}
              </button>
            </>
          ) : (
            <p className="mt-4 text-sm text-gray-500">This order does not require payment.</p>
          )}

          <Link
            to={`/orders/${order.id}`}
            className="mt-4 block text-center text-sm text-indigo-600 hover:text-indigo-700"
          >
            View order details
          </Link>
        </div>
      </div>
    </div>
  )
}