import { useState } from 'react'

export function ActionTable({ decisions, actionItems }) {
  const [activeTab, setActiveTab] = useState('actions') // 'actions' or 'decisions'

  return (
    <div>
      {/* Tab switcher */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button
          onClick={() => setActiveTab('actions')}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            background: activeTab === 'actions' ? '#6c63ff' : '#eee',
            color: activeTab === 'actions' ? '#fff' : '#333',
            fontWeight: '600'
          }}
        >
          Action Items ({actionItems.length})
        </button>
        <button
          onClick={() => setActiveTab('decisions')}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            background: activeTab === 'decisions' ? '#6c63ff' : '#eee',
            color: activeTab === 'decisions' ? '#fff' : '#333',
            fontWeight: '600'
          }}
        >
          Decisions ({decisions.length})
        </button>
      </div>

      {/* Action Items Table */}
      {activeTab === 'actions' && (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f5f5f5' }}>
              <th style={th}>#</th>
              <th style={th}>Task</th>
              <th style={th}>Owner</th>
              <th style={th}>Due Date</th>
            </tr>
          </thead>
          <tbody>
            {actionItems.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ ...td, textAlign: 'center', color: '#999' }}>
                  No action items found
                </td>
              </tr>
            ) : (
              actionItems.map((item, i) => (
                <tr key={item.id || i} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={td}>{i + 1}</td>
                  <td style={td}>{item.description}</td>
                  <td style={td}>
                    <span style={{
                      background: item.owner ? '#e8f4ff' : '#f5f5f5',
                      color: item.owner ? '#0070f3' : '#999',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '13px'
                    }}>
                      {item.owner || 'Unassigned'}
                    </span>
                  </td>
                  <td style={td}>
                    {item.due_date ? (
                      <span style={{
                        background: isOverdue(item.due_date) ? '#fff0f0' : '#f0fff4',
                        color: isOverdue(item.due_date) ? '#e53e3e' : '#276749',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '13px'
                      }}>
                        {item.due_date}
                      </span>
                    ) : (
                      <span style={{ color: '#999', fontSize: '13px' }}>No date</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

      {activeTab === 'decisions' && (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f5f5f5' }}>
              <th style={th}>#</th>
              <th style={th}>Decision</th>
            </tr>
          </thead>
          <tbody>
            {decisions.length === 0 ? (
              <tr>
                <td colSpan={2} style={{ ...td, textAlign: 'center', color: '#999' }}>
                  No decisions found
                </td>
              </tr>
            ) : (
              decisions.map((item, i) => (
                <tr key={item.id || i} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={td}>{i + 1}</td>
                  <td style={td}>{item.description}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  )
}


const th = {
  padding: '10px 14px',
  textAlign: 'left',
  fontWeight: '600',
  fontSize: '13px',
  color: '#555',
  borderBottom: '2px solid #ddd'
}

const td = {
  padding: '10px 14px',
  fontSize: '14px',
  color: '#333',
  verticalAlign: 'top'
}

function isOverdue(dateStr) {
  if (!dateStr) return false
  return new Date(dateStr) < new Date()
}