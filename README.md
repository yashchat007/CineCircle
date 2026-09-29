# CineCircle

A social movie discovery and review platform — the complete product from the project synopsis (core journey, community features, and production polish in one application).

| Area | Stack |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS (`frontend/`) |
| Backend | Java 21, Spring Boot (Web, Security, Data JPA, Validation), Maven (`backend/`) |
| Database | PostgreSQL |
| External movie API | [TMDB](https://www.themoviedb.org/) — titles, posters, descriptions, genres, release info |

All backend areas live in one Spring Boot application. The frontend talks only to the backend; the backend calls TMDB.

## Features

### Core (Version 1)

- **Authentication** — registration, login, logout; BCrypt password hashing; stateless JWT access tokens.
- **Movie discovery** — search by title (optional year filter) and browse Popular / Top rated / Now playing / Upcoming.
- **Movie details** — poster, backdrop, title, tagline, overview, genres, release date, runtime, language, status, TMDB score, and CineCircle community rating.
- **Watchlist** — save movies for later.
- **Watched** — mark movies as watched and view watched history (marking watched removes from watchlist).
- **Ratings & reviews** — one rating (1–5 stars) with optional written review per user per movie; edit or delete your own.
- **User profiles** — display name, bio, join date, watched movies, ratings and reviews; settings page to edit profile.
- **Following** — follow and unfollow users.
- **Feed** — recent activity from users you follow.

### Community (Version 2)

- **Review likes** — like and unlike reviews.
- **Review comments** — comment on reviews.
- **Personal movie lists** — create named lists and add/remove movies; save movies to lists from movie pages.
- **Richer profiles** — follower/following counts and lists; profile tabs for watched, reviews, lists, followers, following.
- **User discovery** — search members by username or display name.
- **Improved feed** — includes list activity and social counts on reviews.
- **Community review discovery** — recent reviews on the Discover page.

### Production polish (Version 3)

- **Personalized recommendations** — genre-based “For you” suggestions from your watched/reviewed history (no ML).
- **Notifications** — new followers, review likes/comments, followed users’ reviews.
- **Security headers** and reduced error exposure in the `prod` profile.
- **Unit and integration tests** — full product journey covered in backend tests.
- **Docker Compose** — PostgreSQL, backend, and frontend/nginx for deployment-style runs.

## Data model

CineCircle stores community data plus a minimal movie reference (TMDB id, title, poster path, release date). Full movie details are fetched from TMDB.

`users`, `movies`, `watchlist_entries`, `watched_entries`, `reviews`, `follows`, `review_likes`, `review_comments`, `movie_lists`, `movie_list_entries`, `notifications`

## Running locally

### Prerequisites

- Java 21 and Maven
- Node.js 20+
- PostgreSQL 14+ (or use the H2 quick-start script below)
- A TMDB **API Read Access Token** (Settings → API on themoviedb.org)

### 1. Database (PostgreSQL)

```sql
CREATE USER cinecircle WITH PASSWORD 'cinecircle';
CREATE DATABASE cinecircle OWNER cinecircle;
```

Tables are created automatically by Hibernate on first start (`ddl-auto: update`).

### 2. Backend

Put secrets in `backend/.env` (git-ignored; copy `backend/.env.example`). The backend loads this file at startup; real environment variables override it.

**Quick start without PostgreSQL:** `backend/run-local.ps1` uses a local file database (`backend/.localdb/`) and reads `backend/.env`. It limits Java to TLS 1.2 for TMDB compatibility on some networks.

```powershell
cd backend
powershell -ExecutionPolicy Bypass -File .\run-local.ps1
```

**With PostgreSQL:**

```powershell
cd backend
$env:TMDB_API_TOKEN = "<your TMDB read access token>"
$env:JWT_SECRET = "<a random string of at least 32 characters>"
mvn spring-boot:run
```

The API runs on http://localhost:8080.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. In development, Vite proxies `/api` to the backend.

### Docker Compose

Set `TMDB_API_TOKEN` and `JWT_SECRET` (at least 32 characters) in your environment or a root `.env` file, then:

```bash
docker compose up --build
```

- Frontend: http://localhost (nginx)
- Backend API: http://localhost:8080
- PostgreSQL: localhost:5432

The backend runs with the `prod` profile: `JWT_SECRET` is mandatory (no development fallback), error responses omit internal details, and missing tables are created on first start (set `JPA_DDL_AUTO=validate` once the schema is established).

### Tests

```bash
cd backend
mvn test
```

Integration test `CoreJourneyIntegrationTest` exercises the full product flow through the REST API (H2 in PostgreSQL mode, TMDB mocked), including ownership rules and deletion of reviews and lists that have likes, comments, or entries. `ReviewSocialServiceTest` unit-tests like/comment logic with Mockito.

## Environment variables

| Variable | Default | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | `jdbc:postgresql://localhost:5432/cinecircle` | JDBC URL |
| `DATABASE_USERNAME` / `DATABASE_PASSWORD` | `cinecircle` / `cinecircle` | Database credentials |
| `JWT_SECRET` | development-only value | HMAC key for access tokens (≥ 32 chars) |
| `JWT_EXPIRATION_HOURS` | `168` | Token lifetime |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173` | Comma-separated allowed frontend origins |
| `TMDB_API_TOKEN` | — | TMDB API Read Access Token (server only) |
| `PORT` | `8080` | Backend port |
| `SPRING_PROFILES_ACTIVE` | — | Set to `prod` for production profile |
| `JPA_DDL_AUTO` (prod) | `update` | Hibernate schema mode in the `prod` profile |
| `VITE_API_BASE_URL` (frontend) | empty | Backend base URL for separately hosted builds |

## REST API (summary)

All endpoints except register/login require `Authorization: Bearer <token>`.

| Area | Examples |
| --- | --- |
| Auth | `POST /api/auth/register`, `POST /api/auth/login` |
| Users | `GET /api/users/me`, `GET /api/users/search?query=`, `GET /api/users/{username}`, followers, following |
| Movies | search (optional `year`), browse, recommendations, details, reviews |
| Reviews | create/update/delete own review; `PUT /api/reviews/{id}/like`; comments CRUD |
| Tracking | watchlist, watched, movie status |
| Lists | `GET/POST /api/me/lists`, add/remove movies |
| Social | follow/unfollow, feed |
| Notifications | list, unread count, mark read |

Logout is handled client-side by discarding the token.
