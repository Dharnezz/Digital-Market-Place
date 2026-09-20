import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getProduct } from '../services/products'
import { addCartItem } from '../services/cart'
import { getReviews, createReview, updateReview, deleteReview } from '../services/reviews'
import { getLibrary } from '../services/library'
import { useAuth } from '../hooks/useAuth'
import { formatPrice } from '../utils/format'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import ErrorState from '../components/ui/ErrorState'
import EmptyState from '../components/ui/EmptyState'
import FlashMessage from '../components/ui/FlashMessage'
import ReviewsSection from '../components/reviews/ReviewsSection'

export default function ProductDetails() {
  const { user, isAuthenticated } = useAuth()
  const { productId } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)
  const [flash, setFlash] = useState(null)
  const [reviews, setReviews] = useState([])
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [reviewsError, setReviewsError] = useState(null)
  const [purchasedProductIds, setPurchasedProductIds] = useState([])
  const [formState, setFormState] = useState(null)
  const [formBusy, setFormBusy] = useState(false)
  const [reviewFlash, setReviewFlash] = useState(null)

  const currentUser = isAuthenticated ? user : null
  const isUser = currentUser?.role === 'USER'

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    setNotFound(false)
    try {
      setProduct(await getProduct(productId))
    } catch (err) {
      if (err.response?.status === 404) {
        setNotFound(true)
      } else {
        setError(err.response?.data?.detail || 'Unable to load this product.')
      }
    } finally {
      setLoading(false)
    }
  }, [productId])

  useEffect(() => {
    load()
  }, [load])

  const loadReviews = useCallback(async () => {
    setReviewsLoading(true)
    setReviewsError(null)
    try {
      const [loadedReviews, library] = await Promise.all([
        getReviews(productId),
        isUser ? getLibrary() : Promise.resolve([]),
      ])
      setReviews(loadedReviews)
      setPurchasedProductIds(library.map((entry) => entry.productId))
    } catch (err) {
      setReviewsError(err.response?.data?.detail || 'Unable to load reviews.')
    } finally {
      setReviewsLoading(false)
    }
  }, [productId, isUser])

  useEffect(() => {
    loadReviews()
  }, [loadReviews])

  const performReviewAction = async (action, successFlash) => {
    setFormBusy(true)
    setReviewFlash(null)
    try {
      await action()
      setFormState(null)
      setReviewFlash(successFlash)
      await loadReviews()
    } catch (err) {
      setReviewFlash({
        tone: 'error',
        title: 'Could not save your review',
        message: err.response?.data?.detail || 'Please try again.',
      })
    } finally {
      setFormBusy(false)
    }
  }

  const handleCreateReview = (rating, comment) =>
    performReviewAction(
      () => createReview(product.id, rating, comment),
      { tone: 'success', title: 'Review submitted', message: 'Thanks for sharing your feedback.' },
    )

  const handleUpdateReview = (rating, comment) =>
    performReviewAction(
      () => updateReview(formState.id, rating, comment),
      { tone: 'success', title: 'Review updated', message: 'Your changes have been saved.' },
    )

  const handleDeleteReview = (review) =>
    performReviewAction(
      () => deleteReview(review.id),
      { tone: 'success', title: 'Review deleted', message: 'Your review has been removed.' },
    )

  const currentUserId = currentUser?.id
  const alreadyReviewed = reviews.some((review) => review.userId === currentUserId)
  const hasPurchased = isUser && purchasedProductIds.includes(Number(product?.id))

  const handleAddToCart = async () => {
    setAdding(true)
    setFlash(null)
    try {
      await addCartItem(Number(product.id), quantity)
      setFlash({ tone: 'success', title: 'Added to cart', message: 'View your cart to continue to checkout.' })
    } catch (err) {
      setFlash({ tone: 'error', title: 'Could not add to cart', message: err.response?.data?.detail || 'Please try again.' })
    } finally {
      setAdding(false)
    }
  }

  if (loading) {
    return <LoadingSpinner label="Loading product..." />
  }

  if (error) {
    return <ErrorState message={error} onRetry={load} />
  }

  if (notFound || !product) {
    return (
      <EmptyState
        title="Product not found"
        message="This product does not exist or is not available for purchase."
      >
        <Link
          to="/products"
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Back to products
        </Link>
      </EmptyState>
    )
  }

  return (
    <div>
      <nav className="text-sm text-gray-500">
        <Link to="/products" className="hover:text-indigo-600">
          Products
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700">{product.title}</span>
      </nav>

      <div className="mt-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900">{product.title}</h1>
          <span className="text-2xl font-bold text-indigo-600">{formatPrice(product.price)}</span>
        </div>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">Category</dt>
            <dd className="mt-1 text-sm text-gray-900">{product.categoryName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Seller</dt>
            <dd className="mt-1 text-sm text-gray-900">{product.sellerName}</dd>
          </div>
        </dl>

        <div className="mt-6">
          <h2 className="text-sm font-medium text-gray-500">Description</h2>
          <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-gray-700">
            {product.description || 'No description provided.'}
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        {flash ? (
          <div className="mb-4">
            <FlashMessage title={flash.title} message={flash.message} tone={flash.tone} onDismiss={() => setFlash(null)} />
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500">Price</p>
            <p className="text-3xl font-bold text-indigo-600">{formatPrice(product.price)}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label htmlFor="quantity" className="text-sm font-medium text-gray-700">
              Quantity
            </label>
            <input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(event) => setQuantity(Math.max(1, parseInt(event.target.value, 10) || 1))}
              className="w-20 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button
              type="button"
              disabled={adding}
              onClick={handleAddToCart}
              className="rounded-md bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {adding ? 'Adding...' : 'Add to Cart'}
            </button>
          </div>
        </div>

        {flash?.tone === 'success' ? (
          <Link
            to="/cart"
            className="mt-4 inline-flex text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            View cart →
          </Link>
        ) : null}
      </div>

      <ReviewsSection
        loading={reviewsLoading}
        error={reviewsError}
        onRetry={loadReviews}
        reviews={reviews}
        currentUserId={currentUserId}
        isUser={isUser}
        hasPurchased={hasPurchased}
        alreadyReviewed={alreadyReviewed}
        formState={formState}
        formBusy={formBusy}
        flash={reviewFlash}
        onDismissFlash={() => setReviewFlash(null)}
        onStartCreate={() => setFormState('create')}
        onCancelForm={() => setFormState(null)}
        onStartEdit={(review) => setFormState(review)}
        onCreate={handleCreateReview}
        onUpdate={handleUpdateReview}
        onDelete={handleDeleteReview}
      />
    </div>
  )
}