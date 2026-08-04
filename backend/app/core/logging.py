import logging
import sys
import structlog
from app.core.config import settings

def redact_sensitive_data(logger, method_name, event_dict):
    """
    Redact PII and sensitive data such as passwords and tokens.
    """
    sensitive_keys = {"password", "token", "access_token", "refresh_token", "secret", "authorization"}
    for key in list(event_dict.keys()):
        lower_key = key.lower()
        if any(sensitive in lower_key for sensitive in sensitive_keys):
            event_dict[key] = "[REDACTED]"
    return event_dict

def add_app_metadata(logger, method_name, event_dict):
    """
    Add application metadata like app name, environment, and version.
    """
    event_dict["app"] = "IEDC_Backend"
    event_dict["env"] = settings.ENVIRONMENT
    # Could add version or commit hash here if available in settings
    return event_dict

def setup_logging():
    """
    Configure structlog for JSON formatting in production or console rendering in dev.
    """
    # Configure stdlib logging
    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=logging.INFO,
    )
    
    # Base processors
    processors = [
        structlog.contextvars.merge_contextvars,
        structlog.stdlib.add_log_level,
        structlog.stdlib.add_logger_name,
        structlog.processors.TimeStamper(fmt="iso"),
        add_app_metadata,
        redact_sensitive_data,
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
    ]
    
    if settings.ENVIRONMENT == "production":
        # JSON formatting for production
        processors.append(structlog.processors.JSONRenderer())
    else:
        # Colored, readable formatting for development
        processors.append(structlog.dev.ConsoleRenderer())
        
    structlog.configure(
        processors=processors,
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )
