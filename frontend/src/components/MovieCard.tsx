import { Link } from 'react-router-dom'
import type { MovieRef } from '../api/types'
import { imageUrl, releaseYear } from '../lib/format'
import { FilmIcon, StarIcon } from './icons'

export function Poster({
  path,
  title,
  size = 'w342',
  className = '',
}: {
  path: string | null
  title: string
  size?: 'w185' | 'w342' | 'w500'
  className?: string
}) {
  const src = imageUrl(path, size)
  return (
    <div className={`relative aspect-[2/3] overflow-hidden rounded-xl bg-ink-800 ${className}`}>
      {src ? (
        <img src={src} alt={`${title} poster`} loading="lazy" className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-3 text-center text-ink-400">
          <FilmIcon className="h-8 w-8" />
          <span className="text-xs">{title}</span>
        </div>
      )}
    </div>
  )
}

export function MovieCard({
  movie,
  voteAverage,
  caption,
}: {
  movie: MovieRef
  voteAverage?: number | null
  caption?: string
}) {
  const year = releaseYear(movie.releaseDate)
  return (
    <Link to={`/movie/${movie.tmdbId}`} className="group block">
      <div className="relative">
        <Poster
          path={movie.posterPath}
          title={movie.title}
          className="ring-1 ring-ink-700 transition duration-200 group-hover:-translate-y-1 group-hover:ring-marquee-400/70 group-hover:shadow-xl group-hover:shadow-black/50"
        />
        {voteAverage != null && voteAverage > 0 && (
          <span className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-full bg-ink-950/85 px-2 py-0.5 text-xs font-semibold text-marquee-300 backdrop-blur">
            <StarIcon filled className="h-3 w-3" />
            {voteAverage.toFixed(1)}
          </span>
        )}
      </div>
      <div className="mt-2.5 px-0.5">
        <p className="line-clamp-1 text-sm font-semibold text-ink-100 group-hover:text-marquee-300">{movie.title}</p>
        <p className="text-xs text-ink-400">{caption ?? year ?? '—'}</p>
      </div>
    </Link>
  )
}

export function MovieGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">{children}</div>
}
