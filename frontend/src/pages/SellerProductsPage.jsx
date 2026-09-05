import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { getSellerProducts, archiveProduct, submitProduct } from '../services/products'
import ProductsToolbar from '../components/products/ProductsToolbar'
import ProductsTable from '../components/products/ProductsTable'
import { STATUS_OPTIONS, statusLabel } from '../components/products/ProductStatusFilter'
import LoadingSkeleton from '../components/ui/LoadingSkeleton'
import EmptyState from '../components/ui/EmptyState'
import ErrorState from '../components/ui/ErrorState'
import FlashMessage from '../components/ui/FlashMessage'
import ConfirmDialog from '../components/ui/ConfirmDialog'

export default function SellerProductsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionError, setActionError] = useState(null)
  const [flash, setFlash] = useState(null)
  const [confirmTarget, setConfirmTarget] = useState(null)
  const [reload, setReload] = useState(0)
  const [activeStatus, setActiveStatus] = useState('ALL')
  const [busy, setBusy] = useState(null)

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

  useEffect(() => {
    if (location.state?.flash) {
      setFlash(location.state.flash)
      window.history.replaceState({}, '')
    }
  }, [location.state])

  const filteredProducts = useMemo(() => {
    const sorted = [...products].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    if (activeStatus === 'ALL') {
      return sorted
    }
    return sorted.filter((product) => product.status === activeStatus)
  }, [products, activeStatus])

  const statusCounts = useMemo(() => {
    const counts = { ALL: products.length }
    for (const option of STATUS_OPTIONS) {
      if (option.value !== 'ALL') {
        counts[option.value] = products.filter((product) => product.status === option.value).length
      }
    }
    return counts
  }, [products])

  const handleEdit = (product) => {
    navigate(`/seller/my-products/${product.id}/edit`)
  }

  const handleSubmitForApproval = async (product) => {
    setActionError(null)
    setBusy({ id: product.id, action: 'submit' })
    try {
      await submitProduct(product.id)
      setFlash({
        title: 'Submitted',
        message: `"${product.title}" was submitted for approval.`,
      })
      setReload((count) => count + 1)
    } catch (err) {
      setActionError({
        title: 'Submit failed',
        message: err.response?.data?.detail || 'Unable to submit the product for approval.',
      })
    } finally {
      setBusy(null)
    }
  }

  const handleArchiveConfirm = async () => {
    if (!confirmTarget) {
      return
    }
    const product = confirmTarget
    setConfirmTarget(null)
    setActionError(null)
    setBusy({ id: product.id, action: 'archive' })
    try {
      await archiveProduct(product.id)
      setFlash({
        title: 'Archived',
        message: `"${product.title}" was archived.`,
      })
      setReload((count) => count + 1)
    } catch (err) {
      setActionError({
        title: 'Archive failed',
        message: err.response?.data?.detail || 'Unable to archive the product.',
      })
    } finally {
      setBusy(null)
    }
  }

  let content
  if (loading && products.length === 0) {
    content = <LoadingSkeleton variant="table" />
  } else if (error && products.length === 0) {
    content = (
      <ErrorState
        title="Unable to load products"
        message={error}
        onRetry={() => setReload((count) => count + 1)}
      />
    )
  } else if (products.length === 0) {
    content = (
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
    )
  } else if (filteredProducts.length === 0) {
    content = (
      <EmptyState
        title={`No ${statusLabel(activeStatus)} products`}
        message="Try a different status filter."
      />
    )
  } else {
    content = (
      <ProductsTable
        products={filteredProducts}
        busy={busy}
        onEdit={handleEdit}
        onSubmitForApproval={handleSubmitForApproval}
        onArchive={setConfirmTarget}
      />
    )
  }

  return (
    <div>
      <ProductsToolbar
        activeStatus={activeStatus}
        onStatusChange={setActiveStatus}
        counts={statusCounts}
      />

      {flash ? (
        <div className="mt-6">
          <FlashMessage
            tone="success"
            title={flash.title}
            message={flash.message}
            onDismiss={() => setFlash(null)}
          />
        </div>
      ) : null}

      {actionError ? (
        <div className="mt-6">
          <FlashMessage
            tone="error"
            title={actionError.title}
            message={actionError.message}
            onDismiss={() => setActionError(null)}
          />
        </div>
      ) : null}

      {error && products.length > 0 ? (
        <div className="mt-6">
          <FlashMessage
            tone="error"
            title="Refresh failed"
            message={error}
            onDismiss={() => setError(null)}
          />
        </div>
      ) : null}

      <div className="mt-6">{content}</div>

      <ConfirmDialog
        open={confirmTarget !== null}
        title="Archive product"
        message={confirmTarget ? `Archive "${confirmTarget.title}"? This cannot be undone.` : ''}
        confirmLabel="Archive"
        tone="danger"
        onConfirm={handleArchiveConfirm}
        onCancel={() => setConfirmTarget(null)}
      />
    </div>
  )
}