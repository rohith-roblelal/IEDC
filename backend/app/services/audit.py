import logging
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.models import AuditLog
import uuid
from typing import Optional, Any

logger = logging.getLogger(__name__)

async def log_audit_event(
    db: AsyncSession,
    action: str,
    user_id: Any = None,
    resource_type: Optional[str] = None,
    resource_id: Optional[str] = None,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None,
    status: str = "SUCCESS",
    metadata_json: Optional[dict] = None
):
    # Redact sensitive information
    if metadata_json:
        sanitized_metadata = {}
        sensitive_keys = {"password", "token", "secret", "key", "jwt", "cookie", "payment"}
        for k, v in metadata_json.items():
            if any(s in k.lower() for s in sensitive_keys):
                sanitized_metadata[k] = "[REDACTED]"
            else:
                sanitized_metadata[k] = v
        metadata_json = sanitized_metadata

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

from functools import wraps
from fastapi import Request

def audit_log(action: str, resource_type: str):
    """
    Decorator for FastAPI route handlers to automatically log audit events.
    The decorated function must have 'request' (Request), 'db' (AsyncSession), 
    and 'current_user' (User) in its arguments or dependencies, or the router must provide them.
    Because of FastAPI limitations, it's easier to explicitly call `log_audit_event`
    in the controller, but to avoid boilerplate, we can use a dependency.
    """
    pass
