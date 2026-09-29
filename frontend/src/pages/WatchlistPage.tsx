import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api, ApiError } from '../api/client'
import { BookmarkIcon } from '../components/icons'
import { PageContainer } from '../components/Layout'
import { MovieCard, MovieGrid } from '../components/MovieCard'
import { EmptyState, ErrorState, PosterGridSkeleton } from '../components/States'
import { timeAgo } from '../lib/format'
import { useAsync } from '../lib/useAsync'

export default function WatchlistPage() {
  const { data, error, loading, reload } = useAsync(() => api.watchlist(), [])
  const [busyId, setBusyId] = useState<number | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const act = async (tmdbId: number, action: (id: number) => Promise<unknown>) => {
    setBusyId(tmdbId)
    setActionError(null)
    try {
      await action(tmdbId)
      reload()
    } catch (err) {
      setActionError((err as ApiError).message)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <PageContainer>
      <h1 className="page-title">Watchlist</h1>
      <p className="mt-2 mb-8 text-ink-300">
        Movies you’ve saved for later{data && data.length > 0 ? ` · ${data.length}` : ''}.
      </p>
      {actionError && <p className="mb-4 text-sm text-velvet-500">{actionError}</p>}

      {loading ? (
        <PosterGridSkeleton />
      ) : error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : !data || data.length === 0 ? (
        <EmptyState
          icon={<BookmarkIcon />}
          title="Your watchlist is empty"
          message="Save movies you want to see and they’ll show up here."
          action={
            <Link to="/discover" className="btn-primary">
              Discover movies
            </Link>
          }
        />
      ) : (
        <MovieGrid>
          {data.map((item) => (
            <div key={item.movie.tmdbId}>
              <MovieCard movie={item.movie} caption={`Added ${timeAgo(item.addedAt)}`} />
              <div className="mt-2 flex gap-1.5">
                <button
                  className="btn-secondary flex-1 px-2 py-1.5 text-xs"
                  disabled={busyId === item.movie.tmdbId}
                  onClick={() => act(item.movie.tmdbId, api.markWatched)}
                >
                  Watched
                </button>
                <button
                  className="btn-ghost px-2 py-1.5 text-xs"
                  disabled={busyId === item.movie.tmdbId}
                  onClick={() => act(item.movie.tmdbId, api.removeFromWatchlist)}
                  aria-label={`Remove ${item.movie.title} from watchlist`}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </MovieGrid>
      )}
    </PageContainer>
  )
}
