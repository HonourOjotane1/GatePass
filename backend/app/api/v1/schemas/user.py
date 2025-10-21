from pydantic import BaseModel, EmailStr
from uuid import UUID


class UserBase(BaseModel):
    username: str
    hashed_password: str
    first_name: str
    last_name: str
    email: EmailStr
    phone_number: int
    # is_adult : Default = False
    # gender: male or female


class User(UserBase):
    id: UUID


class UserCreate(UserBase):
    pass


class UserUpdate(User):
    username: str
    hashed_password: str
    first_name: str
    last_name: str
    email: EmailStr
    phone_number: int


class UserDelete(User):
    pass
