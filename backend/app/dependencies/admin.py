from fastapi import APIRouter, Depends
from app.dependencies.auth import verify_admin

router = APIRouter(prefix="/api/admin")

@router.get("/dashboard")
def get_admin_dashboard(role: str = Depends(verify_admin)):
    return {"status": "success", "data": "Welcome to the admin panel"}