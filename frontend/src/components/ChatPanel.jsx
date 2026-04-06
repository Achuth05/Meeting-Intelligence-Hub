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

  const send = async () => {
    const q = input.trim()
    if (!q || loading) return
    const userMsg = { role: 'user', content: q }
    const history = messages.map(m => ({ role: m.role, content: m.content }))
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    try {
      const { data } = await askQuestion(q, meetingId, history)
      setMessages(prev => [...prev, { role: 'assistant', content: data.answer }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong.', error: true }])
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <>
      <button
        onClick={() => setOpen(o => !o)}
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
              <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-h)', lineHeight: 1 }}>MeetCognit AI</p>
              <p style={{ fontSize: '11px', color: 'var(--accent2)', marginTop: '2px' }}>
                {meetingId ? 'This meeting' : 'All meetings'} · Ask anything
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)' }} />
              <span style={{ fontSize: '11px', color: 'var(--success)' }}>Online</span>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', padding: '16px 8px' }}>
                <div style={{ fontSize: '28px', marginBottom: '10px' }}>💬</div>
                <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-h)', marginBottom: '6px' }}>Ask me anything</p>
                <p style={{ fontSize: '12px', color: 'var(--text)', lineHeight: '1.6', marginBottom: '14px' }}>
                  {meetingId ? 'Ask about this meeting' : 'Ask across all your meetings'}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {[
                    meetingId ? 'What decisions were made?' : 'Summarize all meetings',
                    meetingId ? 'Who has open action items?' : 'Any pending action items?',
                    meetingId ? 'What was the main concern?' : 'What happened last week?',
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
                  maxWidth: '80%', padding: '9px 12px',
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

            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '22px', height: '22px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px'
                }}>🤖</div>
                <div style={{
                  padding: '9px 12px', background: 'var(--surface2)',
                  border: '1px solid var(--border)', borderRadius: '14px 14px 14px 4px',
                  display: 'flex', gap: '4px', alignItems: 'center'
                }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{
                      width: '5px', height: '5px', borderRadius: '50%',
                      background: 'var(--accent)', opacity: 0.6,
                      animation: `chatbounce 1s ease ${i * 0.15}s infinite`
                    }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div style={{
            padding: '10px 12px', borderTop: '1px solid var(--border)',
            display: 'flex', gap: '8px', alignItems: 'flex-end', flexShrink: 0
          }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask a question..."
              rows={1}
              style={{
                flex: 1, padding: '8px 12px', background: 'var(--surface2)',
                border: '1px solid var(--border)', borderRadius: '10px',
                color: 'var(--text-h)', fontSize: '13px', resize: 'none',
                fontFamily: 'var(--font)', lineHeight: '1.5',
                maxHeight: '80px', overflowY: 'auto', outline: 'none'
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            <button
              onClick={send}
              disabled={!input.trim() || loading}
              style={{
                width: '34px', height: '34px', borderRadius: '10px', flexShrink: 0,
                background: input.trim() && !loading ? 'var(--accent)' : 'var(--surface2)',
                border: '1px solid var(--border)', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                fontSize: '14px', transition: 'all 0.15s'
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
        @media (max-width: 480px) {
          .chat-panel-box {
            bottom: 0;
            right: 0;
            left: 0;
            width: 100%;
            height: 85vh;
            border-radius: 16px 16px 0 0;
            border-bottom: none;
          }
        }
        @keyframes chatbounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </>
  )
}