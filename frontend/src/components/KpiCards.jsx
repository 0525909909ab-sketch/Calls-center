import React from 'react';

const KpiCards = ({ totalCalls, totalDurationHours, requiredStaff, assignedStaff }) => {
  // Calculate coverage percentage
  const coveragePercent = requiredStaff > 0 ? Math.round((assignedStaff / requiredStaff) * 100) : 100;
  
  // Color coding for coverage indicator
  const isUnderstaffed = coveragePercent < 100;

  const cardStyle = {
    flex: '1',
    padding: '20px',
    borderRadius: '8px',
    backgroundColor: '#ffffff',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    borderLeft: '4px solid #007bff',
    textAlign: 'left'
  };

  return (
    <div style={{ display: 'flex', gap: '20px', marginBottom: '25px' }}>
      
      {/* Total Predicted Calls */}
      <div style={cardStyle}>
        <span style={{ fontSize: '14px', color: '#6c757d' }}>Total Predicted Calls</span>
        <h2 style={{ margin: '10px 0 0 0', fontSize: '28px', color: '#212529' }}>{totalCalls}</h2>
      </div>

      {/* Total Call Duration (Hours) */}
      <div style={{ ...cardStyle, borderLeftColor: '#17a2b8' }}>
        <span style={{ fontSize: '14px', color: '#6c757d' }}>Est. Call Duration</span>
        <h2 style={{ margin: '10px 0 0 0', fontSize: '28px', color: '#212529' }}>{totalDurationHours} hrs</h2>
      </div>

      {/* Staff Required vs Assigned */}
      <div style={{ ...cardStyle, borderLeftColor: '#ffc107' }}>
        <span style={{ fontSize: '14px', color: '#6c757d' }}>Assigned / Required Staff</span>
        <h2 style={{ margin: '10px 0 0 0', fontSize: '28px', color: '#212529' }}>
          {assignedStaff} / {requiredStaff}
        </h2>
      </div>

      {/* Coverage Percentage Indicator */}
      <div style={{ ...cardStyle, borderLeftColor: isUnderstaffed ? '#dc3545' : '#28a745' }}>
        <span style={{ fontSize: '14px', color: '#6c757d' }}>Staffing Coverage</span>
        <h2 style={{ margin: '10px 0 0 0', fontSize: '28px', color: isUnderstaffed ? '#dc3545' : '#28a745' }}>
          {coveragePercent}%
        </h2>
      </div>

    </div>
  );
};

export default KpiCards;