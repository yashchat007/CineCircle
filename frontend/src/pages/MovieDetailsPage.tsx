import { useEffect, useState, type FormEvent } from 'react'
import { useParams } from 'react-router-dom'
import { api, ApiError } from '../api/client'
import type { MovieStatus, Review } from '../api/types'
import { useAuth } from '../auth/AuthContext'
import { SaveToList } from '../components/SaveToList'
import { BookmarkIcon, CheckIcon, EyeIcon, StarIcon } from '../components/icons'
import { Poster } from '../components/MovieCard'
import { ReviewCard } from '../components/ReviewCard'
import { StarInput } from '../components/StarRating'
import { EmptyState, ErrorState, Spinner } from '../components/States'
import { formatDate, formatRuntime, imageUrl, languageName, releaseYear } from '../lib/format'
import { useAsync } from '../lib/useAsync'

export default function MovieDetailsPage() {
  const tmdbId = Number(useParams().tmdbId)
  const { user } = useAuth()
  const movie = useAsync(() => api.movie(tmdbId), [tmdbId])
  const status = useAsync(() => api.movieStatus(tmdbId), [tmdbId])
  const reviews = useAsync(() => api.movieReviews(tmdbId), [tmdbId])
  const [busy, setBusy] = useState<'watchlist' | 'watched' | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [reviewItems, setReviewItems] = useState<Review[] | null>(null)

  useEffect(() => setReviewItems(null), [tmdbId, reviews.data])

  if (movie.loading) return <Spinner label="Loading movie" />
  if (movie.error || !movie.data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <ErrorState error={movie.error ?? new Error('Movie not found')} onRetry={movie.reload} />
      </div>
    )
  }

  const m = movie.data
  const s = status.data
  const backdrop = imageUrl(m.backdropPath, 'w1280')
  const facts = [
    releaseYear(m.releaseDate),
    formatRuntime(m.runtime),
    languageName(m.originalLanguage),
  ].filter(Boolean)

  const refreshAfterReviewChange = () => {
    status.reload()
    reviews.reload()
    movie.reload()
  }

  const toggle = async (kind: 'watchlist' | 'watched') => {
    if (!s) return
    setBusy(kind)
    setActionError(null)
    try {
      if (kind === 'watchlist') {
        await (s.inWatchlist ? api.removeFromWatchlist(tmdbId) : api.addToWatchlist(tmdbId))
      } else {
        await (s.watched ? api.unmarkWatched(tmdbId) : api.markWatched(tmdbId))
      }
      status.reload()
    } catch (err) {
      setActionError((err as ApiError).message)
    } finally {
      setBusy(null)
    }
  }

  const otherReviews = (reviews.data ?? []).filter((r) => r.user.id !== user?.id)
  const displayOtherReviews = reviewItems ?? otherReviews

  const onReviewChange = (updated: Review) => {
    setReviewItems((prev) => {
      const base = prev ?? otherReviews
      return base.map((r) => (r.id === updated.id ? updated : r))
    })
  }

  return (
    <div>
      <section className="relative isolate overflow-hidden">
        {backdrop && (
          <img src={backdrop} alt="" className="absolute inset-0 -z-20 h-full w-full object-cover opacity-35" />
        )}
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink-950 via-ink-950/85 to-ink-950/40" />
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 pt-10 pb-12 sm:px-6 md:flex-row md:items-end md:pt-24">
          <Poster
            path={m.posterPath}
            title={m.title}
            size="w500"
            className="w-48 shrink-0 shadow-2xl shadow-black/60 ring-1 ring-white/10 md:w-64"
          />
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">{m.title}</h1>
            {facts.length > 0 && <p className="mt-3 text-ink-300">{facts.join(' · ')}</p>}
            {m.genres.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {m.genres.map((g) => (
                  <span key={g.id} className="rounded-full border border-ink-600 bg-ink-900/60 px-3 py-1 text-xs text-ink-100">
                    {g.name}
                  </span>
                ))}
              </div>
            )}
            {m.tagline && <p className="mt-5 font-display text-lg text-marquee-300 italic">“{m.tagline}”</p>}

            <div className="mt-6 flex flex-wrap items-center gap-6">
              <Score label="CineCircle" value={m.communityRating != null ? `${m.communityRating.toFixed(1)}/5` : '—'} sub={`${m.communityReviewCount} review${m.communityReviewCount === 1 ? '' : 's'}`} />
              <Score label="TMDB" value={m.voteAverage ? `${m.voteAverage.toFixed(1)}/10` : '—'} sub={m.voteCount ? `${m.voteCount.toLocaleString()} votes` : 'No votes yet'} />
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                className={s?.inWatchlist ? 'btn-primary' : 'btn-secondary'}
                onClick={() => toggle('watchlist')}
                disabled={!s || busy !== null}
                aria-pressed={s?.inWatchlist ?? false}
              >
                <BookmarkIcon filled={s?.inWatchlist} className="h-4 w-4" />
                {s?.inWatchlist ? 'In watchlist' : 'Add to watchlist'}
              </button>
              <button
                className={s?.watched ? 'btn-primary' : 'btn-secondary'}
                onClick={() => toggle('watched')}
                disabled={!s || busy !== null}
                aria-pressed={s?.watched ?? false}
              >
                {s?.watched ? <CheckIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                {s?.watched ? 'Watched' : 'Mark as watched'}
              </button>
              <SaveToList tmdbId={tmdbId} />
            </div>
            {actionError && <p className="mt-3 text-sm text-velvet-500">{actionError}</p>}
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-16 sm:px-6 lg:grid-cols-3">
        <div className="space-y-10 lg:col-span-2">
          <section>
            <h2 className="font-display text-2xl font-semibold">Overview</h2>
            <p className="mt-3 leading-relaxed text-ink-300">{m.overview || 'No overview available.'}</p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold">Your review</h2>
            <div className="mt-4">
              {status.loading ? (
                <Spinner />
              ) : (
                <MyReview tmdbId={tmdbId} status={s} onChanged={refreshAfterReviewChange} />
              )}
            </div>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold">Community reviews</h2>
            <div className="mt-4 space-y-4">
              {reviews.loading ? (
                <Spinner />
              ) : reviews.error ? (
                <ErrorState error={reviews.error} onRetry={reviews.reload} />
              ) : displayOtherReviews.length === 0 ? (
                <EmptyState icon={<StarIcon />} title="No reviews from others yet" message="Reviews from the community will appear here." />
              ) : (
                displayOtherReviews.map((r) => <ReviewCard key={r.id} review={r} onReviewChange={onReviewChange} />)
              )}
            </div>
          </section>
        </div>

        <aside className="card h-fit p-6">
          <h2 className="font-display text-lg font-semibold">Details</h2>
          <dl className="mt-4 space-y-4 text-sm">
            <Detail label="Release date" value={formatDate(m.releaseDate)} />
            <Detail label="Runtime" value={formatRuntime(m.runtime)} />
            <Detail label="Original language" value={languageName(m.originalLanguage)} />
            <Detail label="Status" value={m.status} />
            <Detail label="Genres" value={m.genres.map((g) => g.name).join(', ') || null} />
          </dl>
        </aside>
      </div>
    </div>
  )
}

