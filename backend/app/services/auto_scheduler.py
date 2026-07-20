from app.DB.connection import get_db_connection
from app.services.metrics import calculate_required_agents

def auto_schedule_workforce(date_str: str) -> dict:
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            # 1. שליפת כל העובדים הפעילים
            cursor.execute("SELECT id, name, role, max_hours_per_day FROM employees;")
            emp_rows = cursor.fetchall()
            if not emp_rows:
                return {"status": "success", "agents_scheduled": 0, "message": "No employees found"}
                
            employees = [
                {"id": r[0], "name": r[1], "role": r[2], "max_hours_per_day": r[3] or 8}
                for r in emp_rows
            ]

            # 2. שליפת התחזית והמשמרות הקיימות לתאריך המבוקש
            forecast_query = """
                SELECT 
                    f.timestamp,
                    f.predicted_volume,
                    f.average_call_duration,
                    COALESCE(ARRAY_AGG(s.employee_id) FILTER (WHERE s.employee_id IS NOT NULL), '{}') as assigned
                FROM hourly_call_forecast f
                LEFT JOIN employee_schedule s ON f.timestamp = s.timestamp
                WHERE f.timestamp::date = %s::date
                GROUP BY f.timestamp, f.predicted_volume, f.average_call_duration
                ORDER BY f.timestamp ASC;
            """
            cursor.execute(forecast_query, (date_str,))
            schedule_rows = cursor.fetchall()

            scheduled_count = 0
            
            # מעקב אחר שעות עבודה יומיות לכל עובד כדי לא לעבור את המגבלה היומית
            emp_daily_hours = {emp["id"]: 0 for emp in employees}

            # 3. אלגוריתם השיבוץ
            for row in schedule_rows:
                slot_timestamp = row[0]
                predicted_volume = row[1]
                avg_duration = row[2] or 900
                assigned_list = list(row[3]) if row[3] else []

                # עדכון השעות שכבר שובצו
                for emp_id in assigned_list:
                    if emp_id in emp_daily_hours:
                        emp_daily_hours[emp_id] += 1

                req_agents = calculate_required_agents(predicted_volume, avg_duration)
                needed = req_agents - len(assigned_list)

                if needed > 0:
                    for emp in employees:
                        if needed == 0:
                            break

                        # דילוג אם העובד כבר משובץ בשעה הזו
                        if emp["id"] in assigned_list:
                            continue

                        # בדיקה אם העובד הגיע למכסת השעות היומית שלו
                        if emp_daily_hours[emp["id"]] >= emp["max_hours_per_day"]:
                            continue

                        # שיבוץ העובד למשמרת
                        insert_query = """
                            INSERT INTO employee_schedule (employee_id, timestamp)
                            VALUES (%s, %s)
                            ON CONFLICT (employee_id, timestamp) DO NOTHING;
                        """
                        cursor.execute(insert_query, (emp["id"], slot_timestamp))
                        
                        scheduled_count += 1
                        needed -= 1
                        assigned_list.append(emp["id"])
                        emp_daily_hours[emp["id"]] += 1

            conn.commit()
            return {"status": "success", "agents_scheduled": scheduled_count}

    except Exception as e:
        conn.rollback()
        print(f"❌ Auto-scheduler engine error: {e}")
        raise e
    finally:
        conn.close()