import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api, ApiError } from '../api/client'
import type { FeedItem, Profile, Review, UserSummary } from '../api/types'
import { useAuth } from '../auth/AuthContext'
import { Avatar } from '../components/Avatar'
import { CheckIcon, CommentIcon, EyeIcon, HeartIcon, ListIcon, StarIcon, UsersIcon } from '../components/icons'
import { PageContainer } from '../components/Layout'
import { MovieCard, Poster } from '../components/MovieCard'
import { ReviewCard } from '../components/ReviewCard'
import { StarDisplay } from '../components/StarRating'
import { EmptyState, ErrorState, Spinner } from '../components/States'
import { releaseYear, timeAgo } from '../lib/format'
import { useAsync } from '../lib/useAsync'

function activityLabel(item: FeedItem): string {
  switch (item.type) {
    case 'WATCHED':
      return 'watched'
    case 'REVIEWED':
      return 'reviewed'
    case 'LIST_ADDED':
      return `added to ${item.listName ?? 'a list'}`
    default:
      return 'updated'
  }
}

export default function FeedPage() {
  const { user } = useAuth()
  const username = user?.username ?? ''
  const feed = useAsync(() => api.feed(), [])
  const profile = useAsync(() => api.profile(username), [username])
  const following = useAsync(() => api.following(username), [username])
  const recentReviews = useAsync(() => api.recentReviews(), [])
  const recommendations = useAsync(() => api.recommendations(1), [])

  const followingIds = new Set((following.data ?? []).map((u) => u.id))
  const suggestedPeople = uniqueReviewers(recentReviews.data ?? []).filter(
    (u) => u.id !== user?.id && !followingIds.has(u.id),
  )
  const communityReviews = (recentReviews.data ?? []).filter((r) => r.user.id !== user?.id)
  const hasHistory = !!profile.data && profile.data.watchedCount + profile.data.reviewCount > 0

  const afterFollow = () => {
    feed.reload()
    following.reload()
    profile.reload()
  }

  const feedEmpty = !feed.loading && !feed.error && (!feed.data || feed.data.length === 0)

  return (
    <PageContainer>
      <h1 className="page-title">{feedEmpty ? `Welcome, ${user?.displayName ?? 'there'}` : 'Your feed'}</h1>
      <p className="mt-2 mb-8 text-ink-300">
        {feedEmpty
          ? 'Your feed fills up with activity from people you follow. Here’s what’s happening on CineCircle in the meantime.'
          : 'What the people you follow have been watching, reviewing, and collecting.'}
      </p>

      <div className="grid gap-10 lg:grid-cols-3">
        <div className="min-w-0 space-y-10 lg:col-span-2">
          {feed.loading ? (
            <Spinner label="Loading feed" />
          ) : feed.error ? (
            <ErrorState error={feed.error} onRetry={feed.reload} />
          ) : feedEmpty ? (
            <>
              {profile.data && <GettingStarted profile={profile.data} />}
              <section>
                <SectionHeading title="Recent from the community" link={{ to: '/discover', label: 'Discover more' }} />
                {recentReviews.loading ? (
                  <Spinner />
                ) : recentReviews.error ? (
                  <ErrorState error={recentReviews.error} onRetry={recentReviews.reload} />
                ) : communityReviews.length === 0 ? (
                  <EmptyState
                    icon={<StarIcon />}
                    title="No community reviews yet"
                    message="Be one of the first — open any movie, rate it, and share what you thought."
                    action={
                      <Link to="/discover" className="btn-primary">
                        Find a movie to review
                      </Link>
                    }
                  />
                ) : (
                  <div className="space-y-4">
                    {communityReviews.slice(0, 8).map((r) => (
                      <ReviewCard key={r.id} review={r} showMovie />
                    ))}
                  </div>
                )}
              </section>
            </>
          ) : (
            <ol className="space-y-4">
              {feed.data!.map((item) => (
                <li key={item.id}>
                  <FeedCard item={item} />
                </li>
              ))}
            </ol>
          )}
        </div>

        <aside className="space-y-8">
          <section className="card p-5">
            <SectionHeading title="People to follow" link={{ to: '/people', label: 'Search' }} small />
            {recentReviews.loading || following.loading ? (
              <p className="text-sm text-ink-400">Loading…</p>
            ) : suggestedPeople.length === 0 ? (
              <p className="text-sm text-ink-400">
                No suggestions right now.{' '}
                <Link to="/people" className="text-marquee-400 hover:text-marquee-300">
                  Search for people
                </Link>{' '}
                by name.
              </p>
            ) : (
              <ul className="space-y-3">
                {suggestedPeople.slice(0, 5).map((u) => (
                  <li key={u.id}>
                    <SuggestedPerson person={u} onFollowed={afterFollow} />
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <SectionHeading
              title={hasHistory ? 'For you' : 'Popular right now'}
              link={{ to: '/discover', label: 'See all' }}
              small
            />
            {!hasHistory && (
              <p className="-mt-2 mb-4 text-xs text-ink-400">Watch or review movies to get picks based on your taste.</p>
            )}
            {recommendations.loading ? (
              <Spinner />
            ) : recommendations.error ? (
              <p className="text-sm text-ink-400">Couldn’t load movie suggestions right now.</p>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {(recommendations.data?.results ?? []).slice(0, 6).map((m) => (
                  <MovieCard key={m.tmdbId} movie={m} />
                ))}
              </div>
            )}
          </section>
        </aside>
      </div>
    </PageContainer>
  )
}

function uniqueReviewers(reviews: Review[]): UserSummary[] {
  const seen = new Map<number, UserSummary>()
  for (const r of reviews) if (!seen.has(r.user.id)) seen.set(r.user.id, r.user)
  return [...seen.values()]
}

function SectionHeading({
  title,
  link,
  small = false,
}: {
  title: string
  link?: { to: string; label: string }
  small?: boolean
}) {
  return (
    <div className="mb-4 flex items-baseline justify-between gap-4">
      <h2 className={`font-display font-semibold ${small ? 'text-lg' : 'text-2xl'}`}>{title}</h2>
      {link && (
        <Link to={link.to} className="shrink-0 text-sm text-marquee-400 hover:text-marquee-300">
          {link.label} →
        </Link>
      )}
    </div>
  )
}

function GettingStarted({ profile }: { profile: Profile }) {
  const steps = [
    { done: profile.watchedCount > 0, icon: EyeIcon, label: 'Mark a movie as watched', to: '/discover' },
    { done: profile.reviewCount > 0, icon: StarIcon, label: 'Rate and review a movie', to: '/discover' },
    { done: profile.followingCount > 0, icon: UsersIcon, label: 'Follow someone', to: '/people' },
    { done: profile.listCount > 0, icon: ListIcon, label: 'Create a movie list', to: '/lists' },
  ]
  const completed = steps.filter((s) => s.done).length

  return (
    <section className="card relative overflow-hidden p-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(245,176,65,0.12),transparent_55%)]" />
      <div className="relative">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-display text-xl font-semibold">Get started</h2>
          <span className="text-xs text-ink-400">
            {completed} of {steps.length} done
          </span>
        </div>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {steps.map((s) => (
            <li key={s.label}>
              <Link
                to={s.to}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-colors ${
                  s.done
                    ? 'border-ink-800 text-ink-400'
                    : 'border-ink-700 text-ink-100 hover:border-marquee-400/60 hover:text-marquee-300'
                }`}
              >
                {s.done ? (
                  <CheckIcon className="h-4 w-4 shrink-0 text-marquee-400" />
                ) : (
                  <s.icon className="h-4 w-4 shrink-0" />
                )}
                <span className={s.done ? 'line-through' : ''}>{s.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function SuggestedPerson({ person, onFollowed }: { person: UserSummary; onFollowed: () => void }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const follow = async () => {
    setBusy(true)
    setError(null)
    try {
      await api.follow(person.username)
      onFollowed()
    } catch (err) {
      setError((err as ApiError).message)
      setBusy(false)
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        <Link to={`/u/${person.username}`} aria-label={`${person.displayName}'s profile`}>
          <Avatar name={person.displayName} size="sm" />
        </Link>
        <Link to={`/u/${person.username}`} className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold hover:text-marquee-300">{person.displayName}</p>
          <p className="truncate text-xs text-ink-400">@{person.username}</p>
        </Link>
        <button className="btn-primary shrink-0 px-3 py-1.5 text-xs" onClick={follow} disabled={busy}>
          {busy ? '…' : 'Follow'}
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-velvet-500">{error}</p>}
    </div>
  )
}

function FeedCard({ item }: { item: FeedItem }) {
  const year = releaseYear(item.movie.releaseDate)
  const listLink = item.listId != null && item.type === 'LIST_ADDED' ? `/u/${item.user.username}/lists/${item.listId}` : null

  return (
    <article className="card p-5">
      <header className="flex items-center gap-3">
        <Link to={`/u/${item.user.username}`} aria-label={`${item.user.displayName}'s profile`}>
          <Avatar name={item.user.displayName} size="sm" />
        </Link>
        <p className="min-w-0 flex-1 text-sm text-ink-300">
          <Link to={`/u/${item.user.username}`} className="font-semibold text-ink-100 hover:text-marquee-300">
            {item.user.displayName}
          </Link>{' '}
          {item.type === 'LIST_ADDED' && item.listName && listLink ? (
            <>
              added to{' '}
              <Link to={listLink} className="font-medium text-marquee-400 hover:text-marquee-300">
                {item.listName}
              </Link>
            </>
          ) : (
            activityLabel(item)
          )}
        </p>
        <time dateTime={item.occurredAt} className="shrink-0 text-xs text-ink-400">
          {timeAgo(item.occurredAt)}
        </time>
      </header>
      <div className="mt-4 flex gap-4">
        <Link to={`/movie/${item.movie.tmdbId}`} className="w-20 shrink-0">
          <Poster path={item.movie.posterPath} title={item.movie.title} size="w185" />
        </Link>
        <div className="min-w-0 flex-1">
          <Link to={`/movie/${item.movie.tmdbId}`} className="font-display text-xl font-semibold hover:text-marquee-300">
            {item.movie.title}
          </Link>
          {year && <span className="ml-2 text-sm text-ink-400">{year}</span>}
          {item.rating != null && (
            <div className="mt-2">
              <StarDisplay rating={item.rating} />
            </div>
          )}
          {item.body && (
            <p className="mt-2 line-clamp-4 text-sm leading-relaxed whitespace-pre-line text-ink-100/90">{item.body}</p>
          )}
          {item.type === 'REVIEWED' && (item.likeCount > 0 || item.commentCount > 0) && (
            <div className="mt-3 flex items-center gap-4 text-xs text-ink-400">
              {item.likeCount > 0 && (
                <span className="inline-flex items-center gap-1">
                  <HeartIcon className="h-3.5 w-3.5" />
                  {item.likeCount}
                </span>
              )}
              {item.commentCount > 0 && (
                <span className="inline-flex items-center gap-1">
                  <CommentIcon className="h-3.5 w-3.5" />
                  {item.commentCount}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
