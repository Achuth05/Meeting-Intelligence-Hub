import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getMeetings } from '../api/client'
import { Sidebar } from '../components/Sidebar'

export default function Dashboard() {
  const { user } = useAuth()
  const [meetings, setMeetings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadMeetings = async () => {
      try {
        const response = await getMeetings()
        setMeetings(response.data?.meetings || response.data || [])
      } catch (err) {
        setError('Failed to load meetings')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadMeetings()
  }, [])

  const totalWords = meetings.reduce((sum, m) => sum + (m.word_count || 0), 0)

  return (
    <div className="page-layout">
      <Sidebar />

      <div className="main-content">
        <div className="page-header">
          <h1>Dashboard</h1>
          <p>Welcome back, {user?.email?.split('@')[0]} — here's your meeting overview</p>
        </div>

        <div className="page-body">

          {/* Stats */}
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-label">Total Meetings</div>
              <div className="stat-value accent">{meetings.length}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total Words</div>
              <div className="stat-value">{totalWords.toLocaleString()}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">This Week</div>
              <div className="stat-value success">
                {meetings.filter(m => {
                  const d = new Date(m.created_at)
                  const week = new Date()
                  week.setDate(week.getDate() - 7)
                  return d > week
                }).length}
              </div>
            </div>
            <div className="stat-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Link to="/upload" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                + Upload Meeting
              </Link>
            </div>
          </div>

          {/* Meetings list */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-h)' }}>
                Recent Meetings
              </h2>
              <Link to="/upload" style={{ fontSize: '13px', color: 'var(--accent)' }}>
                + New
              </Link>
            </div>

            {loading && (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)' }}>
                <span className="spinner" style={{ borderTopColor: 'var(--accent)', borderColor: 'var(--border)' }} />
                <p style={{ marginTop: '12px', fontSize: '14px' }}>Loading meetings...</p>
              </div>
            )}

            {error && <div className="alert alert-error">{error}</div>}

            {!loading && !error && meetings.length === 0 && (
              <div style={{ padding: '60px', textAlign: 'center' }}>
                <div style={{ fontSize: '40px', marginBottom: '16px' }}>📂</div>
                <p style={{ color: 'var(--text-h)', fontWeight: '600', marginBottom: '8px' }}>
                  No meetings yet
                </p>
                <p style={{ color: 'var(--text)', fontSize: '14px', marginBottom: '24px' }}>
                  Upload your first transcript to get started
                </p>
                <Link to="/upload" className="btn btn-primary">Upload Meeting</Link>
              </div>
            )}

            {!loading && meetings.length > 0 && (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Meeting</th>
                    <th>Project</th>
                    <th>Speakers</th>
                    <th>Words</th>
                    <th>Date</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {meetings.map(meeting => (
                    <tr key={meeting.id}>
                      <td>
                        <span style={{ fontWeight: '600', color: 'var(--text-h)' }}>
                          {meeting.name || meeting.title || `Meeting ${meeting.id?.slice(0, 8)}`}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-blue">
                          {meeting.project || 'General'}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: 'var(--text)', fontSize: '13px' }}>
                          {Array.isArray(meeting.speakers)
                            ? meeting.speakers.slice(0, 2).join(', ') + (meeting.speakers.length > 2 ? ` +${meeting.speakers.length - 2}` : '')
                            : '—'}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'var(--mono)', fontSize: '13px', color: 'var(--text)' }}>
                          {meeting.word_count?.toLocaleString() || '—'}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '13px', color: 'var(--text)' }}>
                          {meeting.created_at
                            ? new Date(meeting.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                            : '—'}
                        </span>
                      </td>
                      <td>
                        <Link
                          to={`/meeting/${meeting.id}`}
                          className="btn btn-ghost"
                          style={{ padding: '6px 14px', fontSize: '12px' }}
                        >
                          View →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}