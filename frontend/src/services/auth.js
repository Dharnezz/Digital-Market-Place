import api from './api'

export function login(email, password) {
  return api.post('/api/auth/login', { email, password }).then((response) => response.data)
}

export function register(payload) {
  return api.post('/api/auth/register', payload).then((response) => response.data)
}

export function forgotPassword(email) {
  return api.post('/api/auth/forgot-password', { email }).then((response) => response.data)
}

export function verifyOtp(email, otp) {
  return api.post('/api/auth/verify-otp', { email, otp }).then((response) => response.data)
}

export function resetPassword(email, otp, newPassword) {
  return api.post('/api/auth/reset-password', { email, otp, newPassword }).then((response) => response.data)
}