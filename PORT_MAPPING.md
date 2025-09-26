# MishMob Port Mapping

This document lists all the ports used by MishMob services to avoid conflicts with other local projects.

## Service Ports

| Service | Internal Port | External Port | URL |
|---------|--------------|---------------|-----|
| PostgreSQL | **5433** | **5433** | `postgresql://localhost:5433/mishmob_db` |
| Django Backend | 8000 | **8001** | http://localhost:8001 |
| React Frontend | 5175 | **5175** | http://localhost:5175 |
| Meilisearch | 7700 | **7701** | http://localhost:7701 |
| Redis | 6379 | **6380** | `redis://localhost:6380` |
| Metro Bundler | 8081 | **8082** | http://localhost:8082 |
| Expo | 19000 | 19000 | http://localhost:19000 |
| Expo DevTools | 19001 | 19001 | http://localhost:19001 |

## Configuration Files Updated

The following files have been updated to use the new ports:

1. **docker-compose.yml** - All port mappings
2. **frontend/.env** - API URL updated to port 8001
3. **mobile-cli/.env** - API URL updated to port 8001
4. **backend/.env.example** - Database port and CORS origins
5. **start.sh** - Service URLs for health checks
6. **scripts/quick-start.sh** - Display URLs

## Environment Variables

### Backend (.env)
```bash
DATABASE_PORT=5433  # PostgreSQL now runs on 5433 both internally and externally

CORS_ALLOWED_ORIGINS=http://localhost:5175,http://localhost:8082
MEILISEARCH_HOST=http://search:7700  # Internal Docker network
REDIS_URL=redis://redis:6379  # Internal Docker network
```

### Frontend (.env)
```bash
VITE_API_URL=http://localhost:8001/api
```

### Mobile (.env)
```bash
API_URL=http://localhost:8001/api
# For physical devices, use your computer's IP:
# API_URL=http://192.168.1.100:8001/api
```

## Docker Network Communication

Services communicate internally:
- Backend → Database: `db:5433` (PostgreSQL configured to run on 5433)
- Backend → Redis: `redis:6379` (standard Redis port internally)
- Backend → Meilisearch: `search:7700` (standard Meilisearch port internally)

**Note**: PostgreSQL is configured to run on port 5433 both internally and externally to avoid conflicts with other PostgreSQL instances on your system.

## Troubleshooting

If you get port conflicts:
1. Check what's using a port: `lsof -i :PORT_NUMBER`
2. Stop conflicting service or choose a different port
3. Update the port mapping in `docker-compose.yml`
4. Update all configuration files that reference the port