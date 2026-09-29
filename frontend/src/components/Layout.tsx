import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { Avatar } from './Avatar'
import { CloseIcon, Logo, MenuIcon } from './icons'
import { NotificationBell } from './NotificationBell'

const NAV = [
  { to: '/feed', label: 'Feed' },
  { to: '/discover', label: 'Discover' },
  { to: '/people', label: 'People' },
  { to: '/lists', label: 'Lists' },
  { to: '/watchlist', label: 'Watchlist' },
  { to: '/watched', label: 'Watched' },
]

function navClass({ isActive }: { isActive: boolean }) {
  return `rounded-full px-4 py-2 text-sm font-medium transition-colors ${
    isActive ? 'bg-ink-800 text-marquee-300' : 'text-ink-300 hover:text-ink-100'
  }`
}

export function Layout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const logout = () => {
    signOut()
    setOpen(false)
    navigate('/')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-marquee-400 focus:text-ink-950">
        Skip to content
      </a>
      <header className="sticky top-0 z-30 border-b border-ink-800 bg-ink-950/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to={user ? '/feed' : '/'} aria-label="CineCircle home">
            <Logo />
          </Link>

          {user ? (
            <>
              <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
                {NAV.map((item) => (
                  <NavLink key={item.to} to={item.to} className={navClass}>
                    {item.label}
                  </NavLink>
                ))}
              </nav>
              <div className="flex items-center gap-1 lg:gap-2">
                <NotificationBell />
                <div className="hidden items-center gap-2 lg:flex">
                  <Link
                    to={`/u/${user.username}`}
                    className="flex items-center gap-2 rounded-full py-1 pr-3 pl-1 hover:bg-ink-800"
                  >
                    <Avatar name={user.displayName} size="sm" />
                    <span className="text-sm font-medium">{user.displayName}</span>
                  </Link>
                  <NavLink to="/settings" className={navClass}>
                    Settings
                  </NavLink>
                  <button className="btn-ghost px-4" onClick={logout}>
                    Log out
                  </button>
                </div>
                <button
                  className="btn-ghost p-2 lg:hidden"
                  onClick={() => setOpen((v) => !v)}
                  aria-label={open ? 'Close menu' : 'Open menu'}
                  aria-expanded={open}
                >
                  {open ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn-ghost">
                Log in
              </Link>
              <Link to="/register" className="btn-primary">
                Join
              </Link>
            </div>
          )}
        </div>

        {user && open && (
          <nav className="border-t border-ink-800 px-4 py-3 lg:hidden" aria-label="Mobile">
            <div className="flex flex-col gap-1">
              {[...NAV, { to: `/u/${user.username}`, label: 'My profile' }, { to: '/settings', label: 'Settings' }].map(
                (item) => (
                  <NavLink key={item.to} to={item.to} className={navClass} onClick={() => setOpen(false)}>
                    {item.label}
                  </NavLink>
                ),
              )}
              <button className="rounded-full px-4 py-2 text-left text-sm font-medium text-ink-300" onClick={logout}>
                Log out
              </button>
            </div>
          </nav>
        )}
      </header>

      <main id="main-content" className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-ink-800 py-8 text-center text-xs text-ink-400">
        <p>CineCircle — discover, track, and share the movies you love.</p>
        <p className="mt-1">Movie data and images provided by TMDB. This product uses the TMDB API but is not endorsed or certified by TMDB.</p>
      </footer>
    </div>
  )
}

export function PageContainer({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">{children}</div>
}
