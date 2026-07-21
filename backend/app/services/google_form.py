import httpx
import re
import json
import uuid
import logging
from typing import Dict, Any, Tuple
from bs4 import BeautifulSoup
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.models import Event, Registration
from app.schemas.schemas import RegistrationCreate

logger = logging.getLogger(__name__)

class GoogleFormService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def auto_detect_mapping(self, url: str) -> Tuple[bool, str, Dict[str, str], str, str]:
        """
        Parses a public Google Form URL and extracts form fields.
        Returns (success, form_id, mapping_dict, response_url, error_msg)
        """
        try:
            # Clean URL
            url = url.split("?")[0]
            if "/viewform" not in url:
                if url.endswith("/"):
                    url += "viewform"
                else:
                    url += "/viewform"
                    
            form_id_match = re.search(r'/d/e/([a-zA-Z0-9_-]+)/', url)
            if not form_id_match:
                return False, "", {}, "", "Invalid Google Form URL"
                
            form_id = form_id_match.group(1)
            response_url = url.replace("viewform", "formResponse")

            async with httpx.AsyncClient() as client:
                res = await client.get(url, timeout=10.0)
                if res.status_code != 200:
                    return False, "", {}, "", f"Failed to fetch form. Status: {res.status_code}"

            soup = BeautifulSoup(res.text, "html.parser")
            script_tags = soup.find_all("script")
            
            fb_data = None
            for script in script_tags:
                if script.string and "var FB_PUBLIC_LOAD_DATA_" in script.string:
                    match = re.search(r'var FB_PUBLIC_LOAD_DATA_ = (\[.*?\]);', script.string, re.DOTALL)
                    if match:
                        fb_data = json.loads(match.group(1))
                        break
                        
            if not fb_data or len(fb_data) < 2 or not fb_data[1] or len(fb_data[1]) < 2:
                return False, "", {}, "", "Failed to extract form data. Form may be private."

            questions_array = fb_data[1][1]
            mapping = {}
            
            for q in questions_array:
                if not q or len(q) < 5 or not q[4]:
                    continue
                    
                title = str(q[1]).strip().lower()
                # Field ID is usually inside the 4th element's 0th element's 0th element
                try:
                    entry_id = str(q[4][0][0])
                    entry_key = f"entry.{entry_id}"
                    
                    # Auto map based on common keywords
                    if "name" in title:
                        mapping["name"] = entry_key
                    elif "phone" in title or "number" in title:
                        mapping["phone"] = entry_key
                    elif "email" in title:
                        mapping["email"] = entry_key
                    elif "gender" in title:
                        mapping["gender"] = entry_key
                    elif "year" in title:
                        mapping["year"] = entry_key
                    elif "department" in title:
                        mapping["department"] = entry_key
                    elif "laptop" in title:
                        mapping["has_laptop"] = entry_key
                    elif "iedc" in title or "member" in title:
                        mapping["is_iedc_member"] = entry_key
                except (IndexError, TypeError):
                    continue

            return True, form_id, mapping, response_url, ""
            
        except Exception as e:
            logger.error(f"Error parsing Google Form: {e}")
            return False, "", {}, "", str(e)

    async def submit_registration(self, event: Event, data: RegistrationCreate) -> bool:
        """
        Submits registration data to Google Forms using httpx.
        """
        if not event.google_form_enabled or not event.google_form_response_url or not event.field_mapping:
            return False

        payload = {}
        data_dict = data.model_dump()
        
        for key, value in data_dict.items():
            if key == "custom_answers" and value:
                for custom_key, custom_val in value.items():
                    entry_id = event.field_mapping.get(custom_key)
                    if entry_id and custom_val is not None:
                        if isinstance(custom_val, list):
                            # For checkboxes, Google Forms expects multiple entries with the same key
                            # Requests using httpx handles this when payload is a list of tuples or dict with lists
                            pass
                        payload[entry_id] = str(custom_val) if not isinstance(custom_val, list) else custom_val
                continue
                
            entry_id = event.field_mapping.get(key)
            if entry_id and value is not None:
                if isinstance(value, bool):
                    payload[entry_id] = "Yes" if value else "No"
                else:
                    payload[entry_id] = str(value)

        try:
            async with httpx.AsyncClient() as client:
                res = await client.post(
                    event.google_form_response_url, 
                    data=payload,
                    headers={"Content-Type": "application/x-www-form-urlencoded"},
                    timeout=10.0
                )
                
                # Google Forms usually returns 200 on success, sometimes 302
                if res.status_code in [200, 302, 303]:
                    return True
                else:
                    logger.error(f"Google Form submit failed: {res.status_code} - {res.text}")
                    return False
        except Exception as e:
            logger.error(f"Error submitting to Google Form: {e}")
            return False
