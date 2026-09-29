import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api, ApiError } from '../api/client'
import { ListIcon } from '../components/icons'
import { PageContainer } from '../components/Layout'
import { MovieCard, MovieGrid } from '../components/MovieCard'
import { EmptyState, ErrorState, Spinner } from '../components/States'
import { formatDate } from '../lib/format'
import { useAsync } from '../lib/useAsync'

export default function ListDetailPage() {
  const { listId: listIdParam, username } = useParams()
  const listId = Number(listIdParam)
  const navigate = useNavigate()
  const isOwn = !username

  const detail = useAsync(
    () => (isOwn ? api.myList(listId) : api.userList(username!, listId)),
    [listId, username, isOwn],
  )

  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startEdit = () => {
    if (!detail.data) return
    setName(detail.data.name)
    setDescription(detail.data.description ?? '')
    setEditing(true)
  }

  const save = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await api.updateList(listId, { name: name.trim(), description: description.trim() })
      setEditing(false)
      detail.reload()
    } catch (err) {
      setError((err as ApiError).message)
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    if (!confirm('Delete this list? Movies in the list are not removed from your account.')) return
    setBusy(true)
    try {
      await api.deleteList(listId)
      navigate('/lists')
    } catch (err) {
      setError((err as ApiError).message)
      setBusy(false)
    }
  }

  const removeMovie = async (tmdbId: number) => {
    setBusy(true)
    setError(null)
    try {
      await api.removeFromList(listId, tmdbId)
      detail.reload()
    } catch (err) {
      setError((err as ApiError).message)
    } finally {
      setBusy(false)
    }
  }

  if (detail.loading) return <Spinner label="Loading list" />
  if (detail.error || !detail.data) {
    return (
      <PageContainer>
        <ErrorState error={detail.error ?? new Error('List not found')} onRetry={detail.reload} />
      </PageContainer>
    )
  }

  const list = detail.data
  const ownerLabel = username ? `@${username}` : 'Your list'

  return (
    <PageContainer>
      <nav className="mb-6 text-sm text-ink-400">
        {isOwn ? (
          <Link to="/lists" className="hover:text-marquee-300">
            ← Your lists
          </Link>
        ) : (
          <Link to={`/u/${username}`} className="hover:text-marquee-300">
            ← {ownerLabel}
          </Link>
        )}
      </nav>

      <header className="card p-6 sm:p-8">
        {editing ? (
          <form onSubmit={save} className="max-w-lg space-y-4">
            <div>
              <label htmlFor="edit-name" className="label">
                Name
              </label>
              <input id="edit-name" className="input" maxLength={80} value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="edit-desc" className="label">
                Description
              </label>
              <textarea id="edit-desc" className="input min-h-20 resize-y" maxLength={300} value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary" disabled={busy}>
                Save
              </button>
              <button type="button" className="btn-ghost" onClick={() => setEditing(false)}>
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <h1 className="font-display text-3xl font-bold">{list.name}</h1>
            {list.description && <p className="mt-3 max-w-2xl text-ink-300">{list.description}</p>}
            <p className="mt-4 text-sm text-ink-400">
              {list.movieCount} movie{list.movieCount === 1 ? '' : 's'} · Created {formatDate(list.createdAt)}
            </p>
            {isOwn && (
              <div className="mt-4 flex gap-2">
                <button className="btn-secondary" onClick={startEdit} disabled={busy}>
                  Edit list
                </button>
                <button className="btn-ghost text-velvet-500" onClick={remove} disabled={busy}>
                  Delete list
                </button>
              </div>
            )}
          </>
        )}
        {error && <p className="mt-3 text-sm text-velvet-500">{error}</p>}
      </header>

      <section className="mt-8">
        {list.movies.length === 0 ? (
          <EmptyState
            icon={<ListIcon />}
            title="This list is empty"
            message={isOwn ? 'Add movies from any movie page using “Save to list”.' : 'No movies in this list yet.'}
            action={
              isOwn ? (
                <Link to="/discover" className="btn-primary">
                  Discover movies
                </Link>
              ) : undefined
            }
          />
        ) : (
          <MovieGrid>
            {list.movies.map(({ movie }) => (
              <div key={movie.tmdbId} className="relative">
                <MovieCard movie={movie} />
                {isOwn && (
                  <button
                    className="absolute top-2 right-2 rounded-full bg-ink-950/80 px-2 py-1 text-xs text-velvet-400 hover:bg-ink-900"
                    onClick={() => removeMovie(movie.tmdbId)}
                    disabled={busy}
                    aria-label={`Remove ${movie.title} from list`}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </MovieGrid>
        )}
      </section>
    </PageContainer>
  )
}
