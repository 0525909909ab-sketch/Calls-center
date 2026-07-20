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