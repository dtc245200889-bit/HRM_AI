import os

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User


oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/auth/login"
)


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    try:
        payload = jwt.decode(
            token,
            os.getenv("SECRET_KEY"),
            algorithms=[os.getenv("ALGORITHM")]
        )

        username = payload.get("sub")

        if username is None:
            raise HTTPException(
                status_code=401,
                detail="Token khong hop le"
            )

    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Token khong hop le"
        )

    user = db.query(User).filter(
        User.username == username
    ).first()

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="Nguoi dung khong ton tai"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=403,
            detail="Tai khoan da bi khoa"
        )

    return user


def require_roles(*roles):

    def role_checker(
        current_user: User = Depends(get_current_user)
    ):
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Ban khong co quyen truy cap"
            )

        return current_user

    return role_checker