import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { GuestOnly, RequireAuth } from './components/RequireAuth'
import DiscoverPage from './pages/DiscoverPage'
import FeedPage from './pages/FeedPage'
import LandingPage from './pages/LandingPage'
import ListDetailPage from './pages/ListDetailPage'
import ListsPage from './pages/ListsPage'
import LoginPage from './pages/LoginPage'
import MovieDetailsPage from './pages/MovieDetailsPage'
import NotFoundPage from './pages/NotFoundPage'
import PeoplePage from './pages/PeoplePage'
import ProfilePage from './pages/ProfilePage'
import RegisterPage from './pages/RegisterPage'
import SettingsPage from './pages/SettingsPage'
import WatchedPage from './pages/WatchedPage'
import WatchlistPage from './pages/WatchlistPage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route element={<GuestOnly />}>
          <Route index element={<LandingPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>
        <Route element={<RequireAuth />}>
          <Route path="feed" element={<FeedPage />} />
          <Route path="discover" element={<DiscoverPage />} />
          <Route path="people" element={<PeoplePage />} />
          <Route path="lists" element={<ListsPage />} />
          <Route path="lists/:listId" element={<ListDetailPage />} />
          <Route path="u/:username/lists/:listId" element={<ListDetailPage />} />
          <Route path="movie/:tmdbId" element={<MovieDetailsPage />} />
          <Route path="watchlist" element={<WatchlistPage />} />
          <Route path="watched" element={<WatchedPage />} />
          <Route path="u/:username" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
