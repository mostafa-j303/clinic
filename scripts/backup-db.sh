#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

if [ ! -f .env ]; then
  echo "Error: .env not found in $PROJECT_DIR" >&2
  exit 1
fi

DATABASE_URL=$(grep -v '^#' .env | grep '^DATABASE_URL=' | head -1 | cut -d '=' -f2-)

if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL not set in .env" >&2
  exit 1
fi

BACKUP_DIR="$PROJECT_DIR/backups"
mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_FILE="$BACKUP_DIR/misso-clinic_${TIMESTAMP}.backup"

echo "Backing up database to $BACKUP_FILE ..."
pg_dump "$DATABASE_URL" --format=custom --no-owner --no-privileges -f "$BACKUP_FILE"

echo "Backup complete: $BACKUP_FILE"
