import uuid
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete

from app.models.models import Partner
from app.schemas.schemas import PartnerCreate, PartnerUpdate

class PartnerService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_all_partners(self, page: int = 1, page_size: int = 20) -> dict:
        from app.database.pagination import paginate
        query = select(Partner).order_by(Partner.sort_order.asc(), Partner.created_at.desc())
        items, total = await paginate(self.session, query, page, page_size)
        return {
            "items": items,
            "total": total,
            "page": page,
            "page_size": page_size,
            "has_next": (page * page_size) < total
        }

    async def get_partner(self, partner_id: uuid.UUID) -> Optional[Partner]:
        result = await self.session.execute(select(Partner).where(Partner.id == partner_id))
        return result.scalars().first()

    async def create_partner(self, partner_in: PartnerCreate) -> Partner:
        partner = Partner(**partner_in.model_dump())
        self.session.add(partner)
        await self.session.commit()
        await self.session.refresh(partner)
        return partner

    async def update_partner(self, partner_id: uuid.UUID, partner_in: PartnerUpdate) -> Optional[Partner]:
        partner = await self.get_partner(partner_id)
        if not partner:
            return None

        update_data = partner_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(partner, field, value)

        await self.session.commit()
        await self.session.refresh(partner)
        return partner

    async def delete_partner(self, partner_id: uuid.UUID) -> bool:
        partner = await self.get_partner(partner_id)
        if not partner:
            return False
            
        await self.session.execute(delete(Partner).where(Partner.id == partner_id))
        await self.session.commit()
        return True
