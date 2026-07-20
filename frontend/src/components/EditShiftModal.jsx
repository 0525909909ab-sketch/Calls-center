import React from "react";

export const EditShiftModal = ({ isOpen, onClose, timeBlock, employees, assignedEmployees, onToggleEmployee }) => {
  if (!isOpen) return null;

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

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(15, 23, 42, 0.75)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
      backdropFilter: "blur(4px)"
    }}>
      <div style={{
        backgroundColor: "#1e293b",
        padding: "24px",
        borderRadius: "12px",
        width: "100%",
        maxWidth: "450px",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ color: "#38bdf8", margin: 0, fontSize: "1.25rem", fontWeight: "bold" }}>
            🛠️ Edit Shift Assignments
          </h3>
          <span style={{ color: "#94a3b8", fontSize: "14px", fontWeight: "bold" }}>
            Slot: {formatTimeDisplay(timeBlock)}
          </span>
        </div>

        <p style={{ color: "#94a3b8", fontSize: "14px", marginBottom: "20px", lineHeight: "1.5" }}>
          Select or deselect employees to close coverage gaps for this hourly period.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "250px", overflowY: "auto", marginBottom: "24px", paddingRight: "4px" }}>
          {employees.map(emp => {
            const isAssigned = assignedEmployees.includes(emp.id);
            return (
              <div 
                key={emp.id}
                onClick={() => onToggleEmployee(timeBlock, emp.id)}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px",
                  borderRadius: "8px",
                  backgroundColor: isAssigned ? "rgba(16, 185, 129, 0.1)" : "#1e293b",
                  border: isAssigned ? "1px solid #10b981" : "1px solid rgba(255, 255, 255, 0.05)",
                  cursor: "pointer",
                  transition: "all 0.15s ease"
                }}
              >
                <span style={{ color: isAssigned ? "#10b981" : "#f8fafc", fontWeight: "bold", fontSize: "14px" }}>
                  {emp.name} <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "normal" }}>({emp.role})</span>
                </span>
                <span style={{ color: isAssigned ? "#10b981" : "#64748b", fontWeight: "bold" }}>
                  {isAssigned ? "Active ✔" : "Off Duty +"}
                </span>
              </div>
            );
          })}
        </div>

        <button
          onClick={onClose}
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "#ef4444",
            color: "#ffffff",
            border: "none",
            borderRadius: "6px",
            fontWeight: "bold",
            cursor: "pointer",
            transition: "background-color 0.2s"
          }}
        >
          Close & Save Changes
        </button>
      </div>
    </div>
  );
};

export default EditShiftModal;
