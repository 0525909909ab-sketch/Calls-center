from fastapi import FastAPI, UploadFile, File
import pandas as pd
from  DB.connection import get_db_connection  # 👈 ייבוא מתיקיית ה-database
from psycopg2.extras import execute_values

app = FastAPI()

@app.post("/upload-predictions/")
async def upload_predictions(file: UploadFile = File(...)):
    # כאן יבוא הקוד שמפרסר את האקסל ומזריק ל-DB...
    conn = get_db_connection()
    # ...