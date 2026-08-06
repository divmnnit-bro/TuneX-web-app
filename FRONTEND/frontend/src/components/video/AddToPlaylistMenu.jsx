import { useState, useEffect } from 'react'
import { ListPlus, Check, Plus } from 'lucide-react'
import { getUserPlaylists, createPlaylist, addVideoToPlaylist, removeVideoFromPlaylist } from '../../api/playlists'

export default function AddToPlaylistMenu({ videoId }) {
  const [open, setOpen] = useState(false)
  const [playlists, setPlaylists] = useState([])
  const [loading, setLoading] = useState(false)
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (open) {
      setLoading(true)
      getUserPlaylists()
        .then((res) => setPlaylists(res.data.data))
        .finally(() => setLoading(false))
    }
  }, [open])

  const isInPlaylist = (playlist) => playlist.videos?.some((v) => v._id === videoId || v === videoId)

  const handleToggle = async (playlist) => {
    const alreadyIn = isInPlaylist(playlist)

    // optimistic update
    setPlaylists((prev) =>
      prev.map((p) =>
        p._id === playlist._id
          ? { ...p, videos: alreadyIn ? p.videos.filter((v) => (v._id || v) !== videoId) : [...p.videos, { _id: videoId }] }
          : p
      )
    )

    try {
      if (alreadyIn) {
        await removeVideoFromPlaylist(playlist._id, videoId)
      } else {
        await addVideoToPlaylist(playlist._id, videoId)
      }
    } catch {
      // revert on failure by refetching
      const res = await getUserPlaylists()
      setPlaylists(res.data.data)
    }
  }

  const handleCreateAndAdd = async (e) => {
    e.preventDefault()
    if (!newName.trim()) return

    setCreating(true)
    try {
      const res = await createPlaylist(newName.trim())
      const playlist = res.data.data
      await addVideoToPlaylist(playlist._id, videoId)
      setPlaylists((prev) => [{ ...playlist, videos: [{ _id: videoId }] }, ...prev])
      setNewName('')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border bg-gray-100 hover:bg-gray-200 transition-colors"
      >
        <ListPlus size={16} />
        Save
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-[slideUp_0.18s_ease-out]">
            <div className="px-4 py-3 border-b">
              <p className="font-medium text-sm">Save to...</p>
            </div>

            <div className="max-h-56 overflow-y-auto py-1">
              {loading ? (
                <div className="px-4 py-6 text-center text-sm text-gray-400">Loading...</div>
              ) : playlists.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-gray-400">No playlists yet</div>
              ) : (
                playlists.map((playlist) => {
                  const added = isInPlaylist(playlist)
                  return (
                    <button
                      key={playlist._id}
                      onClick={() => handleToggle(playlist)}
                      className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
                    >
                      <span className="text-sm truncate">{playlist.name}</span>
                      <span
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${
                          added ? 'bg-red-600 border-red-600' : 'border-gray-300'
                        }`}
                      >
                        {added && <Check size={12} className="text-white" strokeWidth={3} />}
                      </span>
                    </button>
                  )
                })
              )}
            </div>

            <form onSubmit={handleCreateAndAdd} className="flex items-center gap-2 p-2.5 border-t bg-gray-50">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="New playlist name"
                className="flex-1 text-sm px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-red-500/30"
              />
              <button
                type="submit"
                disabled={creating || !newName.trim()}
                className="w-9 h-9 rounded-lg bg-red-600 text-white flex items-center justify-center disabled:opacity-40 hover:bg-red-700 transition-colors shrink-0"
              >
                <Plus size={16} />
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  )
}