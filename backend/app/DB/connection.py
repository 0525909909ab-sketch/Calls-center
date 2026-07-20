import os
import psycopg2
from dotenv import load_dotenv

# Load environment variables from the .env file
load_dotenv()

def get_db_connection():
    """
    Creates and returns a connection to the Neon / PostgreSQL database.
    """
    database_url = os.getenv("DATABASE_URL")
    
    if not database_url:
        raise ValueError("Error: The DATABASE_URL environment variable is not defined! Please set it in the .env file.")
        
    try:
        conn = psycopg2.connect(database_url)
        return conn
    except Exception as e:
        print(f"Error creating connection: {e}")
        raise e

# 👇 Add this function below 👇
def get_db():
    """
    Dependency for FastAPI.
    Opens a connection at the start of the request and automatically closes it upon completion.
    """
    conn = get_db_connection()
    try:
        yield conn
    finally:
        conn.close()