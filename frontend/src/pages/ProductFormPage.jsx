import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { getCategories } from '../services/categories'
import { getSellerProducts, createProduct, updateProduct } from '../services/products'
import ProductForm from '../components/products/ProductForm'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import ErrorState from '../components/ui/ErrorState'
import EmptyState from '../components/ui/EmptyState'

export default function ProductFormPage() {
  const { productId } = useParams()
  const isEdit = productId != null
  const { user } = useAuth()
  const navigate = useNavigate()

  const [categories, setCategories] = useState([])
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
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
        const ownedProducts = await getSellerProducts(user.id)
        setProduct(ownedProducts.find((item) => String(item.id) === String(productId)) ?? null)
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

  const handleSubmit = async (values) => {
    setSubmitting(true)
    setSubmitError(null)
    try {
      if (isEdit) {
        await updateProduct(product.id, values)
      } else {
        await createProduct(values)
      }
      navigate('/seller/my-products', { replace: true })
    } catch (err) {
      setSubmitError(
        err.response?.data?.detail || (isEdit ? 'Unable to update the product.' : 'Unable to create the product.'),
      )
    } finally {
      setSubmitting(false)
    }
  }

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
      >
        <Link
          to="/seller/my-products"
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Back to My Products
        </Link>
      </EmptyState>
    )
  } else {
    content = (
      <>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          {isEdit ? 'Edit Product' : 'Create Product'}
        </h1>
        {isEdit ? (
          <p className="mt-1 text-sm text-gray-500">
            Updating “{product.title}” — changes keep the current status.
          </p>
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
          submitting={submitting}
          error={submitError}
        />
      </>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        to="/seller/my-products"
        className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
      >
        ← Back to My Products
      </Link>
      <div className="mt-4">{content}</div>
    </div>
  )
}