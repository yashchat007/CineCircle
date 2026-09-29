import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { api, ApiError } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import { AuthShell, FieldError, FormError } from './AuthShell'

export default function RegisterPage() {
  const { signIn } = useAuth()
  const [form, setForm] = useState({ username: '', displayName: '', email: '', password: '' })
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }))

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setFieldErrors({})
    try {
      const response = await api.register({ ...form, displayName: form.displayName || undefined })
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
    <AuthShell title="Join CineCircle" subtitle="Start tracking, rating, and sharing the movies you watch.">
      <FormError message={error} />
      <form onSubmit={submit} className="space-y-5" noValidate>
        <div>
          <label htmlFor="username" className="label">
            Username
          </label>
          <input
            id="username"
            className="input"
            autoComplete="username"
            placeholder="e.g. film_buff"
            value={form.username}
            onChange={update('username')}
            required
          />
          <FieldError message={fieldErrors.username} />
        </div>
        <div>
          <label htmlFor="displayName" className="label">
            Display name <span className="text-ink-400">(optional)</span>
          </label>
          <input
            id="displayName"
            className="input"
            autoComplete="name"
            value={form.displayName}
            onChange={update('displayName')}
          />
          <FieldError message={fieldErrors.displayName} />
        </div>
        <div>
          <label htmlFor="email" className="label">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="input"
            autoComplete="email"
            value={form.email}
            onChange={update('email')}
            required
          />
          <FieldError message={fieldErrors.email} />
        </div>
        <div>
          <label htmlFor="password" className="label">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="input"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={form.password}
            onChange={update('password')}
            required
          />
          <FieldError message={fieldErrors.password} />
        </div>
        <button type="submit" className="btn-primary w-full py-3" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-ink-300">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-marquee-400 hover:text-marquee-300">
          Log in
        </Link>
      </p>
    </AuthShell>
  )
}
