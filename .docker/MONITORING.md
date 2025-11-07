Logging & Monitoring Setup

- FrankenPHP / Octane
  - The supervisor starts: `php artisan octane:frankenphp --log-level info`.
  - For structured JSON logs, pass `--log-level info` explicitly (already configured).
  - Expose the admin port via `FRANKENPHP_ADMIN_PORT` if needed (default 2019).

- Health Endpoint
  - `/health` returns JSON with `app`, `db`, `redis`, `s3`, `time`.
  - Compose healthcheck hits `http://localhost:8000/health`.

- Log Rotation
  - `/app/storage/logs/*.log` daily, keep 14, compressed.
  - `/var/log/supervisor/*.log` daily, keep 7, compressed.
  - Cron runs via Supervisor to ensure rotation in container.

- Metrics (optional)
  - Export logs to your stack (e.g., Loki via Docker logging driver).
  - Add Prometheus exporters for DB/Redis; scrape container endpoints.
  - Consider Laravel Telescope or third-party APM (ensure Octane compatibility).