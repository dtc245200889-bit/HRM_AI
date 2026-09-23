from app.database import SessionLocal
from app.models.user import User
from app.auth.security import hash_password


test_users = [
    {
        "username": "hr",
        "password": "hr123",
        "role": "HR"
    },
    {
        "username": "manager",
        "password": "manager123",
        "role": "MANAGER"
    },
    {
        "username": "employee",
        "password": "employee123",
        "role": "EMPLOYEE"
    }
]


db = SessionLocal()


try:
    for user_data in test_users:
        existing_user = db.query(User).filter(
            User.username == user_data["username"]
        ).first()

        if existing_user:
            print(
                f"Tai khoan {user_data['username']} da ton tai"
            )
            continue

        user = User(
            username=user_data["username"],
            password=hash_password(
                user_data["password"]
            ),
            role=user_data["role"],
            is_active=True
        )

        db.add(user)

    db.commit()

    print("Tao tai khoan test thanh cong")

    for user_data in test_users:
        print(
            f"{user_data['username']} / "
            f"{user_data['password']} / "
            f"{user_data['role']}"
        )

finally:
    db.close()