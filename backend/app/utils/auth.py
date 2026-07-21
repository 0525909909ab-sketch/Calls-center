# app/utils/auth.py
from fastapi import Request, HTTPException, status, Depends
import jwt 
from jwt.exceptions import PyJWTError, ExpiredSignatureError
from app.core.config import settings

def get_current_user(request: Request) -> dict:
    # 1. ניסיון שליפת הטוקן מתוך ה-Cookie
    token = request.cookies.get("access_token")
    
    # 2. גיבוי: שליפה מ-Header של Authorization במקרה ששלחו Bearer Token
    if not token and "authorization" in request.headers:
        auth_header = request.headers.get("authorization")
        if auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]

    # אם עדיין אין טוקן - החזרת 401
    if not token:
        print("❌ [Auth Error]: No access_token found in cookies or authorization headers.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication token. Please log in again."
        )
    
    try:
        # פענוח ה-JWT
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id = payload.get("sub")
        role = payload.get("role")
        
        if not user_id or not role:
            print("❌ [Auth Error]: Token payload missing sub or role.")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload"
            )
            
        return {"id": int(user_id), "role": role}

    except ExpiredSignatureError:
        print("❌ [Auth Error]: Token has expired.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired. Please log in again."
        )
    except PyJWTError as e:
        print(f"❌ [Auth Error]: JWT Decode failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or corrupted token"
        )

def require_manager(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "Manager":
        print(f"⛔ [Access Denied]: User {current_user.get('id')} with role '{current_user.get('role')}' tried to access Manager route.")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Manager role required"
        )
    return current_user