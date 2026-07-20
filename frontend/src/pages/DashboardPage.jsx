// src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import DashboardFilters from '../components/DashboardFilters';
import KpiCards from '../components/KpiCards';
import DemandChart from '../components/DemandChart';
import { fetchDashboardData } from '../services/api';

// Importing components
import { ManagerExcelActions } from '../components/ManagerExcelActions';
import { CoverageWarnings } from '../components/CoverageWarnings';

const DashboardPage = () => {
  const [timeframe, setTimeframe] = useState('daily');
  const [selectedDate, setSelectedDate] = useState('2026-06-28');
  const [dashboardData, setDashboardData] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const data = await fetchDashboardData(timeframe, selectedDate);
    setDashboardData(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [timeframe, selectedDate]);

  // Calculations based strictly on Backend API Data
  const totalCalls = dashboardData.reduce((acc, item) => acc + (item.predicted_volume || 0), 0);
  
  // Calculate duration (average_call_duration from DB)
  const totalDurationHours = Math.round(
    dashboardData.reduce((acc, item) => acc + ((item.predicted_volume || 0) * (item.average_call_duration || 900)), 0) / 3600
  );
  
  const requiredStaff = dashboardData.reduce((acc, item) => acc + (item.required_agents || 0), 0);
  const assignedStaff = dashboardData.reduce((acc, item) => acc + (item.assigned_agents || 0), 0);

  return (
    <div style={{ padding: '30px', fontFamily: 'Arial, sans-serif', direction: 'ltr', backgroundColor: '#f8f9fa', color: '#333', minHeight: '100vh' }}>
      
      {/* Title */}
      <div style={{ marginBottom: '25px', borderBottom: '2px solid #e9ecef', paddingBottom: '10px' }}>
        <h1 style={{ margin: 0, color: '#2c3e50', fontSize: '26px' }}>
          Manager Dashboard 
          <span style={{ color: '#6c757d', fontSize: '20px', marginLeft: '10px', fontWeight: 'normal' }}>
            | Workload & Staffing Planning
          </span>
        </h1>
      </div>

      {/* 1. Live Excel Upload Component */}
      <div style={{ marginBottom: '25px' }}>
        <ManagerExcelActions onUploadSuccess={loadData} scheduleData={dashboardData} employees={[]} />
      </div>
      
      {/* 2. Filters */}
      <DashboardFilters 
        timeframe={timeframe} 
        setTimeframe={setTimeframe} 
        selectedDate={selectedDate} 
        setSelectedDate={setSelectedDate} 
      />

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>⏳ Loading live data from server...</div>
      ) : (
        <>
          {/* 3. KPI Cards */}
          <KpiCards 
            totalCalls={totalCalls} 
            totalDurationHours={totalDurationHours} 
            requiredStaff={requiredStaff} 
            assignedStaff={assignedStaff} 
          />

          {/* 4. Demand Chart & Table */}
          <DemandChart data={dashboardData} timeframe={timeframe} />
        </>
      )}

      {/* 5. Coverage Warnings */}
      <div style={{ marginTop: '25px' }}>
        <CoverageWarnings scheduleData={dashboardData} />
      </div>

    </div>
  );
};

export default DashboardPage;