import { useParams } from 'react-router-dom'
import { useFetch } from '../hooks/useFetch'
import { getChannelProfile } from '../api/users'
import { getChannelVideos } from '../api/videos'
import SubscribeButton from '../components/video/SubscribeButton'
import VideoGrid from '../components/video/VideoGrid'
import { useAuth } from '../context/AuthContext'
import { Users, Video as VideoIcon } from 'lucide-react'

export default function Channel() {
  const { username } = useParams()
  const { user } = useAuth()

  const { data: channel, loading: channelLoading, error: channelError } = useFetch(
    () => getChannelProfile(username),
    [username]
  )
  const { data: videos, loading: videosLoading } = useFetch(
    () => getChannelVideos(username),
    [username]
  )

  if (channelLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-40 rounded-2xl bg-white/[0.04] border border-white/10 mb-16 relative">
          <div className="absolute -bottom-8 left-6 w-20 h-20 rounded-full bg-white/[0.08] ring-4 ring-[#0a0416]" />
        </div>
      </div>
    )
  }

  if (channelError || !channel) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-red-300">Channel not found.</p>
      </div>
    )
  }

  const isOwnChannel = channel.username === user?.username

  return (
    <div className="animate-[fadeIn_0.4s_ease-out]">
      {/* Cover image */}
      <div className="relative h-40 sm:h-52 rounded-2xl overflow-hidden bg-gradient-to-br from-purple-900/40 to-fuchsia-900/20 border border-white/10">
        {channel.coverImage && (
          <img src={channel.coverImage} alt="cover" className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0416]/60 via-transparent to-transparent" />
      </div>

      {/* Header — avatar overlaps the cover, like real channel pages */}
      <div className="flex flex-col sm:flex-row sm:items-end gap-4 px-2 -mt-10 sm:-mt-12 relative animate-[slideUp_0.4s_ease-out_0.1s_backwards]">
        <div className="relative shrink-0">
          <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-purple-500 to-fuchsia-500 opacity-80 blur-[3px]" />
          <img
            src={channel.avatar}
            alt={channel.username}
            className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover ring-4 ring-[#0a0416]"
          />
        </div>

        <div className="flex-1 min-w-0 pb-1">
          <h1 className="text-xl sm:text-2xl font-semibold bg-gradient-to-r from-white via-purple-100 to-purple-300 bg-clip-text text-transparent">
            {channel.fullname}
          </h1>
          <p className="text-sm text-white/40 mt-0.5">@{channel.username}</p>

          <div className="flex items-center gap-4 mt-2 text-sm text-white/30">
            <span className="flex items-center gap-1.5">
              <Users size={14} className="text-purple-400/60" />
              {channel.subscribersCount} subscribers
            </span>
            <span className="flex items-center gap-1.5">
              <VideoIcon size={14} className="text-purple-400/60" />
              {videos?.length || 0} videos
            </span>
          </div>
        </div>

        {!isOwnChannel && (
          <div className="pb-1">
            <SubscribeButton channelId={channel._id} initiallySubscribed={channel.isSubscribed} />
          </div>
        )}
      </div>

      {/* Video grid */}
      <div className="mt-10 animate-[slideUp_0.4s_ease-out_0.2s_backwards]">
        <div className="h-px bg-white/10 mb-6" />
        {videosLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-7">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-video rounded-2xl bg-white/[0.04] border border-white/10" />
                <div className="flex gap-3 mt-3">
                  <div className="w-9 h-9 rounded-full bg-white/[0.06] shrink-0" />
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-3 bg-white/[0.06] rounded w-full" />
                    <div className="h-2.5 bg-white/[0.04] rounded w-2/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <VideoGrid videos={videos} />
        )}
      </div>
    </div>
  )
}