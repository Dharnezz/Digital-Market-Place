import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { getSellerProducts, archiveProduct, submitProduct } from '../services/products'
import ProductsToolbar from '../components/products/ProductsToolbar'
import ProductsTable from '../components/products/ProductsTable'
import { statusLabel } from '../components/products/ProductStatusFilter'
import LoadingSkeleton from '../components/ui/LoadingSkeleton'
import EmptyState from '../components/ui/EmptyState'
import ErrorState from '../components/ui/ErrorState'

export default function SellerProductsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionError, setActionError] = useState(null)
  const [reload, setReload] = useState(0)
  const [activeStatus, setActiveStatus] = useState('ALL')
  const [busyId, setBusyId] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setProducts(await getSellerProducts(user.id))
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to load your products. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [user.id])

  useEffect(() => {
    load()
  }, [load, reload])

  const filteredProducts = useMemo(() => {
    const sorted = [...products].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    if (activeStatus === 'ALL') {
      return sorted
    }
    return sorted.filter((product) => product.status === activeStatus)
  }, [products, activeStatus])

  const handleEdit = (product) => {
    navigate(`/seller/my-products/${product.id}/edit`)
  }

  const handleSubmitForApproval = async (product) => {
    setActionError(null)
    setBusyId(product.id)
    try {
      await submitProduct(product.id)
      setReload((count) => count + 1)
    } catch (err) {
      setActionError(err.response?.data?.detail || 'Unable to submit the product for approval.')
    } finally {
      setBusyId(null)
    }
  }

  const handleArchive = async (product) => {
    if (!window.confirm(`Archive "${product.title}"? This cannot be undone.`)) {
      return
    }
    setActionError(null)
    setBusyId(product.id)
    try {
      await archiveProduct(product.id)
      setReload((count) => count + 1)
    } catch (err) {
      setActionError(err.response?.data?.detail || 'Unable to archive the product.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div>
      <ProductsToolbar activeStatus={activeStatus} onStatusChange={setActiveStatus} />

      {actionError ? (
        <div className="mt-6">
          <ErrorState title="Request failed" message={actionError} />
        </div>
      ) : null}

      <div className="mt-6">
        {loading ? (
          <LoadingSkeleton variant="table" />
        ) : error ? (
          <ErrorState
            title="Unable to load products"
            message={error}
            onRetry={() => setReload((count) => count + 1)}
          />
        ) : products.length === 0 ? (
          <EmptyState
            title="No products yet"
            message="Create your first product to start selling on the marketplace."
          >
            <Link
              to="/seller/create-product"
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Create Product
            </Link>
          </EmptyState>
        ) : filteredProducts.length === 0 ? (
          <EmptyState
            title={`No ${statusLabel(activeStatus)} products`}
            message="Try a different status filter."
          />
        ) : (
          <ProductsTable
            products={filteredProducts}
            busyId={busyId}
            onEdit={handleEdit}
            onSubmitForApproval={handleSubmitForApproval}
            onArchive={handleArchive}
          />
        )}
      </div>
    </div>
  )
}