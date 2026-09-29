import { useState } from 'react'
import { StarIcon } from './icons'

export function StarDisplay({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const cls = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'
  return (
    <span className="inline-flex items-center gap-0.5 text-marquee-400" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <StarIcon key={n} filled={n <= rating} className={`${cls} ${n <= rating ? '' : 'text-ink-600'}`} />
      ))}
    </span>
  )
}

const LABELS = ['', 'Poor', 'Fair', 'Good', 'Great', 'Masterpiece']

export function StarInput({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  const [hover, setHover] = useState(0)
  const shown = hover || value
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} star${n > 1 ? 's' : ''}`}
            onMouseEnter={() => setHover(n)}
            onClick={() => onChange(n)}
            className="rounded p-0.5 text-marquee-400 transition-transform hover:scale-110"
          >
            <StarIcon filled={n <= shown} className={`h-7 w-7 ${n <= shown ? '' : 'text-ink-600'}`} />
          </button>
        ))}
      </div>
      <span className="text-sm font-medium text-ink-300">{LABELS[shown]}</span>
    </div>
  )
}
