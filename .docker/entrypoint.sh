#!/bin/sh
set -eu

cd /app

echo "🚀 Starting Laravel Octane container..."

# Tunggu sebentar jika DB service belum siap (opsional, bisa dihapus kalau sudah pakai healthcheck di compose)
if [ "${WAIT_FOR_DB:-true}" = "true" ]; then
  echo "⏳ Waiting for database to be ready..."
  for i in $(seq 1 10); do
    php -r "try { new PDO(getenv('DB_CONNECTION') . ':host=' . getenv('DB_HOST') . ';dbname=' . getenv('DB_DATABASE'), getenv('DB_USERNAME'), getenv('DB_PASSWORD')); exit(0); } catch (Exception \$e) { exit(1); }" && break || sleep 3
  done
fi

# Jalankan cache hanya di production
if [ "${APP_ENV:-local}" = "production" ]; then
  echo "🧩 Caching Laravel config, routes, and views..."
  php artisan config:clear || true
  php artisan route:clear || true
  php artisan view:clear || true
  php artisan config:cache || true
  php artisan route:cache || true
  php artisan view:cache || true
fi

# Fix permissions for Octane/FrankenPHP
chown -R www-data:www-data /app/public /app/storage /app/bootstrap/cache /tmp
chmod -R 755 /app/public
chmod -R 777 /tmp

# Create necessary directories
mkdir -p /tmp/php-uploads
chmod 777 /tmp/php-uploads

echo "✅ Starting supervisord..."
exec /usr/bin/supervisord -n -c /etc/supervisor/supervisord.conf
