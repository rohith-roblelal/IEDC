import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 100 }, // fast ramp up to 100 VUs
    { duration: '1m', target: 100 },  // stay at 100 VUs
    { duration: '10s', target: 0 },   // ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<300'],
  },
};

export default function () {
  const BASE_URL = __ENV.BASE_URL || 'http://localhost:8000';
  const res = http.get(`${BASE_URL}/api/v1/health`);
  check(res, { 'status was 200': (r) => r.status == 200 });
  sleep(1);
}
