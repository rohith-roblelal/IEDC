from datetime import datetime
from typing import Optional, List, Any, Dict
from pydantic import BaseModel, ConfigDict

class StatItem(BaseModel):
    label: str
    value: Optional[str] = None
    source: Optional[str] = None
    suffix: Optional[str] = None

class WebsiteSettingsUpdate(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    # Branding
    site_name: Optional[str] = None
    site_tagline: Optional[str] = None

    # Hero
    hero_title: Optional[str] = None
    hero_subtitle: Optional[str] = None
    hero_description: Optional[str] = None
    hero_cta_text: Optional[str] = None
    hero_cta_link: Optional[str] = None

    # About
    about_hero_title: Optional[str] = None
    about_hero_highlight: Optional[str] = None
    about_description: Optional[str] = None
    about_vision: Optional[str] = None
    about_stats_json: Optional[List[StatItem]] = None
    about_inspiration_quote: Optional[str] = None
    about_inspiration_author: Optional[str] = None
    about_inspiration_image_url: Optional[str] = None
    about_values_json: Optional[List[dict]] = None

    # Contact Info
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_address: Optional[str] = None

    # Social Media
    facebook_url: Optional[str] = None
    instagram_url: Optional[str] = None
    twitter_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    youtube_url: Optional[str] = None
    github_url: Optional[str] = None

    # Footer
    footer_tagline: Optional[str] = None

    # SEO / OG
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None

    # Email
    email_from_name: Optional[str] = None
    email_reply_to: Optional[str] = None

    # Flags
    maintenance_mode: Optional[bool] = None
    google_analytics_id: Optional[str] = None


class WebsiteSettingsResponse(WebsiteSettingsUpdate):
    model_config = ConfigDict(from_attributes=True)

    id: int = 1
    site_name: str = "IEDC SNMIMT"
    logo_url: Optional[str] = None
    favicon_url: Optional[str] = None
    hero_image_url: Optional[str] = None
    og_image_url: Optional[str] = None
    maintenance_mode: bool = False
    updated_at: Optional[datetime] = None
    derived_stats: Optional[Dict[str, int]] = None
