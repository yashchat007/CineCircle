import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api, ApiError } from '../api/client'
import type { UserSummary } from '../api/types'
import { Avatar } from '../components/Avatar'
import { EyeIcon, ListIcon, StarIcon, UsersIcon } from '../components/icons'
import { PageContainer } from '../components/Layout'
import { MovieCard, MovieGrid } from '../components/MovieCard'
import { ReviewCard } from '../components/ReviewCard'
import { EmptyState, ErrorState, PosterGridSkeleton, Spinner } from '../components/States'
import { formatDate, timeAgo } from '../lib/format'
import { useAsync } from '../lib/useAsync'

type Tab = 'watched' | 'reviews' | 'lists' | 'followers' | 'following'

export default function ProfilePage() {
  const username = useParams().username ?? ''
  const profile = useAsync(() => api.profile(username), [username])
  const watched = useAsync(() => api.userWatched(username), [username])
  const reviews = useAsync(() => api.userReviews(username), [username])
  const lists = useAsync(() => api.userLists(username), [username])
  const followers = useAsync(() => api.followers(username), [username])
  const following = useAsync(() => api.following(username), [username])
  const [tab, setTab] = useState<Tab>('watched')
  const [followBusy, setFollowBusy] = useState(false)
  const [followError, setFollowError] = useState<string | null>(null)

  useEffect(() => {
    setTab('watched')
    setFollowError(null)
  }, [username])

  if (profile.loading) return <Spinner label="Loading profile" />
  if (profile.error || !profile.data) {
    return (
      <PageContainer>
        <ErrorState error={profile.error ?? new Error('User not found')} onRetry={profile.reload} />
      </PageContainer>
    )
  }

  const p = profile.data
  const displayReviews = reviews.data ?? []

  const toggleFollow = async () => {
    setFollowBusy(true)
    setFollowError(null)
    try {
      await (p.following ? api.unfollow(p.username) : api.follow(p.username))
      profile.reload()
      followers.reload()
    } catch (err) {
      setFollowError((err as ApiError).message)
    } finally {
      setFollowBusy(false)
    }
  }

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'watched', label: 'Watched', count: p.watchedCount },
    { id: 'reviews', label: 'Reviews', count: p.reviewCount },
    { id: 'lists', label: 'Lists', count: p.listCount },
    { id: 'followers', label: 'Followers', count: p.followerCount },
    { id: 'following', label: 'Following', count: p.followingCount },
  ]

  return (
    <PageContainer>
      <header className="card relative overflow-hidden p-6 sm:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(245,176,65,0.12),transparent_55%)]" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
          <Avatar name={p.displayName} size="lg" />
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-3xl font-bold">{p.displayName}</h1>
            <p className="text-ink-400">@{p.username} · Joined {formatDate(p.createdAt)}</p>
            {p.bio && <p className="mt-3 max-w-2xl text-ink-300">{p.bio}</p>}
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <Stat value={p.watchedCount} label="watched" />
              <Stat value={p.reviewCount} label="reviews" />
              <Stat value={p.listCount} label="lists" />
              <Stat value={p.followerCount} label="followers" />
              <Stat value={p.followingCount} label="following" />
            </div>
          </div>
          <div className="flex flex-col items-start gap-2 sm:items-end">
            {p.self ? (
              <Link to="/settings" className="btn-secondary">
                Edit profile
              </Link>
            ) : (
              <button
                className={p.following ? 'btn-secondary' : 'btn-primary'}
                onClick={toggleFollow}
                disabled={followBusy}
                aria-pressed={p.following}
              >
                {p.following ? 'Following' : 'Follow'}
              </button>
            )}
            {followError && <p className="text-sm text-velvet-500">{followError}</p>}
          </div>
        </div>
      </header>

      <div className="mt-8 mb-6 flex gap-2 overflow-x-auto border-b border-ink-800" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`-mb-px shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              tab === t.id ? 'border-marquee-400 text-marquee-300' : 'border-transparent text-ink-400 hover:text-ink-100'
            }`}
          >
            {t.label}
            {t.count != null && <span className="ml-1.5 text-ink-500">({t.count})</span>}
          </button>
        ))}
      </div>

      {tab === 'watched' && (
        <TabContent loading={watched.loading} error={watched.error} onRetry={watched.reload}>
          {!watched.data || watched.data.length === 0 ? (
            <EmptyState
              icon={<EyeIcon />}
              title="No watched movies yet"
              message={p.self ? 'Movies you mark as watched will appear here.' : `${p.displayName} hasn’t marked any movies as watched yet.`}
            />
          ) : (
            <MovieGrid>
              {watched.data.map((item) => (
                <MovieCard key={item.movie.tmdbId} movie={item.movie} />
              ))}
            </MovieGrid>
          )}
        </TabContent>
      )}

      {tab === 'reviews' && (
        <TabContent loading={reviews.loading} error={reviews.error} onRetry={reviews.reload} skeleton={<Spinner />}>
          {displayReviews.length === 0 ? (
            <EmptyState
              icon={<StarIcon />}
              title="No reviews yet"
              message={p.self ? 'Rate and review movies to see them here.' : `${p.displayName} hasn’t reviewed any movies yet.`}
            />
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {displayReviews.map((r) => (
                <ReviewCard key={r.id} review={r} showMovie />
              ))}
            </div>
          )}
        </TabContent>
      )}

      {tab === 'lists' && (
        <TabContent loading={lists.loading} error={lists.error} onRetry={lists.reload}>
          {!lists.data || lists.data.length === 0 ? (
            <EmptyState
              icon={<ListIcon />}
              title="No lists yet"
              message={p.self ? 'Create personal movie lists from the Lists page.' : `${p.displayName} hasn’t created any lists yet.`}
              action={
                p.self ? (
                  <Link to="/lists" className="btn-primary">
                    Manage lists
                  </Link>
                ) : undefined
              }
            />
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {lists.data.map((list) => (
                <li key={list.id}>
                  <Link
                    to={p.self ? `/lists/${list.id}` : `/u/${p.username}/lists/${list.id}`}
                    className="card block p-5 transition-colors hover:border-ink-600"
                  >
                    <h3 className="font-display text-lg font-semibold">{list.name}</h3>
                    {list.description && <p className="mt-2 line-clamp-2 text-sm text-ink-300">{list.description}</p>}
                    <p className="mt-3 text-xs text-ink-400">
                      {list.movieCount} movie{list.movieCount === 1 ? '' : 's'} · Updated {timeAgo(list.updatedAt)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </TabContent>
      )}

      {tab === 'followers' && (
        <TabContent loading={followers.loading} error={followers.error} onRetry={followers.reload}>
          {!followers.data || followers.data.length === 0 ? (
            <EmptyState icon={<UsersIcon />} title="No followers yet" message={`${p.displayName} doesn’t have any followers yet.`} />
          ) : (
            <UserList users={followers.data} />
          )}
        </TabContent>
      )}

      {tab === 'following' && (
        <TabContent loading={following.loading} error={following.error} onRetry={following.reload}>
          {!following.data || following.data.length === 0 ? (
            <EmptyState
              icon={<UsersIcon />}
              title="Not following anyone"
              message={p.self ? 'Follow people to see their activity in your feed.' : `${p.displayName} isn’t following anyone yet.`}
              action={
                p.self ? (
                  <Link to="/people" className="btn-primary">
                    Find people
                  </Link>
                ) : undefined
              }
            />
          ) : (
            <UserList users={following.data} />
          )}
        </TabContent>
      )}
    </PageContainer>
  )
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <span>
      <strong className="font-semibold text-ink-100">{value}</strong>{' '}
      <span className="text-ink-400">{label}</span>
    </span>
  )
}

function TabContent({
  loading,
  error,
  onRetry,
  skeleton,
  children,
}: {
  loading: boolean
  error: Error | null
  onRetry: () => void
  skeleton?: React.ReactNode
  children: React.ReactNode
}) {
  if (loading) return skeleton ?? <PosterGridSkeleton />
  if (error) return <ErrorState error={error} onRetry={onRetry} />
  return <>{children}</>
}

function UserList({ users }: { users: UserSummary[] }) {
  return (
    <ul className="mx-auto max-w-lg space-y-2">
      {users.map((u) => (
        <li key={u.id}>
          <Link to={`/u/${u.username}`} className="card flex items-center gap-4 p-4 transition-colors hover:border-ink-600">
            <Avatar name={u.displayName} />
            <div>
              <p className="font-semibold">{u.displayName}</p>
              <p className="text-sm text-ink-400">@{u.username}</p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  )
}
