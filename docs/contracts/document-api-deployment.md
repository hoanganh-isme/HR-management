# Contract Document API deployment

## Required environment

Start from `backend-app/.env.production.example`. Production requires
`SQL_API_BASE`, both document URLs, the OnlyOffice URL, CORS origins and
`DRAFT_SIGNING_SECRET`. When OnlyOffice JWT is enabled,
`ONLYOFFICE_JWT_SECRET` is also required. Do not commit the resulting `.env`.

`SQL_API_BASE` must be the HTTP(S) origin only. It must not include `/api` or
`/api/API_Gateway_Router`. Keep public browser URLs separate from the internal
callback URL used by OnlyOffice; callbacks must never use `localhost` in a
multi-container or remote deployment.

## Reverse proxy

```nginx
location /docserver/ {
    proxy_pass http://127.0.0.1:8081/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_read_timeout 120s;
}

location /onlyoffice/ {
    proxy_pass http://127.0.0.1:8000/;
}
```

Terminate HTTPS at the proxy, restrict SQL API access to the Document API
host, and expose only the required public routes. Set `CORS_ALLOWED_ORIGINS`
to the exact HR web origins.

## Operations

- Liveness: `GET /health` checks only the Node process.
- Readiness: `GET /ready` checks SQL Gateway connectivity, draft storage and
  sample readability. A 503 removes the instance from service without forcing
  a process restart.
- Use a Docker `restart: unless-stopped` policy or equivalent systemd restart
  policy. Send `SIGTERM` for graceful shutdown.
- Rotate stdout/stderr logs and retain SQL Gateway retry warnings long enough
  to diagnose upstream resets. Logs never need access tokens or HR payloads.
- Permit network traffic from Document API to SQL API and from OnlyOffice to
  `DOCUMENT_INTERNAL_BASE_URL`.

## Post-deploy smoke test

```powershell
$env:DOCUMENT_API_BASE="https://hr.example.com/docserver"
$env:AUTH_TOKEN="<temporary-valid-token>"
npm --prefix backend-app run smoke
```

The script checks health, readiness, templates and attachments without
printing the token. A non-zero exit code means deployment verification failed.

## Rollback

1. Set frontend runtime configuration back to the previous Document API
   release, or set `USE_LEGACY_HR_DOCUMENTS=true` only when the legacy audit
   table is installed and the old flow is intentionally required.
2. Deploy the previous application image or commit.
3. Keep `storage/drafts` during rollback so unfinished documents are not lost.
4. Re-run `/health`, `/ready` and the smoke script.

The transport change does not alter stored procedures, database schema, or the
Gateway `List/Func/JsonData` contract, so no database rollback is required.
