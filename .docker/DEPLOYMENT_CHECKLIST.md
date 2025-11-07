Production Deployment Checklist

- Environment
  - Ensure `.env` or env vars match `.env.production.example`.
  - Set `APP_ENV=production`, `APP_DEBUG=false`, and `APP_URL`.
  - Set DB vars and choose `mysql` or `pgsql` profile in compose.
  - Configure `MINIO_ROOT_USER`, `MINIO_ROOT_PASSWORD`, and `MINIO_BUCKET`.
  - Ensure `CACHE_STORE=redis`, `SESSION_DRIVER=redis`, `QUEUE_CONNECTION=redis`.

- Build & Run
  - Build: `docker compose -f docker-compose.prod.yml build`.
  - Run: `docker compose -f docker-compose.prod.yml --profile mysql up -d` (or `--profile pgsql`).
  - Verify health: `curl http://localhost:${APP_PORT:-8000}/health`.

- Storage & Permissions
  - `storage:link` runs automatically in entrypoint; verify `public/storage` is present.
  - Check ownership for `storage` and `bootstrap/cache`.

- Database & Queues
  - Optionally run migrations: set `RUN_MIGRATIONS=true`.
  - Verify `queue:work` logs via Supervisor.

- MinIO
  - Bucket created by `minio-init` service; confirm in `http://localhost:${FORWARD_MINIO_CONSOLE_PORT:-9001}`.

- Logs & Monitoring
  - Supervisor logs in `/var/log/supervisor/*` inside container.
  - Laravel logs in `/app/storage/logs/*` with daily rotation.
  - Consider forwarding container logs to your log stack.

- Security
  - Use strong secrets; never commit `.env`.
  - Restrict container ports to needed ones.
  - Set `APP_URL` with HTTPS behind a reverse proxy or attach TLS via FrankenPHP.