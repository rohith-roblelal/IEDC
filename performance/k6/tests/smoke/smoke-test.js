// tests/smoke/smoke-test.js
import { testPublicEndpoints } from '../../scenarios/public.js';
import { THRESHOLDS } from '../../config/env.js';
import { sleep } from 'k6';

export const options = {
  vus: 1, // 1 user loop for smoke tests
  duration: '1m',
  thresholds: {
    http_req_duration: [`p(95)<${THRESHOLDS.api}`], // 95% of requests must complete below threshold
    http_req_failed: ['rate<0.01'], // <1% errors
  },
};

export default function () {
  testPublicEndpoints();
  sleep(1);
}
