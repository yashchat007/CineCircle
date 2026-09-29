import { Link } from 'react-router-dom'
import { BookmarkIcon, SearchIcon, StarIcon, UsersIcon } from '../components/icons'

const PILLARS = [
  { icon: SearchIcon, title: 'Discover', text: 'Search and browse thousands of movies with posters, genres, and release details.' },
  { icon: BookmarkIcon, title: 'Track', text: 'Save movies to your watchlist and keep a history of everything you’ve watched.' },
  { icon: StarIcon, title: 'Share', text: 'Rate movies out of five stars and write reviews in your own words.' },
  { icon: UsersIcon, title: 'Connect', text: 'Follow people whose taste you trust and see what they watch in your feed.' },
]

const TILE_GRADIENTS = [
  'from-marquee-500/80 to-velvet-500/60',
  'from-sky-700/70 to-ink-800',
  'from-velvet-500/70 to-ink-800',
  'from-emerald-700/60 to-ink-800',
  'from-violet-700/70 to-marquee-500/40',
  'from-ink-600 to-ink-800',
]

export default function LandingPage() {
  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(245,176,65,0.18),transparent_60%)]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:py-28">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-marquee-400/30 bg-marquee-400/10 px-3 py-1 text-xs font-semibold tracking-wide text-marquee-300 uppercase">
              Your movie community
            </p>
            <h1 className="font-display text-5xl leading-[1.05] font-bold tracking-tight sm:text-6xl">
              Every film you love,
              <br />
              <span className="text-marquee-400">shared in a circle.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-ink-300">
              CineCircle is where you discover movies, track what you watch, rate and review what you’ve seen, and
              follow friends to see what they’re watching.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link to="/register" className="btn-primary px-7 py-3 text-base">
                Create your account
              </Link>
              <Link to="/login" className="btn-secondary px-7 py-3 text-base">
                Log in
              </Link>
            </div>
          </div>

          <div className="relative hidden lg:block" aria-hidden="true">
            <div className="grid rotate-[-6deg] grid-cols-3 gap-4">
              {TILE_GRADIENTS.map((gradient, i) => (
                <div
                  key={gradient}
                  className={`aspect-[2/3] rounded-2xl bg-gradient-to-br ${gradient} ring-1 ring-white/10 shadow-2xl shadow-black/60 ${
                    i % 3 === 1 ? 'translate-y-10' : ''
                  }`}
                >
                  <div className="flex h-full flex-col justify-end p-4">
                    <div className="mb-2 h-2 w-3/4 rounded bg-white/30" />
                    <div className="h-2 w-1/2 rounded bg-white/20" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map(({ icon: Icon, title, text }) => (
            <div key={title} className="card p-6 transition-colors hover:border-ink-600">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-marquee-400/10 text-marquee-400">
                <Icon className="h-5 w-5" />
              </span>
              <h2 className="mt-4 font-display text-xl font-semibold">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-300">{text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
