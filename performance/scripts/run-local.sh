#!/bin/bash
# run-local.sh - Executes smoke tests against the local environment

set -e

echo "Starting Local Performance Tests..."

export TARGET_ENV="local"
export K6_PROMETHEUS_RW_SERVER_URL="http://localhost:9090/api/v1/write"

# Run smoke test locally
k6 run --out experimental-prometheus-rw k6/tests/smoke/smoke-test.js

echo "Local tests completed. Check Grafana at http://localhost:3001"
