import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCart, updateCartItem, removeCartItem } from '../services/cart'
import { formatPrice } from '../utils/format'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import ErrorState from '../components/ui/ErrorState'
import EmptyState from '../components/ui/EmptyState'
import FlashMessage from '../components/ui/FlashMessage'
import ConfirmDialog from '../components/ui/ConfirmDialog'

export default function CartPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [busyProductId, setBusyProductId] = useState(null)
  const [confirmProductId, setConfirmProductId] = useState(null)
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

  const handleUpdateQuantity = async (productId, quantity) => {
    setBusyProductId(productId)
    setFlash(null)
    try {
      await updateCartItem(productId, quantity)
      await load()
    } catch (err) {
      setFlash({ tone: 'error', title: 'Could not update quantity', message: err.response?.data?.detail || 'Please try again.' })
    } finally {
      setBusyProductId(null)
    }
  }

  const handleRemove = async () => {
    const productId = confirmProductId
    setConfirmProductId(null)
    setBusyProductId(productId)
    setFlash(null)
    try {
      await removeCartItem(productId)
      await load()
      setFlash({ tone: 'success', title: 'Item removed', message: 'The item was removed from your cart.' })
    } catch (err) {
      setFlash({ tone: 'error', title: 'Could not remove item', message: err.response?.data?.detail || 'Please try again.' })
    } finally {
      setBusyProductId(null)
    }
  }

  const subtotal = items.reduce((total, item) => total + Number(item.unitPrice) * item.quantity, 0)

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Your Cart</h1>
        {!loading && !error && items.length > 0 ? (
          <p className="text-sm text-gray-500">{items.length} item{items.length === 1 ? '' : 's'}</p>
        ) : null}
      </div>

      <div className="mt-4">
        {flash ? (
          <div className="mb-4">
            <FlashMessage
              title={flash.title}
              message={flash.message}
              tone={flash.tone}
              onDismiss={() => setFlash(null)}
            />
          </div>
        ) : null}

        {loading ? (
          <LoadingSpinner label="Loading your cart..." />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : items.length === 0 ? (
          <EmptyState
            title="Your cart is empty"
            message="Browse available products and add something to get started."
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
              {items.map((item) => (
                <li key={item.productId} className="flex flex-wrap items-center justify-between gap-4 p-5">
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/products/${item.productId}`}
                      className="text-sm font-semibold text-gray-900 hover:text-indigo-700"
                    >
                      {item.productTitle}
                    </Link>
                    <p className="mt-1 text-sm text-gray-500">
                      {formatPrice(item.unitPrice)} each
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center rounded-md border border-gray-300">
                      <button
                        type="button"
                        aria-label={`Decrease quantity of ${item.productTitle}`}
                        disabled={busyProductId === item.productId || item.quantity <= 1}
                        onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                        className="rounded-l-md px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        −
                      </button>
                      <span className="min-w-10 px-3 py-1.5 text-center text-sm font-medium text-gray-900">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        aria-label={`Increase quantity of ${item.productTitle}`}
                        disabled={busyProductId === item.productId}
                        onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                        className="rounded-r-md px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>

                    <span className="w-24 text-right text-sm font-semibold text-gray-900">
                      {formatPrice(Number(item.unitPrice) * item.quantity)}
                    </span>

                    <button
                      type="button"
                      onClick={() => setConfirmProductId(item.productId)}
                      className="rounded-md p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                      aria-label={`Remove ${item.productTitle} from cart`}
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-200 bg-gray-50 px-5 py-4">
              <div>
                <p className="text-sm text-gray-500">Subtotal</p>
                <p className="text-xl font-bold text-gray-900">{formatPrice(subtotal)}</p>
              </div>
              <Link
                to="/checkout"
                className="rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmProductId !== null}
        title="Remove item?"
        message="This item will be removed from your cart."
        confirmLabel="Remove"
        onConfirm={handleRemove}
        onCancel={() => setConfirmProductId(null)}
      />
    </div>
  )
}