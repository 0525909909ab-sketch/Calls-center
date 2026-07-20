import os
import pandas as pd
from connection import get_db_connection
from psycopg2.extras import execute_values

def import_calls(file_path, cursor):
    print("1. Processing Call Forecasts...")
    df = pd.read_excel(file_path)
    
    # Replace NaN values with None for SQL compatibility
    df = df.where(pd.notnull(df), None)
    
    data = [
        (row['timestamp'], row['hybrid_pred'], 180, row['actual'])
        for _, row in df.iterrows()
    ]
    
    query = """
        INSERT INTO hourly_call_forecast 
        (timestamp, predicted_volume, average_call_duration, actual_volume)
        VALUES %s
        ON CONFLICT (timestamp) 
        DO UPDATE SET 
            predicted_volume = EXCLUDED.predicted_volume,
            actual_volume = EXCLUDED.actual_volume;
    """
    execute_values(cursor, query, data)
    print(f"🎉 Successfully imported {len(data)} call forecast rows.")

def import_employees(file_path, cursor):
    print("2. Processing Employees...")
    df = pd.read_excel(file_path)
    
    # Replace NaN values with None for SQL compatibility
    df = df.where(pd.notnull(df), None)
    
    data = [
        (
            row['name'], row['role'], row['available_from'], row['available_to'],
            row['max_hours_per_day'], row['max_hours_per_week'], row['max_hours_per_month']
        )
        for _, row in df.iterrows()
    ]
    
    # Clean old records before inserting to prevent duplication during testing
    cursor.execute("TRUNCATE TABLE employees CASCADE;")
    
    insert_query = """
        INSERT INTO employees 
        (name, role, available_from, available_to, max_hours_per_day, max_hours_per_week, max_hours_per_month)
        VALUES %s;
    """
    execute_values(cursor, insert_query, data)
    print(f"🎉 Successfully imported {len(data)} employee profiles.")

if __name__ == "__main__":
    # Ensure these files are placed inside your backend folder
    CALLS_FILE = "calls_data.xlsx"
    EMPLOYEES_FILE = "employees_data.xlsx"
    
    if not os.path.exists(CALLS_FILE) or not os.path.exists(EMPLOYEES_FILE):
        print("❌ Error: Please ensure both 'calls_data.xlsx' and 'employees_data.xlsx' exist in the backend folder.")
    else:
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            
            import_calls(CALLS_FILE, cursor)
            import_employees(EMPLOYEES_FILE, cursor)
            
            conn.commit()
            print("\n🚀 All data successfully uploaded to Neon Cloud!")
            
            cursor.close()
            conn.close()
        except Exception as e:
            print(f"❌ Database import failed: {e}")