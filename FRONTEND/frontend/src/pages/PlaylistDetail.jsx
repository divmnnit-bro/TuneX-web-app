import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Trash2, GripVertical, Play, ArrowLeft } from 'lucide-react'
import { getPlaylistById, removeVideoFromPlaylist, deletePlaylist, updatePlaylist } from '../api/playlists'

export default function PlaylistDetail() {
  const { playlistId } = useParams()
  const navigate = useNavigate()
  const [playlist, setPlaylist] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const [removingId, setRemovingId] = useState(null)

  useEffect(() => {
    getPlaylistById(playlistId)
      .then((res) => {
        setPlaylist(res.data.data)
        setNameInput(res.data.data.name)
      })
      .finally(() => setLoading(false))
  }, [playlistId])

  const handleRemove = async (videoId) => {
    setRemovingId(videoId)
    // let the exit animation play before actually removing from state
    setTimeout(async () => {
      await removeVideoFromPlaylist(playlistId, videoId)
      setPlaylist((prev) => ({ ...prev, videos: prev.videos.filter((v) => v._id !== videoId) }))
      setRemovingId(null)
    }, 200)
  }

  const handleDeletePlaylist = async () => {
    if (!confirm(`Delete "${playlist.name}" permanently?`)) return
    await deletePlaylist(playlistId)
    navigate('/playlists')
  }

  const handleRename = async () => {
    if (!nameInput.trim() || nameInput === playlist.name) {
      setEditingName(false)
      return
    }
    const res = await updatePlaylist(playlistId, nameInput.trim())
    setPlaylist((prev) => ({ ...prev, name: res.data.data.name }))
    setEditingName(false)
  }

  if (loading) {
    return <p className="text-center py-20 text-gray-400">Loading playlist...</p>
  }

  if (!playlist) {
    return <p className="text-center py-20 text-red-600">Playlist not found.</p>
  }

  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={() => navigate('/playlists')}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-5 transition-colors"
      >
        <ArrowLeft size={16} /> All playlists
      </button>

      <div className="flex items-start justify-between mb-8">
        <div className="flex-1 min-w-0">
          {editingName ? (
            <input
              autoFocus
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onBlur={handleRename}
              onKeyDown={(e) => e.key === 'Enter' && handleRename()}
              className="text-2xl font-semibold border-b-2 border-red-500 focus:outline-none bg-transparent w-full"
            />
          ) : (
            <h1
              onClick={() => setEditingName(true)}
              className="text-2xl font-semibold cursor-text hover:text-gray-600 transition-colors truncate"
              title="Click to rename"
            >
              {playlist.name}
            </h1>
          )}
          <p className="text-sm text-gray-400 mt-1">{playlist.videos.length} videos</p>
        </div>

        <button
          onClick={handleDeletePlaylist}
          className="flex items-center gap-1.5 text-sm text-red-600 border border-red-200 px-3.5 py-2 rounded-full hover:bg-red-50 transition-colors shrink-0 ml-4"
        >
          <Trash2 size={14} /> Delete playlist
        </button>
      </div>

      {playlist.videos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-gray-400 mb-1">This playlist is empty.</p>
          <p className="text-sm text-gray-300">Add videos using the "Save" button while watching.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          {playlist.videos.map((video, i) => (
            <div
              key={video._id}
              className={`group flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-all duration-200 ${
                removingId === video._id ? 'opacity-0 -translate-x-4 scale-95' : 'opacity-100'
              }`}
            >
              <GripVertical size={16} className="text-gray-300 shrink-0" />
              <span className="text-sm text-gray-400 w-5 text-center shrink-0">{i + 1}</span>

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
                <Link to={`/watch/${video._id}`} className="font-medium text-sm line-clamp-2 hover:text-red-600 transition-colors">
                  {video.title}
                </Link>
                <p className="text-xs text-gray-400 mt-1">{video.views} views</p>
              </div>

              <button
                onClick={() => handleRemove(video._id)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-300 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all shrink-0"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}