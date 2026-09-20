import { useCallback, useEffect, useState } from 'react'
import { getPendingProducts, approveProduct, rejectProduct } from '../services/admin'
import ModerationToolbar from '../components/admin/ModerationToolbar'
import PendingProductsTable from '../components/admin/PendingProductsTable'
import ModerationDetailsPanel from '../components/admin/ModerationDetailsPanel'
import LoadingSkeleton from '../components/ui/LoadingSkeleton'
import EmptyState from '../components/ui/EmptyState'
import ErrorState from '../components/ui/ErrorState'
import FlashMessage from '../components/ui/FlashMessage'
import ConfirmDialog from '../components/ui/ConfirmDialog'

export default function AdminModerationPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshError, setRefreshError] = useState(null)
  const [busy, setBusy] = useState(null)
  const [selected, setSelected] = useState(null)
  const [flash, setFlash] = useState(null)
  const [rejectTarget, setRejectTarget] = useState(null)

  const syncSelection = (loaded) => {
    setSelected((current) => {
      if (!current) {
        return null
      }
      return loaded.find((product) => product.id === current.id) ?? null
    })
  }

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const loaded = await getPendingProducts()
      setProducts(loaded)
      syncSelection(loaded)
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to load the moderation queue.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleRefresh = async () => {
    setRefreshError(null)
    try {
      const loaded = await getPendingProducts()
      setProducts(loaded)
      syncSelection(loaded)
    } catch (err) {
      setRefreshError(err.response?.data?.detail || 'Unable to refresh the moderation queue.')
    }
  }

  const removeFromQueue = (productId) => {
    setProducts((current) => current.filter((product) => product.id !== productId))
    setSelected((current) => (current?.id === productId ? null : current))
  }

  const handleApprove = async (product) => {
    setBusy({ id: product.id, action: 'approve' })
    setFlash(null)
    setRefreshError(null)
    try {
      await approveProduct(product.id)
      removeFromQueue(product.id)
      setFlash({
        tone: 'success',
        title: 'Product approved',
        message: `"${product.title}" was approved and is now available in the catalog.`,
      })
    } catch (err) {
      setFlash({
        tone: 'error',
        title: 'Approval failed',
        message: err.response?.data?.detail || 'Unable to approve the product.',
      })
    } finally {
      setBusy(null)
    }
  }

  const handleRejectConfirm = async () => {
    if (!rejectTarget) {
      return
    }
    const product = rejectTarget
    setRejectTarget(null)
    setBusy({ id: product.id, action: 'reject' })
    setFlash(null)
    setRefreshError(null)
    try {
      await rejectProduct(product.id)
      removeFromQueue(product.id)
      setFlash({
        tone: 'success',
        title: 'Product rejected',
        message: `"${product.title}" was rejected and is no longer pending.`,
      })
    } catch (err) {
      setFlash({
        tone: 'error',
        title: 'Rejection failed',
        message: err.response?.data?.detail || 'Unable to reject the product.',
      })
    } finally {
      setBusy(null)
    }
  }

  let content
  if (loading && products.length === 0) {
    content = <LoadingSkeleton variant="table" />
  } else if (error && products.length === 0) {
    content = <ErrorState title="Unable to load moderation queue" message={error} onRetry={load} />
  } else if (products.length === 0) {
    content = (
      <EmptyState
        title="No products pending moderation"
        message="Products submitted by sellers for approval will appear here."
      />
    )
  } else {
    content = (
      <PendingProductsTable
        products={products}
        busy={busy}
        onSelect={setSelected}
        onApprove={handleApprove}
        onReject={setRejectTarget}
      />
    )
  }

  return (
    <div>
      <ModerationToolbar count={loading && products.length === 0 ? 0 : products.length} refreshing={busy?.action === 'refresh'} onRefresh={handleRefresh} />
      <div className="mt-4">
        {content}
      </div>

      {flash ? (
        <div className="mt-4">
          <FlashMessage title={flash.title} message={flash.message} tone={flash.tone} onDismiss={() => setFlash(null)} />
        </div>
      ) : null}

      {refreshError ? (
        <div className="mt-4">
          <FlashMessage
            tone="error"
            title="Refresh failed"
            message={refreshError}
            onDismiss={() => setRefreshError(null)}
          />
        </div>
      ) : null}

      <div className="mt-6">
        <ModerationDetailsPanel
          product={selected}
          busy={selected ? busy?.id === selected.id : false}
          busyAction={selected && busy?.id === selected.id ? busy.action : null}
          onApprove={handleApprove}
          onReject={setRejectTarget}
        />
      </div>

      <ConfirmDialog
        open={rejectTarget !== null}
        title="Reject product"
        message={rejectTarget ? `Reject "${rejectTarget.title}"? The seller will be able to edit and resubmit it.` : ''}
        confirmLabel="Reject"
        tone="danger"
        onConfirm={handleRejectConfirm}
        onCancel={() => setRejectTarget(null)}
      />
    </div>
  )
}