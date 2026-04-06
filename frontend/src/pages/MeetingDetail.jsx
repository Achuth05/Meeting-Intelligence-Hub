import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ExportButtons } from '../components/ExportButtons'
import { ChatPanel } from '../components/ChatPanel'
import { extractItems, getSentiment } from '../api/client'
import { Topbar } from '../components/Topbar'

export default function MeetingDetail() {
  const { id } = useParams()

  const [decisions, setDecisions] = useState([])
  const [actionItems, setActionItems] = useState([])
  const [sentiment, setSentiment] = useState(null)
  const [extracting, setExtracting] = useState(false)
  const [extracted, setExtracted] = useState(false)
  const [extractError, setExtractError] = useState(null)
  const [sentimentLoading, setSentimentLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('actions')
  const [selectedSegment, setSelectedSegment] = useState(null)

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

  const SENTIMENT_COLORS = {
    Positive:    { bg: 'rgba(34,197,94,0.12)',   color: '#4ade80', bar: 'var(--success)' },
    Neutral:     { bg: 'rgba(148,163,184,0.12)', color: '#94a3b8', bar: 'var(--muted)' },
    Negative:    { bg: 'rgba(244,63,94,0.12)',   color: '#fb7185', bar: 'var(--danger)' },
    consensus:   { bg: 'rgba(34,197,94,0.12)',   color: '#4ade80' },
    conflict:    { bg: 'rgba(244,63,94,0.12)',   color: '#fb7185' },
    frustration: { bg: 'rgba(249,115,22,0.12)',  color: '#fb923c' },
    enthusiasm:  { bg: 'rgba(79,142,247,0.12)',  color: '#60a5fa' },
    uncertainty: { bg: 'rgba(234,179,8,0.12)',   color: '#facc15' },
    neutral:     { bg: 'rgba(148,163,184,0.12)', color: '#94a3b8' },
  }

  const capitalize = (str) => {
    if (!str) return ''
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Topbar />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '28px 32px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <Link to="/dashboard" style={{ fontSize: '13px', color: 'var(--accent)', display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '10px', textDecoration: 'none' }}>
            ← Back to Dashboard
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-h)' }}>Meeting Detail</h1>
              <p style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>{id?.slice(0, 8)}...</p>
            </div>
            {extracted && <ExportButtons meetingId={id} />}
          </div>
        </div>

        {/* Extract CTA */}
        {!extracted && (
          <div className="card" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-h)', marginBottom: '4px' }}>Analyze this meeting</h3>
              <p style={{ fontSize: '13px', color: 'var(--text)' }}>Extract decisions, action items and run sentiment analysis</p>
            </div>
            <button onClick={handleExtract} disabled={extracting} className="btn btn-primary">
              {extracting ? <><span className="spinner" /> Extracting...</> : 'Extract Insights'}
            </button>
          </div>
        )}

        {extractError && <div className="alert alert-error" style={{ marginBottom: '20px' }}>{extractError}</div>}

        {extracted && (
          <>
            {/* Stats */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px' }}>
              {[
                { label: 'Action Items', value: actionItems.length, color: 'var(--accent)' },
                { label: 'Decisions', value: decisions.length, color: 'var(--accent2)' },
                sentiment && { label: 'Sentiment', value: sentiment.label, color: SENTIMENT_COLORS[sentiment.label]?.color },
              ].filter(Boolean).map((s, i) => (
                <div key={i} className="card" style={{ padding: '14px 20px', minWidth: '120px' }}>
                  <p style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>{s.label}</p>
                  <p style={{ fontSize: '20px', fontWeight: '800', color: s.color, letterSpacing: '-0.02em' }}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="tabs">
              {['actions', 'sentiment'].map(tab => (
                <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => { setActiveTab(tab); if (tab === 'sentiment' && !sentiment) handleSentiment() }}>
                  {tab === 'actions' ? '📋 Actions & Decisions' : '📊 Sentiment'}
                </button>
              ))}
            </div>

            {/* Actions tab — side by side */}
            {activeTab === 'actions' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }} className="actions-grid">

                {/* Action Items */}
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-h)' }}>Action Items</h3>
                    <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '12px', background: 'rgba(79,142,247,0.1)', color: 'var(--accent)', fontWeight: '600' }}>{actionItems.length}</span>
                  </div>
                  {actionItems.length === 0
                    ? <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)', fontSize: '14px' }}>No action items found</div>
                    : <div style={{ maxHeight: '440px', overflowY: 'auto' }}>
                        {actionItems.map((item, i) => (
                          <div key={i} style={{ padding: '14px 20px', borderBottom: i < actionItems.length - 1 ? '1px solid var(--border)' : 'none' }}>
                            <p style={{ fontSize: '13px', color: 'var(--text-h)', marginBottom: '8px', lineHeight: '1.5' }}>{capitalize(item.description)}</p>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                              {item.owner && (
                                <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '12px', background: 'rgba(79,142,247,0.1)', color: 'var(--accent)', fontWeight: '500' }}>
                                  👤 {item.owner}
                                </span>
                              )}
                              {item.due_date && (
                                <span style={{
                                  fontSize: '11px', padding: '2px 8px', borderRadius: '12px', fontWeight: '500',
                                  background: new Date(item.due_date) < new Date() ? 'rgba(244,63,94,0.1)' : 'rgba(34,197,94,0.1)',
                                  color: new Date(item.due_date) < new Date() ? 'var(--danger)' : 'var(--success)'
                                }}>
                                  📅 {item.due_date}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                  }
                </div>

                {/* Decisions */}
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-h)' }}>Decisions</h3>
                    <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '12px', background: 'rgba(0,229,176,0.1)', color: 'var(--accent2)', fontWeight: '600' }}>{decisions.length}</span>
                  </div>
                  {decisions.length === 0
                    ? <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)', fontSize: '14px' }}>No decisions found</div>
                    : <div style={{ maxHeight: '440px', overflowY: 'auto' }}>
                        {decisions.map((item, i) => (
                          <div key={i} style={{ padding: '14px 20px', borderBottom: i < decisions.length - 1 ? '1px solid var(--border)' : 'none', display: 'flex', gap: '12px' }}>
                            <span style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--accent2)', fontWeight: '700', flexShrink: 0, marginTop: '2px' }}>
                              {String(i + 1).padStart(2, '0')}
                            </span>
                            <p style={{ fontSize: '13px', color: 'var(--text-h)', lineHeight: '1.5' }}>{capitalize(item.description)}</p>
                          </div>
                        ))}
                      </div>
                  }
                </div>
              </div>
            )}

            {/* Sentiment tab */}
            {activeTab === 'sentiment' && (
              <div className="fade-up">
                {sentimentLoading && (
                  <div style={{ textAlign: 'center', padding: '60px', color: 'var(--muted)' }}>
                    <span className="spinner" style={{ borderTopColor: 'var(--accent)', borderColor: 'var(--border)', width: '24px', height: '24px' }} />
                    <p style={{ marginTop: '16px', fontSize: '14px' }}>Analyzing sentiment...</p>
                  </div>
                )}

                {!sentiment && !sentimentLoading && (
                  <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
                    <div style={{ fontSize: '40px', marginBottom: '16px' }}>📊</div>
                    <p style={{ fontWeight: '700', fontSize: '16px', color: 'var(--text-h)', marginBottom: '8px' }}>Run Sentiment Analysis</p>
                    <p style={{ fontSize: '13px', color: 'var(--text)', marginBottom: '24px' }}>Analyze the emotional tone and key highlights of this meeting</p>
                    <button onClick={handleSentiment} className="btn btn-primary">Analyze Sentiment</button>
                  </div>
                )}

                {sentiment && !sentimentLoading && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                    {/* Row 1 — Score + Highlights side by side */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }} className='sentiment-top-grid'>

                      {/* Overall score */}
                      <div className="card" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '32px 24px' }}>
                        <p style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Overall Sentiment</p>
                        <div style={{ fontSize: '56px', fontWeight: '800', letterSpacing: '-0.03em', lineHeight: 1, color: SENTIMENT_COLORS[sentiment.label]?.color || 'var(--text-h)' }}>
                          {sentiment.overall_score > 0 ? '+' : ''}{((sentiment.overall_score || sentiment.score || 0) * 100).toFixed(0)}
                        </div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 16px', borderRadius: '20px', background: SENTIMENT_COLORS[sentiment.label]?.bg || 'var(--surface2)' }}>
                          <span style={{ fontSize: '20px' }}>
                            {sentiment.label === 'Positive' ? '😊' : sentiment.label === 'Negative' ? '😟' : '😐'}
                          </span>
                          <span style={{ fontSize: '14px', fontWeight: '700', color: SENTIMENT_COLORS[sentiment.label]?.color }}>{sentiment.label}</span>
                        </div>
                        <div style={{ width: '100%', height: '6px', background: 'var(--surface2)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{
                            height: '100%', borderRadius: '3px',
                            width: `${Math.abs((sentiment.overall_score || sentiment.score || 0)) * 100}%`,
                            background: SENTIMENT_COLORS[sentiment.label]?.bar || 'var(--muted)',
                            transition: 'width 0.6s ease'
                          }} />
                        </div>
                        <button onClick={handleSentiment} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', color: 'var(--muted)', cursor: 'pointer', fontFamily: 'var(--font)' }}>
                          ↺ Re-analyze
                        </button>
                      </div>

                      {/* Key Highlights */}
                      <div className="card">
                        <p style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>Key Highlights</p>
                        {Array.isArray(sentiment.highlights) ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {sentiment.highlights.map((h, i) => (
                              <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '12px 16px', background: 'var(--surface2)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                <span style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--accent)', fontWeight: '700', flexShrink: 0, marginTop: '1px' }}>{String(i + 1).padStart(2, '0')}</span>
                                <p style={{ fontSize: '13px', color: 'var(--text-h)', lineHeight: '1.6' }}>{h}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: '1.6' }}>{sentiment.highlights}</p>
                        )}
                      </div>
                    </div>

                    {/* Row 2 — Per Speaker Breakdown (full width) */}
                    {sentiment.speaker_breakdown && Object.keys(sentiment.speaker_breakdown).length > 0 && (
                      <div className="card">
                        <p style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>
                          Per Speaker Breakdown
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {Object.entries(sentiment.speaker_breakdown).map(([speaker, data]) => (
                            <div key={speaker} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{
                                width: '28px', height: '28px', borderRadius: '50%',
                                background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '11px', fontWeight: '700', color: 'white', flexShrink: 0
                              }}>
                                {speaker[0].toUpperCase()}
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                  <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-h)' }}>{speaker}</span>
                                  <span style={{
                                    fontSize: '11px', padding: '1px 8px', borderRadius: '12px', fontWeight: '500',
                                    background: SENTIMENT_COLORS[data.label]?.bg || 'var(--surface2)',
                                    color: SENTIMENT_COLORS[data.label]?.color || 'var(--text)'
                                  }}>
                                    {data.dominant_emotion || data.label}
                                  </span>
                                </div>
                                <div style={{ height: '5px', background: 'var(--surface2)', borderRadius: '3px', overflow: 'hidden' }}>
                                  <div style={{
                                    height: '100%', borderRadius: '3px',
                                    width: `${Math.abs(data.score || 0) * 100}%`,
                                    background: (data.score || 0) > 0 ? 'var(--success)' : 'var(--danger)',
                                    transition: 'width 0.5s ease'
                                  }} />
                                </div>
                              </div>
                              <span style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--text)', width: '36px', textAlign: 'right' }}>
                                {(data.score || 0) > 0 ? '+' : ''}{((data.score || 0) * 100).toFixed(0)}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Row 3 — Dialogue Segments (full width) */}
                    {sentiment.segments && sentiment.segments.length > 0 && (
                      <div className="card">
                        <p style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>
                          Dialogue Segments — click to expand
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {sentiment.segments.map((seg, i) => {
                            const c = SENTIMENT_COLORS[seg.label] || SENTIMENT_COLORS.neutral
                            const isSelected = selectedSegment === i
                            return (
                              <div key={i}
                                onClick={() => setSelectedSegment(isSelected ? null : i)}
                                style={{
                                  padding: '10px 14px', borderRadius: '8px', cursor: 'pointer',
                                  transition: 'all 0.15s',
                                  background: isSelected ? c.bg : 'var(--surface2)',
                                  border: `1px solid ${isSelected ? c.color + '40' : 'var(--border)'}`
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: c.color, flexShrink: 0 }} />
                                  <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-h)', flex: 1 }}>{seg.speaker || 'Unknown'}</span>
                                  <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '12px', background: c.bg, color: c.color, fontWeight: '500' }}>
                                    {seg.label}
                                  </span>
                                  <span style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--muted)' }}>
                                    {(seg.score || 0) > 0 ? '+' : ''}{((seg.score || 0) * 100).toFixed(0)}%
                                  </span>
                                </div>
                                {isSelected && (
                                  <p style={{ fontSize: '13px', color: 'var(--text)', marginTop: '8px', lineHeight: '1.6', paddingLeft: '16px', fontStyle: 'italic' }}>
                                    "{seg.text}"
                                  </p>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <ChatPanel meetingId={id} />
    </div>
  )
}