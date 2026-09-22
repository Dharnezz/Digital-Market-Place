import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { forgotPassword } from '../services/auth'
import ErrorState from '../components/ui/ErrorState'
import FlashMessage from '../components/ui/FlashMessage'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [flash, setFlash] = useState(null)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await forgotPassword(email.trim())
      setFlash({ message: 'If an account exists, an OTP has been sent to the registered email.' })
      setTimeout(() => {
        navigate(`/verify-otp?email=${encodeURIComponent(email.trim())}`)
      }, 1500)
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to send OTP. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-bold text-gray-900">Forgot Password</h1>
      <p className="mt-2 text-sm text-gray-500">
        Enter your email address and we'll send you a 6-digit OTP to reset your password.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        {error ? <ErrorState message={error} /> : null}
        {flash ? (
          <FlashMessage tone="success" message={flash.message} onDismiss={() => setFlash(null)} />
        ) : null}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {submitting ? 'Sending OTP...' : 'Send OTP'}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-500">
        Remember your password?{' '}
        <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-700">
          Log in
        </Link>
      </p>
    </div>
  )
}