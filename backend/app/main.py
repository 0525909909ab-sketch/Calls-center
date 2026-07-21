# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# 1. ייבוא כל הראוטרים במערכת
from app.routers.auth import router as auth_router
from app.routers.employee import router as employee_router
from app.routers.analytics import router as analytics_router
from app.routers.customer_call import router as calls_router
from app.routers.schedule import router as schedule_router

app = FastAPI(title="Workforce Management API")

# 2. הגדרות CORS קריטיות לעבודה עם Cookies ואימות נתונים
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,  # 🔑 קריטי: מאפשר העברת HTTP-Only Cookies מהפרונטנד
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. חיבור הראוטרים לאפליקציה
app.include_router(auth_router)
app.include_router(employee_router)
app.include_router(analytics_router)
app.include_router(calls_router)
app.include_router(schedule_router)

@app.get("/")
async def root():
    return {
        "status": "online", 
        "message": "Welcome to the Workforce Management Engine"
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)