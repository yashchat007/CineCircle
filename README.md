# CineCircle

CineCircle is a full-stack social movie discovery and review platform where users can discover movies, track what they watch, rate and review movies, follow other users, and interact with a movie-focused community.

The application uses TMDB for movie metadata and images, while CineCircle manages its own users, reviews, ratings, watchlists, watched history, follows, likes, comments, lists, notifications, and social activity.

---

## Features

### Authentication & Accounts

- User registration and login
- Secure password hashing using BCrypt
- JWT-based authentication
- Logout
- Protected routes and authorization
- User profiles
- Edit profile information
- Account settings

### Movie Discovery

- Search movies by title
- Optional year-based filtering
- Browse:
  - Popular
  - Top Rated
  - Now Playing
  - Upcoming
- Movie details including:
  - Poster
  - Backdrop
  - Title
  - Tagline
  - Overview
  - Genres
  - Release date
  - Runtime
  - Language
  - Status
  - TMDB rating
  - CineCircle community rating

### Personal Movie Tracking

- Add movies to Watchlist
- Mark movies as Watched
- View watched movie history
- Automatically remove a movie from Watchlist when it is marked as Watched
- Track personal movie activity

### Ratings & Reviews

- Rate movies from 1–5 stars
- Write reviews
- Edit your own reviews
- Delete your own reviews
- View community reviews
- Like and unlike reviews
- Comment on reviews

### Social Features

- Discover other CineCircle users
- Search users by username or display name
- Follow and unfollow users
- View follower and following counts
- View user activity
- Social feed based on followed users
- Feed activity for reviews and movie lists
- Notifications for:
  - New followers
  - Review likes
  - Review comments
  - Reviews from followed users

### Personal Movie Lists

- Create custom movie lists
- Give lists custom names
- Add movies to lists
- Remove movies from lists
- View lists from user profiles
- Manage personal movie collections

### Personalized Discovery

- Personalized "For You" movie suggestions
- Recommendations based on watched/reviewed movie activity
- Genre-based recommendations without machine-learning infrastructure

### Security & Reliability

- JWT authentication
- BCrypt password hashing
- Protected user-specific operations
- Authorization checks
- Security headers
- Reduced error exposure in production configuration
- Environment-based configuration for secrets
- Validation and error handling

---

## Technology Stack

### Frontend

- React 19
- TypeScript
- Vite
- Tailwind CSS

### Backend

- Java 21
- Spring Boot
- Spring Web
- Spring Security
- Spring Data JPA
- Hibernate
- Jakarta Validation
- Maven

### Database

- H2 for local development and automated testing
- PostgreSQL for production deployment

### External Service

- TMDB API for movie metadata and images

### Testing

- JUnit
- Mockito
- Spring integration testing
- REST API testing

---

## Architecture

CineCircle follows a simple full-stack architecture with a single Spring Boot backend.

```text
User
 │
 ▼
React + TypeScript Frontend
 │
 ▼
Spring Boot REST API
 │
 ├──────────────► PostgreSQL
 │
 └──────────────► TMDB API
