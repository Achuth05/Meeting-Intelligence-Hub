import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ActionTable } from '../components/ActionTable'
import { ExportButtons } from '../components/ExportButtons'
import { extractItems, getSentiment } from '../api/client'
import { Sidebar } from '../components/Sidebar'

export default function MeetingDetail() {
  const { id } = useParams()
  const { user } = useAuth()

  const [decisions, setDecisions] = useState([])
  const [actionItems, setActionItems] = useState([])
  const [sentiment, setSentiment] = useState(null)
  const [extracting, setExtracting] = useState(false)
  const [extracted, setExtracted] = useState(false)
  const [extractError, setExtractError] = useState(null)
  const [sentimentLoading, setSentimentLoading] = useState(false)
  const [selectedSegment, setSelectedSegment] = useState(null)
  const [activeTab, setActiveTab] = useState('actions')

  const handleExtract = async () => {
    setExtracting(true)
    setExtractError(null)
    try {
      const { data } = await extractItems(id)
      setDecisions(data.decisions || [])
      setActionItems(data.action_items || [])
      setExtracted(true)
    } catch (err) {
      setExtractError('Extraction failed. Please try again.')
    } finally {
      setExtracting(false)
    }
  }

  const handleSentiment = async () => {
    setSentimentLoading(true)
    try {
      const { data } = await getSentiment(id)
      setSentiment(data)
    } catch (err) {
      console.error('Sentiment error:', err)
    } finally {
      setSentimentLoading(false)
    }
  }

  const LABEL_COLORS = {
    consensus:   { bg: 'rgba(34,197,94,0.12)',   color: '#4ade80' },
    conflict:    { bg: 'rgba(244,63,94,0.12)',    color: '#fb7185' },
    frustration: { bg: 'rgba(249,115,22,0.12)',   color: '#fb923c' },
    enthusiasm:  { bg: 'rgba(79,142,247,0.12)',   color: '#60a5fa' },
    uncertainty: { bg: 'rgba(234,179,8,0.12)',    color: '#facc15' },
    neutral:     { bg: 'rgba(148,163,184,0.12)',  color: '#94a3b8' },
  }

  return (
    <div className="page-layout">
      <Sidebar />

      <div className="main-content">
        <div className="page-header">
          <Link to="/dashboard" style={{ fontSize: '13px', color: 'var(--accent)', display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
            ← Dashboard
          </Link>
          <h1>Meeting Detail</h1>
          <p style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--muted)' }}>
            ID: {id?.slice(0, 8)}...
          </p>
        </div>

        <div className="page-body">

          {/* Extract CTA */}
          {!extracted && (
            <div className="card" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-h)', marginBottom: '4px' }}>
                  Analyze this meeting
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text)' }}>
                  Extract decisions, action items and run sentiment analysis
                </p>
              </div>
              <button
                onClick={handleExtract}
                disabled={extracting}
                className="btn btn-primary"
              >
                {extracting ? <><span className="spinner" /> Extracting...</> : '⚡ Extract Insights'}
              </button>
            </div>
          )}

          {extractError && <div className="alert alert-error" style={{ marginBottom: '20px' }}>{extractError}</div>}

          {/* After extraction */}
          {extracted && (
            <>
              {/* Stats row */}
              <div className="stat-grid" style={{ marginBottom: '24px' }}>
                <div className="stat-card">
                  <div className="stat-label">Action Items</div>
                  <div className="stat-value accent">{actionItems.length}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Decisions</div>
                  <div className="stat-value">{decisions.length}</div>
                </div>
                {sentiment && (
                  <div className="stat-card">
                    <div className="stat-label">Sentiment Score</div>
                    <div className={`stat-value ${sentiment.overall_score > 0 ? 'success' : 'orange'}`}>
                      {sentiment.overall_score > 0 ? '+' : ''}{(sentiment.overall_score * 100).toFixed(0)}%
                    </div>
                  </div>
                )}
                <div className="stat-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ExportButtons meetingId={id} />
                </div>
              </div>

              {/* Tabs */}
              <div className="tabs">
                {['actions', 'sentiment', 'chat'].map(tab => (
                  <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                    onClick={() => {
                      setActiveTab(tab)
                      if (tab === 'sentiment' && !sentiment) handleSentiment()
                    }}
                  >
                    {tab === 'actions' && '📋 Actions'}
                    {tab === 'sentiment' && '📊 Sentiment'}
                    {tab === 'chat' && '💬 Chat'}
                  </button>
                ))}
              </div>

              {/* Actions tab */}
              {activeTab === 'actions' && (
                <div className="card fade-up">
                  <ActionTable decisions={decisions} actionItems={actionItems} />
                </div>
              )}

              {/* Sentiment tab */}
              {activeTab === 'sentiment' && (
                <div className="fade-up">
                  {sentimentLoading && (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
                      <span className="spinner" style={{ borderTopColor: 'var(--accent)', borderColor: 'var(--border)' }} />
                      <p style={{ marginTop: '12px', fontSize: '14px' }}>Analyzing sentiment...</p>
                    </div>
                  )}

                  {sentiment && !sentimentLoading && (
                    <>
                      {/* Overall + speaker breakdown */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', marginBottom: '20px' }}>

                        {/* Overall score */}
                        <div className="card" style={{ textAlign: 'center' }}>
                          <p style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                            Overall
                          </p>
                          <div style={{
                            fontSize: '48px', fontWeight: '800',
                            color: sentiment.overall_score > 0 ? 'var(--success)' : 'var(--danger)',
                            letterSpacing: '-0.03em', lineHeight: 1
                          }}>
                            {sentiment.overall_score > 0 ? '+' : ''}{(sentiment.overall_score * 100).toFixed(0)}
                          </div>
                          <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '8px' }}>
                            {sentiment.overall_score > 0.3 ? '😊 Positive' : sentiment.overall_score < -0.3 ? '😟 Negative' : '😐 Neutral'}
                          </p>
                        </div>

                        {/* Speaker breakdown */}
                        <div className="card">
                          <p style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--muted)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                            Per Speaker
                          </p>
                          {sentiment.speaker_breakdown && Object.entries(sentiment.speaker_breakdown).map(([speaker, score]) => (
                            <div key={speaker} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                              <span style={{ width: '100px', fontSize: '13px', color: 'var(--text-h)', fontWeight: '500', flexShrink: 0 }}>
                                {speaker}
                              </span>
                              <div style={{ flex: 1, height: '6px', background: 'var(--surface2)', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{
                                  height: '100%', borderRadius: '3px',
                                  width: `${Math.abs(score) * 100}%`,
                                  background: score > 0 ? 'var(--success)' : 'var(--danger)',
                                  transition: 'width 0.5s ease'
                                }} />
                              </div>
                              <span style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--text)', width: '40px', textAlign: 'right' }}>
                                {(score * 100).toFixed(0)}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Segments */}
                      <div className="card">
                        <p style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--muted)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                          Dialogue Segments — click to expand
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {(sentiment.segments || []).map((seg, i) => {
                            const c = LABEL_COLORS[seg.label] || LABEL_COLORS.neutral
                            const isSelected = selectedSegment === i
                            return (
                              <div key={i}
                                onClick={() => setSelectedSegment(isSelected ? null : i)}
                                style={{
                                  padding: '12px 16px', borderRadius: '8px',
                                  background: isSelected ? c.bg : 'var(--surface2)',
                                  border: `1px solid ${isSelected ? c.color + '40' : 'var(--border)'}`,
                                  cursor: 'pointer', transition: 'all 0.15s'
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <div style={{
                                    width: '8px', height: '8px', borderRadius: '50%',
                                    background: c.color, flexShrink: 0
                                  }} />
                                  <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-h)', flex: 1 }}>
                                    {seg.speaker || 'Unknown'}
                                  </span>
                                  <span style={{
                                    fontSize: '11px', padding: '2px 8px', borderRadius: '12px',
                                    background: c.bg, color: c.color, fontWeight: '500'
                                  }}>
                                    {seg.label}
                                  </span>
                                  <span style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--muted)' }}>
                                    {seg.score > 0 ? '+' : ''}{(seg.score * 100).toFixed(0)}%
                                  </span>
                                </div>
                                {isSelected && (
                                  <p style={{ fontSize: '13px', color: 'var(--text)', marginTop: '10px', lineHeight: '1.6', paddingLeft: '18px' }}>
                                    "{seg.segment}"
                                  </p>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Chat tab — placeholder until ChatPanel is built */}
              {activeTab === 'chat' && (
                <div className="card fade-up" style={{ textAlign: 'center', padding: '60px' }}>
                  <div style={{ fontSize: '40px', marginBottom: '16px' }}>💬</div>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px', color: 'var(--text-h)' }}>
                    Chat coming soon
                  </h3>
                  <p style={{ color: 'var(--text)', fontSize: '14px' }}>
                    The chatbot will be available once ChatPanel is connected.
                  </p>
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  )
}