import api from './api'

export function getProducts() {
  return api.get('/api/products').then((response) => response.data)
}

export function getProduct(productId) {
  return api.get(`/api/products/${productId}`).then((response) => response.data)
}

export function getSellerProducts(sellerId) {
  return api.get(`/api/sellers/${sellerId}/products`).then((response) => response.data)
}

export async function findOwnedProduct(sellerId, productId) {
  // TEMP SOLUTION: GET /api/products/{id} returns APPROVED products only, and the backend
  // has no authenticated endpoint to fetch a DRAFT/PENDING_APPROVAL/REJECTED product by id.
  // Resolve the product by loading the seller's owned list and matching the id client-side.
  // Replace with a direct product lookup when such an endpoint exists.
  const products = await getSellerProducts(sellerId)
  return products.find((item) => String(item.id) === String(productId)) ?? null
}

export function createProduct(payload) {
  return api.post('/api/products', payload).then((response) => response.data)
}

export function updateProduct(productId, payload) {
  return api.put(`/api/products/${productId}`, payload).then((response) => response.data)
}

export function submitProduct(productId) {
  return api.patch(`/api/products/${productId}/submit`).then((response) => response.data)
}

export function archiveProduct(productId) {
  return api.delete(`/api/products/${productId}`)
}