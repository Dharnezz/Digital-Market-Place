import { Link } from 'react-router-dom'
import { formatPrice, formatDate } from '../../utils/format'
import StatusBadge from '../ui/StatusBadge'
import { productActions, statusHelp } from './ProductStatusMeta'

export default function ProductManagementRow({ product, busy, busyAction, onEdit, onSubmitForApproval, onArchive }) {
  const actions = productActions(product.status)
  const help = statusHelp(product.status)

  return (
    <tr className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
      <td className="px-6 py-4 text-sm font-medium text-gray-900">{product.title}</td>
      <td className="px-6 py-4 text-sm text-gray-500">{product.categoryName}</td>
      <td className="px-6 py-4 text-sm text-gray-700">{formatPrice(product.price)}</td>
      <td className="px-6 py-4">
        <StatusBadge status={product.status} />
        {help ? <p className="mt-1 text-xs text-gray-400">{help}</p> : null}
      </td>
      <td className="px-6 py-4 text-sm text-gray-500">{formatDate(product.createdAt)}</td>
      <td className="px-6 py-4 text-right">
        <div className="flex justify-end gap-2">
          {actions.canView ? (
            <Link
              to={`/products/${product.id}`}
              className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              View
            </Link>
          ) : null}
          {actions.canEdit ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => onEdit(product)}
              className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
            >
              Edit
            </button>
          ) : null}
          {actions.canSubmit ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => onSubmitForApproval(product)}
              className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {busyAction === 'submit' ? 'Submitting…' : 'Submit'}
            </button>
          ) : null}
          {actions.canArchive ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => onArchive(product)}
              className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
            >
              {busyAction === 'archive' ? 'Archiving…' : 'Archive'}
            </button>
          ) : null}
        </div>
      </td>
    </tr>
  )
}