function Score({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div>
      <p className="text-xs font-semibold tracking-wider text-ink-400 uppercase">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold text-marquee-400">{value}</p>
      <p className="text-xs text-ink-400">{sub}</p>
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <dt className="text-ink-400">{label}</dt>
      <dd className="mt-0.5 text-ink-100">{value || '—'}</dd>
    </div>
  )
}

function MyReview({
  tmdbId,
  status,
  onChanged,
}: {
  tmdbId: number
  status: MovieStatus | null
  onChanged: () => void
}) {
  const existing: Review | null = status?.review ?? null
  const [editing, setEditing] = useState(false)
  const [rating, setRating] = useState(existing?.rating ?? 0)
  const [body, setBody] = useState(existing?.body ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setRating(existing?.rating ?? 0)
    setBody(existing?.body ?? '')
  }, [existing?.id, existing?.rating, existing?.body])

  if (existing && !editing) {
    return (
      <div className="space-y-3">
        <ReviewCard review={existing} />
        <div className="flex gap-2">
          <button className="btn-secondary" onClick={() => setEditing(true)}>
            Edit review
          </button>
          <button
            className="btn-ghost"
            onClick={async () => {
              if (!confirm('Delete your review?')) return
              try {
                await api.deleteReview(tmdbId)
                onChanged()
              } catch (err) {
                setError((err as ApiError).message)
              }
            }}
          >
            Delete
          </button>
        </div>
        {error && <p className="text-sm text-velvet-500">{error}</p>}
      </div>
    )
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (rating < 1) {
      setError('Choose a rating from 1 to 5 stars.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await api.saveReview(tmdbId, { rating, body })
      setEditing(false)
      onChanged()
    } catch (err) {
      setError((err as ApiError).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="card space-y-4 p-5">
      <div>
        <span className="label">Your rating</span>
        <StarInput value={rating} onChange={setRating} />
      </div>
      <div>
        <label htmlFor="review-body" className="label">
          Review <span className="text-ink-400">(optional)</span>
        </label>
        <textarea
          id="review-body"
          className="input min-h-32 resize-y"
          maxLength={5000}
          placeholder="What did you think?"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <p className="mt-1 text-right text-xs text-ink-400">{body.length}/5000</p>
      </div>
      {error && <p className="text-sm text-velvet-500">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Saving…' : existing ? 'Save changes' : 'Post review'}
        </button>
        {existing && (
          <button type="button" className="btn-ghost" onClick={() => setEditing(false)}>
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
