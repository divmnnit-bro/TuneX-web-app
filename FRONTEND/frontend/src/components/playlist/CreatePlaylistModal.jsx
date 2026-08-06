import { useState, useEffect } from 'react'
import { X, ListPlus } from 'lucide-react'
import { createPlaylist } from '../../api/playlists'

export default function CreatePlaylistModal({ open, onClose, onCreated }) {
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setName('')
      setError('')
    }
  }, [open])

  if (!open) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return

    setSubmitting(true)
    setError('')
    try {
      const res = await createPlaylist(name.trim())
      onCreated(res.data.data)
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create playlist')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 animate-[slideUp_0.25s_cubic-bezier(0.16,1,0.3,1)]"
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center">
              <ListPlus size={18} className="text-red-600" />
            </div>
            <h2 className="font-semibold text-lg">New playlist</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Watch later, Favorites..."
            className="w-full border rounded-xl px-3.5 py-2.5 mb-5 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition-all"
          />

          <button
            type="submit"
            disabled={submitting || !name.trim()}
            className="w-full bg-red-600 text-white rounded-xl py-2.5 font-medium disabled:opacity-40 hover:bg-red-700 active:scale-[0.98] transition-all"
          >
            {submitting ? 'Creating...' : 'Create playlist'}
          </button>
        </form>
      </div>
    </div>
  )
}