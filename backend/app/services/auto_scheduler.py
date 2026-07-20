from app.DB.connection import get_db_connection

def auto_schedule_workforce(date_str: str) -> dict:
    data = get_full_workforce_data(date_str)
    employees = data["employees"]
    schedule = data["schedule"]
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    scheduled_count = 0
    
    for slot in schedule:
        req_agents = calculate_required_agents(slot["predicted_volume"], slot["avg_duration_sec"])
        already_assigned = len(slot["assigned"])
        needed = req_agents - already_assigned
        
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
                    
    cursor.close()
    conn.close()
    
    return {"status": "success", "agents_scheduled": scheduled_count}