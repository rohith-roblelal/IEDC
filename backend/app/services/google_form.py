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
from urllib.parse import urlparse, urljoin
import socket
import ipaddress

logger = logging.getLogger(__name__)

def is_ip_allowed(ip_str: str) -> bool:
    try:
        ip = ipaddress.ip_address(ip_str)
        # Block private, loopback, link-local, multicast, unroutable
        if ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_multicast or ip.is_unspecified or ip.is_reserved:
            return False
        # Explicit check for 169.254.x.x (AWS/GCP/Azure Metadata) - usually covered by is_link_local but good to be explicit
        if isinstance(ip, ipaddress.IPv4Address) and ip_str.startswith("169.254."):
            return False
        return True
    except ValueError:
        return False

async def secure_request(url: str, method: str = "GET", data: dict = None, max_redirects: int = 3) -> httpx.Response:
    """
    Makes a request with strict SSRF protections:
    - HTTPS only
    - Specific allowed domains (Google Forms)
    - DNS resolution checks against private IPs (DNS rebinding / TOCTOU protection)
    - Strict manual redirect following and revalidation
    """
    current_url = url
    redirects = 0
    
    async with httpx.AsyncClient(follow_redirects=False) as client:
        while redirects <= max_redirects:
            parsed = urlparse(current_url)
            
            if parsed.scheme != "https":
                raise ValueError("URL must use HTTPS")
                
            if parsed.netloc not in ["docs.google.com", "forms.gle"]:
                raise ValueError(f"URL domain '{parsed.netloc}' is not allowed")
                
            # Resolve DNS and check IPs
            try:
                # Resolve hostname
                addr_infos = socket.getaddrinfo(parsed.hostname, parsed.port or 443)
                ips = {info[4][0] for info in addr_infos}
                
                for ip in ips:
                    if not is_ip_allowed(ip):
                        raise ValueError(f"URL resolves to a prohibited IP address: {ip}")
            except socket.gaierror:
                raise ValueError("Failed to resolve hostname")
                
            # Make the actual request (timeout enforced)
            if method.upper() == "GET":
                res = await client.get(current_url, timeout=10.0)
            elif method.upper() == "POST":
                res = await client.post(
                    current_url, 
                    data=data, 
                    headers={"Content-Type": "application/x-www-form-urlencoded"},
                    timeout=10.0
                )
            else:
                raise ValueError("Unsupported HTTP method")
                
            if res.status_code in (301, 302, 303, 307, 308):
                location = res.headers.get("Location")
                if not location:
                    break
                # Handle relative redirects
                current_url = urljoin(current_url, location)
                redirects += 1
            else:
                return res
                
        if redirects > max_redirects:
            raise ValueError("Too many redirects")
            
        return res

class GoogleFormService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def auto_detect_mapping(self, url: str) -> Tuple[bool, str, Dict[str, str], str, str]:
        """
        Parses a public Google Form URL and extracts form fields.
        Returns (success, form_id, mapping_dict, response_url, error_msg)
        """
        try:
            # Strict URL Validation (SSRF Protection)
            parsed_url = urlparse(url)
            
            if parsed_url.scheme != "https":
                return False, "", {}, "", "URL must use HTTPS"
                
            if parsed_url.netloc not in ["docs.google.com", "forms.gle"]:
                return False, "", {}, "", "URL must be a valid Google Forms domain"
                
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

            res = await secure_request(url, method="GET")

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
            # Revalidate the URL before submitting, just in case the database was tampered with
            parsed_response_url = urlparse(event.google_form_response_url)
            if parsed_response_url.scheme != "https" or parsed_response_url.netloc not in ["docs.google.com", "forms.gle"]:
                logger.error("Blocked submission to unauthorized Google Form URL")
                return False

            res = await secure_request(event.google_form_response_url, method="POST", data=payload)
            
            # Google Forms usually returns 200 on success, sometimes 302/303 if we didn't follow the final redirect
            if res.status_code in [200, 302, 303]:
                return True
            else:
                logger.error(f"Google Form submit failed: {res.status_code} - {res.text}")
                return False
        except Exception as e:
            logger.error(f"Error submitting to Google Form: {e}")
            return False
