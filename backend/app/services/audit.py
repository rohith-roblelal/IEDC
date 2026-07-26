import logging
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.models import AuditLog
import uuid
from typing import Optional

logger = logging.getLogger(__name__)

async def log_audit_event(
    db: AsyncSession,
    action: str,
    user_id: Optional[uuid.UUID] = None,
    resource_type: Optional[str] = None,
    resource_id: Optional[str] = None,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None,
    status: str = "SUCCESS",
    metadata_json: Optional[dict] = None
):
    try:
        audit = AuditLog(
            user_id=user_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            ip_address=ip_address,
            user_agent=user_agent,
            status=status,
            metadata_json=metadata_json
        )
        db.add(audit)
        await db.commit()
    except Exception as e:
        logger.error(f"Failed to write audit log: {e}")
        await db.rollback()
