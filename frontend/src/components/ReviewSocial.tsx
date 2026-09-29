import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { api, ApiError } from '../api/client'
import type { Comment, Review } from '../api/types'
import { useAuth } from '../auth/AuthContext'
import { timeAgo } from '../lib/format'
import { CommentIcon, HeartIcon } from './icons'
import { useAsync } from '../lib/useAsync'

export function ReviewSocial({
  review: initial,
  onReviewChange,
}: {
  review: Review
  onReviewChange?: (review: Review) => void
}) {
  const { user } = useAuth()
  const [review, setReview] = useState(initial)
  const [showComments, setShowComments] = useState(false)

  useEffect(() => setReview(initial), [initial])
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const comments = useAsync(
    () => (showComments ? api.reviewComments(review.id) : Promise.resolve([] as Comment[])),
    [review.id, showComments],
  )

  const update = (r: Review) => {
    setReview(r)
    onReviewChange?.(r)
  }

  const toggleLike = async () => {
    setBusy(true)
    setError(null)
    try {
      update(await api.toggleReviewLike(review.id))
    } catch (e) {
      setError((e as ApiError).message)
    } finally {
      setBusy(false)
    }
  }

  const submitComment = async (e: FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    setBusy(true)
    setError(null)
    try {
      await api.addComment(review.id, text.trim())
      setText('')
      comments.reload()
      update({ ...review, commentCount: review.commentCount + 1 })
    } catch (err) {
      setError((err as ApiError).message)
    } finally {
      setBusy(false)
    }
  }

  const removeComment = async (commentId: number) => {
    if (!confirm('Delete this comment?')) return
    setBusy(true)
    setError(null)
    try {
      await api.deleteComment(review.id, commentId)
      comments.reload()
      update({ ...review, commentCount: Math.max(0, review.commentCount - 1) })
    } catch (err) {
      setError((err as ApiError).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mt-3 border-t border-ink-800 pt-3">
      <div className="flex items-center gap-4">
        <button
          className={`inline-flex items-center gap-1.5 text-sm ${review.likedByViewer ? 'text-velvet-500' : 'text-ink-400 hover:text-velvet-500'}`}
          onClick={toggleLike}
          disabled={busy}
          aria-pressed={review.likedByViewer}
          aria-label={`${review.likedByViewer ? 'Unlike' : 'Like'} review (${review.likeCount} likes)`}
        >
          <HeartIcon filled={review.likedByViewer} className="h-4 w-4" />
          {review.likeCount}
        </button>
        <button
          className="inline-flex items-center gap-1.5 text-sm text-ink-400 hover:text-ink-100"
          onClick={() => setShowComments((v) => !v)}
          aria-expanded={showComments}
          aria-label={`${showComments ? 'Hide' : 'Show'} comments (${review.commentCount})`}
        >
          <CommentIcon className="h-4 w-4" />
          {review.commentCount}
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-velvet-500">{error}</p>}
      {showComments && (
        <div className="mt-4 space-y-3">
          {comments.loading ? (
            <p className="text-xs text-ink-400">Loading comments…</p>
          ) : comments.error ? (
            <p className="text-xs text-velvet-500">{comments.error.message}</p>
          ) : comments.data?.length === 0 ? (
            <p className="text-xs text-ink-400">No comments yet.</p>
          ) : (
            comments.data?.map((c) => (
              <div key={c.id} className="text-sm">
                <Link to={`/u/${c.user.username}`} className="font-semibold hover:text-marquee-300">
                  {c.user.displayName}
                </Link>
                <span className="ml-2 text-xs text-ink-400">{timeAgo(c.createdAt)}</span>
                {c.user.id === user?.id && (
                  <button
                    className="ml-2 text-xs text-ink-400 hover:text-velvet-500"
                    onClick={() => removeComment(c.id)}
                    disabled={busy}
                    aria-label="Delete comment"
                  >
                    Delete
                  </button>
                )}
                <p className="mt-0.5 break-words whitespace-pre-line text-ink-200">{c.body}</p>
              </div>
            ))
          )}
          {user && (
            <form onSubmit={submitComment} className="flex gap-2">
              <input
                className="input flex-1 py-2 text-sm"
                placeholder="Write a comment…"
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={2000}
                aria-label="Comment"
              />
              <button type="submit" className="btn-secondary px-3 py-2 text-xs" disabled={busy}>
                Post
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
