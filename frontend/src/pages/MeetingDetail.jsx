import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ActionTable } from '../components/ActionTable'
import { ExportButtons } from '../components/ExportButtons'
import { ChatPanel } from '../components/ChatPanel'
import { extractItems, getSentiment } from '../api/client'
import { Sidebar } from '../components/Sidebar'

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

  // Sentiment label → color
  const SENTIMENT_COLORS = {
    Positive: { bg: 'rgba(34,197,94,0.12)', color: '#4ade80', bar: 'var(--success)' },
    Neutral:  { bg: 'rgba(148,163,184,0.12)', color: '#94a3b8', bar: 'var(--muted)' },
    Negative: { bg: 'rgba(244,63,94,0.12)', color: '#fb7185', bar: 'var(--danger)' },
  }

  return (
    <div className="page-layout">
      <Sidebar />

      <div className="main-content">
        <div className="page-header">
          <Link to="/dashboard" style={{
            fontSize: '13px', color: 'var(--accent)',
            display: 'inline-flex', alignItems: 'center',
            gap: '4px', marginBottom: '8px'
          }}>
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
            <div className="card" style={{
              marginBottom: '24px', display: 'flex',
              alignItems: 'center', justifyContent: 'space-between',
              flexWrap: 'wrap', gap: '16px'
            }}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-h)', marginBottom: '4px' }}>
                  Analyze this meeting
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text)' }}>
                  Extract decisions, action items and run sentiment analysis
                </p>
              </div>
              <button onClick={handleExtract} disabled={extracting} className="btn btn-primary">
                {extracting ? <><span className="spinner" /> Extracting...</> : '⚡ Extract Insights'}
              </button>
            </div>
          )}

          {extractError && (
            <div className="alert alert-error" style={{ marginBottom: '20px' }}>{extractError}</div>
          )}

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
                    <div className="stat-label">Sentiment</div>
                    <div className="stat-value" style={{
                      color: SENTIMENT_COLORS[sentiment.label]?.color || 'var(--text-h)',
                      fontSize: '20px'
                    }}>
                      {sentiment.label}
                    </div>
                  </div>
                )}
                <div className="stat-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ExportButtons meetingId={id} />
                </div>
              </div>

              {/* Tabs — only actions and sentiment */}
              <div className="tabs">
                {['actions', 'sentiment'].map(tab => (
                  <button
                    key={tab}
                    className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                    onClick={() => {
                      setActiveTab(tab)
                      if (tab === 'sentiment' && !sentiment) handleSentiment()
                    }}
                  >
                    {tab === 'actions' && '📋 Actions & Decisions'}
                    {tab === 'sentiment' && '📊 Sentiment'}
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

                  {!sentiment && !sentimentLoading && (
                    <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
                      <div style={{ fontSize: '36px', marginBottom: '16px' }}>📊</div>
                      <p style={{ fontWeight: '600', color: 'var(--text-h)', marginBottom: '8px' }}>
                        Run Sentiment Analysis
                      </p>
                      <p style={{ fontSize: '13px', color: 'var(--text)', marginBottom: '20px' }}>
                        Analyze the emotional tone and key highlights of this meeting
                      </p>
                      <button onClick={handleSentiment} className="btn btn-primary">
                        Analyze Sentiment
                      </button>
                    </div>
                  )}

                  {sentiment && !sentimentLoading && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                      {/* Score card */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>

                        {/* Overall score */}
                        <div className="card" style={{ textAlign: 'center' }}>
                          <p style={{
                            fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--muted)',
                            marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.08em'
                          }}>
                            Overall Sentiment
                          </p>
                          <div style={{
                            fontSize: '52px', fontWeight: '800', letterSpacing: '-0.03em', lineHeight: 1,
                            color: SENTIMENT_COLORS[sentiment.label]?.color || 'var(--text-h)',
                            marginBottom: '8px'
                          }}>
                            {sentiment.score > 0 ? '+' : ''}{(sentiment.score * 100).toFixed(0)}
                          </div>
                          <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            padding: '4px 12px', borderRadius: '20px',
                            background: SENTIMENT_COLORS[sentiment.label]?.bg || 'var(--surface2)',
                            marginBottom: '16px'
                          }}>
                            <span style={{ fontSize: '18px' }}>
                              {sentiment.label === 'Positive' ? '😊' : sentiment.label === 'Negative' ? '😟' : '😐'}
                            </span>
                            <span style={{
                              fontSize: '13px', fontWeight: '600',
                              color: SENTIMENT_COLORS[sentiment.label]?.color
                            }}>
                              {sentiment.label}
                            </span>
                          </div>

                          {/* Score bar */}
                          <div style={{ height: '6px', background: 'var(--surface2)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{
                              height: '100%', borderRadius: '3px',
                              width: `${Math.abs(sentiment.score) * 100}%`,
                              background: SENTIMENT_COLORS[sentiment.label]?.bar || 'var(--muted)',
                              transition: 'width 0.6s ease',
                              marginLeft: sentiment.score < 0 ? 'auto' : '0'
                            }} />
                          </div>
                        </div>

                        {/* Highlights */}
                        <div className="card">
                          <p style={{
                            fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--muted)',
                            marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.08em'
                          }}>
                            Key Highlights
                          </p>
                          {Array.isArray(sentiment.highlights) ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                              {sentiment.highlights.map((h, i) => (
                                <div key={i} style={{
                                  display: 'flex', gap: '10px', alignItems: 'flex-start',
                                  padding: '10px 14px', background: 'var(--surface2)',
                                  borderRadius: '8px', border: '1px solid var(--border)'
                                }}>
                                  <span style={{
                                    fontFamily: 'var(--mono)', fontSize: '11px',
                                    color: 'var(--accent)', fontWeight: '600',
                                    flexShrink: 0, marginTop: '1px'
                                  }}>
                                    {String(i + 1).padStart(2, '0')}
                                  </span>
                                  <p style={{ fontSize: '13px', color: 'var(--text-h)', lineHeight: '1.6' }}>
                                    {h}
                                  </p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: '1.6' }}>
                              {sentiment.highlights}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Re-analyze button */}
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button onClick={handleSentiment} className="btn btn-ghost" style={{ fontSize: '13px' }}>
                          ↺ Re-analyze
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

        </div>
      </div>

      {/* Floating chat — scoped to this specific meeting */}
      <ChatPanel meetingId={id} />
    </div>
  )
}