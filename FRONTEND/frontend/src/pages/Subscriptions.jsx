import { useFetch } from '../hooks/useFetch'
import { getSubscribedFeed } from '../api/videos'
import VideoGrid from '../components/video/VideoGrid'
import { Users } from 'lucide-react'

export default function Subscriptions() {
  const { data: videos, loading, error } = useFetch(getSubscribedFeed, [])

  return (
    <div>
      <div className="flex items-center gap-3 mb-6 animate-[slideUp_0.4s_ease-out]">
        <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-400/20 flex items-center justify-center">
          <Users size={18} className="text-purple-300" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-white">Subscriptions</h1>
          <p className="text-sm text-white/30">Latest from channels you follow</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-7">
          {Array.from({ length: 8 }).map((_, i) => (
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
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-red-300">
            {error.response?.data?.message || "Couldn't load your subscriptions feed."}
          </p>
        </div>
      ) : !videos?.length ? (
        <div className="flex flex-col items-center justify-center py-24 text-center animate-[fadeIn_0.4s_ease-out]">
          <div className="w-20 h-20 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center mb-4">
            <Users size={30} className="text-white/20" />
          </div>
          <h2 className="font-medium text-white/70 mb-1">Nothing here yet</h2>
          <p className="text-sm text-white/30 max-w-xs">
            Subscribe to channels to see their latest videos show up here.
          </p>
        </div>
      ) : (
        <VideoGrid videos={videos} />
      )}
    </div>
  )
}