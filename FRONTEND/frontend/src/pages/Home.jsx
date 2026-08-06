import { useFetch } from '../hooks/useFetch'
import { getAllVideos } from '../api/videos'
import VideoGrid from '../components/video/VideoGrid'

export default function Home() {
  const { data: videos, loading, error } = useFetch(getAllVideos, [])

  if (loading) {
    return <p className="text-gray-500 text-center py-10">Loading videos...</p>
  }

  if (error) {
    return (
      <p className="text-red-600 text-center py-10">
        Couldn't load videos. {error.response?.data?.message || 'Please try again.'}
      </p>
    )
  }

  return <VideoGrid videos={videos} />
}