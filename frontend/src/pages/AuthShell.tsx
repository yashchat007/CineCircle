import type { ReactNode } from 'react'

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,176,65,0.10),transparent_60%)]" />
      <div className="card relative w-full max-w-md p-8 shadow-2xl shadow-black/40">
        <h1 className="font-display text-3xl font-bold">{title}</h1>
        <p className="mt-2 text-sm text-ink-300">{subtitle}</p>
        <div className="mt-8">{children}</div>
      </div>
    </div>
  )
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mt-1.5 text-xs text-velvet-500">{message}</p>
}

export function FormError({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <div className="mb-5 rounded-xl border border-velvet-500/40 bg-velvet-500/10 px-4 py-3 text-sm text-ink-100" role="alert">
      {message}
    </div>
  )
}
