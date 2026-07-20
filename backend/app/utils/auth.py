# app/utils/auth.py
from fastapi import Depends, HTTPException, status
import jwt

# פונקציה לשליפת המשתמש הנוכחי מהטוקן
def get_current_user(token: str = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return {"id": payload.get("sub"), "role": payload.get("role")}
    except jwt.PyJWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

# 🔥 פונקציית חסימה: מאפשרת מעבר רק למנהלים
def require_manager(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "Manager":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="⚠️ גישה דחורה: פעולה זו מותרת למנהלים בלבד!"
        )
    return current_user