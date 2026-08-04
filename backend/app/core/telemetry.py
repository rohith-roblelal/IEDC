from opentelemetry import trace
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.sdk.resources import Resource
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.sqlalchemy import SQLAlchemyInstrumentor
from opentelemetry.instrumentation.redis import RedisInstrumentor
from opentelemetry.instrumentation.httpx import HTTPXClientInstrumentor
from opentelemetry.sdk.trace.sampling import TraceIdRatioBased

from app.core.config import settings
import logging

def setup_telemetry(app):
    if not settings.OTEL_EXPORTER_OTLP_ENDPOINT:
        logging.info("OpenTelemetry exporter endpoint not configured. Tracing disabled.")
        return

    # Trace Sampling based on environment
    sample_rate = 1.0  # Default 100% for development
    if settings.ENVIRONMENT == "production":
        sample_rate = 0.1  # 10% in production
    elif settings.ENVIRONMENT == "staging":
        sample_rate = 0.5  # 50% in staging
        
    sampler = TraceIdRatioBased(sample_rate)
    
    resource = Resource.create({
        "service.name": "iedc-backend",
        "service.environment": settings.ENVIRONMENT
    })
    
    provider = TracerProvider(resource=resource, sampler=sampler)
    
    # Configure OTLP Exporter
    otlp_exporter = OTLPSpanExporter(
        endpoint=settings.OTEL_EXPORTER_OTLP_ENDPOINT,
        insecure=True  # Usually insecure for local/internal cluster traffic
    )
    span_processor = BatchSpanProcessor(otlp_exporter)
    provider.add_span_processor(span_processor)
    trace.set_tracer_provider(provider)
    
    # Instrumentations
    FastAPIInstrumentor.instrument_app(app)
    
    # SQLAlchemy (will be instrumented when engine is created, or globally)
    # Exclude passwords or PII if needed by omitting query parameters
    SQLAlchemyInstrumentor().instrument(enable_commenter=True, commenter_options={})
    
    # Redis
    RedisInstrumentor().instrument()
    
    # HTTPX
    HTTPXClientInstrumentor().instrument()
    
    logging.info(f"OpenTelemetry initialized. Exporting to {settings.OTEL_EXPORTER_OTLP_ENDPOINT} at {sample_rate*100}% sample rate.")
