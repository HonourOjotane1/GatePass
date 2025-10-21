from app.api.v1.schemas.user import User, UserCreate

users = []


class UserCrud:
    @staticmethod
    def get_users():
        return users

    @staticmethod
    def register(user: UserCreate):
        new_user = User(id=len(UserCrud.get_user()) + 1, **user.model_dump())
        user.append(new_user)
        return new_user

user_crud = UserCrud()