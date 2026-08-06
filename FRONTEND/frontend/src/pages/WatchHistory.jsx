import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getWatchHistory } from '../api/users'
import { History, Play, Trash2 } from 'lucide-react'

export default function WatchHistory() {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getWatchHistory()
      .then((res) => setVideos(res.data.data))
      .catch(() => setVideos([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-3xl mx-auto animate-[fadeIn_0.4s_ease-out]">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-400/20 flex items-center justify-center">
          <History size={18} className="text-purple-300" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-white">Watch history</h1>
          <p className="text-sm text-white/30">Videos you've watched</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-2.5 animate-pulse">
              <div className="w-32 aspect-video rounded-lg bg-white/[0.04] shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-white/[0.06] rounded w-3/4" />
                <div className="h-2.5 bg-white/[0.04] rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center mb-4">
            <History size={30} className="text-white/20" />
          </div>
          <h2 className="font-medium text-white/70 mb-1">No watch history yet</h2>
          <p className="text-sm text-white/30 max-w-xs">
            Videos you watch will show up here.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          {videos.map((video, i) => (
            <div
              key={video._id}
              className="group flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.04] transition-all duration-200 animate-[slideUp_0.3s_ease-out_backwards]"
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <Link to={`/watch/${video._id}`} className="relative w-32 aspect-video rounded-lg overflow-hidden shrink-0 group/thumb">
                <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover/thumb:bg-black/40 transition-colors flex items-center justify-center">
                  <Play
                    size={20}
                    className="text-white opacity-0 group-hover/thumb:opacity-100 transition-opacity"
                    fill="currentColor"
                  />
                </div>
              </Link>

              <div className="flex-1 min-w-0">
                <Link to={`/watch/${video._id}`} className="font-medium text-sm text-white/90 line-clamp-2 hover:text-purple-300 transition-colors">
                  {video.title}
                </Link>
                <p className="text-xs text-white/40 mt-1">{video.owner?.fullname}</p>
                <p className="text-xs text-white/30">{video.views} views</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}