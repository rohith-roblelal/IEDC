// utils/helpers.js
import http from 'k6/http';
import { CONFIG } from '../config/env.js';

export function getAuthHeaders(token) {
  return {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  };
}

export function generateRandomUser() {
  const randomId = Math.floor(Math.random() * 1000000);
  return {
    email: `testuser_${randomId}@example.com`,
    password: `password${randomId}`,
    name: `Test User ${randomId}`,
  };
}
