import api from './api'

export function getLibrary() {
  return api.get('/api/library').then((response) => response.data)
}

export function getDownloadAuthorization(productId) {
  return api.get(`/api/library/products/${productId}/download`).then((response) => response.data)
}