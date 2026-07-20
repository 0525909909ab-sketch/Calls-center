import * as XLSX from "xlsx";

export const generateExcelFromSchedule = (scheduleData, employees, fileName = "shift_schedule_output.xlsx") => {
  if (!scheduleData || scheduleData.length === 0) return false;

  const formattedData = scheduleData.map(block => {
    let timeLabel = block.time_block;
    try {
      if (block.time_block && block.time_block.includes("T")) {
        timeLabel = new Date(block.time_block).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
      }
    } catch (e) {
      timeLabel = block.time_block;
    }

    const assignedIds = Array.isArray(block.assigned) ? block.assigned : [];
    
    const assignedNames = assignedIds
      .map(id => {
        const emp = employees ? employees.find(e => e.id === id) : null;
        return emp ? emp.name : `ID: ${id}`;
      })
      .join(", ");

    return {
      "Time Slot": timeLabel,
      "Predicted Volume": block.predicted_volume || 0,
      "Average Duration (Sec)": block.avg_duration_sec || 180,
      "Assigned Agents Count": assignedIds.length,
      "Assigned Staff Names": assignedNames
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(formattedData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Shift Schedule");
  
  XLSX.writeFile(workbook, fileName);
  return true;
};
