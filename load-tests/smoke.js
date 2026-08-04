import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 1, // 1 user looping for 10 seconds
  duration: '10s',

  thresholds: {
    http_req_duration: ['p(99)<200'], // 99% of requests must complete below 200ms
    http_req_failed: ['rate<0.01'],   // Error rate must be less than 1%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8000';

export default function () {
  const res = http.get(`${BASE_URL}/api/v1/health`);
  check(res, { 'status was 200': (r) => r.status == 200 });
  sleep(1);
}
