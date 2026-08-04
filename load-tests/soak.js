import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 200 }, // ramp up to 200 users
    { duration: '2h', target: 200 }, // stay at 200 for ~2 hours
    { duration: '2m', target: 0 },   // ramp down
  ],
};

export default function () {
  const BASE_URL = __ENV.BASE_URL || 'http://localhost:8000';
  const res = http.get(`${BASE_URL}/api/v1/health`);
  check(res, { 'status was 200': (r) => r.status == 200 });
  sleep(1);
}
