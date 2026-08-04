import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 50,
  duration: '1m',
  thresholds: {
    http_req_duration: ['p(50)<100', 'p(95)<300', 'p(99)<750'], // Latency SLOs
    http_req_failed: ['rate<0.01'], // Availability > 99%
  },
};

export default function () {
  const BASE_URL = __ENV.BASE_URL || 'http://localhost:8000';
  const res = http.get(`${BASE_URL}/api/v1/health`);
  check(res, { 'status was 200': (r) => r.status == 200 });
  sleep(1);
}
