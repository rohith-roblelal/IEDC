import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.models.models import User
from app.schemas.schemas import PartnerResponse, PartnerCreate, PartnerUpdate
from app.api.dependencies import get_current_active_admin
from app.services.partner import PartnerService

router = APIRouter()

@router.get("", response_model=List[PartnerResponse])
async def read_partners(db: AsyncSession = Depends(get_db)):
    """
    Retrieve all partners. Public endpoint.
    """
    partner_service = PartnerService(db)
    return await partner_service.get_all_partners()

@router.post("", response_model=PartnerResponse)
async def create_partner(
    partner_in: PartnerCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
):
    """
    Create a new partner. Only accessible by Admin.
    """
    partner_service = PartnerService(db)
    return await partner_service.create_partner(partner_in)

@router.put("/{partner_id}", response_model=PartnerResponse)
async def update_partner(
    partner_id: uuid.UUID,
    partner_in: PartnerUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
):
    """
    Update a partner. Only accessible by Admin.
    """
    partner_service = PartnerService(db)
    partner = await partner_service.update_partner(partner_id, partner_in)
    if not partner:
        raise HTTPException(status_code=404, detail="Partner not found")
    return partner

@router.delete("/{partner_id}", status_code=204)
async def delete_partner(
    partner_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
):
    """
    Delete a partner. Only accessible by Admin.
    """
    partner_service = PartnerService(db)
    success = await partner_service.delete_partner(partner_id)
    if not success:
        raise HTTPException(status_code=404, detail="Partner not found")
