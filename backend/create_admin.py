from app.database import SessionLocal
from app.models.user import User
from app.auth.security import hash_password


db = SessionLocal()

try:
    existing_user = db.query(User).filter(
        User.username == "admin"
    ).first()

    if existing_user:
        print("Tai khoan admin da ton tai")
    else:
        admin = User(
            username="admin",
            password=hash_password("admin123"),
            role="ADMIN",
            is_active=True
        )

        db.add(admin)
        db.commit()

        print("Tao tai khoan admin thanh cong")
        print("Username: admin")
        print("Password: admin123")

finally:
    db.close()