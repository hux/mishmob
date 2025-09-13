# MishMob Quick Reference

## Essential Commands

```bash
just            # Show all commands
just up         # Start everything
just down       # Stop everything
just logs       # View all logs
just shell      # Backend shell
```

## URLs

- **Frontend**: http://localhost:8080
- **API**: http://localhost:9000/api
- **Admin**: http://localhost:9000/admin (admin/admin123)

## Development Workflow

```bash
# 1. Start development
just up

# 2. View specific logs
just log backend
just log frontend

# 3. Run migrations after model changes
just makemigrations
just migrate

# 4. Install packages
just pip-install django-extensions
just npm-install axios

# 5. Run tests
just test
just test-frontend

# 6. Format code
just format
```

## Common Tasks

```bash
# Django Commands
just manage shell              # Django shell
just manage createsuperuser    # Create admin user
just startapp myapp           # Create new app

# Database
just dbshell                  # PostgreSQL shell
just reset-db                 # Reset database (careful!)
just backup-db                # Backup database

# Code Quality
just lint                     # Check code style
just check                    # Pre-commit checks

# Troubleshooting
just restart backend          # Restart a service
just build                    # Rebuild all containers
just update                   # Full update & rebuild
just clean                    # Remove everything
```

## Tips

1. **Hot Reload**: Just save files - both frontend and backend auto-reload
2. **Logs**: Use `just log <service>` to see specific service logs
3. **Shell Access**: `just shell` for backend, `just shell-frontend` for frontend
4. **Multiple Commands**: Chain with `&&` - `just down && just clean && just up`

## Installation

```bash
# macOS
brew install just

# Ubuntu/Debian
curl --proto '=https' --tlsv1.2 -sSf https://just.systems/install.sh | bash -s -- --to /usr/local/bin

# Then start MishMob
just up
```