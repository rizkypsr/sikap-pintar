# Stage 1 - Build stage
FROM dunglas/frankenphp:1.9-builder-php8.4 AS builder

 RUN apt-get update && apt-get install -y --no-install-recommends \
    git curl unzip supervisor cron logrotate netcat-openbsd \
    libpq-dev libzip-dev libicu-dev libpng-dev libjpeg62-turbo-dev libfreetype6-dev libonig-dev libxml2-dev \
    && rm -rf /var/lib/apt/lists/*

RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --prefer-dist --no-scripts --no-progress --no-interaction

COPY . .
RUN composer dump-autoload --optimize \
 && rm -rf /tmp/* /root/.composer

# Stage 2 - Production runtime
FROM dunglas/frankenphp:1.9-php8.4 AS runtime

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
RUN apt-get update && apt-get install -y --no-install-recommends supervisor logrotate \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=builder /app /app
COPY .docker/logrotate/laravel /etc/logrotate.d/laravel
COPY .docker/supervisor/supervisord.conf /etc/supervisor/supervisord.conf
COPY .docker/entrypoint.sh /usr/local/bin/entrypoint.sh
COPY .docker/php.ini /usr/local/etc/php/conf.d/99-custom.ini
COPY Caddyfile /app/Caddyfile

RUN chmod +x /usr/local/bin/entrypoint.sh \
 && mkdir -p /var/log/supervisor /app/storage/logs /app/public \
 && chown -R www-data:www-data storage bootstrap/cache /var/log/supervisor /app/storage/logs /app/public \
 && chmod -R 755 /app/public

USER root

EXPOSE 8000
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["supervisord", "-n", "-c", "/etc/supervisor/supervisord.conf"]