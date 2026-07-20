import React from 'react';

const DashboardFilters = ({ timeframe, setTimeframe, selectedDate, setSelectedDate }) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
      
      {/* Timeframe Toggle Buttons (Daily, Weekly, Monthly) */}
      <div style={{ display: 'flex', gap: '10px' }}>
        {['daily', 'weekly', 'monthly'].map((type) => (
          <button
            key={type}
            onClick={() => setTimeframe(type)}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: '1px solid #ccc',
              cursor: 'pointer',
              backgroundColor: timeframe === type ? '#007bff' : '#fff',
              color: timeframe === type ? '#fff' : '#333',
              fontWeight: timeframe === type ? 'bold' : 'normal',
              textTransform: 'capitalize'
            }}
          >
            {type === 'daily' ? 'Daily' : type === 'weekly' ? 'Weekly' : 'Monthly'}
          </button>
        ))}
      </div>

      {/* Date Picker */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <label htmlFor="date-picker" style={{ fontWeight: 'bold' }}>Select Date:</label>
        <input
          id="date-picker"
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
      </div>

    </div>
  );
};

export default DashboardFilters;