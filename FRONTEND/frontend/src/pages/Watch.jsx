import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useFetch } from '../hooks/useFetch'
import { getVideoById } from '../api/videos'
import { getAllComments } from '../api/comments'
import { useAuth } from '../context/AuthContext'
import SubscribeButton from '../components/video/SubscribeButton'
import LikeButton from '../components/video/LikeButton'
import CommentForm from '../components/comments/CommentForm'
import CommentList from '../components/comments/CommentList'
import AddToPlaylistMenu from '../components/video/AddToPlaylistMenu'

export default function Watch() {
  const { videoId } = useParams()
  const { user } = useAuth()
  const [comments, setComments] = useState([])

  const { data: video, loading, error } = useFetch(() => getVideoById(videoId), [videoId])

  useEffect(() => {
    getAllComments(videoId).then((res) => setComments(res.data.data))
  }, [videoId])

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 rounded-full border-2 border-purple-500/20 border-t-purple-400 animate-spin" />
        <p className="text-sm text-purple-200/50">Loading video...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center">
        <p className="text-red-400 font-medium">Video not found.</p>
        <p className="text-sm text-purple-200/40 mt-1">It may have been removed or the link is broken.</p>
      </div>
    )
  }

  const isOwnVideo = video.owner?._id === user?._id
  console.log('owner.isSubscribed:', video.owner?.isSubscribed)

  return (
    <div className="max-w-4xl mx-auto animate-[fadeIn_0.4s_ease-out]">
      {/* Player */}
      <div className="relative rounded-2xl overflow-hidden ring-1 ring-purple-500/20 shadow-[0_0_60px_-10px_rgba(168,85,247,0.4)]">
        <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-purple-500/40 via-fuchsia-500/20 to-purple-500/40 opacity-40 blur-sm -z-10" />
        <video
          src={video.videoFile}
          controls
          autoPlay
          className="w-full aspect-video bg-black block"
        />
      </div>

      {/* Title + views */}
      <div className="mt-5 animate-[slideUp_0.4s_ease-out_0.05s_backwards]">
        <h1 className="text-xl font-semibold bg-gradient-to-r from-white via-purple-100 to-purple-300 bg-clip-text text-transparent">
          {video.title}
        </h1>
        <p className="text-sm text-purple-200/40 mt-1.5 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_8px_2px_rgba(168,85,247,0.6)]" />
          {video.views} views
        </p>
      </div>

      {/* Owner + actions row */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-5 pb-5 border-b border-white/10 animate-[slideUp_0.4s_ease-out_0.1s_backwards]">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute -inset-0.5 rounded-full bg-gradient-to-tr from-purple-500 to-fuchsia-500 opacity-70 blur-[2px]" />
            <img
              src={video.owner?.avatar}
              alt={video.owner?.username}
              className="relative w-11 h-11 rounded-full object-cover ring-2 ring-[#1a0b3d]"
            />
          </div>
          <div>
            <p className="font-medium text-white">{video.owner?.fullname}</p>
            <p className="text-sm text-purple-200/40">@{video.owner?.username}</p>
          </div>

          {!isOwnVideo && (
            <div className="ml-1">
              <SubscribeButton channelId={video.owner?._id}  initiallySubscribed={video.owner?.isSubscribed ?? false} />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          <LikeButton videoId={video._id} initiallyLiked={video.isLiked} initialCount={video.likesCount} />
          <AddToPlaylistMenu videoId={video._id} />
        </div>
      </div>

      {/* Description card */}
<div className="mt-5 p-4 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 animate-[slideUp_0.4s_ease-out_0.15s_backwards]">
  <p className="text-xs font-semibold uppercase tracking-wide text-purple-300/60 mb-2">
    Description
  </p>
  <p className="text-sm text-purple-100/70 whitespace-pre-line leading-relaxed">
    {video.description}
  </p>
</div>

      {/* Comments */}
      <div className="mt-8 p-5 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 animate-[slideUp_0.4s_ease-out_0.2s_backwards]">
        <h2 className="font-medium mb-4 text-white flex items-center gap-2">
          <span className="bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
            {comments.length}
          </span>
          <span className="text-purple-200/50 font-normal">Comments</span>
        </h2>
        <CommentForm videoId={videoId} onCommentAdded={(c) => setComments((prev) => [c, ...prev])} />
        <CommentList
  comments={comments}
  onCommentUpdated={(id, newContent) =>
    setComments((prev) =>
      prev.map((c) => (c._id === id ? { ...c, content: newContent } : c))
    )
  }
  onCommentDeleted={(id) =>
    setComments((prev) => prev.filter((c) => c._id !== id))
  }
/>
      </div>
    </div>
  )
}