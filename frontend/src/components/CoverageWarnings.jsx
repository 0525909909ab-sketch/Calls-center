import React from 'react';

export const CoverageWarnings = ({ warnings = [] }) => {
  if (warnings.length === 0) {
    return (
      <div style={{ padding: '16px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', borderRadius: '8px', border: '1px solid #10b981', direction: 'ltr', textAlign: 'left' }}>
        ✅ <strong>Schedule Status OK:</strong> No coverage issues or employee hour limits exceeded in the current schedule.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', direction: 'ltr', textAlign: 'left', fontFamily: 'sans-serif' }}>
      <h3 style={{ margin: '0 0 4px 0', color: '#f43f5e', fontSize: '18px' }}>🚨 Operational Alerts & Coverage Risks:</h3>
      
      {warnings.map((warning) => (
        <div 
          key={warning.id} 
          style={{
            padding: '14px 16px',
            backgroundColor: '#1e293b',
            borderLeft: `5px solid ${warning.severity === 'high' ? '#f43f5e' : '#f59e0b'}`,
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          <strong style={{ display: 'block', color: warning.severity === 'high' ? '#f43f5e' : '#f59e0b', marginBottom: '4px', fontSize: '15px' }}>
            {warning.title}
          </strong>
          <p style={{ fontSize: '14px', color: '#94a3b8', margin: '0 0 6px 0' }}>
            {warning.description}
          </p>
          
          {warning.reason && (
            <div style={{ marginTop: '8px', padding: '6px 10px', backgroundColor: 'rgba(244, 63, 94, 0.1)', border: '1px dashed rgba(244, 63, 94, 0.3)', borderRadius: '4px', fontSize: '13px', color: '#fda4af' }}>
              💡 <strong>System Analysis:</strong> {warning.reason}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
