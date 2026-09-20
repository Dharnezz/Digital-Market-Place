import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getCart } from '../services/cart'
import { checkout } from '../services/orders'
import { formatPrice } from '../utils/format'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import ErrorState from '../components/ui/ErrorState'
import EmptyState from '../components/ui/EmptyState'
import FlashMessage from '../components/ui/FlashMessage'

export default function CheckoutPage() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [flash, setFlash] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const cart = await getCart()
      setItems(cart.items ?? [])
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to load your cart. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const total = items.reduce((sum, item) => sum + Number(item.unitPrice) * item.quantity, 0)

  const handleCheckout = async () => {
    setProcessing(true)
    setFlash(null)
    try {
      const order = await checkout()
      navigate(`/orders/${order.id}/pay`, { replace: true })
    } catch (err) {
      setFlash({ tone: 'error', title: 'Checkout failed', message: err.response?.data?.detail || 'Unable to place your order. Please try again.' })
      setProcessing(false)
    }
  }

  return (
    <div>
      <nav className="text-sm text-gray-500">
        <Link to="/cart" className="hover:text-indigo-600">
          Cart
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700">Checkout</span>
      </nav>

      <h1 className="mt-2 text-2xl font-bold text-gray-900">Checkout</h1>

      <div className="mt-4">
        {flash ? (
          <div className="mb-4">
            <FlashMessage title={flash.title} message={flash.message} tone={flash.tone} onDismiss={() => setFlash(null)} />
          </div>
        ) : null}

        {loading ? (
          <LoadingSpinner label="Preparing checkout..." />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : items.length === 0 ? (
          <EmptyState
            title="Your cart is empty"
            message="Add items to your cart before checking out."
          >
            <Link
              to="/products"
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Browse products
            </Link>
          </EmptyState>
        ) : (
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm lg:col-span-2">
              <ul className="divide-y divide-gray-200">
                {items.map((item) => (
                  <li key={item.productId} className="flex flex-wrap items-center justify-between gap-4 p-5">
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
              <h2 className="text-sm font-medium text-gray-500">Order Summary</h2>
              <dl className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-gray-500">Items</dt>
                  <dd className="text-sm text-gray-900">{items.length}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-gray-500">Subtotal</dt>
                  <dd className="text-sm font-medium text-gray-900">{formatPrice(total)}</dd>
                </div>
                <div className="flex items-center justify-between border-t border-gray-200 pt-3">
                  <dt className="text-sm font-semibold text-gray-900">Total</dt>
                  <dd className="text-lg font-bold text-indigo-600">{formatPrice(total)}</dd>
                </div>
              </dl>

              <button
                type="button"
                disabled={processing}
                onClick={handleCheckout}
                className="mt-6 w-full rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {processing ? 'Placing order...' : 'Place order'}
              </button>
              <Link
                to="/cart"
                className="mt-3 block text-center text-sm text-indigo-600 hover:text-indigo-700"
              >
                Back to cart
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}