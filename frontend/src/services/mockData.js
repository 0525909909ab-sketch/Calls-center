// src/services/mockData.js

// 1. Call forecast predictions by hour (from hourly_call_forecast table)
export const mockHourlyForecast = [
  { timestamp: '2026-07-20T08:00:00', predicted_volume: 20, average_call_duration: 900 },
  { timestamp: '2026-07-20T09:00:00', predicted_volume: 45, average_call_duration: 900 },
  { timestamp: '2026-07-20T10:00:00', predicted_volume: 65, average_call_duration: 900 },
  { timestamp: '2026-07-20T11:00:00', predicted_volume: 40, average_call_duration: 900 },
  { timestamp: '2026-07-20T12:00:00', predicted_volume: 25, average_call_duration: 900 },
  { timestamp: '2026-07-20T13:00:00', predicted_volume: 50, average_call_duration: 900 },
  { timestamp: '2026-07-20T14:00:00', predicted_volume: 55, average_call_duration: 900 },
  { timestamp: '2026-07-20T15:00:00', predicted_volume: 30, average_call_duration: 900 },
];

// 2. Employee roster and details (from employees table)
export const mockEmployees = [
  { id: 1, name: 'Guy Tzviel', role: 'Manager', available_from: '08:00', available_to: '16:00' },
  { id: 2, name: 'Salome Shorny', role: 'Agent', available_from: '08:00', available_to: '16:00' },
  { id: 3, name: 'Daniel Cohen', role: 'Agent', available_from: '09:00', available_to: '17:00' },
  { id: 4, name: 'Michal Levi', role: 'Agent', available_from: '10:00', available_to: '18:00' },
  { id: 5, name: 'Yossi Abraham', role: 'Agent', available_from: '08:00', available_to: '16:00' },
];

// 3. Actual assigned schedule (from employee_schedule table)
export const mockSchedule = [
  { employee_id: 1, employee_name: 'Guy Tzviel', role: 'Manager', timestamp: '2026-07-20T08:00:00' },
  { employee_id: 2, employee_name: 'Salome Shorny', role: 'Agent', timestamp: '2026-07-20T08:00:00' },
  { employee_id: 3, employee_name: 'Daniel Cohen', role: 'Agent', timestamp: '2026-07-20T09:00:00' },
  { employee_id: 4, employee_name: 'Michal Levi', role: 'Agent', timestamp: '2026-07-20T10:00:00' },
];

// 💡 Helper function to calculate required staffing:
export const calculateRequiredStaff = (predictedVolume, avgDurationSec = 900) => { // 👈 שינוי ל-900 שניות (15 דקות)
  const callsPerWorkerPerHour = 3600 / avgDurationSec; // 3600 / 900 = 4 שיחות בשעה
  return Math.ceil(predictedVolume / callsPerWorkerPerHour);
};