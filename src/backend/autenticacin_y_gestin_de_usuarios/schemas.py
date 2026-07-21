from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UsuarioBase(BaseModel):
    email: str = Field(..., max_length=255)
    nombre: str = Field(..., max_length=255)
    password: str = Field(..., min_length=8, max_length=128)


class TransportistaCreate(BaseModel):
    email: str = Field(..., max_length=255)
    nombre: str = Field(..., max_length=255)
    empresa: str = Field(..., max_length=255)
    password: str = Field(..., min_length=8, max_length=128)


class OperadorCreate(BaseModel):
    email: str = Field(..., max_length=255)
    nombre: str = Field(..., max_length=255)
    password: str = Field(..., min_length=8, max_length=128)
    codigo_invitacion: str = Field(..., max_length=255)


class LoginRequest(BaseModel):
    email: str = Field(..., max_length=255)
    password: str = Field(..., max_length=128)


class PasswordResetRequest(BaseModel):
    email: str = Field(..., max_length=255)


class PasswordResetConfirm(BaseModel):
    token: str = Field(..., max_length=512)
    new_password: str = Field(..., min_length=8, max_length=128)


class UsuarioResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    email: str
    nombre: str
    estado_cuenta: str
    fecha_registro: datetime
    rol: str
    empresa: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class TransportistaResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    email: str
    nombre: str
    empresa: Optional[str] = None
    estado_cuenta: str
    fecha_registro: datetime
    created_at: datetime
    updated_at: datetime


class LoginResponse(BaseModel):
    token: str
    usuario: UsuarioResponse
    mensaje: str = "Inicio de sesión exitoso"


class MensajeResponse(BaseModel):
    mensaje: str


class InvitacionCreate(BaseModel):
    codigo: str = Field(..., max_length=255)
    fecha_expiracion: datetime


class BloquearResponse(BaseModel):
    mensaje: str
    usuario_id: str
    estado_cuenta: str
