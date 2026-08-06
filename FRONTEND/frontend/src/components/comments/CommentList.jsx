import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { editComment, deleteComment } from '../../api/comments'
import { Pencil, Trash2, Check, X } from 'lucide-react'

export default function CommentList({ comments, onCommentUpdated, onCommentDeleted }) {
  const { user } = useAuth()
  const [editingId, setEditingId] = useState(null)
  const [editContent, setEditContent] = useState('')
  const [busyId, setBusyId] = useState(null)

  if (!comments?.length) {
    return <p className="text-sm text-purple-200/50">No comments yet. Be the first!</p>
  }

  const startEdit = (comment) => {
    setEditingId(comment._id)
    setEditContent(comment.content)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditContent('')
  }

  const saveEdit = async (commentId) => {
    if (!editContent.trim()) return
    setBusyId(commentId)
    try {
      const res = await editComment(commentId, editContent)
      onCommentUpdated(commentId, res.data.data.content ?? editContent)
      setEditingId(null)
      setEditContent('')
    } finally {
      setBusyId(null)
    }
  }

  const handleDelete = async (commentId) => {
    setBusyId(commentId)
    try {
      await deleteComment(commentId)
      onCommentDeleted(commentId)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {comments.map((comment) => {
        const isOwn = comment.owner?._id === user?._id
        const isEditing = editingId === comment._id

        return (
          <div key={comment._id} className="flex gap-3 group">
            <img
              src={comment.owner?.avatar}
              alt={comment.owner?.username}
              className="w-9 h-9 rounded-full object-cover shrink-0"
            />
            <div className="flex-1">
              <p className="text-xs font-medium text-purple-200/70">@{comment.owner?.username}</p>

              {isEditing ? (
                <div className="flex items-center gap-2 mt-1">
                  <input
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="flex-1 bg-white/[0.04] border border-white/10 rounded-full px-3 py-1.5 text-sm text-white focus:outline-none focus:border-purple-400/40"
                    autoFocus
                  />
                  <button
                    onClick={() => saveEdit(comment._id)}
                    disabled={busyId === comment._id || !editContent.trim()}
                    className="text-green-400 hover:text-green-300 disabled:opacity-30"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={cancelEdit}
                    disabled={busyId === comment._id}
                    className="text-white/40 hover:text-white/70"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 mt-0.5">
                  {/* Changed text-gray-700 to light text */}
                  <p className="text-sm text-purple-100/90">{comment.content}</p>

                  {isOwn && (
                    <div className="hidden group-hover:flex items-center gap-2 ml-1">
                      <button
                        onClick={() => startEdit(comment)}
                        className="text-white/30 hover:text-purple-300"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(comment._id)}
                        disabled={busyId === comment._id}
                        className="text-white/30 hover:text-red-400 disabled:opacity-30"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}