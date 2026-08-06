import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Search } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (!searchInput.trim()) return
    navigate(`/search?query=${encodeURIComponent(searchInput.trim())}`)
  }

  return (
    <nav className="h-16 flex items-center justify-between gap-6 px-6 shrink-0 border-b border-white/5">
      <Link to="/" className="flex items-center gap-2.5 shrink-0">
        <span className="relative w-7 h-7">
          <span className="absolute inset-0 rounded-full bg-purple-500" />
          <span className="absolute top-0 right-0 w-3 h-3 rounded-full bg-purple-300" />
        </span>
        <span className="text-lg font-semibold text-white hidden sm:inline">TuneX</span>
      </Link>

      <form onSubmit={handleSearch} className="flex-1 max-w-xl">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search videos..."
            className="w-full bg-white/[0.04] border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-purple-400/40 focus:bg-white/[0.06] transition-all"
          />
        </div>
      </form>

      <div className="flex items-center gap-4 shrink-0">
        <Link
          to="/upload"
          className="text-sm font-medium px-4 py-2 rounded-full text-white/70 border border-white/10 hover:border-white/25 hover:text-white transition-all"
        >
          Upload
        </Link>

        <div className="relative">
          <button onClick={() => setMenuOpen((o) => !o)}>
            <img
              src={user?.avatar}
              alt={user?.username}
              className="w-9 h-9 rounded-full object-cover ring-1 ring-white/15"
            />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-3 w-52 rounded-2xl bg-[#0c0714]/95 backdrop-blur-xl border border-white/10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] py-1.5 z-20 animate-[slideUp_0.15s_ease-out]">
              <Link
                to={`/channel/${user?.username}`}
                className="block px-4 py-2.5 text-sm text-white/70 hover:bg-white/[0.06] hover:text-white transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Your channel
              </Link>
              <Link
                to="/dashboard"
                className="block px-4 py-2.5 text-sm text-white/70 hover:bg-white/[0.06] hover:text-white transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                to="/settings"
                className="block px-4 py-2.5 text-sm text-white/70 hover:bg-white/[0.06] hover:text-white transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Settings
              </Link>
              <div className="h-px bg-white/10 my-1" />
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 text-sm text-red-300 hover:bg-red-500/10 transition-colors"
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}