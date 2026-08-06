import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { uploadVideo } from '../api/videos'
import { UploadCloud, Image as ImageIcon, Video, X, Loader2 } from 'lucide-react'

export default function Upload() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [videoFile, setVideoFile] = useState(null)
  const [thumbnail, setThumbnail] = useState(null)
  const [thumbPreview, setThumbPreview] = useState(null)
  const [progress, setProgress] = useState(0)
  const [phase, setPhase] = useState('idle') // idle | uploading | processing | error
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const videoInputRef = useRef(null)
  const thumbInputRef = useRef(null)

  const submitting = phase === 'uploading' || phase === 'processing'

  const handleThumbChange = (file) => {
    setThumbnail(file)
    if (file) setThumbPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!videoFile || !thumbnail) {
      setError('Both a video file and a thumbnail are required')
      return
    }

    setPhase('uploading')
    setProgress(0)

    try {
      const formData = new FormData()
      formData.append('title', title)
      formData.append('description', description)
      formData.append('video', videoFile)
      formData.append('thumbnail', thumbnail)

      const res = await uploadVideo(formData, (event) => {
        const percent = Math.round((event.loaded * 100) / event.total)
        setProgress(percent)
        if (percent >= 100) setPhase('processing')
      })

      const newVideo = res?.data?.data || res?.data || res
      if (newVideo._id) navigate(`/watch/${newVideo._id}`)
    } catch (err) {
      console.log('UPLOAD ERROR - full object:', err)
      if (!err.response) {
        setError(
          `Connection lost during upload (${err.message}). The video may have actually uploaded — check your Dashboard before trying again.`
        )
      } else {
        setError(err.response.data?.message || 'Upload failed')
      }
      setPhase('error')
    }
  }

  const buttonLabel =
    phase === 'uploading'
      ? `Uploading... ${progress}%`
      : phase === 'processing'
      ? 'Processing video...'
      : 'Publish'

  return (
    <div className="max-w-2xl mx-auto animate-[fadeIn_0.4s_ease-out]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8 animate-[slideUp_0.4s_ease-out]">
        <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-400/20 flex items-center justify-center">
          <UploadCloud size={18} className="text-purple-300" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-white">Upload a video</h1>
          <p className="text-sm text-white/30">Share something with the world</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-400/20 text-red-300 text-sm animate-[slideUp_0.3s_ease-out]">
            {error}
          </div>
        )}

        {/* File drop zones */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-[slideUp_0.4s_ease-out_0.05s_backwards]">
          {/* Video file */}
          <label
            className="relative flex flex-col items-center justify-center gap-2 h-40 rounded-2xl bg-white/[0.03] border border-dashed border-white/15 hover:border-purple-400/40 hover:bg-white/[0.05] transition-all cursor-pointer group overflow-hidden"
          >
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              onChange={(e) => setVideoFile(e.target.files[0])}
              className="hidden"
              required
            />
            {videoFile ? (
              <>
                <Video size={22} className="text-purple-300" />
                <p className="text-xs text-white/70 px-4 text-center truncate max-w-full">{videoFile.name}</p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    setVideoFile(null)
                    if (videoInputRef.current) videoInputRef.current.value = ''
                  }}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/40 flex items-center justify-center text-white/60 hover:text-white hover:bg-black/60"
                >
                  <X size={12} />
                </button>
              </>
            ) : (
              <>
                <div className="w-10 h-10 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center group-hover:border-purple-400/30 transition-all">
                  <Video size={18} className="text-white/40 group-hover:text-purple-300 transition-colors" />
                </div>
                <p className="text-sm text-white/50">Video file</p>
                <p className="text-xs text-white/25">Click to browse</p>
              </>
            )}
          </label>

          {/* Thumbnail */}
          <label
            className="relative flex flex-col items-center justify-center gap-2 h-40 rounded-2xl bg-white/[0.03] border border-dashed border-white/15 hover:border-purple-400/40 hover:bg-white/[0.05] transition-all cursor-pointer group overflow-hidden"
          >
            <input
              ref={thumbInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleThumbChange(e.target.files[0])}
              className="hidden"
              required
            />
            {thumbPreview ? (
              <>
                <img src={thumbPreview} alt="Thumbnail preview" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40" />
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    setThumbnail(null)
                    setThumbPreview(null)
                    if (thumbInputRef.current) thumbInputRef.current.value = ''
                  }}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center text-white/70 hover:text-white hover:bg-black/70 z-10"
                >
                  <X size={12} />
                </button>
              </>
            ) : (
              <>
                <div className="w-10 h-10 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center group-hover:border-purple-400/30 transition-all">
                  <ImageIcon size={18} className="text-white/40 group-hover:text-purple-300 transition-colors" />
                </div>
                <p className="text-sm text-white/50">Thumbnail</p>
                <p className="text-xs text-white/25">Click to browse</p>
              </>
            )}
          </label>
        </div>

        {/* Title + description card */}
        <div className="p-5 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 space-y-4 animate-[slideUp_0.4s_ease-out_0.1s_backwards]">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-purple-300/60 mb-2">
              Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your video a title"
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-purple-400/40 focus:bg-white/[0.06] transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-purple-300/60 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Tell viewers about your video"
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-purple-400/40 focus:bg-white/[0.06] transition-all resize-none"
              required
            />
          </div>
        </div>

        {/* Progress */}
        {submitting && (
          <div className="p-4 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 animate-[slideUp_0.3s_ease-out]">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                {phase === 'processing' ? (
                  <Loader2 size={14} className="text-purple-300 animate-spin" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_8px_2px_rgba(168,85,247,0.6)] animate-pulse" />
                )}
                <p className="text-xs text-purple-200/60 font-medium">
                  {phase === 'processing' ? 'Transcoding & saving...' : 'Uploading...'}
                </p>
              </div>
              {phase === 'uploading' && (
                <p className="text-xs text-purple-300 font-medium">{progress}%</p>
              )}
            </div>
            <div className="w-full bg-white/[0.06] rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  phase === 'processing'
                    ? 'bg-gradient-to-r from-purple-500 to-fuchsia-500 animate-pulse w-full'
                    : 'bg-gradient-to-r from-purple-500 to-fuchsia-400 shadow-[0_0_10px_1px_rgba(168,85,247,0.5)]'
                }`}
                style={phase === 'uploading' ? { width: `${progress}%` } : undefined}
              />
            </div>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full relative rounded-xl py-3 font-medium text-white overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed transition-all group"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-purple-600 to-fuchsia-600 group-hover:from-purple-500 group-hover:to-fuchsia-500 transition-all" />
          <span className="absolute inset-0 shadow-[0_0_25px_-5px_rgba(168,85,247,0.6)]" />
          <span className="relative flex items-center justify-center gap-2">
            {submitting && <Loader2 size={15} className="animate-spin" />}
            {buttonLabel}
          </span>
        </button>
      </form>
    </div>
  )
}