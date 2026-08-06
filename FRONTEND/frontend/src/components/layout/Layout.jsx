import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import ChatWidget from '../agent/ChatWidget'

export default function Layout() {
  return (
    <div className="h-screen flex flex-col app-gradient-bg relative overflow-hidden">
      {/* starfield texture, sits above the gradient, below content */}
      <div className="absolute inset-0 app-starfield -z-10 pointer-events-none" />

      {/* soft floating glow, low in the frame like the reference */}
      <div className="absolute bottom-[-15%] left-1/2 -translate-x-1/2 w-[36rem] h-[24rem] rounded-full bg-purple-600/20 blur-[130px] -z-10 animate-[float_10s_ease-in-out_infinite]" />

      <Navbar />
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
      <ChatWidget />
    </div>
  )
}