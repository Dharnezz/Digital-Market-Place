import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { getSellerProducts } from '../services/products'
import DashboardHeader from '../components/dashboard/DashboardHeader'
import StatisticsCards from '../components/dashboard/StatisticsCards'
import RecentProductsTable from '../components/dashboard/RecentProductsTable'
import QuickActionCard from '../components/dashboard/QuickActionCard'
import LoadingSkeleton from '../components/ui/LoadingSkeleton'
import EmptyState from '../components/ui/EmptyState'
import ErrorState from '../components/ui/ErrorState'

const countByStatus = (products, status) => products.filter((product) => product.status === status).length

export default function SellerDashboard() {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reload, setReload] = useState(0)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setProducts(await getSellerProducts(user.id))
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to load your products. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [user.id])

  useEffect(() => {
    load()
  }, [load, reload])

  const statistics = useMemo(
    () => ({
      total: products.length,
      draft: countByStatus(products, 'DRAFT'),
      pending: countByStatus(products, 'PENDING_APPROVAL'),
      approved: countByStatus(products, 'APPROVED'),
    }),
    [products],
  )

  const recentProducts = useMemo(
    () =>
      [...products]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5),
    [products],
  )

  return (
    <div>
      <DashboardHeader name={user?.name} />

      {loading ? (
        <>
          <LoadingSkeleton variant="cards" />
          <LoadingSkeleton variant="table" />
        </>
      ) : error ? (
        <div className="mt-6">
          <ErrorState
            title="Unable to load your dashboard"
            message={error}
            onRetry={() => setReload((count) => count + 1)}
          />
        </div>
      ) : (
        <>
          <StatisticsCards statistics={statistics} />

          {products.length === 0 ? (
            <div className="mt-8">
              <EmptyState
                title="No products yet"
                message="Once you create a product it will appear here for you to manage and submit for approval."
              />
            </div>
          ) : (
            <RecentProductsTable products={recentProducts} />
          )}

          <QuickActionCard />
        </>
      )}
    </div>
  )
}