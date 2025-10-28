#!/bin/bash

# Warehouse Database Backup Script
# This script backs up the PostgreSQL database and Redis data

# Configuration
PROJECT_DIR="/opt/warehouse"
BACKUP_DIR="$PROJECT_DIR/backups"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Create backup directory if not exists
mkdir -p $BACKUP_DIR

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Warehouse Backup Script ===${NC}"
echo -e "Date: $(date)"
echo -e "Backup directory: $BACKUP_DIR\n"

# Function to check if docker compose is running
check_docker() {
    if ! docker compose -f $PROJECT_DIR/docker-compose.prod.yml ps | grep -q "Up"; then
        echo -e "${RED}Error: Docker containers are not running${NC}"
        exit 1
    fi
}

# Function to backup PostgreSQL
backup_postgres() {
    echo -e "${YELLOW}Backing up PostgreSQL database...${NC}"
    
    docker compose -f $PROJECT_DIR/docker-compose.prod.yml exec -T postgres \
        pg_dump -U warehouse_user -d warehouse_db -F c > \
        $BACKUP_DIR/warehouse_db_$DATE.dump
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ PostgreSQL backup completed${NC}"
        
        # Compress backup
        gzip $BACKUP_DIR/warehouse_db_$DATE.dump
        echo -e "${GREEN}✓ Backup compressed${NC}"
    else
        echo -e "${RED}✗ PostgreSQL backup failed${NC}"
        return 1
    fi
}

# Function to backup Redis
backup_redis() {
    echo -e "${YELLOW}Backing up Redis data...${NC}"
    
    # Trigger Redis BGSAVE
    docker compose -f $PROJECT_DIR/docker-compose.prod.yml exec -T redis \
        redis-cli --raw BGSAVE > /dev/null 2>&1
    
    # Wait for BGSAVE to complete
    sleep 5
    
    # Copy dump.rdb
    docker compose -f $PROJECT_DIR/docker-compose.prod.yml cp \
        redis:/data/dump.rdb \
        $BACKUP_DIR/redis_$DATE.rdb
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Redis backup completed${NC}"
        
        # Compress backup
        gzip $BACKUP_DIR/redis_$DATE.rdb
        echo -e "${GREEN}✓ Backup compressed${NC}"
    else
        echo -e "${RED}✗ Redis backup failed${NC}"
        return 1
    fi
}

# Function to backup volumes
backup_volumes() {
    echo -e "${YELLOW}Backing up Docker volumes...${NC}"
    
    # Backup postgres volume
    docker run --rm \
        -v warehouse_postgres_data:/data \
        -v $BACKUP_DIR:/backup \
        alpine tar czf /backup/postgres_volume_$DATE.tar.gz /data
    
    # Backup redis volume
    docker run --rm \
        -v warehouse_redis_data:/data \
        -v $BACKUP_DIR:/backup \
        alpine tar czf /backup/redis_volume_$DATE.tar.gz /data
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Volume backup completed${NC}"
    else
        echo -e "${RED}✗ Volume backup failed${NC}"
        return 1
    fi
}

# Function to clean old backups
cleanup_old_backups() {
    echo -e "${YELLOW}Cleaning up old backups (keeping last $RETENTION_DAYS days)...${NC}"
    
    # Delete old database backups
    find $BACKUP_DIR -name "warehouse_db_*.dump.gz" -mtime +$RETENTION_DAYS -delete
    
    # Delete old Redis backups
    find $BACKUP_DIR -name "redis_*.rdb.gz" -mtime +$RETENTION_DAYS -delete
    
    # Delete old volume backups
    find $BACKUP_DIR -name "*_volume_*.tar.gz" -mtime +$RETENTION_DAYS -delete
    
    echo -e "${GREEN}✓ Cleanup completed${NC}"
}

# Function to display backup summary
backup_summary() {
    echo -e "\n${GREEN}=== Backup Summary ===${NC}"
    echo -e "Backup location: $BACKUP_DIR"
    echo -e "Total backups:"
    ls -lh $BACKUP_DIR/*$DATE* 2>/dev/null
    
    echo -e "\nDisk usage:"
    du -sh $BACKUP_DIR
    
    echo -e "\nBackup files count:"
    echo "PostgreSQL: $(ls -1 $BACKUP_DIR/warehouse_db_*.dump.gz 2>/dev/null | wc -l)"
    echo "Redis: $(ls -1 $BACKUP_DIR/redis_*.rdb.gz 2>/dev/null | wc -l)"
    echo "Volumes: $(ls -1 $BACKUP_DIR/*_volume_*.tar.gz 2>/dev/null | wc -l)"
}

# Main execution
main() {
    check_docker
    
    # Perform backups
    backup_postgres
    backup_redis
    # backup_volumes  # Uncomment if you want to backup volumes too
    
    # Cleanup old backups
    cleanup_old_backups
    
    # Show summary
    backup_summary
    
    echo -e "\n${GREEN}=== Backup completed successfully ===${NC}"
    echo -e "Date: $(date)\n"
}

# Run main function
main

# Exit
exit 0
