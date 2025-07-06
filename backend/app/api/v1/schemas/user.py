from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone_number: int


class UserRegisterCreate(UserBase):
    pass


class UserUpdate(UserRegisterCreate):
    pass


class UserDelete(UserRegisterCreate):
    pass

