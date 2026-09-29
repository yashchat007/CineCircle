import { Link } from 'react-router-dom'
import type { Review } from '../api/types'
import { releaseYear, timeAgo } from '../lib/format'
import { Avatar } from './Avatar'
import { Poster } from './MovieCard'
import { ReviewSocial } from './ReviewSocial'
import { StarDisplay } from './StarRating'

/**
 * Shows a review. `showMovie` puts the movie poster/title first (profile pages);
 * otherwise the author is shown first (movie pages).
 */
export function ReviewCard({
  review,
  showMovie = false,
  showSocial = true,
  onReviewChange,
}: {
  review: Review
  showMovie?: boolean
  showSocial?: boolean
  onReviewChange?: (review: Review) => void
}) {
  const edited = review.updatedAt !== review.createdAt
  return (
    <article className="card flex gap-4 p-5">
      {showMovie ? (
        <Link to={`/movie/${review.movie.tmdbId}`} className="w-16 shrink-0 sm:w-20">
          <Poster path={review.movie.posterPath} title={review.movie.title} size="w185" />
        </Link>
      ) : (
        <Link to={`/u/${review.user.username}`} aria-label={`${review.user.displayName}'s profile`}>
          <Avatar name={review.user.displayName} />
        </Link>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          {showMovie ? (
            <Link to={`/movie/${review.movie.tmdbId}`} className="font-display text-lg font-semibold hover:text-marquee-300">
              {review.movie.title}
              {review.movie.releaseDate && (
                <span className="ml-2 font-sans text-sm font-normal text-ink-400">
                  {releaseYear(review.movie.releaseDate)}
                </span>
              )}
            </Link>
          ) : (
            <Link to={`/u/${review.user.username}`} className="font-semibold hover:text-marquee-300">
              {review.user.displayName}
              <span className="ml-1.5 text-sm font-normal text-ink-400">@{review.user.username}</span>
            </Link>
          )}
        </div>
        <div className="mt-1.5 flex items-center gap-3">
          <StarDisplay rating={review.rating} />
          <span className="text-xs text-ink-400">
            {timeAgo(review.createdAt)}
            {edited && ' · edited'}
          </span>
        </div>
        {review.body && (
          <p className="mt-3 text-sm leading-relaxed whitespace-pre-line text-ink-100/90">{review.body}</p>
        )}
        {showSocial && <ReviewSocial review={review} onReviewChange={onReviewChange} />}
      </div>
    </article>
  )
}
