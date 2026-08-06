import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import axios from 'axios'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const email = searchParams.get('email')

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!token || !email) {
      setError('Invalid or expired reset link')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setSubmitting(true)
    try {
      await axios.post('/api/auth/reset-password', { token, email, newPassword })
      setDone(true)
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid or expired token')
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass =
    'w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-purple-400/40 focus:bg-white/[0.06] transition-all'

  return (
    <div className="min-h-screen app-gradient-bg relative overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 app-starfield -z-10 pointer-events-none" />
      <div className="absolute bottom-[-15%] left-1/2 -translate-x-1/2 w-[36rem] h-[24rem] rounded-full bg-purple-600/20 blur-[130px] -z-10 animate-[float_10s_ease-in-out_infinite]" />

      <div className="w-full max-w-sm mx-4 animate-[slideUp_0.4s_ease-out]">
        <div className="flex items-center gap-2.5 justify-center mb-6">
          <span className="relative w-7 h-7">
            <span className="absolute inset-0 rounded-full bg-purple-500" />
            <span className="absolute top-0 right-0 w-3 h-3 rounded-full bg-purple-300" />
          </span>
          <span className="text-lg font-semibold text-white">TuneX</span>
        </div>

        <div className="relative rounded-3xl p-7 bg-white/[0.04] backdrop-blur-2xl border border-white/10 shadow-[0_20px_80px_-20px_rgba(147,51,234,0.35)]">
          <h1 className="text-2xl font-semibold bg-gradient-to-r from-white via-purple-100 to-purple-300 bg-clip-text text-transparent mb-1">
            Reset password
          </h1>
          <p className="text-sm text-purple-200/40 mb-6">
            {done ? 'Redirecting you to log in...' : 'Choose a new password.'}
          </p>

          {!token || !email ? (
            <div className="text-sm text-red-300 bg-red-500/10 border border-red-400/20 rounded-xl px-3.5 py-2.5">
              This reset link is invalid. Please request a new one.
            </div>
          ) : done ? (
            <div className="text-sm text-green-300 bg-green-500/10 border border-green-400/20 rounded-xl px-3.5 py-2.5 animate-[fadeIn_0.2s_ease-out]">
              Password updated successfully.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {error && (
                <div className="text-sm text-red-300 bg-red-500/10 border border-red-400/20 rounded-xl px-3.5 py-2.5 animate-[fadeIn_0.2s_ease-out]">
                  {error}
                </div>
              )}

              <input
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={inputClass}
                required
              />
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputClass}
                required
              />

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white rounded-xl py-2.5 font-medium shadow-[0_8px_30px_-8px_rgba(168,85,247,0.6)] hover:shadow-[0_8px_40px_-8px_rgba(168,85,247,0.8)] active:scale-[0.98] disabled:opacity-40 disabled:active:scale-100 transition-all"
              >
                {submitting ? 'Updating...' : 'Update password'}
              </button>
            </form>
          )}

          <p className="text-sm text-white/40 text-center mt-5">
            <Link to="/login" className="text-purple-300 hover:text-purple-200 transition-colors">
              Back to log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}