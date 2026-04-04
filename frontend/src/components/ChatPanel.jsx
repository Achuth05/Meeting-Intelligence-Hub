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
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }))
      const { data } = await askQuestion(q, meetingId, history)
      setMessages(prev => [...prev, { role: 'assistant', content: data.answer }])
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, something went wrong. Please try again.',
        error: true
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <>
      {/* Floating bubble */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'fixed', bottom: '28px', right: '28px',
          width: '52px', height: '52px', borderRadius: '50%',
          background: open ? 'var(--surface2)' : 'var(--accent)',
          border: open ? '1px solid var(--border)' : 'none',
          color: 'white', fontSize: '22px', cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(79,142,247,0.35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s', zIndex: 1000
        }}
        title={open ? 'Close chat' : 'Ask Milo about your meetings'}
      >
        {open ? '✕' : '💬'}
      </button>

      {/* Chat panel */}
      {open && (
        <div style={{
          position: 'fixed', bottom: '92px', right: '28px',
          width: '380px', height: '520px',
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          display: 'flex', flexDirection: 'column',
          zIndex: 999, animation: 'fadeUp 0.2s ease',
          overflow: 'hidden'
        }}>

          {/* Header */}
          <div style={{
            padding: '16px 20px', borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: '10px',
            background: 'var(--surface)'
          }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '14px', flexShrink: 0
            }}>🤖</div>
            <div>
              <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-h)', lineHeight: 1 }}>
                Milo
              </p>
              <p style={{ fontSize: '11px', color: 'var(--accent2)', marginTop: '2px' }}>
                {meetingId ? 'This meeting' : 'All meetings'} · Ask anything
              </p>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)' }} />
              <span style={{ fontSize: '11px', color: 'var(--success)' }}>Online</span>
            </div>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: '16px',
            display: 'flex', flexDirection: 'column', gap: '12px'
          }}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', padding: '24px 16px' }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>💬</div>
                <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-h)', marginBottom: '6px' }}>
                  Ask me anything
                </p>
                <p style={{ fontSize: '12px', color: 'var(--text)', lineHeight: '1.6' }}>
                  {meetingId
                    ? 'Ask about decisions, action items, or anything discussed in this meeting'
                    : 'Ask questions across all your uploaded meetings'}
                </p>
                {/* Suggestions */}
                <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {[
                    meetingId ? 'What decisions were made?' : 'What was discussed last week?',
                    meetingId ? 'Who has open action items?' : 'Any pending action items?',
                    meetingId ? 'What was the main concern?' : 'Summarize recent meetings',
                  ].map((s, i) => (
                    <button key={i} onClick={() => setInput(s)} style={{
                      padding: '7px 12px', background: 'var(--surface2)',
                      border: '1px solid var(--border)', borderRadius: '20px',
                      fontSize: '12px', color: 'var(--text)', cursor: 'pointer',
                      transition: 'all 0.15s', textAlign: 'left'
                    }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--text-h)' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text)' }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
              }}>
                {msg.role === 'assistant' && (
                  <div style={{
                    width: '24px', height: '24px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '11px', flexShrink: 0, marginRight: '8px', marginTop: '2px'
                  }}>🤖</div>
                )}
                <div style={{
                  maxWidth: '78%', padding: '10px 14px', borderRadius: msg.role === 'user'
                    ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                  background: msg.role === 'user'
                    ? 'var(--accent)' : msg.error ? 'rgba(244,63,94,0.1)' : 'var(--surface2)',
                  border: msg.role === 'assistant'
                    ? `1px solid ${msg.error ? 'rgba(244,63,94,0.3)' : 'var(--border)'}` : 'none',
                  color: msg.role === 'user' ? 'white' : msg.error ? '#fb7185' : 'var(--text-h)',
                  fontSize: '13px', lineHeight: '1.6', whiteSpace: 'pre-wrap', wordBreak: 'break-word'
                }}>
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '24px', height: '24px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px'
                }}>🤖</div>
                <div style={{
                  padding: '10px 14px', background: 'var(--surface2)',
                  border: '1px solid var(--border)', borderRadius: '14px 14px 14px 4px',
                  display: 'flex', gap: '4px', alignItems: 'center'
                }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{
                      width: '6px', height: '6px', borderRadius: '50%',
                      background: 'var(--accent)', opacity: 0.6,
                      animation: `bounce 1s ease ${i * 0.15}s infinite`
                    }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: '12px 16px', borderTop: '1px solid var(--border)',
            display: 'flex', gap: '8px', alignItems: 'flex-end'
          }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask a question..."
              rows={1}
              style={{
                flex: 1, padding: '9px 12px', background: 'var(--surface2)',
                border: '1px solid var(--border)', borderRadius: '10px',
                color: 'var(--text-h)', fontSize: '13px', resize: 'none',
                fontFamily: 'var(--font)', lineHeight: '1.5', maxHeight: '80px',
                overflowY: 'auto', outline: 'none', transition: 'border-color 0.15s'
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            <button
              onClick={send}
              disabled={!input.trim() || loading}
              style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: input.trim() && !loading ? 'var(--accent)' : 'var(--surface2)',
                border: '1px solid var(--border)', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                fontSize: '14px', transition: 'all 0.15s', flexShrink: 0
              }}
            >
              ↑
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </>
  )
}