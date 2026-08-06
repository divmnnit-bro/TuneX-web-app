import { useState, useEffect } from 'react'
import { ListVideo, Plus } from 'lucide-react'
import { getUserPlaylists } from '../api/playlists'
import PlaylistCard from '../components/playlist/PlaylistCard'
import CreatePlaylistModal from '../components/playlist/CreatePlaylistModal'

export default function Playlists() {
  const [playlists, setPlaylists] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    getUserPlaylists()
      .then((res) => setPlaylists(res.data.data))
      .finally(() => setLoading(false))
  }, [])

  const handleCreated = (playlist) => {
    setPlaylists((prev) => [playlist, ...prev])
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-2xl overflow-hidden animate-pulse">
            <div className="aspect-video bg-gray-200" />
            <div className="p-3.5 space-y-2">
              <div className="h-3 bg-gray-200 rounded w-3/4" />
              <div className="h-2.5 bg-gray-100 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Your playlists</h1>
          <p className="text-sm text-gray-400 mt-0.5">{playlists.length} playlists</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-full text-sm font-medium hover:bg-red-700 active:scale-95 transition-all"
        >
          <Plus size={16} />
          New playlist
        </button>
      </div>

      {playlists.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mb-4">
            <ListVideo size={32} className="text-gray-300" />
          </div>
          <h2 className="font-medium text-gray-700 mb-1">No playlists yet</h2>
          <p className="text-sm text-gray-400 mb-5 max-w-xs">
            Create your first playlist to start organizing videos you want to watch again.
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="bg-red-600 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-red-700 transition-colors"
          >
            Create a playlist
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {playlists.map((playlist, i) => (
            <div key={playlist._id} className="animate-[slideUp_0.35s_ease-out_backwards]" style={{ animationDelay: `${i * 50}ms` }}>
              <PlaylistCard playlist={playlist} />
            </div>
          ))}
        </div>
      )}

      <CreatePlaylistModal open={modalOpen} onClose={() => setModalOpen(false)} onCreated={handleCreated} />
    </div>
  )
}