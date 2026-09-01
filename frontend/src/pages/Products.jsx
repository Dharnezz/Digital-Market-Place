import { useCallback, useEffect, useState } from 'react'
import { getProducts } from '../services/products'
import ProductCard from '../components/products/ProductCard'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import ErrorState from '../components/ui/ErrorState'
import EmptyState from '../components/ui/EmptyState'

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reload, setReload] = useState(0)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setProducts(await getProducts())
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to load products. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load, reload])

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <p className="text-sm text-gray-500">{!loading && !error ? `${products.length} available` : ''}</p>
      </div>
      <p className="mt-1 text-sm text-gray-500">
        Browse approved digital products from verified sellers.
      </p>

      <div className="mt-6">
        {loading ? (
          <LoadingSpinner label="Loading products..." />
        ) : error ? (
          <ErrorState message={error} onRetry={() => setReload((count) => count + 1)} />
        ) : products.length === 0 ? (
          <EmptyState
            title="No products available"
            message="There are no approved products to display yet. Please check back later."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}