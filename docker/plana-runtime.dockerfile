FROM uptime-kuma-remastered:2.2.1

WORKDIR /app

# Frontend bundle with the custom dashboard inbox and status-page sort behavior.
COPY dist/ /app/dist/

# Runtime server changes and database migration for the new status-page option.
COPY server/model/group.js /app/server/model/group.js
COPY server/model/monitor.js /app/server/model/monitor.js
COPY server/model/status_page.js /app/server/model/status_page.js
COPY server/socket-handlers/status-page-socket-handler.js /app/server/socket-handlers/status-page-socket-handler.js
COPY server/utils/plana-status-page-snapshot.js /app/server/utils/plana-status-page-snapshot.js
COPY db/knex_migrations/2026-04-13-0000-add-default-status-sort.js /app/db/knex_migrations/2026-04-13-0000-add-default-status-sort.js
COPY db/knex_migrations/2026-04-13-0001-add-plana-showcase-config.js /app/db/knex_migrations/2026-04-13-0001-add-plana-showcase-config.js
