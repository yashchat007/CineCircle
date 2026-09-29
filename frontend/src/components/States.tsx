import type { ReactNode } from 'react'

export function Spinner({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="flex justify-center py-16" role="status" aria-label={label}>
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-ink-600 border-t-marquee-400" />
    </div>
  )
}

export function EmptyState({
  icon,
  title,
  message,
  action,
}: {
  icon?: ReactNode
  title: string
  message?: string
  action?: ReactNode
}) {
  return (
    <div className="card flex flex-col items-center px-6 py-14 text-center">
      {icon && <div className="mb-4 text-ink-400 [&>svg]:h-10 [&>svg]:w-10">{icon}</div>}
      <h3 className="font-display text-xl font-semibold">{title}</h3>
      {message && <p className="mt-2 max-w-md text-sm text-ink-300">{message}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

export function ErrorState({ error, onRetry }: { error: Error; onRetry?: () => void }) {
  return (
    <div className="card flex flex-col items-center border-velvet-500/40 px-6 py-12 text-center" role="alert">
      <h3 className="font-display text-xl font-semibold">Something went wrong</h3>
      <p className="mt-2 max-w-md text-sm text-ink-300">{error.message}</p>
      {onRetry && (
        <button className="btn-secondary mt-6" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  )
}

export function PosterGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="aspect-[2/3] animate-pulse rounded-xl bg-ink-800" />
      ))}
    </div>
  )
}
