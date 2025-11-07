# syntax=docker/dockerfile:1.6

# Production image using FrankenPHP with PHP 8.4
FROM dunglas/frankenphp:1.9-builder-php8.4 AS base

# Install system packages
RUN apt-get update && apt-get install -y \
    git curl unzip supervisor cron logrotate netcat-openbsd \
    libpq-dev libzip-dev libicu-dev libpng-dev libjpeg62-turbo-dev libfreetype6-dev libonig-dev libxml2-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Install PHP extensions required by Laravel + Octane + typical apps
RUN install-php-extensions \
    pcntl \
    bcmath \
    gd \
    intl \
    zip \
    exif \
    sodium \
    pdo_mysql \
    mysqli \
    pgsql \
    pdo_pgsql \
    redis \
    opcache

WORKDIR /app

# Copy application source
COPY . /app

# Ensure permissions for storage and cache directories
RUN mkdir -p storage/app/private storage/app/public bootstrap/cache && \
    chown -R www-data:www-data storage bootstrap/cache && \
    find storage -type d -exec chmod 775 {} \; && \
    find storage -type f -exec chmod 664 {} \; && \
    chmod -R 775 bootstrap/cache

# Install PHP dependencies and optimize
RUN composer install --no-dev --prefer-dist --optimize-autoloader && \
    php -d variables_order=EGPCS artisan config:cache && \
    php -d variables_order=EGPCS artisan route:cache && \
    php -d variables_order=EGPCS artisan view:cache || true

# Logrotate config
COPY .docker/logrotate/laravel /etc/logrotate.d/laravel

# Supervisor config
COPY .docker/supervisor/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Entrypoint
COPY .docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 8000

ENV OCTANE_SERVER=frankenphp \
    APP_ENV=production \
    APP_DEBUG=false \
    LOG_LEVEL=info

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["supervisord", "-n", "-c", "/etc/supervisor/supervisord.conf"]