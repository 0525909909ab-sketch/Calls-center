// src/services/api.js
const API_BASE_URL = "http://localhost:8000";

// 🔑 1. התחברות למערכת (Login)
export const loginUser = async (employeeId, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employee_id: parseInt(employeeId, 10), password }),
      credentials: "include", // 🔑 שמירת ה-Cookie בדפדפן
    });

    if (!response.ok) return null;
    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error("Login API error:", error);
    return null;
  }
};

// 🚪 2. התנתקות מהמערכת (Logout)
export const logoutUser = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: "POST",
      credentials: "include", // 🔑 מחיקת ה-Cookie המאובטח בשרת
    });
    return response.ok;
  } catch (error) {
    console.error("Logout API error:", error);
    return false;
  }
};

// 📊 3. שליפת נתוני דשבורד מנהל (GET /api/dashboard)
export const fetchDashboardData = async (timeframe = 'daily', date = '2026-07-20') => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/dashboard?timeframe=${timeframe}&date=${date}`, {
      method: "GET",
      credentials: "include", // 🔑 שליחת Cookie לאימות הרשאות
    });
    if (!response.ok) throw new Error("Failed to fetch dashboard data");
    return await response.json();
  } catch (error) {
    console.error("Dashboard API error:", error);
    return [];
  }
};

// 🗓️ 4. שליפת נתוני שיבוצים וכוח אדם (GET /api/workforce-data)
export const fetchWorkforceData = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/workforce-data`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      console.warn(`Workforce API returned status ${response.status}`);
      return { employees: [], schedule: [] };
    }

    const data = await response.json();
    return {
      employees: data.employees || [],
      schedule: data.schedule || []
    };
  } catch (error) {
    console.error("Workforce API error:", error);
    return { employees: [], schedule: [] };
  }
};

// ✏️ 5. שינוי איוש משמרת (POST /api/toggle-assignment)
// ✏️ 5. שינוי איוש משמרת (POST /api/toggle-assignment)
export const toggleEmployeeAssignment = async (timeBlock, employeeId) => {
  try {
    console.log(`Toggle assignment response status: ${timeBlock}, ${employeeId}`);
    const response = await fetch(`${API_BASE_URL}/api/toggle-assignment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        time_block: timeBlock,
        employee_id: parseInt(employeeId, 10),
      }),
      credentials: "include", // 🔑 קריטי להעברת טוקן המנהל
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.error("Toggle failed on server:", errData.detail || response.statusText);
      alert(`פעולה נכשלה: ${errData.detail || 'אין הרשאת מנהל או שהחיבור פג'}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Toggle assignment API error:", error);
    return false;
  }
};

// 🪄 6. הפעלת שיבוץ אוטומטי (POST /api/auto-schedule)
export const runAutoScheduler = async (date = '2026-07-20') => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auto-schedule`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date }),
      credentials: "include", // 🔑 בדיקה שהמשתמש הוא Manager
    });
    if (!response.ok) throw new Error("Auto-scheduler operation failed");
    return await response.json();
  } catch (error) {
    console.error("Auto-scheduler API error:", error);
    return null;
  }
};

// 📞 7. דיווח שיחה עתידית של עובד (POST /api/employee/calls)
export const createScheduledCall = async (callData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/employee/calls`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(callData),
      credentials: "include", // 🔑 שליחת Cookie
    });
    return response.ok;
  } catch (error) {
    console.error("Create call API error:", error);
    return false;
  }
};

// 📞 8. שליפת שיחות עתידיות של עובד (GET /api/employee/calls)
export const fetchScheduledCalls = async (employeeId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/employee/calls?employee_id=${employeeId}`, {
      method: "GET",
      credentials: "include", // 🔑 שליחת Cookie
    });
    if (!response.ok) throw new Error("Failed to fetch employee calls");
    return await response.json();
  } catch (error) {
    console.error("Employee calls API error:", error);
    return [];
  }
};