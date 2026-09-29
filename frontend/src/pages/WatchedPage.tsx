import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { EyeIcon } from '../components/icons'
import { PageContainer } from '../components/Layout'
import { MovieCard, MovieGrid } from '../components/MovieCard'
import { EmptyState, ErrorState, PosterGridSkeleton } from '../components/States'
import { formatDate } from '../lib/format'
import { useAsync } from '../lib/useAsync'

export default function WatchedPage() {
  const { data, error, loading, reload } = useAsync(() => api.watched(), [])

  return (
    <PageContainer>
      <h1 className="page-title">Watched</h1>
      <p className="mt-2 mb-8 text-ink-300">
        Your viewing history{data && data.length > 0 ? ` · ${data.length} film${data.length === 1 ? '' : 's'}` : ''}.
      </p>

      {loading ? (
        <PosterGridSkeleton />
      ) : error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : !data || data.length === 0 ? (
        <EmptyState
          icon={<EyeIcon />}
          title="Nothing watched yet"
          message="Mark movies as watched to build your viewing history."
          action={
            <Link to="/discover" className="btn-primary">
              Find a movie
            </Link>
          }
        />
      ) : (
        <MovieGrid>
          {data.map((item) => (
            <MovieCard key={item.movie.tmdbId} movie={item.movie} caption={`Watched ${formatDate(item.watchedAt)}`} />
          ))}
        </MovieGrid>
      )}
    </PageContainer>
  )
}
