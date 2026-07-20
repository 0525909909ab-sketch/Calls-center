// src/utils/warningsUtils.js

const calculateRequiredStaff = (volume, duration) => {
  if (!volume || !duration) return 0;
  return Math.ceil(volume / (3600 / duration));
};

export const calculateCoverageWarnings = (scheduleData, employees) => {
  const warnings = [];
  const processedTimestamps = new Set();
  const employeeConsecutiveHours = {};

  // אתחול מונה שעות רצופות (בשביל הפסקות) לכל עובד
  employees.forEach(emp => {
    employeeConsecutiveHours[emp.id] = 0;
  });

  // סידור הלו"ז לפי זמן מבטיח שספירת השעות הרצופות תעבוד נכון כרונולוגית
  const sortedForecasts = [...scheduleData].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  sortedForecasts.forEach(forecast => {
    // מניעת כפילויות במקרה שיש כמה שורות לאותה שעה
    if (processedTimestamps.has(forecast.timestamp)) return;
    processedTimestamps.add(forecast.timestamp);

    const hourlyAssignments = sortedForecasts.filter(s => s.timestamp === forecast.timestamp);
    
    // תמיכה בשני סוגי המבנים מה-Backend (גם אם זה מערך assigned וגם אם זה employee_id)
    const assignedIds = forecast.assigned || hourlyAssignments.map(s => s.employee_id).filter(Boolean);
    const assignedAgentsCount = assignedIds.length > 0 ? assignedIds.length : hourlyAssignments.length;

    const requiredAgents = calculateRequiredStaff(forecast.predicted_volume, 180);
    const timeString = new Date(forecast.timestamp).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });

    // ==========================================
    // 1. הלוגיקה המקורית שלך: תת-איוש (Understaffing)
    // ==========================================
    if (assignedAgentsCount < requiredAgents) {
      const restrictedEmployees = [];
      
      employees.forEach(emp => {
        const isAssignedThisHour = assignedIds.includes(emp.id) || hourlyAssignments.some(s => s.employee_id === emp.id);
        
        if (!isAssignedThisHour) {
          const totalHours = sortedForecasts.filter(s => s.employee_id === emp.id || (s.assigned && s.assigned.includes(emp.id))).length;
          if (
            (emp.max_hours_per_day && totalHours >= emp.max_hours_per_day) ||
            (emp.max_hours_per_week && totalHours >= emp.max_hours_per_week) ||
            (emp.max_hours_per_month && totalHours >= emp.max_hours_per_month)
          ) {
            restrictedEmployees.push(emp.name);
          }
        }
      });

      let reasonMessage = "No other available agents in the database for this specific period.";
      if (restrictedEmployees.length > 0) {
        reasonMessage = `Shift gap at ${timeString} due to max-hours limits reached for available agents (${restrictedEmployees.join(', ')}).`;
      }

      warnings.push({
        id: `understaffed-${forecast.timestamp}`,
        type: 'coverage',
        severity: requiredAgents - assignedAgentsCount >= 2 ? 'high' : 'medium',
        title: `⚠️ Understaffing Detected at ${timeString}`,
        description: `Required: ${requiredAgents} agents, Assigned: ${assignedAgentsCount} agents. Shortage of ${requiredAgents - assignedAgentsCount} agent(s).`,
        reason: reasonMessage
      });
    }

    // ==========================================
    // 2. חוק חדש: חובת נוכחות מנהל משמרת
    // ==========================================
    if (assignedAgentsCount > 0) {
      const hasManager = employees.some(emp => 
        (assignedIds.includes(emp.id) || hourlyAssignments.some(s => s.employee_id === emp.id)) && 
        (emp.role === 'Manager' || emp.role === 'מנהל')
      );

      if (!hasManager) {
        warnings.push({
          id: `no-manager-${forecast.timestamp}`,
          type: 'compliance',
          severity: 'high',
          title: `⚠️ No Manager on Duty at ${timeString}`,
          description: `There are ${assignedAgentsCount} employees scheduled, but no manager is present.`,
          reason: "Protocol requires at least one manager during active operational hours."
        });
      }
    }

    // ==========================================
    // 3. חוק חדש: אילוץ הפסקות (רצף שעות עבודה)
    // ==========================================
    employees.forEach(emp => {
      const isAssignedThisHour = assignedIds.includes(emp.id) || hourlyAssignments.some(s => s.employee_id === emp.id);

      if (isAssignedThisHour) {
        employeeConsecutiveHours[emp.id] += 1;
        const maxConsecutive = emp.max_consecutive_hours || 4; // ברירת מחדל של 4 שעות רצופות אם לא מוגדר

        if (employeeConsecutiveHours[emp.id] > maxConsecutive) {
          warnings.push({
            id: `missed-break-${emp.id}-${forecast.timestamp}`,
            type: 'limit',
            severity: 'high',
            title: `☕ Break Required: ${emp.name}`,
            description: `Employee is scheduled for more than ${maxConsecutive} consecutive hours and must take a break.`
          });
        }
      } else {
        // איפוס מונה הרצף אם העובד לא משובץ בשעה זו (קיבל הפסקה)
        employeeConsecutiveHours[emp.id] = 0;
      }
    });

    // ==========================================
    // 4. הלוגיקה המקורית שלך: חריגת שעות יומיות/שבועיות (Overtime)
    // ==========================================
    const assignedEmployeesForOvertime = employees.filter(emp => assignedIds.includes(emp.id) || hourlyAssignments.some(s => s.employee_id === emp.id));

    assignedEmployeesForOvertime.forEach(emp => {
      const totalHours = sortedForecasts.filter(s => s.employee_id === emp.id || (s.assigned && s.assigned.includes(emp.id))).length;

      if (emp.max_hours_per_day && totalHours > emp.max_hours_per_day) {
        if (!warnings.some(w => w.id === `overtime-day-${emp.id}`)) {
          warnings.push({
            id: `overtime-day-${emp.id}`,
            type: 'limit',
            severity: 'high',
            title: `👑 Daily Hour Limit Exceeded: ${emp.name}`,
            description: `Employee is assigned to ${totalHours} hours, while the maximum daily limit is ${emp.max_hours_per_day} hours.`
          });
        }
      }

      if (emp.max_hours_per_week && totalHours > emp.max_hours_per_week) {
        if (!warnings.some(w => w.id === `overtime-week-${emp.id}`)) {
          warnings.push({
            id: `overtime-week-${emp.id}`,
            type: 'limit',
            severity: 'high',
            title: `📅 Weekly Hour Limit Exceeded: ${emp.name}`,
            description: `Employee is assigned to ${totalHours} hours, while the maximum weekly limit is ${emp.max_hours_per_week} hours.`
          });
        }
      }

      if (emp.max_hours_per_month && totalHours > emp.max_hours_per_month) {
        if (!warnings.some(w => w.id === `overtime-month-${emp.id}`)) {
          warnings.push({
            id: `overtime-month-${emp.id}`,
            type: 'limit',
            severity: 'high',
            title: `🗓️ Monthly Hour Limit Exceeded: ${emp.name}`,
            description: `Employee is assigned to ${totalHours} hours, while the maximum monthly limit is ${emp.max_hours_per_month} hours.`
          });
        }
      }
    });
  });

  return warnings;
};