from datetime import datetime
from enum import Enum
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class Role(str, Enum):
    admin = "admin"
    manager = "manager"
    user = "user"


class UserCreate(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    email: EmailStr
    password: str = Field(min_length=8)
    name: str | None = None
    phone: str | None = None
    address: str | None = None


class UserUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    email: EmailStr | None = None
    password: str | None = Field(default=None, min_length=8)
    role: Role | None = None
    is_active: bool | None = None


class ProfileUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    name: str | None = None
    phone: str | None = None
    address: str | None = None


class ForgotPasswordRequest(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    email: EmailStr


class ResetPasswordRequest(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    token: str = Field(min_length=20)
    new_password: str = Field(min_length=8, max_length=72)


class ChangePasswordRequest(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    current_password: str
    new_password: str = Field(min_length=8, max_length=72)


class MessageResponse(BaseModel):
    message: str


class UserPublic(BaseModel):
    id: str
    email: EmailStr
    is_active: bool
    role: Role
    created_at: datetime


class ProfilePublic(BaseModel):
    id: str
    name: str | None = None
    phone: str | None = None
    address: str | None = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: Literal["bearer"]


class RegisteredUser(BaseModel):
    id: str
    is_active: bool
    role: Role
    created_at: datetime


class RegistrationResponse(BaseModel):
    user: RegisteredUser
    profile: ProfilePublic


class AccountResponse(BaseModel):
    user: UserPublic
    profile: ProfilePublic | None


class UserListItem(UserPublic):
    """Flat public fields; profiles and credentials never belong in this list."""


class UserDeleteResponse(BaseModel):
    deleted: bool
    id: str
