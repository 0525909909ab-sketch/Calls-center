import React from 'react';

const calculateRequiredStaff = (volume, duration) => {
  if (!volume || !duration) return 0;
  return Math.ceil(volume / (3600 / duration));
};

const DemandChart = ({ data, timeframe, employees = [], onToggleEmployee }) => {
  return (
    <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '25px' }}>
      <h3 style={{ marginBottom: '15px', color: '#1a252f', textAlign: 'left' }}>
        Workload & Staffing Planning ({timeframe === 'daily' ? 'Hourly' : timeframe === 'weekly' ? 'Daily' : 'Weekly'})
      </h3>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6', color: '#495057' }}>
              <th style={{ padding: '12px' }}>Hour / Slot</th>
              <th style={{ padding: '12px' }}>Expected Calls</th>
              <th style={{ padding: '12px' }}>Required Staff</th>
              <th style={{ padding: '12px' }}>Assigned Staff</th>
              <th style={{ padding: '12px' }}>Quick Shift Assignment</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => {
              const required = item.required_agents || calculateRequiredStaff(item.predicted_volume, item.average_call_duration || 900);
              const assignedList = item.assigned || [];
              const assignedCount = item.assigned_agents !== undefined ? item.assigned_agents : assignedList.length;

              return (
                <tr key={index} style={{ borderBottom: '1px solid #e9ecef', backgroundColor: index % 2 === 0 ? '#ffffff' : '#fcfcfc' }}>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>{item.label || item.timestamp}</td>
                  <td style={{ padding: '12px' }}>{item.predicted_volume} calls</td>
                  <td style={{ padding: '12px', fontWeight: 'bold', color: '#007bff' }}>{required}</td>
                  <td style={{ padding: '12px', fontWeight: 'bold', color: '#28a745' }}>{assignedCount}</td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                      {employees.map(emp => {
                        const isAssigned = assignedList.includes(emp.id);
                        return (
                          <button
                            key={emp.id}
                            onClick={() => onToggleEmployee && onToggleEmployee(item.timestamp, emp.id)}
                            style={{
                              padding: '4px 10px',
                              fontSize: '12px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              border: isAssigned ? '1px solid #16a34a' : '1px solid #cbd5e1',
                              backgroundColor: isAssigned ? '#dcfce7' : '#ffffff',
                              color: isAssigned ? '#15803d' : '#64748b',
                              fontWeight: 'bold',
                            }}
                          >
                            {emp.name} {emp.role === 'Manager' ? '👑' : '🎧'}
                          </button>
                        );
                      })}
                    </div>
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