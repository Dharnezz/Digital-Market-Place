import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { verifyOtp } from '../services/auth'
import ErrorState from '../components/ui/ErrorState'
import FlashMessage from '../components/ui/FlashMessage'

export default function VerifyOtpPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialEmail = searchParams.get('email') || ''

  const [email, setEmail] = useState(initialEmail)
  const [otp, setOtp] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [resendCooldown, setResendCooldown] = useState(0)

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setInterval(() => {
        setResendCooldown((prev) => (prev > 1 ? prev - 1 : 0))
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [resendCooldown])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await verifyOtp(email.trim(), otp.trim())
      navigate(`/reset-password?email=${encodeURIComponent(email.trim())}&otp=${encodeURIComponent(otp.trim())}`)
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid or expired OTP. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleResend = async () => {
    if (resendCooldown > 0) return
    try {
      await forgotPassword(email.trim())
      setResendCooldown(60)
    } catch (err) {
      console.error('Failed to resend OTP:', err)
    }
  }

  // Need to import forgotPassword
  const forgotPassword = async (email) => {
    const response = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })
    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.detail || 'Failed to resend OTP')
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-bold text-gray-900">Verify OTP</h1>
      <p className="mt-2 text-sm text-gray-500">
        We've sent a 6-digit code to <strong>{email}</strong>. Enter it below to verify.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        {error ? <ErrorState message={error} /> : null}

        <div>
          <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
            OTP Code
          </label>
          <input
            id="otp"
            type="text"
            required
            maxLength={6}
            autoComplete="one-time-code"
            value={otp}
            onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-center text-2xl tracking-widest shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            inputMode="numeric"
          />
          <p className="mt-1 text-xs text-gray-400">Enter the 6-digit code sent to your email</p>
        </div>

        <button
          type="submit"
          disabled={submitting || otp.length !== 6}
          className="w-full rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {submitting ? 'Verifying...' : 'Verify OTP'}
        </button>
      </form>

      <div className="mt-4 text-center">
        <p className="text-sm text-gray-500">
          Didn't receive the code?{' '}
          <button
            type="button"
            disabled={resendCooldown > 0}
            onClick={handleResend}
            className="font-medium text-indigo-600 hover:text-indigo-700 disabled:text-gray-400"
          >
            {resendCooldown > 0
              ? `Resend in {resendCooldown}s`
              : 'Resend OTP'}
          </button>
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Wrong email?{' '}
          <Link to="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-700">
            Change email
          </Link>
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Remember your password?{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-700">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}