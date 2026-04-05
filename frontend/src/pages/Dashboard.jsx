import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getMeetings, deleteMeeting } from '../api/client'
import { Topbar } from '../components/Topbar'
import { ChatPanel } from '../components/ChatPanel'

export default function Dashboard() {
  const { user } = useAuth()
  const [meetings, setMeetings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleting, setDeleting] = useState(null)

  useEffect(() => { loadMeetings() }, [])

  const loadMeetings = async () => {
    try {
      const response = await getMeetings()
      setMeetings(response.data?.meetings || response.data || [])
    } catch (err) {
      setError('Failed to load meetings')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (meetingId, meetingName, e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!window.confirm(`Delete "${meetingName}"? This cannot be undone.`)) return
    setDeleting(meetingId)
    try {
      await deleteMeeting(meetingId)
      setMeetings(prev => prev.filter(m => m.id !== meetingId))
    } catch (err) {
      alert('Failed to delete meeting. Please try again.')
    } finally {
      setDeleting(null)
    }
  }

  const totalWords = meetings.reduce((sum, m) => sum + (m.word_count || 0), 0)
  const thisWeek = meetings.filter(m => {
    const d = new Date(m.created_at)
    const week = new Date()
    week.setDate(week.getDate() - 7)
    return d > week
  }).length

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Topbar />

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 32px 80px' }}>

        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-h)', marginBottom: '4px' }}>
            Welcome back, {user?.username || user?.email?.split('@')[0]} 
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text)' }}>
            Here's your meeting intelligence overview
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          {[
            { label: 'Total Meetings', value: meetings.length, color: 'var(--accent)' },
            { label: 'Total Words', value: totalWords.toLocaleString(), color: 'var(--text-h)' },
            { label: 'This Week', value: thisWeek, color: 'var(--success)' },
          ].map((s, i) => (
            <div key={i} className="card" style={{ padding: '20px' }}>
              <p style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>{s.label}</p>
              <p style={{ fontSize: '28px', fontWeight: '800', color: s.color, letterSpacing: '-0.03em' }}>{s.value}</p>
            </div>
          ))}
          <Link to="/upload" style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: '8px', padding: '20px', background: 'rgba(79,142,247,0.06)',
            border: '1px dashed rgba(79,142,247,0.3)', borderRadius: '12px',
            textDecoration: 'none', transition: 'all 0.15s'
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(79,142,247,0.12)'; e.currentTarget.style.borderColor = 'var(--accent)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(79,142,247,0.06)'; e.currentTarget.style.borderColor = 'rgba(79,142,247,0.3)' }}
          >
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: 'white', fontWeight: '700' }}>+</div>
            <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--accent)' }}>Upload Meeting</p>
          </Link>
        </div>

        {/* Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-h)' }}>Recent Meetings</h2>
            <Link to="/upload" style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: '600' }}>+ New</Link>
          </div>

          {loading && (
            <div style={{ padding: '60px', textAlign: 'center', color: 'var(--muted)' }}>
              <span className="spinner" style={{ borderTopColor: 'var(--accent)', borderColor: 'var(--border)', width: '20px', height: '20px' }} />
              <p style={{ marginTop: '12px', fontSize: '14px' }}>Loading meetings...</p>
            </div>
          )}

          {error && <div style={{ padding: '24px' }}><div className="alert alert-error">{error}</div></div>}

          {!loading && !error && meetings.length === 0 && (
            <div style={{ padding: '80px', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📂</div>
              <p style={{ fontWeight: '700', fontSize: '16px', color: 'var(--text-h)', marginBottom: '8px' }}>No meetings yet</p>
              <p style={{ color: 'var(--text)', fontSize: '14px', marginBottom: '28px' }}>Upload your first transcript to get started</p>
              <Link to="/upload" className="btn btn-primary">Upload Meeting</Link>
            </div>
          )}

          {!loading && meetings.length > 0 && (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--surface2)' }}>
                  {['Meeting', 'Project', 'Speakers', 'Words', 'Meeting Date', ''].map((h, i) => (
                    <th key={i} style={{ padding: '10px 20px', textAlign: 'left', fontFamily: 'var(--mono)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)', borderBottom: '1px solid var(--border)', fontWeight: '500' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {meetings.map((meeting, idx) => (
                  <tr key={meeting.id}
                    style={{ borderBottom: idx < meetings.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background 0.1s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '14px 20px' }}>
                      <Link to={`/meeting/${meeting.id}`} style={{ fontWeight: '600', fontSize: '14px', color: 'var(--text-h)', textDecoration: 'none', transition: 'color 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-h)'}
                      >
                        {meeting.name || `Meeting ${meeting.id?.slice(0, 8)}`}
                      </Link>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ fontSize: '12px', padding: '3px 10px', borderRadius: '20px', background: 'rgba(79,142,247,0.1)', color: 'var(--accent)', fontWeight: '500' }}>
                        {meeting.project || 'General'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--text)' }}>
                      {Array.isArray(meeting.speakers)
                        ? meeting.speakers.slice(0, 2).join(', ') + (meeting.speakers.length > 2 ? ` +${meeting.speakers.length - 2}` : '')
                        : '—'}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: '13px', color: 'var(--text)' }}>
                        {meeting.word_count?.toLocaleString() || '—'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--text)' }}>
                      {meeting.meeting_date
                        ? new Date(meeting.meeting_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : '—'}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <Link to={`/meeting/${meeting.id}`} style={{
                          padding: '5px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600',
                          color: 'var(--accent)', textDecoration: 'none', background: 'rgba(79,142,247,0.08)',
                          border: '1px solid rgba(79,142,247,0.2)', transition: 'all 0.15s'
                        }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(79,142,247,0.18)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'rgba(79,142,247,0.08)'}
                        >
                          View →
                        </Link>
                        <button
                          onClick={(e) => handleDelete(meeting.id, meeting.name || 'this meeting', e)}
                          disabled={deleting === meeting.id}
                          title="Delete meeting"
                          style={{
                            width: '30px', height: '30px', borderRadius: '6px', background: 'transparent',
                            border: '1px solid var(--border)', color: 'var(--muted)', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.15s', flexShrink: 0
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(244,63,94,0.1)'; e.currentTarget.style.borderColor = 'rgba(244,63,94,0.4)'; e.currentTarget.style.color = 'var(--danger)' }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)' }}
                        >
                          {deleting === meeting.id
                            ? <span className="spinner" style={{ width: '10px', height: '10px', borderTopColor: 'var(--danger)', borderColor: 'rgba(244,63,94,0.2)' }} />
                            : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3,6 5,6 21,6"/><path d="M19,6l-1,14a2,2,0,0,1-2,2H8a2,2,0,0,1-2-2L5,6"/><path d="M10,11v6M14,11v6"/><path d="M9,6V4a1,1,0,0,1,1-1h4a1,1,0,0,1,1,1v2"/></svg>
                          }
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <ChatPanel meetingId={null} />
    </div>
  )
}