import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle, X, Send, Sparkles } from 'lucide-react'
import { chatWithAgent } from '../../api/agent'

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([]) // {role, text, videos?, channels?, isRateLimit?}
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, loading])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', text: userMessage }])
    setLoading(true)

    try {
      const res = await chatWithAgent(userMessage, history)
      const { reply, videos, channels, history: newHistory } = res.data.data
      setMessages((prev) => [...prev, { role: 'assistant', text: reply, videos, channels }])
      setHistory(newHistory)
    } catch (err) {
      const isRateLimit = err.response?.status === 429
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: isRateLimit
            ? '⏳ FREE CREDITS EXPIRED. Please wait 30-40 seconds and try again.'
            : 'Sorry, something went wrong.',
          isRateLimit,
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500 shadow-[0_8px_30px_-6px_rgba(168,85,247,0.6)] flex items-center justify-center hover:shadow-[0_8px_40px_-6px_rgba(168,85,247,0.8)] active:scale-95 transition-all"
      >
        {open ? <X size={22} className="text-white" /> : <MessageCircle size={22} className="text-white" />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-40 w-[22rem] h-[32rem] rounded-3xl bg-[#0c0714]/95 backdrop-blur-2xl border border-white/10 shadow-[0_20px_80px_-20px_rgba(147,51,234,0.5)] flex flex-col overflow-hidden animate-[slideUp_0.25s_ease-out]">
          <div className="flex items-center gap-2 px-4 py-3.5 border-b border-white/10">
            <Sparkles size={16} className="text-purple-300" />
            <span className="text-sm font-medium text-white">TuneX Assistant</span>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.length === 0 && (
              <p className="text-sm text-white/30 text-center mt-8">
                Ask me to find videos, channels, or how to use the app.
              </p>
            )}

            {messages.map((m, i) => (
              <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm ${
                    m.role === 'user'
                      ? 'bg-purple-500/20 text-purple-100 border border-purple-400/20'
                      : m.isRateLimit
                      ? 'bg-amber-500/10 text-amber-200 border border-amber-400/30'
                      : 'bg-white/[0.05] text-white/80 border border-white/10'
                  }`}
                >
                  <p>{m.text}</p>

                  {m.videos?.length > 0 && (
                    <div className="mt-2 space-y-1.5">
                      {m.videos.map((v) => (
                        <Link
                          key={v._id}
                          to={`/watch/${v._id}`}
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-2 bg-white/[0.04] hover:bg-white/[0.08] rounded-lg p-1.5 transition-colors"
                        >
                          <img src={v.thumbnail} className="w-12 h-8 object-cover rounded shrink-0" />
                          <span className="text-xs text-white/80 truncate">{v.title}</span>
                        </Link>
                      ))}
                    </div>
                  )}

                  {m.channels?.length > 0 && (
                    <div className="mt-2 space-y-1.5">
                      {m.channels.map((c) => (
                        <Link
                          key={c._id}
                          to={`/channel/${c.username}`}
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-2 bg-white/[0.04] hover:bg-white/[0.08] rounded-lg p-1.5 transition-colors"
                        >
                          <img src={c.avatar} className="w-6 h-6 rounded-full object-cover shrink-0" />
                          <span className="text-xs text-white/80">@{c.username}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white/[0.05] border border-white/10 rounded-2xl px-3.5 py-2.5 flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-300 animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-300 animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-300 animate-bounce" />
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSend} className="flex items-center gap-2 p-3 border-t border-white/10">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask something..."
              className="flex-1 bg-white/[0.04] border border-white/10 rounded-full px-3.5 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-purple-400/40 transition-all"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="w-9 h-9 rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500 flex items-center justify-center disabled:opacity-40 transition-all shrink-0"
            >
              <Send size={15} className="text-white" />
            </button>
          </form>
        </div>
      )}
    </>
  )
}