# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers.employee import router as employee_router
from app.routers.analytics import router as analytics_router  
from app.routers.customer_call import router as calls_router
from app.routers.schedule import router as schedule_router
import uvicorn


app = FastAPI(title="Workforce Management API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(employee_router)
app.include_router(analytics_router)
app.include_router(calls_router)
app.include_router(schedule_router) 

@app.get("/")
async def root():
    return {"status": "online", "message": "Welcome to the Workforce Management Engine"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)    