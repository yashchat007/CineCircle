import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { api, ApiError } from '../api/client'
import { ListIcon } from '../components/icons'
import { PageContainer } from '../components/Layout'
import { EmptyState, ErrorState, Spinner } from '../components/States'
import { timeAgo } from '../lib/format'
import { useAsync } from '../lib/useAsync'

export default function ListsPage() {
  const lists = useAsync(() => api.myLists(), [])
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const create = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    setError(null)
    try {
      await api.createList({ name: name.trim(), description: description.trim() || undefined })
      setName('')
      setDescription('')
      setShowForm(false)
      lists.reload()
    } catch (err) {
      setError((err as ApiError).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <PageContainer>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="page-title">Your lists</h1>
          <p className="mt-2 text-ink-300">Organize movies into personal collections.</p>
        </div>
        <button className="btn-primary shrink-0" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancel' : 'New list'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={create} className="card mt-6 max-w-lg space-y-4 p-5">
          <div>
            <label htmlFor="list-name" className="label">
              Name
            </label>
            <input
              id="list-name"
              className="input"
              maxLength={80}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sci-fi favorites"
              required
            />
          </div>
          <div>
            <label htmlFor="list-desc" className="label">
              Description <span className="text-ink-400">(optional)</span>
            </label>
            <textarea
              id="list-desc"
              className="input min-h-20 resize-y"
              maxLength={300}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-velvet-500">{error}</p>}
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Creating…' : 'Create list'}
          </button>
        </form>
      )}

      <div className="mt-8">
        {lists.loading ? (
          <Spinner label="Loading lists" />
        ) : lists.error ? (
          <ErrorState error={lists.error} onRetry={lists.reload} />
        ) : !lists.data || lists.data.length === 0 ? (
          <EmptyState
            icon={<ListIcon />}
            title="No lists yet"
            message="Create a list to organize movies you love or want to revisit."
            action={
              !showForm ? (
                <button className="btn-primary" onClick={() => setShowForm(true)}>
                  Create your first list
                </button>
              ) : undefined
            }
          />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {lists.data.map((list) => (
              <li key={list.id}>
                <Link to={`/lists/${list.id}`} className="card block h-full p-5 transition-colors hover:border-ink-600">
                  <h2 className="font-display text-lg font-semibold">{list.name}</h2>
                  {list.description && <p className="mt-2 line-clamp-2 text-sm text-ink-300">{list.description}</p>}
                  <p className="mt-4 text-xs text-ink-400">
                    {list.movieCount} movie{list.movieCount === 1 ? '' : 's'} · Updated {timeAgo(list.updatedAt)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </PageContainer>
  )
}
