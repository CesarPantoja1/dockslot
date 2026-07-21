import hashlib
import uuid
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from .models import Invitacion, RecuperacionContrasena, Sesion, Usuario
from .schemas import (
    BloquearResponse,
    LoginRequest,
    LoginResponse,
    MensajeResponse,
    OperadorCreate,
    PasswordResetConfirm,
    PasswordResetRequest,
    TransportistaCreate,
    TransportistaResponse,
    UsuarioResponse,
)

router = APIRouter()


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def verify_password(password: str, password_hash: str) -> bool:
    return hash_password(password) == password_hash


def generate_token() -> str:
    return str(uuid.uuid4()) + "-" + str(uuid.uuid4())


@router.post("/auth/register/transportista", response_model=UsuarioResponse)
async def register_transportista(data: TransportistaCreate, db: AsyncSession = Depends(get_db)):
    """Registro de transportista (Requisito 1)"""
    try:
        result = await db.execute(select(Usuario).where(Usuario.email == data.email))
        existing = result.scalar_one_or_none()
        if existing:
            raise HTTPException(status_code=409, detail="El correo electrónico ya está registrado")

        usuario = Usuario(
            email=data.email,
            nombre=data.nombre,
            password_hash=hash_password(data.password),
            empresa=data.empresa,
            rol="transportista",
            estado_cuenta="activo",
        )
        db.add(usuario)
        await db.commit()
        await db.refresh(usuario)
        return UsuarioResponse.model_validate(usuario)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al registrar transportista: {str(e)}")


@router.post("/auth/register/operador", response_model=UsuarioResponse)
async def register_operador(data: OperadorCreate, db: AsyncSession = Depends(get_db)):
    """Registro de operador con código de invitación (Requisito 2)"""
    try:
        result = await db.execute(select(Usuario).where(Usuario.email == data.email))
        existing = result.scalar_one_or_none()
        if existing:
            raise HTTPException(status_code=409, detail="El correo electrónico ya está registrado")

        result = await db.execute(
            select(Invitacion).where(
                Invitacion.codigo == data.codigo_invitacion,
                Invitacion.usado == False,
                Invitacion.fecha_expiracion > datetime.utcnow(),
            )
        )
        invitacion = result.scalar_one_or_none()
        if not invitacion:
            raise HTTPException(status_code=400, detail="El código de invitación no es válido o ha expirado")

        usuario = Usuario(
            email=data.email,
            nombre=data.nombre,
            password_hash=hash_password(data.password),
            rol="operador",
            estado_cuenta="activo",
            codigo_invitacion_usado=data.codigo_invitacion,
        )
        invitacion.usado = True
        db.add(usuario)
        await db.commit()
        await db.refresh(usuario)
        return UsuarioResponse.model_validate(usuario)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al registrar operador: {str(e)}")


