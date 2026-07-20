const API_BASE_URL = "http://localhost:8000";

export const fetchWorkforceData = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/workforce-data`);
    if (!response.ok) throw new Error("Network response was not ok");
    return await response.json();
  } catch (error) {
    console.error("Error communicating with Python server:", error);
    return { employees: [], schedule: [] };
  }
};

export const toggleEmployeeAssignment = async (timeBlock, employeeId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/toggle-assignment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ time_block: timeBlock, employee_id: employeeId }),
    });
    return response.ok;
  } catch (error) {
    console.error("Assignment update failed in database:", error);
    return false;
  }
};
