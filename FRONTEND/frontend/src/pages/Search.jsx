import { useSearchParams } from 'react-router-dom'
import { useFetch } from '../hooks/useFetch'
import { getAllVideos } from '../api/videos'
import VideoGrid from '../components/video/VideoGrid'
import { Search as SearchIcon } from 'lucide-react'

export default function Search() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('query') || ''

  const { data: videos, loading, error } = useFetch(() => getAllVideos(query), [query])

  return (
    <div className="animate-[fadeIn_0.4s_ease-out]">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-400/20 flex items-center justify-center">
          <SearchIcon size={18} className="text-purple-300" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-white">
            Results for <span className="text-purple-300">"{query}"</span>
          </h1>
          <p className="text-sm text-white/30">
            {loading ? 'Searching...' : `${videos?.length || 0} videos found`}
          </p>
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
        <p className="text-red-300 text-center py-20">Something went wrong.</p>
      ) : (
        <VideoGrid videos={videos} />
      )}
    </div>
  )
}

