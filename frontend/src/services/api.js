// src/services/api.js
const API_BASE_URL = "http://127.0.0.1:8000";

// 1. שליפת נתוני דשבורד מנהל (GET /api/dashboard)
export const fetchDashboardData = async (timeframe = 'daily', date = '2026-07-20') => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/dashboard?timeframe=${timeframe}&date=${date}`);
    if (!response.ok) throw new Error("Failed to fetch dashboard data");
    return await response.json();
  } catch (error) {
    console.error("Dashboard API error:", error);
    return [];
  }
};

// 2. שליפת נתוני עובדים ומשמרות (GET /api/workforce-data)
export const fetchWorkforceData = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/workforce-data`);
    if (!response.ok) throw new Error("Failed to fetch workforce data");
    return await response.json();
  } catch (error) {
    console.error("Workforce API error:", error);
    return { employees: [], schedule: [] };
  }
};

// 3. עדכון שיבוץ עובד במשמרת (POST /api/toggle-assignment)
export const toggleEmployeeAssignment = async (timeBlock, employeeId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/toggle-assignment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ time_block: timeBlock, employee_id: employeeId }),
    });
    return response.ok;
  } catch (error) {
    console.error("Toggle assignment API error:", error);
    return false;
  }
};

// 4. שמירת שיחה עתידית מהעובד (POST /api/employee/calls)
export const createScheduledCall = async (callData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/employee/calls`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employee_id: callData.employee_id || 1,
        customer_name: callData.customer_name || callData.customerName,
        scheduled_time: callData.scheduled_time || callData.scheduledTime,
        estimated_duration_minutes: parseInt(
          callData.estimated_duration_minutes || callData.duration || 15,
          10
        ),
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Create call server error:", errorText);
      return false;
    }
    
    return await response.json();
  } catch (error) {
    console.error("Create call API error:", error);
    return false;
  }
};

// 5. שליפת רשימת שיחות של עובד (GET /api/employee/calls?employee_id=X)
export const fetchScheduledCalls = async (employeeId = 1) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/employee/calls?employee_id=${employeeId}`);
    if (!response.ok) throw new Error("Failed to fetch employee calls");
    return await response.json();
  } catch (error) {
    console.error("Employee calls API error:", error);
    return [];
  }
};

// 6. הרצת מנוע שיבוץ אוטומטי (POST /api/auto-schedule)
export const runAutoScheduler = async (date) => {
  const targetDate = date || new Date().toISOString().split('T')[0];

  try {
    const response = await fetch(`${API_BASE_URL}/api/auto-schedule`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: targetDate }),
    });
    if (!response.ok) throw new Error("Auto-scheduler failed");
    return await response.json();
  } catch (error) {
    console.error("Auto-scheduler API error:", error);
    return null;
  }
};