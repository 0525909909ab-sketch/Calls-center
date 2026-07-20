import React, { useState } from 'react';
import DashboardFilters from '../components/DashboardFilters';
import KpiCards from '../components/KpiCards';
import DemandChart from '../components/DemandChart';
import { mockHourlyForecast, calculateRequiredStaff, mockEmployees, mockSchedule } from '../services/mockData';
import { ManagerExcelActions } from '../components/ManagerExcelActions';
import { CoverageWarnings } from '../components/CoverageWarnings';
import { calculateCoverageWarnings } from '../utils/warningsUtils';

const DashboardPage = () => {
  const [timeframe, setTimeframe] = useState('daily');
  const [selectedDate, setSelectedDate] = useState('2026-07-20');
  const [employees] = useState(mockEmployees || []);

  const [scheduleData, setScheduleData] = useState(() => {
    if (!mockHourlyForecast) return [];
    return mockHourlyForecast.map(forecast => {
      const activeAssignments = mockSchedule 
        ? mockSchedule.filter(s => s.timestamp === forecast.timestamp) 
        : [];
      return {
        time_block: forecast.timestamp,
        predicted_volume: forecast.predicted_volume || 0,
        avg_duration_sec: forecast.average_call_duration || 180,
        assigned: activeAssignments.map(s => s.employee_id)
      };
    });
  });

  const getProcessedData = () => {
    if (timeframe === 'daily') return mockHourlyForecast;
    if (timeframe === 'weekly') {
      return [
        { timestamp: '2026-07-19T00:00:00', predicted_volume: 320, average_call_duration: 180, label: 'Sunday' },
        { timestamp: '2026-07-20T00:00:00', predicted_volume: 340, average_call_duration: 180, label: 'Monday' },
        { timestamp: '2026-07-21T00:00:00', predicted_volume: 290, average_call_duration: 180, label: 'Tuesday' },
        { timestamp: '2026-07-22T00:00:00', predicted_volume: 310, average_call_duration: 180, label: 'Wednesday' },
        { timestamp: '2026-07-23T00:00:00', predicted_volume: 400, average_call_duration: 180, label: 'Thursday' },
        { timestamp: '2026-07-24T00:00:00', model: 150, average_call_duration: 180, label: 'Friday' },
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
    return acc + calculateRequiredStaff(item.predicted_volume, item.average_call_duration || 180);
  }, 0);

  const assignedStaff = scheduleData.reduce((acc, item) => acc + (item.assigned ? item.assigned.length : 0), 0);

  const activeWarnings = typeof calculateCoverageWarnings === "function"
    ? calculateCoverageWarnings(scheduleData, employees)
    : [];

  const handleExcelDataSynced = (newData) => {
    if (!Array.isArray(newData) || newData.length === 0) return;
    const mappedData = newData.map(item => ({
      time_block: item["Time Slot"] || item["Time Block"] || item["time_block"] || "00:00",
      predicted_volume: Number(item["Predicted Volume"] || item["predicted_volume"] || 0),
      avg_duration_sec: Number(item["Average Duration (Sec)"] || item["avg_duration_sec"] || 180),
      assigned: item["Assigned IDs"] ? item["Assigned IDs"].toString().split(",").map(id => Number(id.trim())).filter(id => !isNaN(id)) : []
    }));
    setScheduleData(mappedData);
    alert("🎉 Dashboard insights synchronized with new forecast data successfully!");
  };

  return (
    <div style={{ padding: '30px', fontFamily: 'Arial, sans-serif', direction: 'ltr', backgroundColor: '#f8f9fa', color: '#333', minHeight: '100vh' }}>
      
      <div style={{ marginBottom: '25px', borderBottom: '2px solid #e9ecef', paddingBottom: '10px' }}>
        <h1 style={{ margin: 0, color: '#2c3e50', fontSize: '26px' }}>
          Manager Dashboard 
          <span style={{ color: '#6c757d', fontSize: '20px', marginLeft: '10px', fontWeight: 'normal' }}>
            | Workload & Staffing Planning
          </span>
        </h1>
      </div>

      <div style={{ marginBottom: '25px' }}>
        <ManagerExcelActions 
          onUploadSuccess={handleExcelDataSynced} 
          scheduleData={scheduleData} 
          employees={employees} 
        />
      </div>
      
      <DashboardFilters 
        timeframe={timeframe} 
        setTimeframe={setTimeframe} 
        selectedDate={selectedDate} 
        setSelectedDate={setSelectedDate} 
      />

      <KpiCards 
        totalCalls={totalCalls} 
        totalDurationHours={totalDurationHours} 
        requiredStaff={requiredStaff} 
        assignedStaff={assignedStaff} 
      />

      <DemandChart data={activeData} timeframe={timeframe} />

      <div style={{ marginTop: '25px' }}>
        <CoverageWarnings warnings={activeWarnings} />
      </div>

    </div>
  );
};

export default DashboardPage;
