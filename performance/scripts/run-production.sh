#!/bin/bash
# run-production.sh - Safely executes baseline benchmark/capacity tests against production

set -e

echo "WARNING: Starting Production Performance Tests..."
echo "Press Ctrl+C to abort..."
sleep 5

export TARGET_ENV="production"
export K6_PROMETHEUS_RW_SERVER_URL="http://localhost:9090/api/v1/write"

mkdir -p k6/reports

echo "Running safe capacity test..."
k6 run --out experimental-prometheus-rw --out json=k6/reports/prod-capacity-results.json --out csv=k6/reports/prod-capacity-results.csv k6/tests/capacity/capacity-test.js

echo "Production tests completed."
