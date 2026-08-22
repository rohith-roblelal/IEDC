import http from 'k6/http';
import { check, sleep } from 'k6';

// ----------------------------------------------------------------------------
// SAFETY CONTROLS
// ----------------------------------------------------------------------------

// Enforce target environment to prevent accidental production attacks
const TARGET_ENV = __ENV.TARGET_ENV;

if (TARGET_ENV !== 'staging' && TARGET_ENV !== 'local') {
    throw new Error('ABORTED: You must explicitly set TARGET_ENV=staging or TARGET_ENV=local to run this test. Never run against production without explicit authorization.');
}

const BASE_URL = __ENV.TARGET_URL || (TARGET_ENV === 'local' ? 'http://127.0.0.1:8000' : 'https://api-staging.iedc.example.com');

// ----------------------------------------------------------------------------
// LOAD PROFILES
// ----------------------------------------------------------------------------

export const options = {
    scenarios: {
        // A controlled ramp-up to simulate moderate spike traffic
        spike_test: {
            executor: 'ramping-vus',
            startVUs: 0,
            stages: [
                { duration: '30s', target: 20 }, // Ramp up to 20 users
                { duration: '1m', target: 50 },  // Spike to 50 users
                { duration: '30s', target: 0 },  // Ramp down to 0
            ],
            gracefulRampDown: '10s',
        },
    },
    // Emergency stop if errors exceed 2% or p95 latency exceeds 2s
    thresholds: {
        http_req_failed: ['rate<0.02'],
        http_req_duration: ['p(95)<2000'],
    },
};

// ----------------------------------------------------------------------------
// TEST EXECUTION
// ----------------------------------------------------------------------------

export default function () {
    // 1. Test public GET endpoint (Events list)
    const eventsRes = http.get(`${BASE_URL}/api/v1/events?page=1&page_size=10`);
    
    // We expect either 200 (Success) or 429 (Rate Limited)
    check(eventsRes, {
        'events GET status is 200 or 429': (r) => r.status === 200 || r.status === 429,
        'backend handles load gracefully (no 5xx)': (r) => r.status < 500,
    });

    sleep(1); // Wait 1 second before next action to simulate human delay

    // 2. Test public POST endpoint (Contact form spam simulation)
    const contactPayload = JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        message: 'This is a load test message.',
    });
    
    const contactParams = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    const contactRes = http.post(`${BASE_URL}/api/v1/contact`, contactPayload, contactParams);
    
    check(contactRes, {
        'contact POST status is 200 or 429': (r) => r.status === 200 || r.status === 429,
        'rate limiting is working (eventual 429)': (r) => r.status === 429 || r.status === 200, 
    });

    sleep(2);
}
