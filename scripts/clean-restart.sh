#!/bin/bash

# Clean restart script for MishMob
# Removes all containers and volumes for a fresh start

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${YELLOW}⚠️  This will remove all MishMob containers and data!${NC}"
read -p "Are you sure you want to continue? (y/N) " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 0
fi

echo -e "${BLUE}Stopping all MishMob containers...${NC}"
docker-compose down

echo -e "${BLUE}Removing orphan containers...${NC}"
docker-compose down --remove-orphans

echo -e "${BLUE}Removing volumes...${NC}"
docker-compose down -v

echo -e "${BLUE}Removing any conflicting containers...${NC}"
docker rm -f mishmob-db mishmob-db-1 mishmob-backend mishmob-frontend mishmob-web mishmob-redis-1 mishmob-search-1 2>/dev/null || true

echo -e "${BLUE}Cleaning up old images...${NC}"
docker image prune -f

echo -e "${GREEN}✓ Clean up complete!${NC}"
echo ""
echo "To start fresh, run:"
echo "  ./start.sh"