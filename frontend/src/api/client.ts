import type {
  Account,
  AuthResponse,
  BrowseCategory,
  Comment,
  FeedItem,
  MovieDetails,
  MovieListDetail,
  MovieListSummary,
  MoviePage,
  MovieRef,
  MovieStatus,
  Notification,
  Profile,
  Review,
  UserSummary,
  WatchedItem,
  WatchlistItem,
} from './types'

function resolveApiBase(): string {
  const fromEnv = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '')
  if (typeof window !== 'undefined' && window.location.hostname.endsWith('.vercel.app')) {
    return ''
  }
  return fromEnv ?? ''
}

const API_BASE = resolveApiBase()
const TOKEN_KEY = 'cinecircle.token'

export const UNAUTHORIZED_EVENT = 'cinecircle:unauthorized'

export class ApiError extends Error {
  status: number
  fieldErrors: Record<string, string>

  constructor(status: number, message: string, fieldErrors: Record<string, string> = {}) {
    super(message)
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}

async function request<T>(path: string, options: { method?: string; body?: unknown } = {}): Promise<T> {
  const headers: Record<string, string> = {}
  const token = tokenStore.get()
  if (token) headers.Authorization = `Bearer ${token}`
  if (options.body !== undefined) headers['Content-Type'] = 'application/json'

  let response: Response
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method: options.method ?? 'GET',
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    })
  } catch {
    throw new ApiError(0, 'Could not reach CineCircle. Check your connection and try again.')
  }

  if (response.status === 401 && token) {
    window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))
  }

  if (!response.ok) {
    let message = 'Something went wrong. Please try again.'
    let fieldErrors: Record<string, string> = {}
    try {
      const data = await response.json()
      if (data?.message) message = data.message
      if (data?.fieldErrors) fieldErrors = data.fieldErrors
    } catch {
      // Non-JSON error body; keep the default message.
    }
    throw new ApiError(response.status, message, fieldErrors)
  }

  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

const q = encodeURIComponent

export const api = {
  register: (data: { username: string; email: string; password: string; displayName?: string }) =>
    request<AuthResponse>('/api/auth/register', { method: 'POST', body: data }),
  login: (data: { login: string; password: string }) =>
    request<AuthResponse>('/api/auth/login', { method: 'POST', body: data }),

  me: () => request<Account>('/api/users/me'),
  updateMe: (data: { displayName: string; bio: string }) =>
    request<Account>('/api/users/me', { method: 'PUT', body: data }),

  searchUsers: (query: string) => request<UserSummary[]>(`/api/users/search?query=${q(query)}`),

  searchMovies: (query: string, page = 1, year?: number) => {
    let url = `/api/movies/search?query=${q(query)}&page=${page}`
    if (year) url += `&year=${year}`
    return request<MoviePage>(url)
  },
  browseMovies: (category: BrowseCategory, page = 1) =>
    request<MoviePage>(`/api/movies/browse?category=${category}&page=${page}`),
  recommendations: (page = 1) => request<MoviePage>(`/api/movies/recommendations?page=${page}`),
  movie: (tmdbId: number) => request<MovieDetails>(`/api/movies/${tmdbId}`),
  movieReviews: (tmdbId: number) => request<Review[]>(`/api/movies/${tmdbId}/reviews`),
  recentReviews: () => request<Review[]>('/api/reviews/recent'),
  movieStatus: (tmdbId: number) => request<MovieStatus>(`/api/me/movies/${tmdbId}/status`),

  saveReview: (tmdbId: number, data: { rating: number; body: string }) =>
    request<Review>(`/api/movies/${tmdbId}/review`, { method: 'PUT', body: data }),
  deleteReview: (tmdbId: number) => request<void>(`/api/movies/${tmdbId}/review`, { method: 'DELETE' }),

  toggleReviewLike: (reviewId: number) => request<Review>(`/api/reviews/${reviewId}/like`, { method: 'PUT' }),
  reviewComments: (reviewId: number) => request<Comment[]>(`/api/reviews/${reviewId}/comments`),
  addComment: (reviewId: number, body: string) =>
    request<Comment>(`/api/reviews/${reviewId}/comments`, { method: 'POST', body: { body } }),
  updateComment: (reviewId: number, commentId: number, body: string) =>
    request<Comment>(`/api/reviews/${reviewId}/comments/${commentId}`, { method: 'PUT', body: { body } }),
  deleteComment: (reviewId: number, commentId: number) =>
    request<void>(`/api/reviews/${reviewId}/comments/${commentId}`, { method: 'DELETE' }),

  watchlist: () => request<WatchlistItem[]>('/api/me/watchlist'),
  addToWatchlist: (tmdbId: number) => request<WatchlistItem>(`/api/me/watchlist/${tmdbId}`, { method: 'PUT' }),
  removeFromWatchlist: (tmdbId: number) => request<void>(`/api/me/watchlist/${tmdbId}`, { method: 'DELETE' }),

  watched: () => request<WatchedItem[]>('/api/me/watched'),
  markWatched: (tmdbId: number) => request<WatchedItem>(`/api/me/watched/${tmdbId}`, { method: 'PUT' }),
  unmarkWatched: (tmdbId: number) => request<void>(`/api/me/watched/${tmdbId}`, { method: 'DELETE' }),

  myLists: () => request<MovieListSummary[]>('/api/me/lists'),
  createList: (data: { name: string; description?: string }) =>
    request<MovieListSummary>('/api/me/lists', { method: 'POST', body: data }),
  myList: (listId: number) => request<MovieListDetail>(`/api/me/lists/${listId}`),
  updateList: (listId: number, data: { name: string; description?: string }) =>
    request<MovieListSummary>(`/api/me/lists/${listId}`, { method: 'PUT', body: data }),
  deleteList: (listId: number) => request<void>(`/api/me/lists/${listId}`, { method: 'DELETE' }),
  addToList: (listId: number, tmdbId: number) =>
    request<{ movie: MovieRef; addedAt: string }>(`/api/me/lists/${listId}/movies/${tmdbId}`, { method: 'PUT' }),
  removeFromList: (listId: number, tmdbId: number) =>
    request<void>(`/api/me/lists/${listId}/movies/${tmdbId}`, { method: 'DELETE' }),
  userLists: (username: string) => request<MovieListSummary[]>(`/api/users/${q(username)}/lists`),
  userList: (username: string, listId: number) =>
    request<MovieListDetail>(`/api/users/${q(username)}/lists/${listId}`),

  profile: (username: string) => request<Profile>(`/api/users/${q(username)}`),
  followers: (username: string) => request<UserSummary[]>(`/api/users/${q(username)}/followers`),
  following: (username: string) => request<UserSummary[]>(`/api/users/${q(username)}/following`),
  userWatched: (username: string) => request<WatchedItem[]>(`/api/users/${q(username)}/watched`),
  userReviews: (username: string) => request<Review[]>(`/api/users/${q(username)}/reviews`),
  follow: (username: string) => request<void>(`/api/users/${q(username)}/follow`, { method: 'PUT' }),
  unfollow: (username: string) => request<void>(`/api/users/${q(username)}/follow`, { method: 'DELETE' }),

  feed: () => request<FeedItem[]>('/api/feed'),

  notifications: () => request<Notification[]>('/api/notifications'),
  unreadCount: () => request<{ count: number }>('/api/notifications/unread-count'),
  markNotificationRead: (id: number) => request<void>(`/api/notifications/${id}/read`, { method: 'PUT' }),
  markAllNotificationsRead: () => request<void>('/api/notifications/read-all', { method: 'PUT' }),
}
