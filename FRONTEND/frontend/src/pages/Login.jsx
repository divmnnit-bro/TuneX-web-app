import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login({
        email: identifier,
        username: identifier,
        password,
      })
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass =
    'w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-purple-400/40 focus:bg-white/[0.06] transition-all'

  return (
    <div className="min-h-screen app-gradient-bg relative overflow-hidden flex items-center justify-center">
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
            Welcome back
          </h1>
          <p className="text-sm text-purple-200/40 mb-6">Log in to keep watching.</p>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {error && (
              <div className="text-sm text-red-300 bg-red-500/10 border border-red-400/20 rounded-xl px-3.5 py-2.5 animate-[fadeIn_0.2s_ease-out]">
                {error}
              </div>
            )}

            <input
              type="text"
              placeholder="Username or Email"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className={inputClass}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              required
            />

            <div className="text-right -mt-1">
              <Link
                to="/forgot-password"
                className="text-xs text-purple-300/70 hover:text-purple-200 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white rounded-xl py-2.5 font-medium shadow-[0_8px_30px_-8px_rgba(168,85,247,0.6)] hover:shadow-[0_8px_40px_-8px_rgba(168,85,247,0.8)] active:scale-[0.98] disabled:opacity-40 disabled:active:scale-100 transition-all"
            >
              {submitting ? 'Logging in...' : 'Log in'}
            </button>
          </form>

          <p className="text-sm text-white/40 text-center mt-5">
            No account?{' '}
            <Link to="/register" className="text-purple-300 hover:text-purple-200 transition-colors">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}