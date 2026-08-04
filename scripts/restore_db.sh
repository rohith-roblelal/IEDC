#!/bin/bash
set -e

# Disaster Recovery Script
# Usage: ./restore_db.sh <backup_file.dump> <database_url>
# Example: ./restore_db.sh backup.dump postgres://postgres:postgres@localhost:5432/iedc_dev

if [ "$#" -ne 2 ]; then
    echo "Usage: $0 <backup_file.dump> <database_url>"
    exit 1
fi

BACKUP_FILE=$1
DB_URL=$2

echo "Starting Disaster Recovery restoration..."
echo "Target DB: $DB_URL"
echo "Backup File: $BACKUP_FILE"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "Error: Backup file $BACKUP_FILE does not exist."
    exit 1
fi

echo "[1/4] Dropping existing schema..."
# Drop schema public to ensure clean slate, then recreate
psql "$DB_URL" -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

echo "[2/4] Restoring backup..."
pg_restore --clean --if-exists --no-owner --no-privileges --dbname="$DB_URL" "$BACKUP_FILE"

echo "[3/4] Running migrations to ensure schema is up-to-date..."
# Assuming we run this from the project root
cd backend && alembic upgrade head && cd ..

echo "[4/4] Running health check..."
# Assuming the backend is running locally at 8000 for verification
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/api/v1/health)

if [ "$HTTP_STATUS" -eq 200 ]; then
    echo "✅ DR Restoration Successful! Health check passed."
else
    echo "❌ DR Restoration failed! Health check returned $HTTP_STATUS."
    exit 1
fi

echo "Please manually record RTO and RPO for this DR exercise."
