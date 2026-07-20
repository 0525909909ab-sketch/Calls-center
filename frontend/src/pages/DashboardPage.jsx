// src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import DashboardFilters from '../components/DashboardFilters';
import KpiCards from '../components/KpiCards';
import DemandChart from '../components/DemandChart';
import { fetchDashboardData, fetchWorkforceData, runAutoScheduler, toggleEmployeeAssignment } from '../services/api';

import { ManagerExcelActions } from '../components/ManagerExcelActions';
import { CoverageWarnings } from '../components/CoverageWarnings';

const DashboardPage = () => {
  const [timeframe, setTimeframe] = useState('daily');
  const [selectedDate, setSelectedDate] = useState('2026-07-20');
  const [dashboardData, setDashboardData] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scheduling, setScheduling] = useState(false);

  const loadAllData = async () => {
    setLoading(true);
    const [dashData, workforce] = await Promise.all([
      fetchDashboardData(timeframe, selectedDate),
      fetchWorkforceData()
    ]);
    setDashboardData(dashData || []);
    setEmployees(workforce.employees || []);
    setLoading(false);
  };

  useEffect(() => {
    loadAllData();
  }, [timeframe, selectedDate]);

  // 🪄 הרצת מנוע השיבוץ האוטומטי בלחיצת כפתור
  const handleAutoSchedule = async () => {
    setScheduling(true);
    const res = await runAutoScheduler(selectedDate);
    setScheduling(false);

    if (res && res.status === 'success') {
      alert(`🎉 Auto-Scheduler finished! Scheduled ${res.agents_scheduled} agent shifts.`);
      loadAllData(); // טעינה מחדש של הלו"ז המעודכן
    } else {
      alert("❌ Auto-scheduling failed or server offline.");
    }
  };

  const handleToggleEmployee = async (timeBlock, employeeId) => {
    const success = await toggleEmployeeAssignment(timeBlock, employeeId);
    if (success) {
      loadAllData();
    }
  };

  const totalCalls = dashboardData.reduce((acc, item) => acc + (item.predicted_volume || 0), 0);
  const totalDurationHours = Math.round(
    dashboardData.reduce((acc, item) => acc + ((item.predicted_volume || 0) * (item.average_call_duration || 900)), 0) / 3600
  );
  
  const requiredStaff = dashboardData.reduce((acc, item) => acc + (item.required_agents || 0), 0);
  const assignedStaff = dashboardData.reduce((acc, item) => acc + (item.assigned_agents || 0), 0);

  return (
    <div style={{ padding: '30px', fontFamily: 'Arial, sans-serif', direction: 'ltr', backgroundColor: '#f8f9fa', color: '#333', minHeight: '100vh' }}>
      
      {/* Title + Magic Wand Auto-Schedule Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', borderBottom: '2px solid #e9ecef', paddingBottom: '15px' }}>
        <h1 style={{ margin: 0, color: '#2c3e50', fontSize: '26px' }}>
          Manager Control Center 
          <span style={{ color: '#6c757d', fontSize: '18px', marginLeft: '10px', fontWeight: 'normal' }}>
            | Workload & Auto-Scheduling Engine
          </span>
        </h1>

        {/* 🪄 הכפתור שמנצח את ההאקתון */}
        <button
          onClick={handleAutoSchedule}
          disabled={scheduling}
          style={{
            padding: '12px 24px',
            backgroundColor: scheduling ? '#94a3b8' : '#8b5cf6',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            fontSize: '15px',
            cursor: scheduling ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 6px rgba(139, 92, 246, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease'
          }}
        >
          {scheduling ? '⏳ Running AI Engine...' : '🪄 Auto-Schedule Workforce'}
        </button>
      </div>

      {/* 1. Live Excel Actions */}
      <div style={{ marginBottom: '25px' }}>
        <ManagerExcelActions onUploadSuccess={loadAllData} scheduleData={dashboardData} employees={employees} />
      </div>
      
      {/* 2. Filters */}
      <DashboardFilters 
        timeframe={timeframe} 
        setTimeframe={setTimeframe} 
        selectedDate={selectedDate} 
        setSelectedDate={setSelectedDate} 
      />

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>⏳ Loading live control center...</div>
      ) : (
        <>
          {/* 3. KPI Cards */}
          <KpiCards 
            totalCalls={totalCalls} 
            totalDurationHours={totalDurationHours} 
            requiredStaff={requiredStaff} 
            assignedStaff={assignedStaff} 
          />

          {/* 4. Demand Chart with Quick Employee Assignment */}
          <DemandChart 
            data={dashboardData} 
            timeframe={timeframe} 
            employees={employees}
            onToggleEmployee={handleToggleEmployee}
          />
        </>
      )}

      {/* 5. Coverage Warnings */}
      <div style={{ marginTop: '25px' }}>
        <CoverageWarnings scheduleData={dashboardData} employees={employees} />
      </div>

    </div>
  );
};

export default DashboardPage;