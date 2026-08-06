import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { updateAccountDetails, updateAvatar, updateCoverImage } from '../api/users'
import { Camera, Check } from 'lucide-react'

function SectionCard({ title, description, children }) {
  return (
    <div className="rounded-2xl p-6 bg-white/[0.04] backdrop-blur-xl border border-white/10 animate-[slideUp_0.4s_ease-out_backwards]">
      <h2 className="text-white font-medium">{title}</h2>
      <p className="text-sm text-white/40 mt-0.5 mb-5">{description}</p>
      {children}
    </div>
  )
}

export default function Settings() {
  const { user, refetchUser } = useAuth()

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-[fadeIn_0.4s_ease-out]">
      <div className="mb-2">
        <h1 className="text-xl font-semibold bg-gradient-to-r from-white via-purple-100 to-purple-300 bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-sm text-white/30 mt-1">Manage your profile and account details.</p>
      </div>

      <CoverImageSection user={user} refetchUser={refetchUser} />
      <AvatarSection user={user} refetchUser={refetchUser} />
      <AccountDetailsSection user={user} refetchUser={refetchUser} />
    </div>
  )
}

function CoverImageSection({ user, refetchUser }) {
  const [preview, setPreview] = useState(null)
  const [file, setFile] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleFileChange = (e) => {
    const selected = e.target.files[0]
    
    if (!selected) return
    setFile(selected)
    setPreview(URL.createObjectURL(selected))
    setSuccess(false)
  }

  const handleSave = async () => {
    if (!file) return
    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('coverImage', file)
      await updateCoverImage(formData)
      await refetchUser()
      setSuccess(true)
      setFile(null)
    } finally {-
      setSubmitting(false)
    }
  }

  return (
    <SectionCard title="Cover image" description="Shown at the top of your channel page.">
      <div className="relative h-32 rounded-xl overflow-hidden bg-gradient-to-br from-purple-900/40 to-fuchsia-900/20 border border-white/10 group">
        <img
          src={preview || user?.coverImage}
          alt="cover"
          className="w-full h-full object-cover"
        />
        <label className="absolute inset-0 bg-black/0 group-hover:bg-black/50 flex items-center justify-center cursor-pointer transition-colors">
          <span className="opacity-0 group-hover:opacity-100 flex items-center gap-2 text-sm text-white transition-opacity">
            <Camera size={16} /> Change cover
          </span>
          <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        </label>
      </div>

      {file && (
        <div className="flex items-center gap-3 mt-3 animate-[fadeIn_0.2s_ease-out]">
          <button
            onClick={handleSave}
            disabled={submitting}
            className="text-sm font-medium px-4 py-2 rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white disabled:opacity-40 transition-all"
          >
            {submitting ? 'Saving...' : 'Save cover image'}
          </button>
          <button
            onClick={() => { setFile(null); setPreview(null) }}
            className="text-sm text-white/40 hover:text-white/70 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
      {success && (
        <p className="text-sm text-green-400 flex items-center gap-1.5 mt-3 animate-[fadeIn_0.2s_ease-out]">
          <Check size={14} /> Cover image updated
        </p>
      )}
    </SectionCard>
  )
}

function AvatarSection({ user, refetchUser }) {
  const [preview, setPreview] = useState(null)
  const [file, setFile] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleFileChange = (e) => {
    const selected = e.target.files[0]
    if (!selected) return
    setFile(selected)
    setPreview(URL.createObjectURL(selected))
    setSuccess(false)
  }

  const handleSave = async () => {
    if (!file) return
    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('avatar', file)
      await updateAvatar(formData)
      await refetchUser()
      setSuccess(true)
      setFile(null)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <SectionCard title="Avatar" description="Your profile picture across the app.">
      <div className="flex items-center gap-5">
        <div className="relative group">
          <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-purple-500 to-fuchsia-500 opacity-70 blur-[3px]" />
          <img
            src={preview || user?.avatar}
            alt={user?.username}
            className="relative w-20 h-20 rounded-full object-cover ring-4 ring-[#0a0416]"
          />
          <label className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/50 flex items-center justify-center cursor-pointer transition-colors">
            <Camera size={18} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </label>
        </div>

        <div>
          {file ? (
            <div className="flex items-center gap-3 animate-[fadeIn_0.2s_ease-out]">
              <button
                onClick={handleSave}
                disabled={submitting}
                className="text-sm font-medium px-4 py-2 rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white disabled:opacity-40 transition-all"
              >
                {submitting ? 'Saving...' : 'Save avatar'}
              </button>
              <button
                onClick={() => { setFile(null); setPreview(null) }}
                className="text-sm text-white/40 hover:text-white/70 transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : success ? (
            <p className="text-sm text-green-400 flex items-center gap-1.5 animate-[fadeIn_0.2s_ease-out]">
              <Check size={14} /> Avatar updated
            </p>
          ) : (
            <p className="text-sm text-white/30">Hover your photo to change it</p>
          )}
        </div>
      </div>
    </SectionCard>
  )
}

function AccountDetailsSection({ user, refetchUser }) {
  const [fullname, setFullname] = useState(user?.fullname || '')
  const [email, setEmail] = useState(user?.email || '')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const inputClass =
    'w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-purple-400/40 focus:bg-white/[0.06] transition-all'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setSubmitting(true)
    try {
      await updateAccountDetails(fullname, email)
      await refetchUser()
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update details')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <SectionCard title="Account details" description="Your name and email address.">
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {error && (
          <div className="text-sm text-red-300 bg-red-500/10 border border-red-400/20 rounded-xl px-3.5 py-2.5">
            {error}
          </div>
        )}

        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-purple-300/60 mb-1.5 block">
            Full name
          </label>
          <input
            value={fullname}
            onChange={(e) => setFullname(e.target.value)}
            className={inputClass}
          />
        </div>
        
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-purple-300/60 mb-1.5 block">
          </label>
          <p className="text-sm text-white/30">
            Username and email can't be changed!
          </p>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={submitting}
            className="text-sm font-medium px-4 py-2 rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white disabled:opacity-40 transition-all"
          >
            {submitting ? 'Saving...' : 'Save changes'}
          </button>
          {success && (
            <p className="text-sm text-green-400 flex items-center gap-1.5 animate-[fadeIn_0.2s_ease-out]">
              <Check size={14} /> Saved
            </p>
          )}
        </div>
      </form>
    </SectionCard>
  )
}