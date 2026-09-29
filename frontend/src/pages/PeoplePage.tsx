import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { Avatar } from '../components/Avatar'
import { SearchIcon, UsersIcon } from '../components/icons'
import { PageContainer } from '../components/Layout'
import { EmptyState, ErrorState, Spinner } from '../components/States'
import { useAsync } from '../lib/useAsync'

export default function PeoplePage() {
  const [query, setQuery] = useState('')
  const [submitted, setSubmitted] = useState('')

  const { data, error, loading, reload } = useAsync(
    () => (submitted.trim() ? api.searchUsers(submitted.trim()) : Promise.resolve([])),
    [submitted],
  )

  const submit = (e: FormEvent) => {
    e.preventDefault()
    setSubmitted(query.trim())
  }

  return (
    <PageContainer>
      <h1 className="page-title">People</h1>
      <p className="mt-2 mb-8 text-ink-300">Find other CineCircle members by username or display name.</p>

      <form onSubmit={submit} className="relative mx-auto mb-10 max-w-lg" role="search">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-ink-400" />
        <input
          type="search"
          className="input rounded-full py-3 pl-12"
          placeholder="Search by username or name…"
          aria-label="Search people"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </form>

      {!submitted ? (
        <EmptyState
          icon={<UsersIcon />}
          title="Search for people"
          message="Enter a username or display name to find members on CineCircle."
        />
      ) : loading ? (
        <Spinner label="Searching" />
      ) : error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : !data || data.length === 0 ? (
        <EmptyState
          icon={<UsersIcon />}
          title="No people found"
          message={`No members match “${submitted}”. Try a different search.`}
        />
      ) : (
        <ul className="mx-auto max-w-lg space-y-2">
          {data.map((u) => (
            <li key={u.id}>
              <Link
                to={`/u/${u.username}`}
                className="card flex items-center gap-4 p-4 transition-colors hover:border-ink-600"
              >
                <Avatar name={u.displayName} />
                <div className="min-w-0">
                  <p className="font-semibold">{u.displayName}</p>
                  <p className="text-sm text-ink-400">@{u.username}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </PageContainer>
  )
}
