import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, ApiError } from '../api/client'
import type { MovieListSummary } from '../api/types'
import { CheckIcon, ListIcon } from './icons'

export function SaveToList({ tmdbId }: { tmdbId: number }) {
  const [open, setOpen] = useState(false)
  const [lists, setLists] = useState<MovieListSummary[] | null>(null)
  const [saved, setSaved] = useState<Set<number>>(new Set())
  const [busy, setBusy] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [])

  useEffect(() => {
    setSaved(new Set())
    setLists(null)
    setOpen(false)
  }, [tmdbId])

  const loadLists = async () => {
    try {
      setLists(await api.myLists())
    } catch (err) {
      setError((err as ApiError).message)
    }
  }

  const toggle = () => {
    const next = !open
    setOpen(next)
    setError(null)
    if (next) loadLists()
  }

  const add = async (listId: number) => {
    setBusy(listId)
    setError(null)
    try {
      await api.addToList(listId, tmdbId)
      setSaved((prev) => new Set(prev).add(listId))
      await loadLists()
    } catch (err) {
      setError((err as ApiError).message)
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button className="btn-secondary" onClick={toggle} aria-expanded={open} aria-haspopup="menu">
        <ListIcon className="h-4 w-4" />
        Save to list
      </button>
      {open && (
        <div className="absolute left-0 z-20 mt-2 w-64 overflow-hidden rounded-xl border border-ink-700 bg-ink-900 shadow-xl">
          {lists === null ? (
            <p className="px-4 py-3 text-sm text-ink-400">{error ? '' : 'Loading lists…'}</p>
          ) : lists.length === 0 ? (
            <p className="px-4 py-3 text-sm text-ink-400">
              No lists yet.{' '}
              <Link to="/lists" className="text-marquee-400 hover:text-marquee-300">
                Create one
              </Link>
            </p>
          ) : (
            <ul className="max-h-72 overflow-y-auto">
              {lists.map((l) => (
                <li key={l.id}>
                  <button
                    className="flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left text-sm hover:bg-ink-800 disabled:opacity-50"
                    onClick={() => add(l.id)}
                    disabled={busy !== null || saved.has(l.id)}
                  >
                    <span className="min-w-0 truncate">
                      {l.name}
                      <span className="ml-2 text-xs text-ink-400">({l.movieCount})</span>
                    </span>
                    {saved.has(l.id) && <CheckIcon className="h-4 w-4 shrink-0 text-marquee-400" aria-label="Saved" />}
                  </button>
                </li>
              ))}
            </ul>
          )}
          {error && <p className="border-t border-ink-800 px-4 py-2 text-xs text-velvet-500">{error}</p>}
        </div>
      )}
    </div>
  )
}
