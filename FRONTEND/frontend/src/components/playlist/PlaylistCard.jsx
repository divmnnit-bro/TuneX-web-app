import { Link } from 'react-router-dom'
import { ListVideo, Play } from 'lucide-react'

export default function PlaylistCard({ playlist, index = 0 }) {
  const thumbCount = playlist.videos?.length || 0
  const cover = playlist.videos?.[0]?.thumbnail

  return (
    <Link
      to={`/playlist/${playlist._id}`}
      className="group block rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="relative aspect-video bg-gradient-to-br from-gray-800 to-gray-950 overflow-hidden">
        {cover ? (
          <img
            src={cover}
            alt={playlist.name}
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ListVideo className="text-white/30" size={40} />
          </div>
        )}

        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center scale-0 group-hover:scale-100 transition-transform duration-300 ease-out">
            <Play size={18} className="text-black ml-0.5" fill="currentColor" />
          </div>
        </div>

        <div className="absolute bottom-0 right-0 bg-black/80 text-white text-xs font-medium px-2.5 py-1.5 flex items-center gap-1.5 rounded-tl-lg">
          <ListVideo size={12} />
          {thumbCount} {thumbCount === 1 ? 'video' : 'videos'}
        </div>
      </div>

      <div className="p-3.5">
        <h3 className="font-medium text-sm truncate group-hover:text-red-600 transition-colors duration-200">
          {playlist.name}
        </h3>
        <p className="text-xs text-gray-400 mt-1">
          {thumbCount === 0 ? 'No videos yet' : `${thumbCount} ${thumbCount === 1 ? 'video' : 'videos'}`}
        </p>
      </div>
    </Link>
  )
}