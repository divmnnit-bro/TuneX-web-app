import { NavLink } from 'react-router-dom'
import { Home, Users, ListVideo, History } from 'lucide-react'

const links = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/subscriptions', label: 'Subscriptions', icon: Users },
  { to: '/playlists', label: 'Playlists', icon: ListVideo },
  { to: '/history', label: 'History', icon: History },
]

export default function Sidebar() {
  return (
    <aside className="w-56 shrink-0 py-5 border-r border-white/5">
      {links.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'} // end={true} means check whether full path matches, not just the prefix and then alter isActive accordingly
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2.5 text-sm rounded-xl mx-2.5 mb-1 transition-all duration-200 ${
              isActive
                ? 'bg-purple-500/15 text-white border border-purple-400/20'
                : 'text-white/40 hover:bg-white/[0.04] hover:text-white/70'
            }`
          }
        >
          <Icon size={18} />
          {label}
        </NavLink>
      ))}
    </aside>
  )
}