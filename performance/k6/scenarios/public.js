// scenarios/public.js
import http from 'k6/http';
import { check, group } from 'k6';
import { CONFIG } from '../config/env.js';

export function testPublicEndpoints() {
  group('Homepage', () => {
    const res = http.get(`${CONFIG.WEB_URL}/`);
    check(res, {
      'homepage status is 200': (r) => r.status === 200,
    });
  });

  group('Events API', () => {
    const res = http.get(`${CONFIG.API_URL}/api/events`);
    check(res, {
      'events api status is 200': (r) => r.status === 200,
    });
  });

  group('Team API', () => {
    const res = http.get(`${CONFIG.API_URL}/api/team`);
    check(res, {
      'team api status is 200': (r) => r.status === 200,
    });
  });
}
