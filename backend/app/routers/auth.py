# app/routers/auth.py
from fastapi import APIRouter, Depends, HTTPException, status, Response
from pydantic import BaseModel
from app.core.security import verify_password, create_access_token
from app.DB.connection import get_db

router = APIRouter(prefix="/api/auth", tags=["auth"])

class LoginRequest(BaseModel):
    employee_id: int
    password: str

@router.post("/login")
async def login(payload: LoginRequest, response: Response, db = Depends(get_db)):
    with db.cursor() as cursor:
        cursor.execute("SELECT id, name, role, password_hash FROM employees WHERE id = %s;", (payload.employee_id,))
        user = cursor.fetchone()
        
    if not user or not verify_password(payload.password, user[3]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Employee ID or Password"
        )

    # יצירת טוקן המכיל את מזהה העובד והתפקיד שלו (Manager / Agent)
    token = create_access_token(data={"sub": str(user[0]), "role": user[2]})

    # הזרקת ה-Cookie המאובטח ישירות ל-response שיוחזר
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,       # מונע גישה דרך JS בפרונטנד
        samesite="lax",      # הגנת CSRF
        secure=False,  
        path="/",      # לשנות ל-True ב-Production עם HTTPS
        max_age=1800         # 30 דקות
    )

    return {
        "access_token": token, 
        "token_type": "bearer", 
        "user": {"id": user[0], "name": user[1], "role": user[2]}
    }
@router.post("/logout")
async def logout(response: Response):
    # מחיקת ה-Cookie של הטוקן מהדפדפן
    response.delete_cookie(key="access_token", path="/")
    return {"status": "success", "message": "Logged out successfully"}