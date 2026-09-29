export interface Account {
  id: number
  username: string
  email: string
  displayName: string
  bio: string | null
  createdAt: string
}

export interface AuthResponse {
  token: string
  user: Account
}

export interface UserSummary {
  id: number
  username: string
  displayName: string
}

export interface Profile {
  id: number
  username: string
  displayName: string
  bio: string | null
  createdAt: string
  watchedCount: number
  reviewCount: number
  followerCount: number
  followingCount: number
  listCount: number
  self: boolean
  following: boolean
}

export interface MovieRef {
  tmdbId: number
  title: string
  posterPath: string | null
  releaseDate: string | null
}

export interface MovieSummary extends MovieRef {
  overview: string | null
  voteAverage: number | null
}

export interface MoviePage {
  page: number
  totalPages: number
  totalResults: number
  results: MovieSummary[]
}

export interface Genre {
  id: number
  name: string
}

export interface MovieDetails {
  tmdbId: number
  title: string
  tagline: string | null
  overview: string | null
  posterPath: string | null
  backdropPath: string | null
  releaseDate: string | null
  runtime: number | null
  genres: Genre[]
  originalLanguage: string | null
  status: string | null
  voteAverage: number | null
  voteCount: number | null
  communityRating: number | null
  communityReviewCount: number
}

export interface Review {
  id: number
  user: UserSummary
  movie: MovieRef
  rating: number
  body: string | null
  createdAt: string
  updatedAt: string
  likeCount: number
  commentCount: number
  likedByViewer: boolean
}

export interface Comment {
  id: number
  user: UserSummary
  body: string
  createdAt: string
  updatedAt: string
}

export interface WatchlistItem {
  movie: MovieRef
  addedAt: string
}

export interface WatchedItem {
  movie: MovieRef
  watchedAt: string
}

export interface MovieStatus {
  inWatchlist: boolean
  watched: boolean
  watchedAt: string | null
  review: Review | null
}

export interface FeedItem {
  id: string
  type: 'WATCHED' | 'REVIEWED' | 'LIST_ADDED'
  user: UserSummary
  movie: MovieRef
  reviewId: number | null
  rating: number | null
  body: string | null
  listId: number | null
  listName: string | null
  likeCount: number
  commentCount: number
  occurredAt: string
}

export interface MovieListSummary {
  id: number
  name: string
  description: string | null
  movieCount: number
  updatedAt: string
}

export interface MovieListDetail {
  id: number
  name: string
  description: string | null
  movieCount: number
  createdAt: string
  updatedAt: string
  movies: { movie: MovieRef; addedAt: string }[]
}

export interface Notification {
  id: number
  type: 'NEW_FOLLOWER' | 'REVIEW_LIKED' | 'REVIEW_COMMENTED' | 'FOLLOWED_USER_REVIEWED' | 'FOLLOWED_USER_WATCHED'
  actor: UserSummary
  referenceId: number | null
  message: string
  read: boolean
  createdAt: string
}

export type BrowseCategory = 'popular' | 'top_rated' | 'now_playing' | 'upcoming'
