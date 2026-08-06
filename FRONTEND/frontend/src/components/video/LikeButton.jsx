import { useState } from 'react'
import { toggleVideoLike } from '../../api/likes'
import { ThumbsUp } from 'lucide-react'

export default function LikeButton({ videoId, initiallyLiked, initialCount = 0 }) {
  const [liked, setLiked] = useState(initiallyLiked)
  const [count, setCount] = useState(initialCount)
  const [busy, setBusy] = useState(false)

  const handleClick = async () => {
    const wasLiked = liked
    setLiked(!wasLiked)
    setCount((c) => (wasLiked ? c - 1 : c + 1))
    setBusy(true)
    try {
      const res = await toggleVideoLike(videoId)
      setLiked(res.data.data.isLiked)
      setCount(res.data.data.likesCount)
    } catch {
      setLiked(wasLiked)
      setCount((c) => (wasLiked ? c + 1 : c - 1))
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={busy}
      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border disabled:opacity-50 transition-all ${
        liked
          ? 'bg-purple-500/15 text-purple-200 border-purple-400/30'
          : 'bg-white/[0.04] text-white/70 border-white/10 hover:bg-white/[0.08]'
      }`}
    >
      <ThumbsUp size={16} fill={liked ? 'currentColor' : 'none'} />
      {count}
    </button>
  )
}