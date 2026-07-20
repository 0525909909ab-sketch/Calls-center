// src/components/DemandChart.jsx
import React from 'react';
import "../services/api"

const calculateRequiredStaff = (volume, duration) => {
  if (!volume || !duration) return 0;
  return Math.ceil(volume / (3600 / duration));
};
const DemandChart = ({ data, timeframe }) => {
  return (
    <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '25px' }}>
      <h3 style={{ marginBottom: '15px', color: '#1a252f', textAlign: 'left' }}>
        Workload & Staffing Planning ({timeframe === 'daily' ? 'Hourly' : timeframe === 'weekly' ? 'Daily' : 'Weekly'})
      </h3>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6', color: '#495057' }}>
              <th style={{ padding: '12px' }}>
                {timeframe === 'daily' ? 'Hour' : timeframe === 'weekly' ? 'Day' : 'Period'}
              </th>
              <th style={{ padding: '12px' }}>Expected Calls</th>
              <th style={{ padding: '12px' }}>Required Staff</th>
              <th style={{ padding: '12px' }}>Assigned Staff</th>
              <th style={{ padding: '12px' }}>Staffing Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => {
              // Display label or formatted time
              let timeFormatted = item.label;
              if (!timeFormatted) {
                const dateObj = new Date(item.timestamp);
                timeFormatted = dateObj.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false
                });
              }

              // Calculations
              const required = calculateRequiredStaff(item.predicted_volume, item.average_call_duration);
              const assigned = Math.max(1, required - (item.predicted_volume > 50 ? 1 : 0));
              const diff = assigned - required;

              // Determine status badge color
              let statusText = 'Balanced';
              let badgeBg = '#d4edda';
              let badgeColor = '#155724';

              if (diff < 0) {
                statusText = `Shortage (${Math.abs(diff)})`;
                badgeBg = '#f8d7da';
                badgeColor = '#721c24';
              } else if (diff > 0) {
                statusText = `Surplus (${diff})`;
                badgeBg = '#fff3cd';
                badgeColor = '#856404';
              }

              return (
                <tr key={index} style={{ borderBottom: '1px solid #e9ecef', backgroundColor: index % 2 === 0 ? '#ffffff' : '#fcfcfc' }}>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>{timeFormatted}</td>
                  <td style={{ padding: '12px' }}>{item.predicted_volume.toLocaleString()} calls</td>
                  <td style={{ padding: '12px', fontWeight: 'bold', color: '#007bff' }}>{required}</td>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>{assigned}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '6px 12px',
                      borderRadius: '12px',
                      fontSize: '13px',
                      fontWeight: 'bold',
                      backgroundColor: badgeBg,
                      color: badgeColor,
                      display: 'inline-block'
                    }}>
                      {statusText}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DemandChart;