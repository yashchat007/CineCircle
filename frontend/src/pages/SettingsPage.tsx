import { useState, type FormEvent } from 'react'
import { api, ApiError } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import { PageContainer } from '../components/Layout'
import { formatDate } from '../lib/format'
import { FieldError, FormError } from './AuthShell'

export default function SettingsPage() {
  const { user, updateUser } = useAuth()
  const [displayName, setDisplayName] = useState(user?.displayName ?? '')
  const [bio, setBio] = useState(user?.bio ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  if (!user) return null

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    setError(null)
    setFieldErrors({})
    try {
      updateUser(await api.updateMe({ displayName, bio }))
      setSaved(true)
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError.message)
      setFieldErrors(apiError.fieldErrors ?? {})
    } finally {
      setSaving(false)
    }
  }

  return (
    <PageContainer>
      <div className="mx-auto max-w-2xl">
        <h1 className="page-title">Settings</h1>
        <p className="mt-2 mb-8 text-ink-300">Manage your profile and account.</p>

        <form onSubmit={submit} className="card space-y-5 p-6">
          <h2 className="font-display text-xl font-semibold">Profile</h2>
          <FormError message={error} />
          <div>
            <label htmlFor="displayName" className="label">
              Display name
            </label>
            <input
              id="displayName"
              className="input"
              maxLength={50}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
            <FieldError message={fieldErrors.displayName} />
          </div>
          <div>
            <label htmlFor="bio" className="label">
              Bio
            </label>
            <textarea
              id="bio"
              className="input min-h-24 resize-y"
              maxLength={300}
              placeholder="Tell people about your taste in movies"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
            <div className="flex justify-between">
              <FieldError message={fieldErrors.bio} />
              <p className="mt-1 ml-auto text-xs text-ink-400">{bio.length}/300</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save profile'}
            </button>
            {saved && <span className="text-sm text-emerald-400">Profile saved</span>}
          </div>
        </form>

        <section className="card mt-6 p-6">
          <h2 className="font-display text-xl font-semibold">Account</h2>
          <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-ink-400">Username</dt>
              <dd className="mt-0.5">@{user.username}</dd>
            </div>
            <div>
              <dt className="text-ink-400">Email</dt>
              <dd className="mt-0.5 break-all">{user.email}</dd>
            </div>
            <div>
              <dt className="text-ink-400">Member since</dt>
              <dd className="mt-0.5">{formatDate(user.createdAt)}</dd>
            </div>
          </dl>
        </section>
      </div>
    </PageContainer>
  )
}
