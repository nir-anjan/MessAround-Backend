# Docker PostgreSQL Setup

## Overview

This project uses Docker to run a PostgreSQL database, connected to an Express.js backend.

## Configuration

### Environment Variables

The database connection is configured in `.env`:

- `DB_HOST`: Database host (127.0.0.1)
- `DB_PORT`: Database port (5433 - changed from default 5432 to avoid conflicts)
- `DB_NAME`: Database name (messaround_db)
- `DB_USER`: Database user (postgres)
- `DB_PASSWORD`: Database password (postgres123)

### Docker Setup

PostgreSQL runs in a Docker container configured in `docker-compose.yml`:

- Image: postgres:15-alpine
- Container name: messaround_postgres
- External port: 5433 (maps to internal 5432)
- Volume: postgres_data (persistent storage)
- Health checks enabled

## Usage

### Start Database

```bash
docker-compose up -d
```

### Stop Database

```bash
docker-compose down
```

### Remove Database (including data)

```bash
docker-compose down -v
```

### View Database Logs

```bash
docker logs messaround_postgres
```

### Connect to Database (inside container)

```bash
docker exec -it messaround_postgres psql -U postgres -d messaround_db
```

## Server Endpoints

### Health Check

```
GET http://localhost:3000/health
```

Returns server status without database check.

### Database Health Check

```
GET http://localhost:3000/health/db
```

Returns database connection status and current timestamp.

## Development

### Start Development Server

```bash
npm run dev
```

Server runs on port 3000 with auto-reload (nodemon).

### Database Connection

The connection pool is configured in `src/db/connection.js`:

- Uses `pg` (node-postgres) library
- Connection pooling with max 20 clients
- Automatic reconnection on errors
- Query helper: `db.query(text, params)`

## Troubleshooting

### Port Conflict

If you have a local PostgreSQL instance running on port 5432, this setup uses port 5433 to avoid conflicts.

### Connection Issues

1. Ensure Docker container is running: `docker ps`
2. Check container logs: `docker logs messaround_postgres`
3. Test connection: Visit http://localhost:3000/health/db

### Reset Database

If you need to start fresh:

```bash
docker-compose down -v
docker-compose up -d
```

## Note

**Important**: The default password `postgres123` should be changed for production use. Update both `.env` and `docker-compose.yml` with secure credentials.
