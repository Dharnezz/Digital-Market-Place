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