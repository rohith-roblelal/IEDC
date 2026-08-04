import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 50 },  // below normal load
    { duration: '5m', target: 50 },
    { duration: '2m', target: 100 }, // normal load
    { duration: '5m', target: 100 },
    { duration: '2m', target: 200 }, // around breaking point
    { duration: '5m', target: 200 },
    { duration: '2m', target: 300 }, // beyond breaking point
    { duration: '5m', target: 300 },
    { duration: '10m', target: 0 },  // scale down
  ],
};

export default function () {
  const BASE_URL = __ENV.BASE_URL || 'http://localhost:8000';
  const res = http.get(`${BASE_URL}/api/v1/health/ready`);
  check(res, { 'status was 200': (r) => r.status == 200 });
  sleep(1);
}
