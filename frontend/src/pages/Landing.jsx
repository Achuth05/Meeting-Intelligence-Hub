import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function Landing() {
  const { user } = useAuth()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>

      {/* Nav */}
      <nav className="landing-nav" style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '20px 48px', borderBottom: '1px solid var(--border)',
          position: 'sticky', top: 0, background: 'rgba(15,17,23,0.9)',
          backdropFilter: 'blur(12px)', zIndex: 100
      }}>
          {/* Logo Section */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              <div style={{
                  width: '28px', height: '28px', background: 'var(--accent)',
                  borderRadius: '6px', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '14px', fontWeight: '800', color: 'white'
              }}>M</div>
              <span style={{ fontWeight: '700', fontSize: '16px', color: 'var(--text-h)' }}>
                  Meet<span style={{ color: 'var(--accent)' }}>Cognit</span>
              </span>
          </div>

          {/* Auth Links Section */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
              {user ? (
                  <Link to="/dashboard" className="btn btn-primary" style={{ fontSize: '13px', padding: '8px 12px' }}>Dashboard →</Link>
              ) : (
                  <>
                      <Link to="/auth" className="btn btn-ghost" style={{ fontSize: '13px', padding: '8px 12px' }}>Login</Link>
                      <Link to="/auth" className="btn btn-primary" style={{ fontSize: '13px', padding: '8px 12px' }}>Get Started</Link>
                  </>
              )}
          </div>
      </nav>

      {/* Hero */}
      <section style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '80px 48px', textAlign: 'center', position: 'relative', overflow: 'hidden'
      }}>
        {/* Background blobs */}
        <div style={{
          position: 'absolute', top: '10%', left: '20%',
          width: '400px', height: '400px',
          background: 'radial-gradient(circle, rgba(79,142,247,0.08) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', right: '15%',
          width: '300px', height: '300px',
          background: 'radial-gradient(circle, rgba(0,229,176,0.06) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ maxWidth: '760px', position: 'relative', animation: 'fadeUp 0.5s ease' }}>
          <div className="badge badge-blue" style={{ marginBottom: '24px', fontSize: '13px', padding: '6px 14px' }}>
            AI-Powered Meeting Analysis
          </div>

          <h1 style={{
            fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: '800',
            lineHeight: '1.1', letterSpacing: '-0.03em',
            color: 'var(--text-h)', marginBottom: '24px'
          }}>
            Turn meeting transcripts<br />
            into <span style={{ color: 'var(--accent)' }}>actionable intelligence</span>
          </h1>

          <p style={{
            fontSize: '18px', color: 'var(--text)', lineHeight: '1.7',
            marginBottom: '40px', maxWidth: '560px', margin: '0 auto 40px'
          }}>
           Uncover your team’s collective momentum through an intelligent meeting hub designed to eliminate the drag of double work.
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/auth" className="btn btn-primary" style={{ padding: '12px 32px', fontSize: '15px' }}>
              Start for free →
            </Link>
            <a href="#features" className="btn btn-ghost" style={{ padding: '12px 32px', fontSize: '15px' }}>
              See Features ↓
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '80px 48px', borderTop: '1px solid var(--border)' }}>
        <div id='features' style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <p style={{
            fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--accent)',
            textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '12px', textAlign: 'center'
          }}>
            Features
          </p>
          <h2 style={{
            fontSize: '32px', fontWeight: '700', textAlign: 'center',
            marginBottom: '56px', letterSpacing: '-0.02em'
          }}>
            Everything your team needs
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            {[
              { icon: '⚡', title: 'Smart Extraction', desc: 'Auto-extract decisions and action items with owner and due date from any transcript', color: 'var(--accent)' },
              { icon: '📊', title: 'Sentiment Analysis', desc: 'Visual dashboard showing tone, conflict zones, and per-speaker sentiment breakdown', color: 'var(--accent2)' },
              { icon: '💬', title: 'AI Chatbot', desc: 'Ask questions across all your meetings. Get cited answers grounded in transcript text', color: 'var(--accent3)' },
              { icon: '📥', title: 'Export', desc: 'Download action items and decisions as CSV or PDF with one click', color: '#a78bfa' },
            ].map((f, i) => (
              <div key={i} className="card" style={{
                transition: 'all 0.2s', cursor: 'default',
                animationDelay: `${i * 0.1}s`
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--border2)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  background: 'var(--surface2)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: '20px', marginBottom: '16px'
                }}>{f.icon}</div>
                <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '8px', color: 'var(--text-h)' }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: '1.6' }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '80px 48px', background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{
            fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--accent2)',
            textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '12px'
          }}>
            How it works
          </p>
          <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '56px', letterSpacing: '-0.02em' }}>
            From transcript to insight in minutes
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0' }}>
            {[
              { n: '01', title: 'Upload', desc: 'Drop your .txt or .vtt transcript file' },
              { n: '02', title: 'Process', desc: 'AI extracts decisions, actions and sentiment' },
              { n: '03', title: 'Explore', desc: 'Chat with AI and review insights' },
              { n: '04', title: 'Export', desc: 'Share with your team as CSV or PDF' },
            ].map((s, i) => (
              <div key={i} style={{
                padding: '32px 24px', position: 'relative',
                borderBottom: '1px solid var(--border)'
              }}>
                <div style={{
                  fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--accent)',
                  marginBottom: '16px', fontWeight: '500'
                }}>{s.n}</div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px' }}>{s.title}</h3>
                <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: '1.6' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      {!user && (
        <section style={{ padding: '80px 48px', textAlign: 'center', borderTop: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '800', letterSpacing: '-0.03em', marginBottom: '16px' }}>
            Ready to get started?
          </h2>
          <Link to="/auth" className="btn btn-primary" style={{ padding: '14px 40px', fontSize: '16px' }}>
            Create your account →
          </Link>
        </section>
      )}

      {/* Footer */}
      <footer style={{
        padding: '24px 48px', borderTop: '1px solid var(--border)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: '8px'
      }}>
        <span style={{ fontWeight: '700', fontSize: '14px' }}>
          Meet<span style={{ color: 'var(--accent)' }}>Cognit</span>
        </span>
        <p style={{ color: 'var(--muted)', fontSize: '13px' }}>
          © 2026 Meeting Intelligence Hub.
        </p>
      </footer>
      <style>{`
          @media (max-width: 640px) {
            .landing-nav {
              /* Reduce the 48px padding to 16px so items don't touch */
              padding: 15px 16px !important;
            }
            
            .landing-nav .btn {
              /* Slightly smaller buttons on mobile to save space */
              padding: 6px 10px !important;
              font-size: 12px !important;
            }

            /* Prevents the logo text from getting squashed */
            .landing-nav span {
              font-size: 14px !important;
            }
          }
      `}</style>
    </div>
  )
}