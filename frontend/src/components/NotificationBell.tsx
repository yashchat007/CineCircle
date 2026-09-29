import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import type { Notification } from '../api/types'
import { timeAgo } from '../lib/format'
import { BellIcon } from './icons'

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<Notification[]>([])
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  const load = () => {
    api.unreadCount().then((r) => setCount(r.count)).catch(() => {})
    if (open) api.notifications().then(setItems).catch(() => {})
  }

  useEffect(() => {
    load()
    const id = window.setInterval(load, 60_000)
    return () => clearInterval(id)
  }, [open])

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [])

  const toggle = () => {
    setOpen((v) => !v)
    if (!open) api.notifications().then(setItems).catch(() => {})
  }

  const openNotification = (n: Notification) => {
    setOpen(false)
    if (n.read) return
    setItems((prev) => prev.map((i) => (i.id === n.id ? { ...i, read: true } : i)))
    setCount((c) => Math.max(0, c - 1))
    api.markNotificationRead(n.id).catch(() => {})
  }

  const markAll = async () => {
    try {
      await api.markAllNotificationsRead()
      setCount(0)
      setItems((prev) => prev.map((n) => ({ ...n, read: true })))
    } catch {
      // Keep current state; the next poll will resync.
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        className="btn-ghost relative p-2"
        onClick={toggle}
        aria-label={`Notifications${count > 0 ? `, ${count} unread` : ''}`}
        aria-expanded={open}
      >
        <BellIcon className="h-5 w-5" />
        {count > 0 && (
          <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-velvet-500 px-1 text-[10px] font-bold text-white">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>
      {open && (
        <div
          className="absolute right-0 z-40 mt-2 w-80 overflow-hidden rounded-2xl border border-ink-700 bg-ink-900 shadow-xl"
          role="region"
          aria-label="Notifications"
        >
          <div className="flex items-center justify-between border-b border-ink-800 px-4 py-3">
            <span className="text-sm font-semibold">Notifications</span>
            {count > 0 && (
              <button className="text-xs text-marquee-400 hover:text-marquee-300" onClick={markAll}>
                Mark all read
              </button>
            )}
          </div>
          <ul className="max-h-80 overflow-y-auto">
            {items.length === 0 ? (
              <li className="px-4 py-6 text-center text-sm text-ink-400">No notifications yet</li>
            ) : (
              items.map((n) => (
                <li
                  key={n.id}
                  className={`border-b border-ink-800 px-4 py-3 text-sm last:border-0 ${n.read ? 'opacity-60' : ''}`}
                >
                  <Link to={`/u/${n.actor.username}`} className="block hover:text-marquee-300" onClick={() => openNotification(n)}>
                    <p className="flex items-start gap-2 text-ink-200">
                      {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-marquee-400" aria-label="Unread" />}
                      <span>{n.message}</span>
                    </p>
                    <p className="mt-1 text-xs text-ink-400">
                      @{n.actor.username} · {timeAgo(n.createdAt)}
                    </p>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
