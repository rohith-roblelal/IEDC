#!/bin/bash
# run-staging.sh - Executes load and stress tests against the staging environment

set -e

echo "Starting Staging Performance Tests..."

export TARGET_ENV="staging"
export K6_PROMETHEUS_RW_SERVER_URL="http://localhost:9090/api/v1/write"

# Ensure reports directory exists
mkdir -p k6/reports

echo "Running Load Test..."
k6 run --out experimental-prometheus-rw --out json=k6/reports/staging-load-results.json --out csv=k6/reports/staging-load-results.csv k6/tests/load/load-test.js

echo "Running Stress Test..."
k6 run --out experimental-prometheus-rw --out json=k6/reports/staging-stress-results.json --out csv=k6/reports/staging-stress-results.csv k6/tests/stress/stress-test.js

echo "Staging tests completed."
