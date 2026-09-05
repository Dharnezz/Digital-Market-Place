import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { formatPrice, formatDate } from '../utils/format'
import { getCategories } from '../services/categories'
import { createProduct, updateProduct, submitProduct, findOwnedProduct } from '../services/products'
import ProductForm from '../components/products/ProductForm'
import StatusBadge from '../components/ui/StatusBadge'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import ErrorState from '../components/ui/ErrorState'
import EmptyState from '../components/ui/EmptyState'
import FlashMessage from '../components/ui/FlashMessage'

function editHelper(status) {
  if (status === 'APPROVED') {
    return 'Changes update the live listing immediately.'
  }
  if (status === 'REJECTED') {
    return 'Review the changes, then submit again for approval.'
  }
  return 'Updates keep the current Draft status.'
}

export default function ProductFormPage() {
  const { productId } = useParams()
  const isEdit = productId != null
  const { user } = useAuth()
  const navigate = useNavigate()

  const [categories, setCategories] = useState([])
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(null)
  const [submitError, setSubmitError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const categoryData = await getCategories()
      setCategories(categoryData)

      if (isEdit) {
        // TEMP SOLUTION: GET /api/products/{id} returns APPROVED products only, and the
        // backend has no authenticated endpoint to fetch a DRAFT/PENDING_APPROVAL/REJECTED
        // product by id. Resolve the product by loading the seller's owned list and
        // matching the id client-side. Replace with a direct product lookup when such an
        // endpoint exists.
        setProduct(await findOwnedProduct(user.id, productId))
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to load the form. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [isEdit, user.id, productId])

  useEffect(() => {
    load()
  }, [load])

  const goToList = (flash) => {
    navigate('/seller/my-products', { replace: true, state: { flash } })
  }

  const handleSubmit = async (values) => {
    if (busy) {
      return
    }
    setBusy('save')
    setSubmitError(null)
    try {
      if (isEdit) {
        await updateProduct(product.id, values)
        goToList({ title: 'Saved', message: 'Product updated.' })
      } else {
        await createProduct(values)
        goToList({ title: 'Created', message: 'Product created.' })
      }
    } catch (err) {
      setSubmitError(
        err.response?.data?.detail || (isEdit ? 'Unable to update the product.' : 'Unable to create the product.'),
      )
    } finally {
      setBusy(null)
    }
  }

  const handleSaveAndSubmit = async (values) => {
    if (busy) {
      return
    }
    setBusy('approval')
    setSubmitError(null)
    try {
      await updateProduct(product.id, values)
      await submitProduct(product.id)
      goToList({ title: 'Submitted', message: 'Product updated and submitted for approval.' })
    } catch (err) {
      setSubmitError(err.response?.data?.detail || 'Unable to update and submit the product.')
    } finally {
      setBusy(null)
    }
  }

  const isArchived = isEdit && product && product.status === 'ARCHIVED'
  const isPending = isEdit && product && product.status === 'PENDING_APPROVAL'
  const canSaveAndSubmit = isEdit && product && (product.status === 'DRAFT' || product.status === 'REJECTED')

  let content
  if (loading) {
    content = <LoadingSpinner label={isEdit ? 'Loading product...' : 'Loading categories...'} />
  } else if (error) {
    content = <ErrorState title="Unable to load the form" message={error} onRetry={load} />
  } else if (isEdit && !product) {
    content = (
      <EmptyState
        title="Product not found"
        message="The product does not exist or you do not have access to it."
      />
    )
  } else if (isArchived) {
    content = (
      <EmptyState
        title="Archived product"
        message="Archived products cannot be edited. Restore or delete requires a new listing."
      />
    )
  } else if (isPending) {
    content = (
      <>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Product Details</h1>
        <div className="mt-4 space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-900">{product.title}</h2>
            <StatusBadge status={product.status} />
          </div>
          <FlashMessage tone="info" message="This product is currently under review." />
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="font-medium text-gray-500">Category</dt>
              <dd className="mt-0.5 text-gray-900">{product.categoryName}</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-500">Price</dt>
              <dd className="mt-0.5 text-gray-900">{formatPrice(product.price)}</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-500">Created</dt>
              <dd className="mt-0.5 text-gray-900">{formatDate(product.createdAt)}</dd>
            </div>
            {product.description ? (
              <div>
                <dt className="font-medium text-gray-500">Description</dt>
                <dd className="mt-0.5 whitespace-pre-line text-gray-900">{product.description}</dd>
              </div>
            ) : null}
          </dl>
        </div>
      </>
    )
  } else {
    content = (
      <>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          {isEdit ? 'Edit Product' : 'Create Product'}
        </h1>
        {isEdit ? (
          <p className="mt-1 text-sm text-gray-500">{editHelper(product.status)}</p>
        ) : (
          <p className="mt-1 text-sm text-gray-500">
            New products are created as drafts and must be submitted for approval.
          </p>
        )}
        <ProductForm
          key={isEdit ? product.id : 'create'}
          mode={isEdit ? 'edit' : 'create'}
          categories={categories}
          initialValues={isEdit ? product : undefined}
          onSubmit={handleSubmit}
          onSaveAndSubmit={canSaveAndSubmit ? handleSaveAndSubmit : undefined}
          busy={busy}
          error={submitError}
          canSaveAndSubmit={Boolean(canSaveAndSubmit)}
        />
      </>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        to="/seller/my-products"
        onClick={(event) => {
          if (busy) {
            event.preventDefault()
          }
        }}
        className={`text-sm font-medium text-indigo-600 hover:text-indigo-700 ${
          busy ? 'pointer-events-none opacity-60' : ''
        }`}
      >
        ← Back to My Products
      </Link>
      <div className="mt-4">{content}</div>
    </div>
  )
}