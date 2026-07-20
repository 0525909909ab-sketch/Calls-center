// src/pages/EmployeePage.jsx
import React, { useState, useEffect } from 'react';
import CustomerCallForm from '../components/CustomerCallForm';
import MyScheduledCalls from '../components/MyScheduledCalls';
import { createScheduledCall, fetchScheduledCalls } from '../services/api';

export const EmployeePage = () => {
  const [scheduledCalls, setScheduledCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentEmployeeId = 1; // Example logged in agent

  const loadCalls = async () => {
    setLoading(true);
    const data = await fetchScheduledCalls(currentEmployeeId);
    setScheduledCalls(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadCalls();
  }, []);

  const handleAddCall = async (newCall) => {
    const payload = {
      employee_id: currentEmployeeId,
      customer_name: newCall.customer_name,
      scheduled_time: newCall.scheduled_time,
      estimated_duration_minutes: newCall.estimated_duration_minutes
    };

    const success = await createScheduledCall(payload);
    if (success) {
      loadCalls();
    } else {
      alert("❌ Failed to save call in database.");
    }
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

      {/* 1. Call Form */}
      <CustomerCallForm onAddCall={handleAddCall} />

      {/* 2. Scheduled Calls Table */}
      {loading ? (
        <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>⏳ Loading agent calls...</div>
      ) : (
        <MyScheduledCalls calls={scheduledCalls} />
      )}

    </div>
  );
};

export default EmployeePage;