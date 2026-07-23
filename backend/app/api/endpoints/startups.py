import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.models import User
from app.schemas.startups import StartupResponse, StartupCreate, StartupUpdate
from app.api.dependencies import get_current_active_admin
from app.services.startups import StartupService

router = APIRouter()

@router.get("", response_model=List[StartupResponse])
def read_startups(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Retrieve all startups. Public endpoint.
    """
    startup_service = StartupService(db)
    return startup_service.get_all_startups(skip=skip, limit=limit)

@router.get("/{startup_id}", response_model=StartupResponse)
def read_startup(startup_id: uuid.UUID, db: Session = Depends(get_db)):
    """
    Retrieve a specific startup. Public endpoint.
    """
    startup_service = StartupService(db)
    return startup_service.get_startup(startup_id)

@router.post("", response_model=StartupResponse)
def create_startup(
    startup_in: StartupCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
):
    """
    Create a new startup. Only accessible by Admin.
    """
    startup_service = StartupService(db)
    return startup_service.create_startup(startup_in)

@router.put("/{startup_id}", response_model=StartupResponse)
def update_startup(
    startup_id: uuid.UUID,
    startup_in: StartupUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
):
    """
    Update a startup. Only accessible by Admin.
    """
    startup_service = StartupService(db)
    return startup_service.update_startup(startup_id, startup_in)

@router.delete("/{startup_id}", status_code=204)
def delete_startup(
    startup_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
):
    """
    Delete a startup. Only accessible by Admin.
    """
    startup_service = StartupService(db)
    startup_service.delete_startup(startup_id)
