import { formatPrice, formatDate } from '../../utils/format'
import StatusBadge from '../ui/StatusBadge'

export default function ProductRow({ product }) {
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
          <button
            type="button"
            disabled
            title="Coming in a later module"
            className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-300"
          >
            Edit
          </button>
          <button
            type="button"
            disabled
            title="Coming in a later module"
            className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-300"
          >
            View
          </button>
        </div>
      </td>
    </tr>
  )
}