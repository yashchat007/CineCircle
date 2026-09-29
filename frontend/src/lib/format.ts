const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p'

export function imageUrl(path: string | null | undefined, size: 'w185' | 'w342' | 'w500' | 'w780' | 'w1280' = 'w342') {
  return path ? `${TMDB_IMAGE_BASE}/${size}${path}` : null
}

export function releaseYear(date: string | null | undefined) {
  return date ? date.slice(0, 4) : null
}

export function formatDate(date: string | null | undefined) {
  if (!date) return null
  return new Date(date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
}

export function formatRuntime(minutes: number | null | undefined) {
  if (!minutes) return null
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

export function timeAgo(date: string) {
  const seconds = Math.round((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const units: [number, string][] = [
    [60 * 60 * 24 * 365, 'y'],
    [60 * 60 * 24 * 30, 'mo'],
    [60 * 60 * 24 * 7, 'w'],
    [60 * 60 * 24, 'd'],
    [60 * 60, 'h'],
    [60, 'm'],
  ]
  for (const [size, label] of units) {
    if (seconds >= size) return `${Math.floor(seconds / size)}${label} ago`
  }
  return 'just now'
}

export function languageName(code: string | null | undefined) {
  if (!code) return null
  try {
    return new Intl.DisplayNames(undefined, { type: 'language' }).of(code) ?? code
  } catch {
    return code
  }
}
