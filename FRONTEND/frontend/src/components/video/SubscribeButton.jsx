import { useState } from 'react'
import { toggleSubscription } from '../../api/subscriptions'
import { Check, Bell } from 'lucide-react'

export default function SubscribeButton({ channelId, initiallySubscribed }) {
  const [subscribed, setSubscribed] = useState(initiallySubscribed)
  const [busy, setBusy] = useState(false)

  const handleClick = async () => {
    setSubscribed((s) => !s)
    setBusy(true)
    try {
      const res = await toggleSubscription(channelId)
      setSubscribed(res.data.data.subscribed)
    } catch {
      setSubscribed((s) => !s)
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={busy}
      className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 disabled:opacity-50 ${
        subscribed
          ? 'bg-white/[0.06] text-white/70 border border-white/10 hover:bg-white/[0.1]'
          : 'bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white shadow-[0_4px_20px_-6px_rgba(168,85,247,0.6)] hover:shadow-[0_4px_28px_-6px_rgba(168,85,247,0.8)] active:scale-95'
      }`}
    >
      {subscribed ? <Bell size={14} /> : null}
      {subscribed ? 'Subscribed' : 'Subscribe'}
    </button>
  )
}