from datetime import datetime, timezone, timedelta
from dataclasses import dataclass
from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from app.models.models import Event, Registration, Startup, Podcast, Announcement, GalleryImage

@dataclass
class AnnualReportSummary:
    total_events: int
    total_registrations: int
    total_startups: int
    total_podcasts: int
    total_announcements: int
    total_gallery: int

@dataclass
class AnnualReportData:
    start_date: datetime
    end_date: datetime
    generated_at: datetime
    generated_by: str
    
    summary: AnnualReportSummary
    events: List[Event]
    registration_summary: List[Dict[str, Any]]
    startups: List[Startup]
    podcasts: List[Podcast]
    announcements: List[Announcement]
    gallery: List[GalleryImage]

async def get_annual_report_data(
    db: AsyncSession,
    start_date: datetime,
    end_date: datetime,
    generated_by_name: str
) -> AnnualReportData:
    """
    Fetches and aggregates all data needed for the annual report,
    avoiding N+1 queries.
    Uses inclusive date semantics for the end date.
    """
    generated_at = datetime.now(timezone.utc)
    
    # Make end date inclusive of the entire day
    end_date_inclusive = end_date + timedelta(days=1)

    # 1. Events (filter by start_datetime, fallback to created_at if null)
    event_stmt = select(Event).where(
        (Event.start_datetime >= start_date) & (Event.start_datetime < end_date_inclusive)
    ).order_by(Event.start_datetime.desc())
    events_result = await db.execute(event_stmt)
    events = list(events_result.scalars().all())

    # 2. Registrations Summary
    # Group registrations by event for the reporting period
    # To keep it event-centric as requested, we count registrations that occurred in the period
    reg_stmt = (
        select(Event.title, Event.start_datetime, func.count(Registration.id).label("total_regs"))
        .join(Registration, Registration.event_id == Event.id)
        .where((Registration.created_at >= start_date) & (Registration.created_at < end_date_inclusive))
        .group_by(Event.id)
        .order_by(Event.start_datetime.desc())
    )
    reg_result = await db.execute(reg_stmt)
    registration_summary = [
        {"event_name": row.title, "date": row.start_datetime, "total_registrations": row.total_regs}
        for row in reg_result.all()
    ]
    
    total_registrations = sum(item["total_registrations"] for item in registration_summary)

    # 3. Startups (with founders loaded via selectinload to avoid N+1)
    startup_stmt = select(Startup).options(
        selectinload(Startup.founders)
    ).where(
        (Startup.created_at >= start_date) & (Startup.created_at < end_date_inclusive)
    ).order_by(Startup.created_at.desc())
    startup_result = await db.execute(startup_stmt)
    startups = list(startup_result.scalars().unique().all())

    # 4. Podcasts
    podcast_stmt = select(Podcast).where(
        (Podcast.created_at >= start_date) & (Podcast.created_at < end_date_inclusive)
    ).order_by(Podcast.created_at.desc())
    podcast_result = await db.execute(podcast_stmt)
    podcasts = list(podcast_result.scalars().all())

    # 5. Announcements
    ann_stmt = select(Announcement).where(
        (Announcement.created_at >= start_date) & (Announcement.created_at < end_date_inclusive)
    ).order_by(Announcement.created_at.desc())
    ann_result = await db.execute(ann_stmt)
    announcements = list(ann_result.scalars().all())

    # 6. Gallery
    gallery_stmt = select(GalleryImage).where(
        (GalleryImage.created_at >= start_date) & (GalleryImage.created_at < end_date_inclusive)
    ).order_by(GalleryImage.created_at.desc())
    gallery_result = await db.execute(gallery_stmt)
    gallery = list(gallery_result.scalars().all())

    summary = AnnualReportSummary(
        total_events=len(events),
        total_registrations=total_registrations,
        total_startups=len(startups),
        total_podcasts=len(podcasts),
        total_announcements=len(announcements),
        total_gallery=len(gallery)
    )

    return AnnualReportData(
        start_date=start_date,
        end_date=end_date,
        generated_at=generated_at,
        generated_by=generated_by_name,
        summary=summary,
        events=events,
        registration_summary=registration_summary,
        startups=startups,
        podcasts=podcasts,
        announcements=announcements,
        gallery=gallery
    )
