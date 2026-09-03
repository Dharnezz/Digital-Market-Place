import { formatPrice, formatDate } from '../../utils/format'
import StatusBadge from '../ui/StatusBadge'

const canSubmit = (status) => status === 'DRAFT' || status === 'REJECTED'
const isArchived = (status) => status === 'ARCHIVED'

export default function ProductManagementRow({ product, busy, onEdit, onSubmitForApproval, onArchive }) {
  const archived = isArchived(product.status)

  return (
    <tr className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
      <td className="px-6 py-4 text-sm font-medium text-gray-900">{product.title}</td>
      <td className="px-6 py-4 text-sm text-gray-500">{product.categoryName}</td>
      <td className="px-6 py-4 text-sm text-gray-700">{formatPrice(product.price)}</td>
      <td className="px-6 py-4">
        <StatusBadge status={product.status} />
      </td>
      <td className="px-6 py-4 text-sm text-gray-500">{formatDate(product.createdAt)}</td>
      <td className="px-6 py-4 text-right">
        <div className="flex justify-end gap-2">
          {!archived ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => onEdit(product)}
              className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
            >
              Edit
            </button>
          ) : null}
          {canSubmit(product.status) ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => onSubmitForApproval(product)}
              className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {busy ? 'Submitting…' : 'Submit'}
            </button>
          ) : null}
          {!archived ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => onArchive(product)}
              className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
            >
              Archive
            </button>
          ) : null}
        </div>
      </td>
    </tr>
  )
}