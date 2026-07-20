from connection import get_db_connection

try:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # A simple test query that returns the Neon PostgreSQL version
    cursor.execute("SELECT version();")
    db_version = cursor.fetchone()
    
    print("🎉 Connection to Neon successful!")
    print(f"Cloud database version: {db_version[0]}")
    
    cursor.close()
    conn.close()
except Exception as e:
    print(f"❌ Connection failed: {e}")