#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

if [ $# -lt 1 ]; then
  echo "Usage: $0 <backup-file> [target-database-url]" >&2
  echo "  If target-database-url is omitted, DATABASE_URL from .env is used." >&2
  exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
  echo "Error: backup file not found: $BACKUP_FILE" >&2
  exit 1
fi

if [ -n "${2:-}" ]; then
  TARGET_URL="$2"
else
  if [ ! -f .env ]; then
    echo "Error: .env not found and no target-database-url given" >&2
    exit 1
  fi
  TARGET_URL=$(grep -v '^#' .env | grep '^DATABASE_URL=' | head -1 | cut -d '=' -f2-)
fi

if [ -z "$TARGET_URL" ]; then
  echo "Error: no target database URL resolved" >&2
  exit 1
fi

echo "This will restore into:"
echo "  $TARGET_URL"
echo "Existing objects with the same name will be dropped and replaced."
read -r -p "Continue? (y/N) " CONFIRM
if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
  echo "Aborted."
  exit 1
fi

echo "Restoring from $BACKUP_FILE ..."
pg_restore --clean --if-exists --no-owner --no-privileges --dbname="$TARGET_URL" "$BACKUP_FILE"

echo "Restore complete."
