import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getChannelProfile } from '../api/users'
import { getMyVideos, togglePublishStatus, deleteVideo } from '../api/videos'

export default function Dashboard() {
  const { user } = useAuth()
  const [channel, setChannel] = useState(null)
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.username) return

    Promise.all([
      getChannelProfile(user.username),
      getMyVideos(),
    ]).then(([channelRes, videosRes]) => {
      setChannel(channelRes.data.data)
      setVideos(videosRes.data.data)
      setLoading(false)
    })
  }, [user?.username])

  const handleTogglePublish = async (videoId) => {
    const res = await togglePublishStatus(videoId)
    setVideos((prev) =>
      prev.map((v) => (v._id === videoId ? { ...v, isPublished: res.data.data.isPublished } : v))
    )
  }

  const handleDelete = async (videoId) => {
    if (!confirm('Delete this video permanently?')) return
    await deleteVideo(videoId)
    setVideos((prev) => prev.filter((v) => v._id !== videoId))
  }

  if (loading) return <p className="text-gray-500 text-center py-10">Loading dashboard...</p>

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <img src={channel?.avatar} alt={channel?.username} className="w-16 h-16 rounded-full object-cover" />
        <div>
          <h1 className="text-xl font-semibold">{channel?.fullname}</h1>
          <p className="text-gray-500 text-sm">
            {channel?.subscribersCount} subscribers · {videos.length} videos
          </p>
        </div>
      </div>

      <h2 className="font-medium mb-3">Your videos</h2>

      {videos.length === 0 ? (
        <p className="text-gray-500 text-sm">You haven't uploaded any videos yet.</p>
      ) : (
        <div className="border rounded-xl overflow-hidden divide-y">
          {videos.map((video) => (
            <div key={video._id} className="flex items-center gap-4 p-3">
              <Link to={`/watch/${video._id}`} className="shrink-0">
                <img src={video.thumbnail} alt={video.title} className="w-32 aspect-video object-cover rounded-lg" />
              </Link>

              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{video.title}</p>
                <p className="text-xs text-gray-500 mt-1">{video.views} views</p>
              </div>

              <button
                onClick={() => handleTogglePublish(video._id)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full border ${
                  video.isPublished ? 'text-green-700 border-green-300 bg-green-50' : 'text-gray-500 border-gray-300 bg-gray-50'
                }`}
              >
                {video.isPublished ? 'Public' : 'Private'}
              </button>

              <button
                onClick={() => handleDelete(video._id)}
                className="text-xs font-medium text-red-600 px-3 py-1.5 rounded-full border border-red-200 hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}