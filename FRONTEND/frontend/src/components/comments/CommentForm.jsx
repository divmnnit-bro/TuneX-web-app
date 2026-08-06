import { useState } from 'react'
import { addComment } from '../../api/comments'
import { useAuth } from '../../context/AuthContext'

export default function CommentForm({ videoId, onCommentAdded }) {
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { user } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim()) return

    setSubmitting(true)
    try {
      const res = await addComment(videoId, content)
      onCommentAdded({ ...res.data.data, owner: { _id: user._id, username: user.username, avatar: user.avatar } })
      setContent('')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-3 mb-6">
      <img
        src={user?.avatar}
        alt={user?.username}
        className="w-9 h-9 rounded-full object-cover ring-1 ring-white/15 shrink-0"
      />
      <input
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Add a comment..."
        className="flex-1 bg-white/[0.04] border border-white/10 rounded-full px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-purple-400/40 focus:bg-white/[0.06] transition-all"
      />
      <button
        type="submit"
        disabled={submitting || !content.trim()}
        className="text-sm font-medium px-4 py-2.5 rounded-full bg-purple-500/20 text-purple-200 border border-purple-400/20 hover:bg-purple-500/30 disabled:opacity-30 disabled:hover:bg-purple-500/20 transition-all shrink-0"
      >
        Comment
      </button>
    </form>
  )
}