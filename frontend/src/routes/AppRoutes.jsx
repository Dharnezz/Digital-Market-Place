import { Route, Routes, Navigate } from 'react-router-dom'
import RootLayout from '../layouts/RootLayout'
import ProtectedRoute from '../components/auth/ProtectedRoute'
import RoleRoute from '../components/auth/RoleRoute'
import Home from '../pages/Home'
import Login from '../pages/Login'
import Register from '../pages/Register'
import ForgotPasswordPage from '../pages/ForgotPasswordPage'
import VerifyOtpPage from '../pages/VerifyOtpPage'
import ResetPasswordPage from '../pages/ResetPasswordPage'
import Products from '../pages/Products'
import ProductDetails from '../pages/ProductDetails'
import NotFound from '../pages/NotFound'
import Unauthorized from '../pages/Unauthorized'
import Forbidden from '../pages/Forbidden'
import SellerDashboard from '../pages/SellerDashboard'
import SellerProductsPage from '../pages/SellerProductsPage'
import ProductFormPage from '../pages/ProductFormPage'
import CartPage from '../pages/CartPage'
import CheckoutPage from '../pages/CheckoutPage'
import OrderPaymentPage from '../pages/OrderPaymentPage'
import OrdersPage from '../pages/OrdersPage'
import OrderDetailsPage from '../pages/OrderDetailsPage'
import LibraryPage from '../pages/LibraryPage'
import AdminModerationPage from '../pages/AdminModerationPage'
import DashboardLayout from '../components/layout/DashboardLayout'

const AUTHENTICATED_ROLES = ['USER', 'SELLER', 'ADMIN']

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-otp" element={<VerifyOtpPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route
          path="/products"
          element={
            <RoleRoute roles={AUTHENTICATED_ROLES}>
              <Products />
            </RoleRoute>
          }
        />
        <Route
          path="/products/:productId"
          element={
            <ProtectedRoute>
              <ProductDetails />
            </ProtectedRoute>
          }
        />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/forbidden" element={<Forbidden />} />
        <Route
          path="/cart"
          element={
            <RoleRoute roles={['USER']}>
              <CartPage />
            </RoleRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <RoleRoute roles={['USER']}>
              <CheckoutPage />
            </RoleRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <RoleRoute roles={['USER']}>
              <OrdersPage />
            </RoleRoute>
          }
        />
        <Route
          path="/orders/:orderId"
          element={
            <RoleRoute roles={['USER']}>
              <OrderDetailsPage />
            </RoleRoute>
          }
        />
        <Route
          path="/orders/:orderId/pay"
          element={
            <RoleRoute roles={['USER']}>
              <OrderPaymentPage />
            </RoleRoute>
          }
        />
        <Route
          path="/library"
          element={
            <RoleRoute roles={['USER']}>
              <LibraryPage />
            </RoleRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route
        path="/seller"
        element={
          <RoleRoute roles={['SELLER']}>
            <DashboardLayout />
          </RoleRoute>
        }
      >
        <Route index element={<SellerDashboard />} />
        <Route path="my-products" element={<SellerProductsPage />} />
        <Route path="my-products/:productId/edit" element={<ProductFormPage />} />
        <Route path="create-product" element={<ProductFormPage />} />
      </Route>

      <Route
        path="/admin"
        element={
          <RoleRoute roles={['ADMIN']}>
            <DashboardLayout />
          </RoleRoute>
        }
      >
        <Route index element={<Navigate to="/admin/moderation" replace />} />
        <Route path="moderation" element={<AdminModerationPage />} />
      </Route>
    </Routes>
  )
}