import { formatPrice, formatDate } from '../../utils/format'
import StatusBadge from '../ui/StatusBadge'

export default function PendingProductRow({ product, busy, busyAction, onSelect, onApprove, onReject }) {
  return (
    <tr className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
      <td className="px-6 py-4 text-sm font-medium text-gray-900">{product.title}</td>
      <td className="px-6 py-4 text-sm text-gray-500">{product.sellerName}</td>
      <td className="px-6 py-4 text-sm text-gray-500">{product.categoryName}</td>
      <td className="px-6 py-4 text-sm text-gray-700">{formatPrice(product.price)}</td>
      <td className="px-6 py-4">
        <StatusBadge status={product.status} />
      </td>
      <td className="px-6 py-4 text-sm text-gray-500">{formatDate(product.createdAt)}</td>
      <td className="px-6 py-4 text-right">
        <div className="flex justify-end gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => onSelect(product)}
            className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            Review
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => onApprove(product)}
            className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {busyAction === 'approve' ? 'Approving…' : 'Approve'}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => onReject(product)}
            className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
          >
            {busyAction === 'reject' ? 'Rejecting…' : 'Reject'}
          </button>
        </div>
      </td>
    </tr>
  )
}