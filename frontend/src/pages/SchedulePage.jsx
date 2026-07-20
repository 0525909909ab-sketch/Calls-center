// src/pages/SchedulePage.jsx
import React, { useState, useEffect } from "react";
import { fetchWorkforceData, toggleEmployeeAssignment } from "../services/api";
import { CoverageWarnings } from "../components/CoverageWarnings";
import ManagerExcelActions from "../components/ManagerExcelActions";

export const SchedulePage = () => {
  const [employees, setEmployees] = useState([]);
  const [scheduleData, setScheduleData] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadWorkforce = async () => {
    setLoading(true);
    const data = await fetchWorkforceData();
    setEmployees(data.employees || []);
    setScheduleData(data.schedule || []);
    setLoading(false);
  };

  useEffect(() => {
    loadWorkforce();
  }, []);

  const calculateRequiredStaff = (volume, duration = 900) => {
    if (!volume) return 0;
    return Math.ceil(volume / (3600 / duration));
  };

  const handleToggleEmployee = async (timeBlock, employeeId) => {
    const success = await toggleEmployeeAssignment(timeBlock, employeeId);
    if (success) {
      // Reload updated schedule from backend
      loadWorkforce();
    } else {
      alert("Failed to update assignment in backend.");
    }
  };

  return (
    <div style={{ padding: "30px", direction: "ltr", fontFamily: "Arial, sans-serif", color: "#333", backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      <h2 style={{ color: "#2c3e50", marginBottom: "24px" }}>📅 Shift Schedule & Operations</h2>
      
      <div style={{ marginBottom: "30px" }}>
        <ManagerExcelActions onUploadSuccess={loadWorkforce} scheduleData={scheduleData} employees={employees} />
      </div>

      {loading ? (
        <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>⏳ Loading schedule from server...</div>
      ) : (
        <div style={{ backgroundColor: "#ffffff", padding: "24px", borderRadius: "8px", border: "1px solid #e2e8f0", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc", borderBottom: "2px solid #e2e8f0", color: "#475569" }}>
                <th style={{ padding: "12px" }}>Time</th>
                <th style={{ padding: "12px" }}>Predicted Calls</th>
                <th style={{ padding: "12px", color: "#0284c7" }}>Required Staff</th>
                <th style={{ padding: "12px", color: "#16a34a" }}>Assigned Staff</th>
                <th style={{ padding: "12px", textAlign: "center" }}>Manual Editing & Quick Assignment</th>
              </tr>
            </thead>
            <tbody>
              {scheduleData.map((block) => {
                const req = calculateRequiredStaff(block.predicted_volume, block.avg_duration_sec);
                const assignedList = block.assigned || [];
                return (
                  <tr key={block.time_block} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "14px", fontWeight: "bold" }}>{block.time_block}</td>
                    <td style={{ padding: "14px" }}>{block.predicted_volume} calls</td>
                    <td style={{ padding: "14px", color: "#0284c7", fontWeight: "bold" }}>{req}</td>
                    <td style={{ padding: "14px", color: "#16a34a", fontWeight: "bold" }}>{assignedList.length}</td>
                    <td style={{ padding: "14px", textAlign: "center" }}>
                      <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                        {employees.map(emp => {
                          const isAssigned = assignedList.includes(emp.id);
                          return (
                            <button
                              key={emp.id}
                              onClick={() => handleToggleEmployee(block.timestamp || block.time_block, emp.id)}
                              style={{
                                padding: "6px 12px",
                                fontSize: "12px",
                                borderRadius: "6px",
                                cursor: "pointer",
                                border: isAssigned ? "1px solid #16a34a" : "1px solid #cbd5e1",
                                backgroundColor: isAssigned ? "#dcfce7" : "#ffffff",
                                color: isAssigned ? "#15803d" : "#64748b",
                                fontWeight: "bold",
                                transition: "all 0.15s"
                              }}
                            >
                              {emp.name} {emp.role === "Manager" ? "👑" : "🎧"}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ marginTop: "30px" }}>
        <CoverageWarnings scheduleData={scheduleData} employees={employees} />
      </div>
    </div>
  );
};

export default SchedulePage;