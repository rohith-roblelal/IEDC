#!/bin/bash
set -e

echo "Starting Production Deployment..."

# Ensure we are in the correct directory
cd /opt/iedc || exit 1

# 1. Pull the latest code (assuming deployment uses git)
echo "Pulling latest code from git..."
git pull origin main

# 2. Rebuild the backend image
echo "Building backend Docker image..."
docker compose -f docker-compose.prod.yml build backend

# 3. Bring up the stack (downtime is minimal as containers are restarted one-by-one or in-place)
echo "Starting production stack..."
docker compose -f docker-compose.prod.yml up -d

# 4. Run database migrations
echo "Running Alembic migrations..."
docker compose -f docker-compose.prod.yml exec -T backend alembic upgrade head

# 5. Health Check
echo "Deployment completed. Validating services..."
docker compose -f docker-compose.prod.yml ps

echo "Done!"
