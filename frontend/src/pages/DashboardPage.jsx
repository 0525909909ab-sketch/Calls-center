// src/pages/DashboardPage.jsx
import React, { useState } from 'react';
import DashboardFilters from '../components/DashboardFilters';
import KpiCards from '../components/KpiCards';
import DemandChart from '../components/DemandChart';
import { mockHourlyForecast, calculateRequiredStaff } from '../services/mockData';

const DashboardPage = () => {
  // State for dashboard filters
  const [timeframe, setTimeframe] = useState('daily');
  const [selectedDate, setSelectedDate] = useState('2026-07-20');

  // Filter or process data based on selected timeframe
  const getProcessedData = () => {
    if (timeframe === 'daily') {
      // Show hourly breakdown for the selected day
      return mockHourlyForecast;
    } 
    
    if (timeframe === 'weekly') {
      // Simulate weekly aggregated data (7 days)
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
      // Simulate monthly aggregated data (4 weeks)
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

  // Calculate stats based on active timeframe data
  const totalCalls = activeData.reduce((acc, item) => acc + item.predicted_volume, 0);
  const totalDurationHours = Math.round((totalCalls * 180) / 3600);
  
  const requiredStaff = activeData.reduce((acc, item) => {
    return acc + calculateRequiredStaff(item.predicted_volume, item.average_call_duration);
  }, 0);

  const assignedStaff = Math.round(requiredStaff * 0.85);

  return (
    <div style={{ padding: '30px', fontFamily: 'Arial, sans-serif', direction: 'ltr' }}>
      <h1 style={{ marginBottom: '20px', color: '#1a252f' }}>
        Manager Dashboard - Workload & Staffing
      </h1>
      
      {/* 1. Filter Bar Component */}
      <DashboardFilters 
        timeframe={timeframe} 
        setTimeframe={setTimeframe} 
        selectedDate={selectedDate} 
        setSelectedDate={setSelectedDate} 
      />

      {/* 2. KPI Summary Cards Component */}
      <KpiCards 
        totalCalls={totalCalls} 
        totalDurationHours={totalDurationHours} 
        requiredStaff={requiredStaff} 
        assignedStaff={assignedStaff} 
      />

      {/* 3. Demand & Staffing Table Component */}
      <DemandChart data={activeData} timeframe={timeframe} />

    </div>
  );
};

export default DashboardPage;