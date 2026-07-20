// src/pages/DashboardPage.jsx
import React, { useState } from 'react';
import DashboardFilters from '../components/DashboardFilters';
import KpiCards from '../components/KpiCards';
import DemandChart from '../components/DemandChart';
import { mockHourlyForecast, calculateRequiredStaff, mockEmployees, mockSchedule } from '../services/mockData';

// Importing components built by Developer B
import { ManagerExcelUpload } from '../components/ManagerExcelUpload';
import { CoverageWarnings } from '../components/CoverageWarnings';

const DashboardPage = () => {
  const [timeframe, setTimeframe] = useState('daily');
  const [selectedDate, setSelectedDate] = useState('2026-07-20');

  // Filter or process data based on selected timeframe
  const getProcessedData = () => {
    if (timeframe === 'daily') return mockHourlyForecast;
    if (timeframe === 'weekly') {
      return [
        { timestamp: '2026-07-19T00:00:00', predicted_volume: 320, average_call_duration: 180, label: 'Sunday' },
        { timestamp: '2026-07-20T00:00:00', predicted_volume: 340, average_call_duration: 180, label: 'Monday' },
        { timestamp: '2026-07-21T00:00:00', predicted_volume: 290, average_call_duration: 180, label: 'Tuesday' },
        { timestamp: '2026-07-22T00:00:00', predicted_volume: 310, average_call_duration: 180, label: 'Wednesday' },
        { timestamp: '2026-07-23T00:00:00', predicted_volume: 400, average_call_duration: 180, label: 'Thursday' },
        { timestamp: '2026-07-24T00:00:00', predicted_volume: 150, average_call_duration: 180, label: 'Friday' },
        { timestamp: '2026-07-25T00:00:00', predicted_volume: 80,  average_call_duration: 180, label: 'Saturday' },
      ];
    }
    if (timeframe === 'monthly') {
      return [
        { timestamp: '2026-07-01T00:00:00', predicted_volume: 1800, average_call_duration: 180, label: 'Week 1' },
        { timestamp: '2026-07-08T00:00:00', predicted_volume: 2100, average_call_duration: 180, label: 'Week 2' },
        { timestamp: '2026-07-15T00:00:00', predicted_volume: 1950, average_call_duration: 180, label: 'Week 3' },
        { timestamp: '2026-07-22T00:00:00', predicted_volume: 2200, average_call_duration: 180, label: 'Week 4' },
      ];
    }
    return mockHourlyForecast;
  };

  const activeData = getProcessedData();

  const totalCalls = activeData.reduce((acc, item) => acc + item.predicted_volume, 0);
  const totalDurationHours = Math.round((totalCalls * 180) / 3600);
  
  const requiredStaff = activeData.reduce((acc, item) => {
    return acc + calculateRequiredStaff(item.predicted_volume, item.average_call_duration);
  }, 0);

  const assignedStaff = Math.round(requiredStaff * 0.85);

  return (
    <div style={{ padding: '30px', fontFamily: 'Arial, sans-serif', direction: 'ltr', backgroundColor: '#f8f9fa', color: '#333', minHeight: '100vh' }}>
      
      {/* Updated, cleaner Title */}
      <div style={{ marginBottom: '25px', borderBottom: '2px solid #e9ecef', paddingBottom: '10px' }}>
        <h1 style={{ margin: 0, color: '#2c3e50', fontSize: '26px' }}>
          Manager Dashboard 
          <span style={{ color: '#6c757d', fontSize: '20px', marginLeft: '10px', fontWeight: 'normal' }}>
            | Workload & Staffing Planning
          </span>
        </h1>
      </div>

      {/* 1. Manager Live Excel Upload Component */}
      <div style={{ marginBottom: '25px' }}>
        <ManagerExcelUpload onUploadSuccess={() => alert("Data synced successfully!")} />
      </div>
      
      {/* 2. Filter Bar Component */}
      <DashboardFilters 
        timeframe={timeframe} 
        setTimeframe={setTimeframe} 
        selectedDate={selectedDate} 
        setSelectedDate={setSelectedDate} 
      />

      {/* 3. KPI Summary Cards Component */}
      <KpiCards 
        totalCalls={totalCalls} 
        totalDurationHours={totalDurationHours} 
        requiredStaff={requiredStaff} 
        assignedStaff={assignedStaff} 
      />

      {/* 4. Demand & Staffing Table Component */}
      <DemandChart data={activeData} timeframe={timeframe} />

      {/* 5. Coverage Warnings Component */}
      <div style={{ marginTop: '25px' }}>
        <CoverageWarnings scheduleData={mockSchedule} employees={mockEmployees} />
      </div>

    </div>
  );
};

export default DashboardPage;