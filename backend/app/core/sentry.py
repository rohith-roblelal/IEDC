import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration
from sentry_sdk.integrations.redis import RedisIntegration
from sentry_sdk.integrations.arq import ArqIntegration

from app.core.config import settings
import logging

def setup_sentry():
    if not settings.SENTRY_DSN:
        logging.info("Sentry DSN not configured. Sentry tracking disabled.")
        return

    # Sentry environment sampling
    traces_sample_rate = 1.0  # Default 100% for development
    if settings.ENVIRONMENT == "production":
        traces_sample_rate = 0.1
    elif settings.ENVIRONMENT == "staging":
        traces_sample_rate = 0.5
        
    sentry_sdk.init(
        dsn=settings.SENTRY_DSN,
        environment=settings.ENVIRONMENT,
        traces_sample_rate=traces_sample_rate,
        profiles_sample_rate=traces_sample_rate,
        integrations=[
            FastApiIntegration(),
            SqlalchemyIntegration(),
            RedisIntegration(),
            ArqIntegration(),
        ],
        send_default_pii=False, # We explicitly do not send PII without manual opting in
    )
    logging.info(f"Sentry initialized for environment '{settings.ENVIRONMENT}'.")
