import { Link } from 'react-router-dom'

function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function timeAgo(dateString) {
  const seconds = Math.floor((Date.now() - new Date(dateString)) / 1000)
  const units = [
    ['year', 31536000], ['month', 2592000], ['day', 86400],
    ['hour', 3600], ['minute', 60],
  ]
  for (const [name, secondsInUnit] of units) {
    const value = Math.floor(seconds / secondsInUnit)
    if (value >= 1) return `${value} ${name}${value > 1 ? 's' : ''} ago`
  }
  return 'just now'
}

export default function VideoCard({ video, index = 0 }) {
  return (
    <Link
      to={`/watch/${video._id}`}
      className="block group animate-[slideUp_0.35s_ease-out_backwards]"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="relative aspect-video rounded-2xl overflow-hidden bg-white/[0.03] border border-white/10 group-hover:border-purple-400/30 transition-all duration-300">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        <span className="absolute bottom-1.5 right-1.5 bg-black/80 backdrop-blur-sm text-white text-xs px-1.5 py-0.5 rounded-md border border-white/10">
          {formatDuration(video.duration)}
        </span>
      </div>

      <div className="flex gap-3 mt-3">
        <div className="relative shrink-0">
          <div className="absolute -inset-0.5 rounded-full bg-gradient-to-tr from-purple-500/60 to-fuchsia-500/60 opacity-0 group-hover:opacity-100 blur-[2px] transition-opacity duration-300" />
          <img
            src={video.owner?.avatar}
            alt={video.owner?.username}
            className="relative w-9 h-9 rounded-full object-cover ring-1 ring-white/10"
          />
        </div>
        <div className="min-w-0">
          <h3 className="font-medium text-sm text-white/90 line-clamp-2 leading-snug group-hover:text-purple-200 transition-colors">
            {video.title}
          </h3>
          <p className="text-xs text-white/40 mt-1">{video.owner?.fullname}</p>
          <p className="text-xs text-white/30 flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-purple-400/60" />
            {video.views} views · {timeAgo(video.createdAt)}
          </p>
        </div>
      </div>
    </Link>
  )
}