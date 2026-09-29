import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { api, ApiError } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import { AuthShell, FieldError, FormError } from './AuthShell'

export default function LoginPage() {
  const { signIn } = useAuth()
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setFieldErrors({})
    try {
      const response = await api.login({ login, password })
      signIn(response)
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError.message)
      setFieldErrors(apiError.fieldErrors ?? {})
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthShell title="Welcome back" subtitle="Log in to pick up where you left off.">
      <FormError message={error} />
      <form onSubmit={submit} className="space-y-5" noValidate>
        <div>
          <label htmlFor="login" className="label">
            Username or email
          </label>
          <input
            id="login"
            className="input"
            autoComplete="username"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            required
          />
          <FieldError message={fieldErrors.login} />
        </div>
        <div>
          <label htmlFor="password" className="label">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="input"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <FieldError message={fieldErrors.password} />
        </div>
        <button type="submit" className="btn-primary w-full py-3" disabled={submitting}>
          {submitting ? 'Logging in…' : 'Log in'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-ink-300">
        New to CineCircle?{' '}
        <Link to="/register" className="font-semibold text-marquee-400 hover:text-marquee-300">
          Create an account
        </Link>
      </p>
    </AuthShell>
  )
}
