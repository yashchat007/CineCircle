import { useEffect, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../api/client'
import type { BrowseCategory } from '../api/types'
import { SearchIcon, StarIcon } from '../components/icons'
import { PageContainer } from '../components/Layout'
import { MovieCard, MovieGrid } from '../components/MovieCard'
import { ReviewCard } from '../components/ReviewCard'
import { EmptyState, ErrorState, PosterGridSkeleton, Spinner } from '../components/States'
import { useAsync } from '../lib/useAsync'

const CATEGORIES: { id: BrowseCategory; label: string }[] = [
  { id: 'popular', label: 'Popular' },
  { id: 'top_rated', label: 'Top rated' },
  { id: 'now_playing', label: 'Now playing' },
  { id: 'upcoming', label: 'Upcoming' },
]

const TMDB_MAX_PAGE = 500

export default function DiscoverPage() {
  const [params, setParams] = useSearchParams()
  const query = params.get('q')?.trim() ?? ''
  const category = (params.get('category') as BrowseCategory | null) ?? 'popular'
  const page = Math.max(1, Number(params.get('page')) || 1)
  const yearParam = params.get('year')
  const year = yearParam ? Number(yearParam) : undefined
  const [input, setInput] = useState(query)
  const [yearInput, setYearInput] = useState(yearParam ?? '')

  useEffect(() => setInput(query), [query])
  useEffect(() => setYearInput(yearParam ?? ''), [yearParam])

  const movies = useAsync(
    () => (query ? api.searchMovies(query, page, year) : api.browseMovies(category, page)),
    [query, category, page, year],
  )
  const recommendations = useAsync(() => (!query ? api.recommendations(1) : Promise.resolve(null)), [query])
  const recentReviews = useAsync(() => api.recentReviews(), [])
  const totalPages = Math.min(movies.data?.totalPages ?? 0, TMDB_MAX_PAGE)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const q = input.trim()
    const next = new URLSearchParams()
    if (q) {
      next.set('q', q)
      const y = yearInput.trim()
      if (y && /^\d{4}$/.test(y)) next.set('year', y)
    } else {
      next.set('category', category)
    }
    setParams(next)
  }

  const goToPage = (next: number) => {
    const nextParams = new URLSearchParams(params)
    nextParams.set('page', String(next))
    setParams(nextParams)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <PageContainer>
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="page-title">Discover</h1>
          <p className="mt-2 text-ink-300">Find your next favorite film.</p>
        </div>
        <form onSubmit={submit} className="flex w-full flex-col gap-2 md:max-w-xl md:flex-row" role="search">
          <div className="relative flex-1">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-ink-400" />
            <input
              type="search"
              className="input rounded-full py-3 pl-12"
              placeholder="Search movies by title…"
              aria-label="Search movies"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>
          <input
            type="text"
            inputMode="numeric"
            pattern="\d{4}"
            className="input w-full rounded-full py-3 md:w-28"
            placeholder="Year"
            aria-label="Release year filter"
            value={yearInput}
            onChange={(e) => setYearInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
          />
          <button type="submit" className="btn-primary shrink-0 rounded-full px-6">
            Search
          </button>
        </form>
      </div>

      {!query && recommendations.data && recommendations.data.results.length > 0 && (
        <section className="mt-10">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-semibold">For you</h2>
              <p className="mt-1 text-sm text-ink-400">Based on genres from movies you’ve watched and reviewed.</p>
            </div>
          </div>
          <MovieGrid>
            {recommendations.data.results.slice(0, 6).map((movie) => (
              <MovieCard key={movie.tmdbId} movie={movie} voteAverage={movie.voteAverage} />
            ))}
          </MovieGrid>
        </section>
      )}

      <div className="mt-8 mb-8 flex flex-wrap items-center gap-2">
        {query ? (
          <>
            <p className="text-sm text-ink-300">
              Results for <span className="font-semibold text-ink-100">“{query}”</span>
              {year && <span className="text-ink-400"> · {year}</span>}
              {movies.data && ` · ${movies.data.totalResults.toLocaleString()} found`}
            </p>
            <button className="btn-ghost px-3 py-1 text-xs" onClick={() => setParams({ category })}>
              Clear search
            </button>
          </>
        ) : (
          CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setParams({ category: c.id })}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                c.id === category
                  ? 'bg-marquee-400 text-ink-950'
                  : 'border border-ink-700 text-ink-300 hover:border-ink-500 hover:text-ink-100'
              }`}
              aria-pressed={c.id === category}
            >
              {c.label}
            </button>
          ))
        )}
      </div>

      {movies.loading ? (
        <PosterGridSkeleton />
      ) : movies.error ? (
        <ErrorState error={movies.error} onRetry={movies.reload} />
      ) : !movies.data || movies.data.results.length === 0 ? (
        <EmptyState
          icon={<SearchIcon />}
          title="No movies found"
          message={query ? 'Try a different title, year, or check the spelling.' : 'Nothing to show here right now.'}
        />
      ) : (
        <>
          <MovieGrid>
            {movies.data.results.map((movie) => (
              <MovieCard key={movie.tmdbId} movie={movie} voteAverage={movie.voteAverage} />
            ))}
          </MovieGrid>
          {totalPages > 1 && (
            <nav className="mt-12 flex items-center justify-center gap-4" aria-label="Pagination">
              <button className="btn-secondary" disabled={page <= 1} onClick={() => goToPage(page - 1)}>
                Previous
              </button>
              <span className="text-sm text-ink-300">
                Page {page} of {totalPages}
              </span>
              <button className="btn-secondary" disabled={page >= totalPages} onClick={() => goToPage(page + 1)}>
                Next
              </button>
            </nav>
          )}
        </>
      )}

      <section className="mt-16">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-2xl font-semibold">Recent community reviews</h2>
          <Link to="/feed" className="text-sm text-marquee-400 hover:text-marquee-300">
            View feed →
          </Link>
        </div>
        {recentReviews.loading ? (
          <Spinner />
        ) : recentReviews.error ? (
          <ErrorState error={recentReviews.error} onRetry={recentReviews.reload} />
        ) : !recentReviews.data || recentReviews.data.length === 0 ? (
          <EmptyState icon={<StarIcon />} title="No reviews yet" message="Be the first to review a movie you love." />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {recentReviews.data.slice(0, 6).map((r) => (
              <ReviewCard key={r.id} review={r} showMovie />
            ))}
          </div>
        )}
      </section>
    </PageContainer>
  )
}
