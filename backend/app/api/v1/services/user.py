from app.api.v1.schemas.user import User, UserBaseCreate
from app.core.security import hash_password

users = []


class UserCrud:
    @staticmethod
    def get_users():
        return users

    @staticmethod
    def register(db, user: UserBaseCreate):
        data = user.model_dump()

        # hash the password BEFORE saving
        data["hashed_password"] = hash_password(data["password"])
        data.pop("password")
        new_user = User(**data)
        try:
            db.add(new_user)
            db.commit()
            db.refresh(new_user)
            return new_user
        except Exception:
            db.rollback()
            raise

    # existing_user = db.query(User).filter(User.email == data["email"]).first()
    #     if existing_user:
    #         raise ValueError("User already exists"
   

user_crud = UserCrud()