import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.models.models import User
from app.schemas.schemas import PartnerResponse, PartnerCreate, PartnerUpdate
from app.api.dependencies import get_current_super_admin
from app.services.partner import PartnerService

from app.api.cache import cache_control, ETagRoute

router = APIRouter(route_class=ETagRoute)

from fastapi import APIRouter, Depends, HTTPException, Query
from app.schemas.schemas import PaginatedResponse

@router.get("", response_model=PaginatedResponse[PartnerResponse], dependencies=[Depends(cache_control(max_age=3600, s_maxage=21600))])
async def read_partners(
    page: int = Query(1, ge=1), 
    page_size: int = Query(20, ge=1, le=100), 
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve all partners. Public endpoint.
    """
    partner_service = PartnerService(db)
    return await partner_service.get_all_partners(page=page, page_size=page_size)

@router.post("", response_model=PartnerResponse)
async def create_partner(
    partner_in: PartnerCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_super_admin),
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
    current_user: User = Depends(get_current_super_admin),
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
    current_user: User = Depends(get_current_super_admin),
):
    """
    Delete a partner. Only accessible by Admin.
    """
    partner_service = PartnerService(db)
    success = await partner_service.delete_partner(partner_id)
    if not success:
        raise HTTPException(status_code=404, detail="Partner not found")
