from pydantic import BaseModel
from pydantic import EmailStr


class RegisterSchema(BaseModel):

    email: EmailStr
    password: str


class LoginSchema(BaseModel):

    email: EmailStr
    password: str


class QuestionSchema(BaseModel):

    question: str