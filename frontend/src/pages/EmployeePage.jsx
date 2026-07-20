// src/pages/EmployeePage.jsx
import React, { useState } from 'react';
import CustomerCallForm from '../components/CustomerCallForm';
import MyScheduledCalls from '../components/MyScheduledCalls';

export const EmployeePage = () => {
  // Mock initial calls for agent
  const [scheduledCalls, setScheduledCalls] = useState([
    {
      id: 1,
      customer_name: 'Rachel Green',
      scheduled_time: '2026-07-20T14:30:00',
      estimated_duration_minutes: 15,
      status: 'Scheduled'
    },
    {
      id: 2,
      customer_name: 'Michael Scott',
      scheduled_time: '2026-07-20T16:00:00',
      estimated_duration_minutes: 30,
      status: 'Scheduled'
    }
  ]);

  const handleAddCall = (newCall) => {
    setScheduledCalls((prev) => [newCall, ...prev]);
  };

  return (
    <div style={{ padding: '30px', fontFamily: 'Arial, sans-serif', direction: 'ltr', backgroundColor: '#f8f9fa', color: '#333', minHeight: '100vh' }}>
      
      {/* Title */}
      <div style={{ marginBottom: '25px', borderBottom: '2px solid #e9ecef', paddingBottom: '10px' }}>
        <h1 style={{ margin: 0, color: '#2c3e50', fontSize: '26px' }}>
          Agent Portal 
          <span style={{ color: '#6c757d', fontSize: '20px', marginLeft: '10px', fontWeight: 'normal' }}>
            | Customer Call Logging & Schedule
          </span>
        </h1>
      </div>

      {/* 1. Form Component */}
      <CustomerCallForm onAddCall={handleAddCall} />

      {/* 2. List Component */}
      <MyScheduledCalls calls={scheduledCalls} />

    </div>
  );
};

export default EmployeePage;