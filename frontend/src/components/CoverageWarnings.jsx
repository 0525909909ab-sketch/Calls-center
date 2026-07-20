import React, { useState } from "react";
import { mockEmployees, mockSchedule } from "../services/mockData";
import { CoverageWarnings } from "../components/CoverageWarnings";
import { ManagerExcelUpload } from "../components/ManagerExcelUpload";

export const SchedulePage = () => {
  const [employees] = useState(mockEmployees || []);
  const [scheduleData, setScheduleData] = useState(mockSchedule || []);

  const calculateRequiredStaff = (volume, duration) => {
    if (!volume || !duration) return 0;
    return Math.ceil(volume / (3600 / duration));
  };

  const checkEmployeeShiftLimits = (empId) => {
    const emp = employees.find(e => e.id === empId);
    if (!emp) return { isOver: false, msg: "" };

    let totalAssignedHours = 0;
    scheduleData.forEach(block => {
      if (block.assigned && block.assigned.includes(empId)) {
        totalAssignedHours += 1;
      }
    });

    if (emp.max_hours_per_day && totalAssignedHours >= emp.max_hours_per_day) {
      return { isOver: true, msg: "Cannot assign employee, daily hour limit exceeded" };
    }
    if (emp.max_hours_per_week && totalAssignedHours >= emp.max_hours_per_week) {
      return { isOver: true, msg: "Cannot assign employee, weekly hour limit exceeded" };
    }
    if (emp.max_hours_per_month && totalAssignedHours >= emp.max_hours_per_month) {
      return { isOver: true, msg: "Cannot assign employee, monthly hour limit exceeded" };
    }

    return { isOver: false, msg: "" };
  };

  const handleToggleEmployee = (timeBlock, employeeId) => {
    const targetBlock = scheduleData.find(b => b.time_block === timeBlock);
    const isAlreadyAssigned = targetBlock ? targetBlock.assigned.includes(employeeId) : false;

    if (!isAlreadyAssigned) {
      const limitResult = checkEmployeeShiftLimits(employeeId);
      if (limitResult.isOver) {
        alert(limitResult.msg);
        return;
      }
    }

    setScheduleData(prevSchedule => prevSchedule.map(block => {
      if (block.time_block !== timeBlock) return block;
      return {
        ...block,
        assigned: isAlreadyAssigned 
          ? block.assigned.filter(id => id !== employeeId) 
          : [...block.assigned, employeeId]
      };
    }));
  };

  return (
    <div style={{ padding: "20px", direction: "ltr", fontFamily: "sans-serif", color: "#f8fafc" }}>
      <h2 style={{ color: "#38bdf8", marginBottom: "24px" }}>📅 Shift Schedule & Operations</h2>
      
      <div style={{ marginBottom: "30px" }}>
        <ManagerExcelUpload onUploadSuccess={() => alert("Data synced with database successfully!")} />
      </div>

      <div style={{ backgroundColor: "#1e293b", padding: "24px", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid rgba(255,255,255,0.1)" }}>
              <th style={{ padding: "12px" }}>Time</th>
              <th style={{ padding: "12px" }}>Predicted Calls</th>
              <th style={{ padding: "12px", color: "#38bdf8" }}>Required Agents</th>
              <th style={{ padding: "12px", color: "#10b981" }}>Assigned Agents</th>
              <th style={{ padding: "12px", textAlign: "center" }}>Manual Editing & Quick Assignment</th>
            </tr>
          </thead>
          <tbody>
            {scheduleData.map((block) => {
              const req = calculateRequiredStaff(block.predicted_volume, block.avg_duration_sec);
              return (
                <tr key={block.time_block} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <td style={{ padding: "14px", fontWeight: "bold" }}>{block.time_block}</td>
                  <td style={{ padding: "14px" }}>{block.predicted_volume} calls</td>
                  <td style={{ padding: "14px", color: "#38bdf8", fontWeight: "bold" }}>{req}</td>
                  <td style={{ padding: "14px", color: "#10b981", fontWeight: "bold" }}>{block.assigned.length}</td>
                  <td style={{ padding: "14px", textAlign: "center" }}>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                      {employees.map(emp => {
                        const isAssigned = block.assigned.includes(emp.id);
                        return (
                          <button
                            key={emp.id}
                            onClick={() => handleToggleEmployee(block.time_block, emp.id)}
                            style={{
                              padding: "6px 12px",
                              fontSize: "12px",
                              borderRadius: "6px",
                              cursor: "pointer",
                              border: isAssigned ? "1px solid #10b981" : "1px solid rgba(255,255,255,0.1)",
                              backgroundColor: isAssigned ? "rgba(16, 185, 129, 0.2)" : "transparent",
                              color: isAssigned ? "#10b981" : "#94a3b8",
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

      <div style={{ marginTop: "30px" }}>
        <CoverageWarnings scheduleData={scheduleData} employees={employees} />
      </div>
    </div>
  );
};
