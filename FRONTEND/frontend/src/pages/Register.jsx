import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { registerUser } from '../api/users'
import { Upload, Check } from 'lucide-react'

export default function Register() {
  const [form, setForm] = useState({ fullname: '', email: '', username: '', password: '' })
  const [avatar, setAvatar] = useState(null)
  const [coverImage, setCoverImage] = useState(null)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const usernameRegex = /^[a-zA-Z0-9]+$/
    if (!usernameRegex.test(form.username)) {
      setError('Username can only contain letters and numbers')
      return
    }

    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/
    if (!gmailRegex.test(form.email)) {
      setError('Email must be a valid @gmail.com address')
      return
    }

    if (!avatar) {
      setError('Avatar image is required')
      return
    }

    setSubmitting(true)
    try {
      const formData = new FormData()
      Object.entries(form).forEach(([key, value]) => formData.append(key, value))
      formData.append('avatar', avatar)
      if (coverImage) formData.append('coverImage', coverImage)

      await registerUser(formData)
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass =
    'w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-purple-400/40 focus:bg-white/[0.06] transition-all'

  return (
    <div className="min-h-screen app-gradient-bg relative overflow-hidden flex items-center justify-center py-10">
      {/* starfield + ambient glow, same system as the rest of the app */}
      <div className="absolute inset-0 app-starfield -z-10 pointer-events-none" />
      <div className="absolute bottom-[-15%] left-1/2 -translate-x-1/2 w-[36rem] h-[24rem] rounded-full bg-purple-600/20 blur-[130px] -z-10 animate-[float_10s_ease-in-out_infinite]" />

      <div className="w-full max-w-sm mx-4 animate-[slideUp_0.4s_ease-out]">
        {/* logo */}
        <div className="flex items-center gap-2.5 justify-center mb-6">
          <span className="relative w-7 h-7">
            <span className="absolute inset-0 rounded-full bg-purple-500" />
            <span className="absolute top-0 right-0 w-3 h-3 rounded-full bg-purple-300" />
          </span>
          <span className="text-lg font-semibold text-white">TuneX</span>
        </div>

        <div className="relative rounded-3xl p-7 bg-white/[0.04] backdrop-blur-2xl border border-white/10 shadow-[0_20px_80px_-20px_rgba(147,51,234,0.35)]">
          <h1 className="text-2xl font-semibold bg-gradient-to-r from-white via-purple-100 to-purple-300 bg-clip-text text-transparent mb-1">
            Create account
          </h1>
          <p className="text-sm text-purple-200/40 mb-6">Join and start sharing your videos.</p>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {error && (
              <div className="text-sm text-red-300 bg-red-500/10 border border-red-400/20 rounded-xl px-3.5 py-2.5 animate-[fadeIn_0.2s_ease-out]">
                {error}
              </div>
            )}

            <input
              name="fullname"
              placeholder="Full name"
              value={form.fullname}
              onChange={handleChange}
              className={inputClass}
              required
            />
            <div>
              <input
                name="username"
                placeholder="Username"
                value={form.username}
                onChange={handleChange}
                className={inputClass}
                required
              />
              <p className="text-xs text-white/30 mt-1 ml-1">Letters and numbers only, no spaces or symbols</p>
            </div>
            <div>
              <input
                name="email"
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                className={inputClass}
                required
              />
              <p className="text-xs text-white/30 mt-1 ml-1">Must be a @gmail.com address</p>
            </div>
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className={inputClass}
              required
            />

            {/* Avatar upload */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-purple-300/60 mb-1.5 block">
                Avatar <span className="text-purple-400/50 normal-case font-normal">(required)</span>
              </label>
              <label className="flex items-center gap-2.5 w-full bg-white/[0.04] border border-dashed border-white/15 rounded-xl px-4 py-2.5 text-sm cursor-pointer hover:border-purple-400/40 hover:bg-white/[0.06] transition-all">
                {avatar ? (
                  <Check size={16} className="text-purple-300 shrink-0" />
                ) : (
                  <Upload size={16} className="text-white/30 shrink-0" />
                )}
                <span className={avatar ? 'text-white truncate' : 'text-white/30'}>
                  {avatar ? avatar.name : 'Choose a file'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setAvatar(e.target.files[0])}
                  className="hidden"
                  required
                />
              </label>
            </div>

            {/* Cover image upload */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-purple-300/60 mb-1.5 block">
                Cover image <span className="text-purple-400/50 normal-case font-normal">(optional)</span>
              </label>
              <label className="flex items-center gap-2.5 w-full bg-white/[0.04] border border-dashed border-white/15 rounded-xl px-4 py-2.5 text-sm cursor-pointer hover:border-purple-400/40 hover:bg-white/[0.06] transition-all">
                {coverImage ? (
                  <Check size={16} className="text-purple-300 shrink-0" />
                ) : (
                  <Upload size={16} className="text-white/30 shrink-0" />
                )}
                <span className={coverImage ? 'text-white truncate' : 'text-white/30'}>
                  {coverImage ? coverImage.name : 'Choose a file'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCoverImage(e.target.files[0])}
                  className="hidden"
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white rounded-xl py-2.5 font-medium shadow-[0_8px_30px_-8px_rgba(168,85,247,0.6)] hover:shadow-[0_8px_40px_-8px_rgba(168,85,247,0.8)] active:scale-[0.98] disabled:opacity-40 disabled:active:scale-100 transition-all"
            >
              {submitting ? 'Creating account...' : 'Register'}
            </button>
          </form>

          <p className="text-sm text-white/40 text-center mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-purple-300 hover:text-purple-200 transition-colors">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}