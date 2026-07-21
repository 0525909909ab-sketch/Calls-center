// src/components/CustomerCallForm.jsx
import React, { useState } from 'react';

export const CustomerCallForm = ({ onAddCall }) => {
  const [customerName, setCustomerName] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState('15');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!customerName || !scheduledTime) {
      alert('Please fill in both customer name and scheduled time.');
      return;
    }

    // המרה לפורמט ISO מלא (YYYY-MM-DDTHH:mm:ss.sssZ) כדי ש-FastAPI יבין את התאריך בצורה חלק
    const formattedDate = new Date(scheduledTime).toISOString();

    const newCall = {
      id: Date.now(),
      customer_name: customerName,
      scheduled_time: formattedDate,
      estimated_duration_minutes: parseInt(estimatedDuration, 10),
      status: 'Scheduled'
    };

    onAddCall(newCall);

    // Reset Form
    setCustomerName('');
    setScheduledTime('');
    setEstimatedDuration('15');
  };

  return (
    <div style={{
      backgroundColor: '#ffffff',
      padding: '24px',
      borderRadius: '8px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      marginBottom: '25px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h3 style={{ margin: '0 0 15px 0', color: '#1e293b', fontSize: '18px' }}>
        📞 Log Upcoming Customer Call
      </h3>
      <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>
        Report scheduled calls with customers so workload forecasting can adjust accordingly.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', alignItems: 'end' }}>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#475569', marginBottom: '6px' }}>
            Customer Name
          </label>
          <input
            type="text"
            placeholder="e.g. David Levi"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#475569', marginBottom: '6px' }}>
            Scheduled Date & Time
          </label>
          <input
            type="datetime-local"
            value={scheduledTime}
            onChange={(e) => setScheduledTime(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#475569', marginBottom: '6px' }}>
            Est. Duration (Minutes)
          </label>
          <select
            value={estimatedDuration}
            onChange={(e) => setEstimatedDuration(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
          >
            <option value="5">5 Minutes</option>
            <option value="10">10 Minutes</option>
            <option value="15">15 Minutes</option>
            <option value="30">30 Minutes</option>
            <option value="45">45 Minutes</option>
            <option value="60">60 Minutes</option>
          </select>
        </div>

        <div>
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '11px',
              backgroundColor: '#007bff',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            ➕ Schedule Call
          </button>
        </div>
      </form>
    </div>
  );
};

export default CustomerCallForm;