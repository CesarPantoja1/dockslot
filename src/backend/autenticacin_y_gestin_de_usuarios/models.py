import uuid
from datetime import datetime, timedelta

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from database import Base


def generate_uuid():
    return str(uuid.uuid4())


class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, nullable=False, index=True)
    nombre = Column(String(255), nullable=False)
    password_hash = Column(String(255), nullable=False)
    estado_cuenta = Column(String(20), nullable=False, default="activo")
    fecha_registro = Column(DateTime, nullable=False, default=datetime.utcnow)
    rol = Column(String(20), nullable=False)
    empresa = Column(String(255), nullable=True)
    codigo_invitacion_usado = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __mapper_args__ = {
        "polymorphic_on": rol,
        "polymorphic_identity": "usuario",
    }

    sesiones = relationship("Sesion", back_populates="usuario", cascade="all, delete-orphan")
    recuperaciones = relationship("RecuperacionContrasena", back_populates="usuario", cascade="all, delete-orphan")


class Invitacion(Base):
    __tablename__ = "invitaciones"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    codigo = Column(String(255), unique=True, nullable=False, index=True)
    fecha_creacion = Column(DateTime, nullable=False, default=datetime.utcnow)
    fecha_expiracion = Column(DateTime, nullable=False)
    usado = Column(Boolean, nullable=False, default=False)
    creado_por = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Sesion(Base):
    __tablename__ = "sesiones"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    token = Column(String(512), unique=True, nullable=False)
    usuario_id = Column(String(36), ForeignKey("usuarios.id"), nullable=False)
    fecha_inicio = Column(DateTime, nullable=False, default=datetime.utcnow)
    fecha_expiracion = Column(DateTime, nullable=False)
    activa = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    usuario = relationship("Usuario", back_populates="sesiones")


class RecuperacionContrasena(Base):
    __tablename__ = "recuperaciones_contrasena"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    token = Column(String(512), unique=True, nullable=False)
    usuario_id = Column(String(36), ForeignKey("usuarios.id"), nullable=False)
    fecha_solicitud = Column(DateTime, nullable=False, default=datetime.utcnow)
    fecha_expiracion = Column(DateTime, nullable=False)
    utilizada = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    usuario = relationship("Usuario", back_populates="recuperaciones")
