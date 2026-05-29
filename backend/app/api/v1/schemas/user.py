from typing import Optional

from pydantic import BaseModel, EmailStr
from uuid import UUID


class UserBase(BaseModel):
    username: str
    first_name: str
    last_name: str
    email: EmailStr
    phone_number: Optional[str] = None
    # is_adult : Default = False
    # gender: male or female


class User(UserBase):
    id: UUID


class UserBaseCreate(UserBase):
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(User):
    username: str
    hashed_password: str
    first_name: str
    last_name: str
    email: EmailStr
    phone_number: int


class UserDelete(User):
    pass
