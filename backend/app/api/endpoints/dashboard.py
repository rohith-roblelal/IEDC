import uuid
import csv
import io
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, Query, Request, HTTPException
from fastapi.responses import Response, StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, and_

from app.database.session import get_db
from app.models.models import User, Event, Registration, ContactMessage, TeamMember, Startup
from app.api.dependencies import get_current_super_admin
from app.services.audit import log_audit_event
from app.services.report_data import get_annual_report_data
from app.services.report_generator import create_pdf_report

router = APIRouter()

@router.get("", response_model=Dict[str, Any])
async def get_dashboard_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_super_admin),
):
    """
    Retrieve aggregated statistics for the admin dashboard. Only accessible by Admin.
    """
    # Consolidate into a single query using scalar_subquery to prevent DB pool starvation
    query = select(
        select(func.count(Event.id)).where(Event.deleted_at.is_(None)).scalar_subquery().label("total_events"),
        select(func.count(Registration.id)).join(Event, Registration.event_id == Event.id).where(Event.deleted_at.is_(None)).scalar_subquery().label("total_registrations"),
        select(func.count(ContactMessage.id)).where(ContactMessage.is_read == False).scalar_subquery().label("unread_messages"),
        select(func.count(TeamMember.id)).where(TeamMember.deleted_at.is_(None)).scalar_subquery().label("total_team_members"),
        select(func.count(Startup.id)).where(Startup.deleted_at.is_(None)).scalar_subquery().label("total_startups")
    )
    
    result = await db.execute(query)
    row = result.first()

    return {
        "total_events": row.total_events if row else 0,
        "total_registrations": row.total_registrations if row else 0,
        "unread_messages": row.unread_messages if row else 0,
        "total_team_members": row.total_team_members if row else 0,
        "total_startups": row.total_startups if row else 0
    }

@router.get("/report")
async def generate_annual_report(
    request: Request,
    start_date: Optional[datetime] = Query(None, description="Start date for report (defaults to 1 year ago)"),
    end_date: Optional[datetime] = Query(None, description="End date for report (defaults to now)"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_super_admin),
):
    """
    Generate a professional PDF activity report for the given date range.
    Only accessible by Super Admin.
    """
    now = datetime.now(timezone.utc)
    
    if not end_date:
        end_date = now
    if not start_date:
        start_date = end_date - timedelta(days=365)
        
    # Ensure timezone awareness
    if start_date.tzinfo is None:
        start_date = start_date.replace(tzinfo=timezone.utc)
    if end_date.tzinfo is None:
        end_date = end_date.replace(tzinfo=timezone.utc)
        
    if start_date > end_date:
        raise HTTPException(status_code=422, detail="Start date cannot be after end date.")

    # Perform DB queries for the requested range using the new service
    report_data = await get_annual_report_data(
        db=db,
        start_date=start_date,
        end_date=end_date,
        generated_by_name=str(current_user.email)
    )

    # Generate PDF
    pdf_buffer = create_pdf_report(report_data)

    filename = f"IEDC_Activity_Report_{start_date.strftime('%Y-%m-%d')}_to_{end_date.strftime('%Y-%m-%d')}.pdf"
    
    # Log Audit Event
    await log_audit_event(
        db=db,
        user_id=current_user.id,
        action="GENERATE_REPORT",
        resource_type="Report",
        ip_address=request.client.host if request.client else "Unknown",
        user_agent=request.headers.get("user-agent", "Unknown"),
        resource_id=None,
        metadata_json={"start_date": start_date.isoformat(), "end_date": end_date.isoformat(), "format": "pdf"}
    )

    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )
