import ProductManagementRow from './ProductManagementRow'

export default function ProductsTable({ products, busy, onEdit, onSubmitForApproval, onArchive }) {
  return (
    <section className="mt-6">
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
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
              {products.map((product) => {
                const rowBusy = busy?.id === product.id
                return (
                  <ProductManagementRow
                    key={product.id}
                    product={product}
                    busy={rowBusy}
                    busyAction={rowBusy ? busy.action : null}
                    onEdit={onEdit}
                    onSubmitForApproval={onSubmitForApproval}
                    onArchive={onArchive}
                  />
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}