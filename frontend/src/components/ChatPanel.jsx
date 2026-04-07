import { useState, useRef, useEffect } from 'react'
import { askQuestion } from '../api/client'

export function ChatPanel({ meetingId = null }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    if (open && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, open])

  // Prevent background scrolling when chat is full-screen on mobile
  useEffect(() => {
    if (open && window.innerWidth <= 480) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [open])

  const send = async () => {
    const q = input.trim()
    if (!q || loading) return
    
    // We keep the message in the UI for the user to see
    const userMsg = { role: 'user', content: q }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    
    try {
      // FIX: We send an empty array [] for history. 
      // This removes the 1,300+ extra tokens I added yesterday.
      // We also ensure meetingId is handled strictly.
      const mid = meetingId || null 
      
      const { data } = await askQuestion(q, mid, []) 

      setMessages(prev => [...prev, { role: 'assistant', content: data.answer }])
    } catch (err) {
      // Detailed logging to help us see if it's still a limit issue
      console.error("Chat Error:", err.response?.data || err.message)
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Milo is struggling with the size of this transcript. Try a more specific question.', 
        error: true 
      }])
    } finally {
      setLoading(false)
    }
  }
  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <>
      {/* Floating Action Button - Hidden when chat is open on mobile */}
      <button
        onClick={() => setOpen(o => !o)}
        title={!open ? "Ask Milo about your meetings" : ""}
        className={`chat-fab ${open ? 'fab-active' : ''}`}
        style={{
          position: 'fixed', bottom: '20px', right: '20px',
          width: '50px', height: '50px', borderRadius: '50%',
          background: open ? 'var(--surface2)' : 'var(--accent)',
          border: open ? '1px solid var(--border)' : 'none',
          color: 'white', fontSize: '20px', cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(79,142,247,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s', zIndex: 1000
        }}
      >
        {open ? '✕' : '💬'}
      </button>

      {open && (
        <div className="chat-panel-box">
          {/* Header */}
          <div style={{
            padding: '14px 16px', borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: '10px',
            background: 'var(--surface)', flexShrink: 0
          }}>
            <div style={{
              width: '30px', height: '30px', borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '14px', flexShrink: 0
            }}>🤖</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-h)', lineHeight: 1 }}>Milo</p>
              <p style={{ fontSize: '11px', color: 'var(--accent2)', marginTop: '2px' }}>
                {meetingId ? 'This meeting' : 'All meetings'}
              </p>
            </div>
            
            {/* Online Indicator (Desktop) / Close Button (Mobile) */}
            <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="mobile-close" onClick={() => setOpen(false)} style={{ cursor: 'pointer', padding: '4px', fontSize: '18px', color: 'var(--text)' }}>✕</div>
                <div className="desktop-status" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)' }} />
                    <span style={{ fontSize: '11px', color: 'var(--success)' }}>Online</span>
                </div>
            </div>
          </div>

          {/* Messages Area */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', padding: '16px 8px' }}>
                <div style={{ fontSize: '28px', marginBottom: '10px' }}>💬</div>
                <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-h)', marginBottom: '6px' }}>Ask me anything</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {[
                    meetingId ? 'What decisions were made?' : 'Summarize all meetings',
                    meetingId ? 'Who has open action items?' : 'Any pending action items?',
                  ].map((s, i) => (
                    <button key={i} onClick={() => setInput(s)} style={{
                      padding: '7px 12px', background: 'var(--surface2)',
                      border: '1px solid var(--border)', borderRadius: '20px',
                      fontSize: '12px', color: 'var(--text)', cursor: 'pointer',
                      textAlign: 'left', fontFamily: 'var(--font)'
                    }}>{s}</button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                {msg.role === 'assistant' && (
                  <div style={{
                    width: '22px', height: '22px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '10px', flexShrink: 0, marginRight: '6px', marginTop: '2px'
                  }}>🤖</div>
                )}
                <div style={{
                  maxWidth: '85%', padding: '9px 12px',
                  borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                  background: msg.role === 'user' ? 'var(--accent)' : msg.error ? 'rgba(244,63,94,0.1)' : 'var(--surface2)',
                  border: msg.role === 'assistant' ? `1px solid ${msg.error ? 'rgba(244,63,94,0.3)' : 'var(--border)'}` : 'none',
                  color: msg.role === 'user' ? 'white' : msg.error ? '#fb7185' : 'var(--text-h)',
                  fontSize: '13px', lineHeight: '1.5', whiteSpace: 'pre-wrap', wordBreak: 'break-word'
                }}>
                  {msg.content}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input Area */}
          <div style={{
            padding: '12px', borderTop: '1px solid var(--border)',
            display: 'flex', gap: '8px', alignItems: 'flex-end', flexShrink: 0,
            background: 'var(--surface)', paddingBottom: 'env(safe-area-inset-bottom, 12px)'
          }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask Milo..."
              rows={1}
              style={{
                flex: 1, padding: '10px 12px', background: 'var(--surface2)',
                border: '1px solid var(--border)', borderRadius: '12px',
                color: 'var(--text-h)', fontSize: '14px', resize: 'none',
                fontFamily: 'var(--font)', lineHeight: '1.4',
                maxHeight: '120px', overflowY: 'auto', outline: 'none'
              }}
            />
            <button
              onClick={send}
              disabled={!input.trim() || loading}
              style={{
                width: '38px', height: '38px', borderRadius: '12px', flexShrink: 0,
                background: input.trim() && !loading ? 'var(--accent)' : 'var(--surface2)',
                border: 'none', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', fontSize: '16px'
              }}
            >↑</button>
          </div>
        </div>
      )}

      <style>{`
        .chat-panel-box {
          position: fixed;
          bottom: 80px;
          right: 20px;
          width: 360px;
          height: 500px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.5);
          display: flex;
          flex-direction: column;
          z-index: 999;
          animation: fadeUp 0.2s ease;
          overflow: hidden;
        }

        .mobile-close { display: none; }

        @media (max-width: 480px) {
          .chat-fab.fab-active {
            display: none !important; /* Hide floating icon when chat is open on mobile */
          }
          
          .chat-panel-box {
            bottom: 0 !important;
            right: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            border-radius: 0 !important;
            border: none !important;
            z-index: 2000;
          }

          .mobile-close { 
            display: flex !important; 
            align-items: center;
            justify-content: center;
          }

          .desktop-status { display: none !important; }

          @keyframes fadeUp {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }
        }

        @keyframes chatbounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-4px); opacity: 1; }
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  )
}