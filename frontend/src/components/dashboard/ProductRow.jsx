import { Link } from 'react-router-dom'
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
          <Link
            to={`/seller/my-products/${product.id}/edit`}
            className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            Edit
          </Link>
          <Link
            to={`/products/${product.id}`}
            className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            View
          </Link>
        </div>
      </td>
    </tr>
  )
}