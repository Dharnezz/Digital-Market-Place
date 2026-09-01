import ProductRow from './ProductRow'

export default function RecentProductsTable({ products }) {
  return (
    <section className="mt-8">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Recent Products</h2>
        <span className="text-sm text-gray-500">Latest {products.length}</span>
      </div>

      <div className="mt-3 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Title
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Price
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Created Date
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {products.map((product) => (
                <ProductRow key={product.id} product={product} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}