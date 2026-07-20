from app.DB.connection import get_db_connection

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