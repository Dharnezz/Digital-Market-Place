import { useCallback, useEffect, useMemo, useState } from 'react'
import { getProducts } from '../services/products'
import ProductCard from '../components/products/ProductCard'
import CatalogToolbar from '../components/catalog/CatalogToolbar'
import { SORT_COMPARATORS } from '../components/catalog/catalogSort'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import ErrorState from '../components/ui/ErrorState'
import EmptyState from '../components/ui/EmptyState'
import FlashMessage from '../components/ui/FlashMessage'

const SEARCH_DEBOUNCE_MS = 350

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reload, setReload] = useState(0)
  const [searchInput, setSearchInput] = useState('')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('newest')
  const [searching, setSearching] = useState(false)

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

  useEffect(() => {
    setSearching(true)
    const timer = setTimeout(() => {
      setQuery(searchInput.trim())
      setSearching(false)
    }, SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [searchInput])

  const normalizedQuery = query.toLowerCase()
  const visibleProducts = useMemo(() => {
    const filtered = normalizedQuery
      ? products.filter(
          (product) =>
            product.title.toLowerCase().includes(normalizedQuery) ||
            (product.sellerName || '').toLowerCase().includes(normalizedQuery) ||
            (product.categoryName || '').toLowerCase().includes(normalizedQuery),
        )
      : [...products]
    const comparator = SORT_COMPARATORS[sort]
    if (comparator) {
      filtered.sort(comparator)
    }
    return filtered
  }, [products, normalizedQuery, sort])

  let content
  if (loading && products.length === 0) {
    content = <LoadingSpinner label="Loading products..." />
  } else if (error && products.length === 0) {
    content = <ErrorState message={error} onRetry={() => setReload((count) => count + 1)} />
  } else if (products.length === 0) {
    content = (
      <EmptyState
        title="No products available"
        message="There are no approved products to display yet. Please check back later."
      />
    )
  } else if (searching) {
    content = <LoadingSpinner label="Searching..." />
  } else if (visibleProducts.length === 0) {
    content = (
      <EmptyState
        title="No products match your search"
        message={`Nothing matched "${query}". Try a different term or clear the search.`}
      >
        <button
          type="button"
          onClick={() => setSearchInput('')}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Clear search
        </button>
      </EmptyState>
    )
  } else {
    content = (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visibleProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    )
  }

  return (
    <div>
      <CatalogToolbar
        total={products.length}
        shown={visibleProducts.length}
        query={searchInput}
        searching={searching}
        onQueryChange={setSearchInput}
        onClear={() => setSearchInput('')}
        sort={sort}
        onSortChange={setSort}
      />

      {error && products.length > 0 ? (
        <div className="mt-4">
          <FlashMessage
            tone="error"
            title="Refresh failed"
            message={error}
            onDismiss={() => setError(null)}
          />
        </div>
      ) : null}

      <div className="mt-6">{content}</div>
    </div>
  )
}