// src/components/MyScheduledCalls.jsx
import React from 'react';

export const MyScheduledCalls = ({ calls = [] }) => {
  return (
    <div style={{
      backgroundColor: '#ffffff',
      padding: '24px',
      borderRadius: '8px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h3 style={{ margin: '0 0 15px 0', color: '#1e293b', fontSize: '18px' }}>
        📋 My Scheduled Calls ({calls.length})
      </h3>

      {calls.length === 0 ? (
        <p style={{ color: '#94a3b8', fontStyle: 'italic', margin: 0 }}>
          No upcoming customer calls scheduled yet.
        </p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                <th style={{ padding: '12px' }}>Customer Name</th>
                <th style={{ padding: '12px' }}>Scheduled Date & Time</th>
                <th style={{ padding: '12px' }}>Duration</th>
                <th style={{ padding: '12px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {calls.map((call) => (
                <tr key={call.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px', fontWeight: 'bold', color: '#1e293b' }}>
                    {call.customer_name}
                  </td>
                  <td style={{ padding: '12px', color: '#334155' }}>
                    {new Date(call.scheduled_time).toLocaleString('en-US', {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    })}
                  </td>
                  <td style={{ padding: '12px', color: '#334155' }}>
                    {call.estimated_duration_minutes} mins
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      backgroundColor: '#e0f2fe',
                      color: '#0369a1'
                    }}>
                      {call.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyScheduledCalls;