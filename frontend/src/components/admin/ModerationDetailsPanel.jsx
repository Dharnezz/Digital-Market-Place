import { formatPrice, formatDate } from '../../utils/format'
import StatusBadge from '../ui/StatusBadge'
import { statusLabel } from '../products/ProductStatusMeta'

function DetailItem({ label, children }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900">{children}</dd>
    </div>
  )
}

export default function ModerationDetailsPanel({ product, busy, busyAction, onApprove, onReject }) {
  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white px-6 py-14 text-center">
        <p className="text-lg font-medium text-gray-700">No product selected</p>
        <p className="mt-2 max-w-sm text-sm text-gray-500">
          Use the Review button on a pending product to inspect its details before deciding.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h2 className="text-lg font-bold text-gray-900">{product.title}</h2>
        <StatusBadge status={product.status} />
      </div>

      <dl className="mt-5 grid gap-4">
        <DetailItem label="Seller">{product.sellerName}</DetailItem>
        <DetailItem label="Category">{product.categoryName}</DetailItem>
        <DetailItem label="Price">{formatPrice(product.price)}</DetailItem>
        <DetailItem label="Status">{statusLabel(product.status)}</DetailItem>
        <DetailItem label="Submitted">{formatDate(product.createdAt)}</DetailItem>
      </dl>

      <div className="mt-5">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Description</h3>
        <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-gray-700">
          {product.description || 'No description provided.'}
        </p>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-gray-100 pt-5">
        <button
          type="button"
          disabled={busy}
          onClick={() => onApprove(product)}
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busyAction === 'approve' ? 'Approving…' : 'Approve product'}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => onReject(product)}
          className="rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busyAction === 'reject' ? 'Rejecting…' : 'Reject product'}
        </button>
      </div>
    </div>
  )
}