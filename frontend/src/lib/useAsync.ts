import { useCallback, useEffect, useRef, useState, type DependencyList } from 'react'

interface AsyncState<T> {
  data: T | null
  error: Error | null
  /** True only while loading without data to show (first load or after deps change). */
  loading: boolean
  /** Re-runs the loader, keeping the current data visible until the new result arrives. */
  reload: () => void
}

/** Runs an async loader whenever deps change, ignoring results from stale runs. */
export function useAsync<T>(loader: () => Promise<T>, deps: DependencyList): AsyncState<T> {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState(true)
  const [version, setVersion] = useState(0)
  const lastVersion = useRef(version)

  useEffect(() => {
    let active = true
    const isReload = version !== lastVersion.current
    lastVersion.current = version
    if (!isReload) {
      setData(null)
      setLoading(true)
    }
    setError(null)
    loader()
      .then((result) => active && setData(result))
      .catch((err: Error) => active && setError(err))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [...deps, version])

  const reload = useCallback(() => setVersion((v) => v + 1), [])

  return { data, error, loading, reload }
}
