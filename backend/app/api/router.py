from fastapi import APIRouter

from app.api.endpoints import auth, users, events, registrations, team, announcements, gallery, contact, dashboard, upload, podcasts, partners, startups, settings, health

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(events.router, prefix="/events", tags=["events"])
api_router.include_router(registrations.router, tags=["registrations"])
api_router.include_router(team.router, prefix="/team", tags=["team"])
api_router.include_router(announcements.router, prefix="/announcements", tags=["announcements"])
api_router.include_router(gallery.router, prefix="/gallery", tags=["gallery"])
api_router.include_router(contact.router, prefix="/contact", tags=["contact"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(upload.router, prefix="/upload", tags=["upload"])
api_router.include_router(podcasts.router, prefix="/podcasts", tags=["podcasts"])
api_router.include_router(partners.router, prefix="/partners", tags=["partners"])
api_router.include_router(startups.router, prefix="/startups", tags=["startups"])
api_router.include_router(settings.router, prefix="/settings", tags=["settings"])
api_router.include_router(health.router, tags=["health"])
