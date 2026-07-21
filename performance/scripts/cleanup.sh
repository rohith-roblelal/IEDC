#!/bin/bash
# cleanup.sh - Removes test artifacts and resets monitoring data

set -e

echo "Cleaning up performance test artifacts..."

# Remove generated reports
rm -rf k6/reports/*
echo "Removed test reports."

# Optional: Bring down and wipe monitoring volumes
# uncomment if a full wipe is desired
# docker-compose down -v

echo "Cleanup completed."
