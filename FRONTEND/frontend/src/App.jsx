import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Search from './pages/Search'
import Home from './pages/Home'
import Watch from './pages/Watch'
import Subscriptions from './pages/Subscriptions'
import Channel from './pages/Channel'
import Dashboard from './pages/Dashboard'
import Upload from './pages/Upload'
import Playlists from './pages/Playlists'
import PlaylistDetail from './pages/PlaylistDetail'
import Settings from './pages/Settings'
import WatchHistory from './pages/WatchHistory'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/watch/:videoId" element={<Watch />} />
          <Route path="/subscriptions" element={<Subscriptions />} />
          <Route path="/channel/:username" element={<Channel />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/search" element={<Search />} />
          <Route path="/playlists" element={<Playlists />} />
          <Route path="/history" element={<WatchHistory />} />
          <Route path="/playlist/:playlistId" element={<PlaylistDetail />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App