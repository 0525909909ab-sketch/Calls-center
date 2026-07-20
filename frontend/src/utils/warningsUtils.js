const calculateRequiredStaff = (volume, duration) => {
  if (!volume || !duration) return 0;
  return Math.ceil(volume / (3600 / duration));
};

export const calculateCoverageWarnings = (scheduleData, employees) => {
  const warnings = [];
  const forecasts = scheduleData; 

  forecasts.forEach(forecast => {
    const hourlyAssignments = forecasts.filter(s => s.timestamp === forecast.timestamp);
    const assignedAgentsCount = hourlyAssignments.length;
    const requiredAgents = calculateRequiredStaff(forecast.predicted_volume || forecast.predicted_volume, 180);

    const timeString = new Date(forecast.timestamp).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });

    if (assignedAgentsCount < requiredAgents) {
      const restrictedEmployees = [];
      
      employees.forEach(emp => {
        const isAssignedThisHour = hourlyAssignments.some(s => s.employee_id === emp.id);
        
        if (!isAssignedThisHour) {
          const totalHours = forecasts.filter(s => s.employee_id === emp.id).length;
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

    hourlyAssignments.forEach(assignment => {
      const emp = employees.find(e => e.id === assignment.employee_id);
      if (!emp) return;

      const totalHours = forecasts.filter(s => s.employee_id === emp.id).length;

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
