import math
from app.DB.connection import get_db_connection

def fetch_filtered_forecast(timeframe: str, date_str: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    if timeframe == "daily":
        query = """
            SELECT 
                timestamp::text as timestamp,
                predicted_volume,
                average_call_duration,
                TO_CHAR(timestamp, 'HH24:MI') as label
            FROM hourly_call_forecast
            WHERE timestamp::date = %s
            ORDER BY timestamp ASC;
        """
        cursor.execute(query, (date_str,))
    elif timeframe == "weekly":
        query = """
            SELECT 
                timestamp::text as timestamp,
                predicted_volume,
                average_call_duration,
                TO_CHAR(timestamp, 'MM-DD HH24:MI') as label
            FROM hourly_call_forecast
            WHERE timestamp::date BETWEEN %s AND %s::date + INTERVAL '7 days'
            ORDER BY timestamp ASC;
        """
        cursor.execute(query, (date_str, date_str))
    elif timeframe == "monthly":
        query = """
            SELECT 
                timestamp::text as timestamp,
                predicted_volume,
                average_call_duration,
                TO_CHAR(timestamp, 'MM-DD') as label
            FROM hourly_call_forecast
            WHERE EXTRACT(YEAR FROM timestamp) = EXTRACT(YEAR FROM %s::date)
              AND EXTRACT(MONTH FROM timestamp) = EXTRACT(MONTH FROM %s::date)
            ORDER BY timestamp ASC;
        """
        cursor.execute(query, (date_str, date_str))
    else:
        query = """
            SELECT 
                timestamp::text as timestamp,
                predicted_volume,
                average_call_duration,
                TO_CHAR(timestamp, 'HH24:MI') as label
            FROM hourly_call_forecast
            ORDER BY timestamp ASC;
        """
        cursor.execute(query)
    records = cursor.fetchall()
    formatted_results = []
    for row in records:
        formatted_results.append({
            "timestamp": row[0],
            "predicted_volume": row[1],
            "average_call_duration": row[2],
            "label": row[3]
        })
    cursor.close()
    conn.close()
    return formatted_results

def calculate_required_agents(predicted_volume: int, avg_duration_sec: int) -> int:
    raw_required = (predicted_volume * avg_duration_sec) / 3600
    rounded_agents = math.ceil(raw_required)
    return max(1, rounded_agents)

from app.DB.connection import get_db_connection

def get_full_workforce_data(date_str: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    emp_query = """
        SELECT id, name, role, max_hours_per_day 
        FROM employees;
    """
    cursor.execute(emp_query)
    emp_records = cursor.fetchall()
    
    employees_list = []
    for emp in emp_records:
        employees_list.append({
            "id": emp[0],
            "name": emp[1],
            "role": emp[2],
            "max_hours_per_day": emp[3]
        })
        
    forecast_query = """
        SELECT 
            timestamp,
            predicted_volume,
            average_call_duration,
            TO_CHAR(timestamp, 'HH24:MI') as label
        FROM hourly_call_forecast
        WHERE timestamp::date = %s
        ORDER BY timestamp ASC;
    """
    cursor.execute(forecast_query, (date_str,))
    forecast_records = cursor.fetchall()
    
    schedule_list = []
    for row in forecast_records:
        slot_timestamp = row[0]
        predicted_volume = row[1]
        avg_duration_sec = row[2]
        time_label = row[3]
        
        assigned_query = """
            SELECT employee_id 
            FROM employee_schedule 
            WHERE timestamp = %s;
        """
        cursor.execute(assigned_query, (slot_timestamp,))
        assigned_records = cursor.fetchall()
        
        assigned_ids = []
        for ass in assigned_records:
            assigned_ids.append(ass[0])
            
        schedule_list.append({
            "timestamp": slot_timestamp,
            "time_block": time_label,
            "predicted_volume": predicted_volume,
            "avg_duration_sec": avg_duration_sec,
            "assigned": assigned_ids
        })
        
    cursor.close()
    conn.close()
    
    return {
        "employees": employees_list,
        "schedule": schedule_list
    }


def check_employee_constraints(employee_id: int, date_str: str) -> dict:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    limit_query = """
        SELECT max_hours_per_day, max_hours_per_week, max_hours_per_month
        FROM employees
        WHERE id = %s;
    """
    cursor.execute(limit_query, (employee_id,))
    limits = cursor.fetchone()
    
    if not limits:
        cursor.close()
        conn.close()
        return {"allowed": False, "reason": "Employee not found"}
        
    max_day, max_week, max_month = limits
    
    day_query = """
        SELECT COUNT(*) 
        FROM employee_schedule
        WHERE employee_id = %s AND timestamp::date = %s::date;
    """
    cursor.execute(day_query, (employee_id, date_str))
    current_day_hours = cursor.fetchone()[0]
    
    week_query = """
        SELECT COUNT(*) 
        FROM employee_schedule
        WHERE employee_id = %s 
          AND DATE_TRUNC('week', timestamp) = DATE_TRUNC('week', %s::date);
    """
    cursor.execute(week_query, (employee_id, date_str))
    current_week_hours = cursor.fetchone()[0]
    
    month_query = """
        SELECT COUNT(*) 
        FROM employee_schedule
        WHERE employee_id = %s 
          AND EXTRACT(YEAR FROM timestamp) = EXTRACT(YEAR FROM %s::date)
          AND EXTRACT(MONTH FROM timestamp) = EXTRACT(MONTH FROM %s::date);
    """
    cursor.execute(month_query, (employee_id, date_str))
    current_month_hours = cursor.fetchone()[0]
    
    cursor.close()
    conn.close()
    
    if max_day and current_day_hours >= max_day:
        return {"allowed": False, "reason": "Daily hour limit exceeded"}
        
    if max_week and current_week_hours >= max_week:
        return {"allowed": False, "reason": "Weekly hour limit exceeded"}
        
    if max_month and current_month_hours >= max_month:
        return {"allowed": False, "reason": "Monthly hour limit exceeded"}
        
    return {"allowed": True, "reason": "All constraints satisfied"}

def auto_schedule_workforce(date_str: str) -> dict:
    data = get_full_workforce_data(date_str)
    employees = data["employees"]
    schedule = data["schedule"]
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    scheduled_count = 0
    coverage_warnings = []
    
    avg_duration_sec = 15 * 60
    
    for slot in schedule:
        req_agents = calculate_required_agents(slot["predicted_volume"], avg_duration_sec)
        already_assigned = len(slot["assigned"])
        needed = req_agents - already_assigned
        
        slot_warnings = []
        
        if needed > 0:
            for emp in employees:
                if needed == 0:
                    break
                    
                if emp["id"] in slot["assigned"]:
                    continue
                    
                constraint_check = check_employee_constraints(emp["id"], date_str)
                
                if constraint_check["allowed"]:
                    insert_query = """
                        INSERT INTO employee_schedule (employee_id, timestamp)
                        VALUES (%s, %s);
                    """
                    cursor.execute(insert_query, (emp["id"], slot["timestamp"]))
                    
                    scheduled_count += 1
                    needed -= 1
                else:
                    slot_warnings.append({
                        "employee_id": emp["id"],
                        "employee_name": emp["name"],
                        "reason": constraint_check["reason"]
                    })
            
            if needed > 0:
                coverage_warnings.append({
                    "time_block": slot["time_block"],
                    "missing_agents": needed,
                    "rejected_reasons": slot_warnings
                })
                
    conn.commit()
    cursor.close()
    conn.close()
    
    return {
        "status": "success", 
        "agents_scheduled": scheduled_count,
        "coverage_warnings": coverage_warnings
    }