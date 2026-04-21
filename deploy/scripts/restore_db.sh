#!/usr/bin/env bash
# This script is auto-executed by the mongo container on first start.
# It restores the database from db_dump/ocean2joy_v2 if present.
set -e

DUMP_DIR="/docker-entrypoint-initdb.d/db_dump"

if [ -d "$DUMP_DIR/${DB_NAME:-ocean2joy_v2}" ]; then
  echo "[mongo-init] Restoring database dump from $DUMP_DIR/${DB_NAME:-ocean2joy_v2}..."
  mongorestore --drop "$DUMP_DIR/${DB_NAME:-ocean2joy_v2}" --nsInclude="${DB_NAME:-ocean2joy_v2}.*"
  echo "[mongo-init] Restore complete."
else
  echo "[mongo-init] No dump found, starting with empty database."
fi