@router.post("/auth/login", response_model=LoginResponse)
async def login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Inicio de sesión para transportista y operador (Requisito 3)"""
    try:
        result = await db.execute(select(Usuario).where(Usuario.email == data.email))
        usuario = result.scalar_one_or_none()

        if not usuario or not verify_password(data.password, usuario.password_hash):
            raise HTTPException(status_code=401, detail="Credenciales inválidas")

        if usuario.estado_cuenta == "bloqueado":
            raise HTTPException(
                status_code=403,
                detail="La cuenta ha sido bloqueada. Contacte al operador.",
            )

        token = generate_token()
        sesion = Sesion(
            token=token,
            usuario_id=usuario.id,
            fecha_inicio=datetime.utcnow(),
            fecha_expiracion=datetime.utcnow() + timedelta(hours=24),
            activa=True,
        )
        db.add(sesion)
        await db.commit()

        return LoginResponse(
            token=token,
            usuario=UsuarioResponse.model_validate(usuario),
            mensaje="Inicio de sesión exitoso",
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al iniciar sesión: {str(e)}")


@router.post("/auth/password-reset/request", response_model=MensajeResponse)
async def request_password_reset(data: PasswordResetRequest, db: AsyncSession = Depends(get_db)):
    """Solicitar recuperación de contraseña (Requisito 4)"""
    try:
        result = await db.execute(
            select(Usuario).where(
                Usuario.email == data.email,
                Usuario.rol == "transportista",
            )
        )
        usuario = result.scalar_one_or_none()

        if not usuario:
            return MensajeResponse(
                mensaje="Si el correo existe, recibirá un enlace de recuperación"
            )

        token = generate_token()
        recuperacion = RecuperacionContrasena(
            token=token,
            usuario_id=usuario.id,
            fecha_solicitud=datetime.utcnow(),
            fecha_expiracion=datetime.utcnow() + timedelta(hours=1),
            utilizada=False,
        )
        db.add(recuperacion)
        await db.commit()

        return MensajeResponse(
            mensaje="Si el correo existe, recibirá un enlace de recuperación"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al solicitar recuperación: {str(e)}")


@router.post("/auth/password-reset/confirm", response_model=MensajeResponse)
async def confirm_password_reset(data: PasswordResetConfirm, db: AsyncSession = Depends(get_db)):
    """Confirmar recuperación de contraseña (Requisito 4)"""
    try:
        result = await db.execute(
            select(RecuperacionContrasena).where(
                RecuperacionContrasena.token == data.token,
                RecuperacionContrasena.utilizada == False,
                RecuperacionContrasena.fecha_expiracion > datetime.utcnow(),
            )
        )
        recuperacion = result.scalar_one_or_none()

        if not recuperacion:
            raise HTTPException(
                status_code=400,
                detail="El enlace ha expirado o ya ha sido utilizado. Solicite un nuevo enlace.",
            )

        result = await db.execute(
            select(Usuario).where(Usuario.id == recuperacion.usuario_id)
        )
        usuario = result.scalar_one_or_none()

        if not usuario:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")

        usuario.password_hash = hash_password(data.new_password)
        recuperacion.utilizada = True
        await db.commit()

        return MensajeResponse(mensaje="Contraseña actualizada exitosamente")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al confirmar recuperación: {str(e)}")


@router.post("/auth/logout", response_model=MensajeResponse)
async def logout(token: str = Query(...), db: AsyncSession = Depends(get_db)):
    """Cerrar sesión"""
    try:
        result = await db.execute(
            select(Sesion).where(
                Sesion.token == token,
                Sesion.activa == True,
            )
        )
        sesion = result.scalar_one_or_none()
        if sesion:
            sesion.activa = False
            await db.commit()

        return MensajeResponse(mensaje="Sesión cerrada exitosamente")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al cerrar sesión: {str(e)}")


@router.get("/transportistas", response_model=list[TransportistaResponse])
async def list_transportistas(
    search: Optional[str] = Query(None),
    nombre: Optional[str] = Query(None),
    email: Optional[str] = Query(None),
    estado: Optional[str] = Query(None),
    ordenar_por: Optional[str] = Query(None),
    orden_ascendente: bool = Query(True),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
):
    """Listar transportistas (Requisito 5) - Solo visibles por operadores"""
    try:
        query = select(Usuario).where(Usuario.rol == "transportista")

        if search:
            query = query.where(
                or_(
                    Usuario.nombre.ilike(f"%{search}%"),
                    Usuario.email.ilike(f"%{search}%"),
                )
            )
        if nombre:
            query = query.where(Usuario.nombre.ilike(f"%{nombre}%"))
        if email:
            query = query.where(Usuario.email.ilike(f"%{email}%"))
        if estado:
            query = query.where(Usuario.estado_cuenta == estado)

        if ordenar_por:
            col = getattr(Usuario, ordenar_por, None)
            if col:
                query = query.order_by(col.asc() if orden_ascendente else col.desc())
            else:
                query = query.order_by(Usuario.nombre.asc())
        else:
            query = query.order_by(Usuario.nombre.asc())

        query = query.offset(skip).limit(limit)
        result = await db.execute(query)
        transportistas = result.scalars().all()

        return [TransportistaResponse.model_validate(t) for t in transportistas]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al listar transportistas: {str(e)}")


@router.post("/transportistas/{usuario_id}/block", response_model=BloquearResponse)
async def block_transportista(usuario_id: str, db: AsyncSession = Depends(get_db)):
    """Bloquear cuenta de transportista (Requisito 6)"""
    try:
        result = await db.execute(
            select(Usuario).where(
                Usuario.id == usuario_id,
                Usuario.rol == "transportista",
            )
        )
        usuario = result.scalar_one_or_none()

        if not usuario:
            raise HTTPException(status_code=404, detail="Transportista no encontrado")

        if usuario.estado_cuenta == "bloqueado":
            raise HTTPException(status_code=409, detail="La cuenta ya está bloqueada")

        usuario.estado_cuenta = "bloqueado"
        await db.commit()
        await db.refresh(usuario)

        return BloquearResponse(
            mensaje="Cuenta bloqueada exitosamente",
            usuario_id=usuario.id,
            estado_cuenta=usuario.estado_cuenta,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al bloquear transportista: {str(e)}")


@router.post("/transportistas/{usuario_id}/unblock", response_model=BloquearResponse)
async def unblock_transportista(usuario_id: str, db: AsyncSession = Depends(get_db)):
    """Desbloquear cuenta de transportista (Requisito 6)"""
    try:
        result = await db.execute(
            select(Usuario).where(
                Usuario.id == usuario_id,
                Usuario.rol == "transportista",
            )
        )
        usuario = result.scalar_one_or_none()

        if not usuario:
            raise HTTPException(status_code=404, detail="Transportista no encontrado")

        if usuario.estado_cuenta == "activo":
            raise HTTPException(status_code=409, detail="La cuenta ya está activa")

        usuario.estado_cuenta = "activo"
        await db.commit()
        await db.refresh(usuario)

        return BloquearResponse(
            mensaje="Cuenta desbloqueada exitosamente",
            usuario_id=usuario.id,
            estado_cuenta=usuario.estado_cuenta,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al desbloquear transportista: {str(e)}")


@router.get("/auth/session/validate", response_model=UsuarioResponse)
async def validate_session(token: str = Query(...), db: AsyncSession = Depends(get_db)):
    """Validar si un token de sesión es activo"""
    try:
        result = await db.execute(
            select(Sesion).where(
                Sesion.token == token,
                Sesion.activa == True,
                Sesion.fecha_expiracion > datetime.utcnow(),
            )
        )
        sesion = result.scalar_one_or_none()

        if not sesion:
            raise HTTPException(status_code=401, detail="Sesión inválida o expirada")

        result = await db.execute(select(Usuario).where(Usuario.id == sesion.usuario_id))
        usuario = result.scalar_one_or_none()

        if not usuario or usuario.estado_cuenta == "bloqueado":
            raise HTTPException(status_code=401, detail="Sesión inválida o cuenta bloqueada")

        return UsuarioResponse.model_validate(usuario)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al validar sesión: {str(e)}")
