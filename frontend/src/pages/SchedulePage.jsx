import React, { useState } from "react";
import { mockEmployees, mockHourlyForecast, mockSchedule } from "../services/mockData";
import { CoverageWarnings } from "../components/CoverageWarnings";
import { ManagerExcelActions } from "../components/ManagerExcelActions";
import { EditShiftModal } from "../components/EditShiftModal";
import { calculateCoverageWarnings } from "../utils/warningsUtils";

export const SchedulePage = () => {
  const [employees] = useState(mockEmployees || []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTimeBlock, setSelectedTimeBlock] = useState(null);
  
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

  const activeWarnings = typeof calculateCoverageWarnings === "function"
    ? calculateCoverageWarnings(scheduleData, employees) 
    : [];

  const calculateRequiredStaff = (volume, duration) => {
    if (!volume || !duration) return 0;
    return Math.ceil(volume / (3600 / duration));
  };

  const handleExcelDataSynced = (newData) => {
    if (!Array.isArray(newData) || newData.length === 0) return;
    
    const mappedData = newData.map(item => ({
      time_block: item["Time Slot"] || item["Time Block"] || item["time_block"] || "00:00",
      predicted_volume: Number(item["Predicted Volume"] || item["predicted_volume"] || 0),
      avg_duration_sec: Number(item["Average Duration (Sec)"] || item["avg_duration_sec"] || 180),
      assigned: item["Assigned IDs"] ? item["Assigned IDs"].toString().split(",").map(id => Number(id.trim())).filter(id => !isNaN(id)) : []
    }));

    setScheduleData(mappedData);
    alert("🎉 Dashboard & roster synced with updated forecast data successfully!");
  };

  const checkEmployeeShiftLimits = (empId) => {
    const emp = employees.find(e => (e.id || e.employee_id) === empId);
    if (!emp) return { isOver: false, msg: "" };

    let totalAssignedHours = 0;
    scheduleData.forEach(block => {
      if (block && Array.isArray(block.assigned) && block.assigned.includes(empId)) {
        totalAssignedHours += 1;
      }
    });

    const maxDaily = emp.max_hours_per_day || emp.maxHoursPerDay || 8;
    const maxWeekly = emp.max_hours_per_week || emp.maxHoursPerWeek;
    const maxMonthly = emp.max_hours_per_month || emp.maxHoursPerMonth;

    if (maxDaily && totalAssignedHours >= maxDaily) {
      return { isOver: true, msg: `Block: ${emp.name} reached the maximum daily limit of ${maxDaily} hours.` };
    }
    if (maxWeekly && totalAssignedHours >= maxWeekly) {
      return { isOver: true, msg: `Block: ${emp.name} reached the maximum weekly limit of ${maxWeekly} hours.` };
    }
    if (maxMonthly && totalAssignedHours >= maxMonthly) {
      return { isOver: true, msg: `Block: ${emp.name} reached the maximum monthly limit of ${maxMonthly} hours.` };
    }

    return { isOver: false, msg: "" };
  };

  const handleToggleEmployee = (timeBlock, employeeId) => {
    const targetBlock = scheduleData.find(b => b.time_block === timeBlock);
    const isAlreadyAssigned = targetBlock && Array.isArray(targetBlock.assigned)
      ? targetBlock.assigned.includes(employeeId)
      : false;

    if (!isAlreadyAssigned) {
      const limitResult = checkEmployeeShiftLimits(employeeId);
      if (limitResult.isOver) {
        alert(limitResult.msg);
        return;
      }
    }

    setScheduleData(prevSchedule => prevSchedule.map(block => {
      if (block.time_block !== timeBlock) return block;
      const currentAssigned = Array.isArray(block.assigned) ? block.assigned : [];
      return {
        ...block,
        assigned: isAlreadyAssigned 
          ? currentAssigned.filter(id => id !== employeeId) 
          : [...currentAssigned, employeeId]
      };
    }));
  };

  const openShiftEditor = (timeBlock) => {
    setSelectedTimeBlock(timeBlock);
    setIsModalOpen(true);
  };

  const formatTimeDisplay = (isoString) => {
    try {
      if (isoString && isoString.includes("T")) {
        return new Date(isoString).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
      }
      return isoString;
    } catch (e) {
      return isoString;
    }
  };

  const currentModalBlock = scheduleData.find(b => b.time_block === selectedTimeBlock);
  const modalAssignedList = currentModalBlock && Array.isArray(currentModalBlock.assigned) 
    ? currentModalBlock.assigned 
    : [];

  return (
    <div style={{ padding: "20px", direction: "ltr", fontFamily: "sans-serif", color: "#f8fafc" }}>
      <h2 style={{ color: "#38bdf8", marginBottom: "24px" }}>📅 Shift Schedule & Operations</h2>
      
      <div style={{ marginBottom: "30px" }}>
        <ManagerExcelActions 
          onUploadSuccess={handleExcelDataSynced} 
          scheduleData={scheduleData} 
          employees={employees}
        />
      </div>

      <div style={{ backgroundColor: "#1e293b", padding: "24px", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid rgba(255,255,255,0.1)" }}>
              <th style={{ padding: "12px" }}>Time</th>
              <th style={{ padding: "12px" }}>Predicted Calls</th>
              <th style={{ padding: "12px", color: "#38bdf8" }}>Required Agents</th>
              <th style={{ padding: "12px", color: "#10b981" }}>Assigned Agents</th>
              <th style={{ padding: "12px", textAlign: "center" }}>Operations Management</th>
            </tr>
          </thead>
          <tbody>
            {scheduleData.map((block) => {
              const req = calculateRequiredStaff(block.predicted_volume, block.avg_duration_sec);
              const currentAssignedList = Array.isArray(block.assigned) ? block.assigned : [];

              return (
                <tr key={block.time_block} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <td style={{ padding: "14px", fontWeight: "bold" }}>{formatTimeDisplay(block.time_block)}</td>
                  <td style={{ padding: "14px" }}>{block.predicted_volume} calls</td>
                  <td style={{ padding: "14px", color: "#38bdf8", fontWeight: "bold" }}>{req}</td>
                  <td style={{ padding: "14px", color: "#10b981", fontWeight: "bold" }}>{currentAssignedList.length}</td>
                  <td style={{ padding: "14px", textAlign: "center" }}>
                    <button
                      onClick={() => openShiftEditor(block.time_block)}
                      style={{
                        padding: "8px 16px",
                        backgroundColor: "rgba(56, 189, 248, 0.1)",
                        color: "#38bdf8",
                        border: "1px solid #38bdf8",
                        borderRadius: "6px",
                        fontWeight: "bold",
                        cursor: "pointer",
                        transition: "all 0.2s"
                      }}
                    >
                      ✏️ Edit Roster Holes
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: "30px" }}>
        <CoverageWarnings warnings={activeWarnings} />
      </div>

      <EditShiftModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        timeBlock={selectedTimeBlock}
        employees={employees}
        assignedEmployees={modalAssignedList}
        onToggleEmployee={handleToggleEmployee}
      />
    </div>
  );
};
