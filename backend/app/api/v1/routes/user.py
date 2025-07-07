from fastapi import APIRouter
from app.api.v1.services.user import UserCrud
from app.api.v1.schemas.user import  UserCreate
user_router = APIRouter()


@user_router.get("/")
def get_users():
    return {"message": "successful!", "data": UserCrud.get_users}


# @user_router.post("/register")
# def register(payload: UserCreate):
#     return {"message": "registration successful!", "data": UserCrud.register}
