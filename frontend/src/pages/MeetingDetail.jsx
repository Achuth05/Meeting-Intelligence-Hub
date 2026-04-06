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

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '28px 20px 80px' }}> {/* Adjusted horizontal padding for mobile */}

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

        {/* Analyze CTA */}
        {!extracted && (
          <div className="card cta-card" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
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
            {/* Stats - Grid on mobile, flex on desktop */}
            <div className="stats-grid" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px' }}>
              {[
                { label: 'Action Items', value: actionItems.length, color: 'var(--accent)' },
                { label: 'Decisions', value: decisions.length, color: 'var(--accent2)' },
                sentiment && { label: 'Sentiment', value: sentiment.label, color: SENTIMENT_COLORS[sentiment.label]?.color },
              ].filter(Boolean).map((s, i) => (
                <div key={i} className="card stat-card" style={{ padding: '14px 20px', minWidth: '120px', flex: 1 }}>
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

            {/* Actions tab — Side-by-side on Desktop, Stacked on Mobile */}
            {activeTab === 'actions' && (
              <div className="responsive-grid">
                {/* Action Items */}
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-h)' }}>Action Items</h3>
                    <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '12px', background: 'rgba(79,142,247,0.1)', color: 'var(--accent)', fontWeight: '600' }}>{actionItems.length}</span>
                  </div>
                  <div style={{ maxHeight: '440px', overflowY: 'auto' }}>
                    {actionItems.length === 0 ? (
                      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)' }}>No items found</div>
                    ) : actionItems.map((item, i) => (
                      <div key={i} style={{ padding: '14px 20px', borderBottom: i < actionItems.length - 1 ? '1px solid var(--border)' : 'none' }}>
                        <p style={{ fontSize: '13px', color: 'var(--text-h)', marginBottom: '8px' }}>{capitalize(item.description)}</p>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {item.owner && <span className="badge-small">👤 {item.owner}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Decisions */}
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-h)' }}>Decisions</h3>
                    <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '12px', background: 'rgba(0,229,176,0.1)', color: 'var(--accent2)', fontWeight: '600' }}>{decisions.length}</span>
                  </div>
                  <div style={{ maxHeight: '440px', overflowY: 'auto' }}>
                    {decisions.map((item, i) => (
                      <div key={i} style={{ padding: '14px 20px', borderBottom: i < decisions.length - 1 ? '1px solid var(--border)' : 'none', display: 'flex', gap: '12px' }}>
                        <span style={{ color: 'var(--accent2)', fontWeight: '700' }}>{i + 1}</span>
                        <p style={{ fontSize: '13px', color: 'var(--text-h)' }}>{capitalize(item.description)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Sentiment tab */}
            {activeTab === 'sentiment' && (
              <div className="sentiment-container">
                {sentimentLoading ? (
                  <div style={{ textAlign: 'center', padding: '60px' }}><span className="spinner" /></div>
                ) : sentiment && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    {/* Row 1 — Score + Highlights responsive grid */}
                    <div className="responsive-grid sentiment-top">
                      <div className="card score-card" style={{ textAlign: 'center', padding: '32px' }}>
                        <p style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--muted)' }}>Overall Sentiment</p>
                        <div style={{ fontSize: '56px', fontWeight: '800', color: SENTIMENT_COLORS[sentiment.label]?.color }}>
                           {((sentiment.overall_score || 0) * 100).toFixed(0)}
                        </div>
                        <div className="badge-sentiment">{sentiment.label}</div>
                      </div>

                      <div className="card">
                        <p style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '16px' }}>Highlights</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                           {sentiment.highlights?.map((h, i) => (
                             <div key={i} className="highlight-item">{h}</div>
                           ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <ChatPanel meetingId={id} />

      <style>{`
        /* Desktop Layout (Default) */
        .responsive-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        /* Mobile Layout Adjustments */
        @media (max-width: 768px) {
          .responsive-grid {
            grid-template-columns: 1fr; /* Changes side-by-side to stacked */
          }
          
          .stats-grid {
            display: grid !important;
            grid-template-columns: 1fr 1fr; /* Stats 2x2 on mobile */
          }

          .stat-card {
             min-width: 0 !important;
          }

          .cta-card {
            flex-direction: column;
            align-items: flex-start !important;
          }

          .cta-card button {
            width: 100%;
          }
        }

        .highlight-item {
          padding: 12px;
          background: var(--surface2);
          border-radius: 8px;
          border: 1px solid var(--border);
          font-size: 13px;
        }

        .badge-small {
          font-size: 11px; 
          padding: 2px 8px; 
          border-radius: 12px; 
          background: rgba(79,142,247,0.1); 
          color: var(--accent);
        }

        .badge-sentiment {
          display: inline-block;
          padding: 6px 16px;
          border-radius: 20px;
          background: var(--surface2);
          font-weight: 700;
          font-size: 14px;
        }
      `}</style>
    </div>
  )
}