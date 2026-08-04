import * as Sentry from '@sentry/nextjs';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Node.js edge/server Sentry setup
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      Sentry.init({
        dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
        tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      });
    }

    // OpenTelemetry setup
    if (process.env.OTEL_EXPORTER_OTLP_ENDPOINT) {
      const { registerOTel } = await import('@vercel/otel');
      registerOTel({ serviceName: 'iedc-frontend' });
    }
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    // Edge environment Sentry setup
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      Sentry.init({
        dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
        tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      });
    }
  }
}
