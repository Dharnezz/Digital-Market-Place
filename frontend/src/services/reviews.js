import api from './api'

export function getReviews(productId) {
  return api.get(`/api/products/${productId}/reviews`).then((response) => response.data)
}

export function createReview(productId, rating, comment) {
  return api.post(`/api/products/${productId}/reviews`, { rating, comment }).then((response) => response.data)
}

export function updateReview(reviewId, rating, comment) {
  return api.put(`/api/reviews/${reviewId}`, { rating, comment }).then((response) => response.data)
}

export function deleteReview(reviewId) {
  return api.delete(`/api/reviews/${reviewId}`)
}