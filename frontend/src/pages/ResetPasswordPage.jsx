import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { resetPassword } from '../services/auth'
import ErrorState from '../components/ui/ErrorState'
import FlashMessage from '../components/ui/FlashMessage'

function validatePassword(password) {
  const errors = {}
  if (!password) {
    errors.password = 'Password is required'
  } else if (password.length < 8) {
    errors.password = 'Password must be at least 8 characters'
  } else if (password.length > 72) {
    errors.password = 'Password must be at most 72 characters'
  }
  return errors
}

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email') || ''
  const otp = searchParams.get('otp') || ''

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})

  useEffect(() => {
    if (!email || !otp) {
      navigate('/forgot-password', { replace: true })
    }
  }, [navigate])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError(null)
    const errors = validatePassword(password)
    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }
    setFieldErrors({})
    setSubmitting(true)
    try {
      await resetPassword(email, otp, password)
      navigate('/login', { state: { flash: { message: 'Password updated successfully. You can now log in with your new password.' } }, replace: true })
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to reset password. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-bold text-gray-900">Reset Password</h1>
      <p className="mt-2 text-sm text-gray-500">
        Enter your new password below.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        {error ? <ErrorState message={error} /> : null}

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            New Password
          </label>
          <input
            id="password"
            type="password"
            required
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-invalid={Boolean(fieldErrors.password)}
            aria-describedby={fieldErrors.password ? 'password-error' : undefined}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          {fieldErrors.password && (
            <p id="password-error" className="mt-1 text-xs text-red-600" role="alert">
              {fieldErrors.password}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-400">At least 8 characters</p>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            Confirm New Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            required
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            aria-invalid={Boolean(fieldErrors.confirmPassword)}
            aria-describedby={fieldErrors.confirmPassword ? 'confirmPassword-error' : undefined}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          {fieldErrors.confirmPassword && (
            <p id="confirmPassword-error" className="mt-1 text-xs text-red-600" role="alert">
              {fieldErrors.confirmPassword}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {submitting ? 'Resetting...' : 'Reset Password'}
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