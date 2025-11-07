#!/usr/bin/env bash
set -e

# Optional wait for DB and Redis to be ready
if [ "${WAIT_FOR_SERVICES:-true}" = "true" ]; then
  if [ -n "${DB_HOST}" ]; then
    echo "Waiting for database at ${DB_HOST}:${DB_PORT:-3306}..."
    timeout 30 bash -c "until nc -z ${DB_HOST} ${DB_PORT:-3306}; do sleep 1; done" || true
  fi
  if [ -n "${REDIS_HOST}" ]; then
    echo "Waiting for Redis at ${REDIS_HOST}:${REDIS_PORT:-6379}..."
    timeout 30 bash -c "until nc -z ${REDIS_HOST} ${REDIS_PORT:-6379}; do sleep 1; done" || true
  fi
fi

cd /app

# Ensure storage permissions
chown -R www-data:www-data storage bootstrap/cache || true

# Storage symlink (idempotent)
php -d variables_order=EGPCS artisan storage:link || true

# Optimize caches (safe even if already cached)
php -d variables_order=EGPCS artisan optimize || true

# Run migrations if enabled
if [ "${RUN_MIGRATIONS}" = "true" ]; then
  php -d variables_order=EGPCS artisan migrate --force || true
fi

exec "$@"