// config/env.js
export const ENV = {
  local: {
    WEB_URL: __ENV.BASE_URL_LOCAL || 'http://localhost:3000',
    API_URL: __ENV.API_URL_LOCAL || 'http://localhost:8000',
  },
  staging: {
    WEB_URL: __ENV.BASE_URL_STAGING || 'https://staging.iedc.com',
    API_URL: __ENV.API_URL_STAGING || 'https://api.staging.iedc.com',
  },
  production: {
    WEB_URL: __ENV.BASE_URL_PROD || 'https://iedc.com',
    API_URL: __ENV.API_URL_PROD || 'https://api.iedc.com',
  },
};

const targetEnv = __ENV.TARGET_ENV || 'local';
export const CONFIG = ENV[targetEnv];

export const THRESHOLDS = {
  web: __ENV.THRESHOLDS_P95_WEB || 300,
  api: __ENV.THRESHOLDS_P95_API || 500,
  admin: __ENV.THRESHOLDS_P95_ADMIN || 600,
};
