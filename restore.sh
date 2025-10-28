#!/bin/bash

# Warehouse Database Restore Script
# This script restores PostgreSQL database and Redis data from backup

# Configuration
PROJECT_DIR="/opt/warehouse"
BACKUP_DIR="$PROJECT_DIR/backups"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Warehouse Restore Script ===${NC}"
echo -e "Date: $(date)\n"

# Function to list available backups
list_backups() {
    echo -e "${BLUE}Available PostgreSQL backups:${NC}"
    ls -lh $BACKUP_DIR/warehouse_db_*.dump.gz 2>/dev/null | nl
    
    echo -e "\n${BLUE}Available Redis backups:${NC}"
    ls -lh $BACKUP_DIR/redis_*.rdb.gz 2>/dev/null | nl
}

# Function to select backup file
select_backup() {
    local backup_type=$1
    local pattern=$2
    
    echo -e "\n${YELLOW}Select $backup_type backup to restore:${NC}"
    
    # List backups with numbers
    backups=($(ls -t $BACKUP_DIR/$pattern 2>/dev/null))
    
    if [ ${#backups[@]} -eq 0 ]; then
        echo -e "${RED}No backups found!${NC}"
        return 1
    fi
    
    select backup in "${backups[@]}"; do
        if [ -n "$backup" ]; then
            echo "$backup"
            return 0
        else
            echo -e "${RED}Invalid selection${NC}"
        fi
    done
}

# Function to confirm action
confirm() {
    local message=$1
    echo -e "\n${YELLOW}$message${NC}"
    read -p "Type 'yes' to continue: " confirmation
    
    if [ "$confirmation" != "yes" ]; then
        echo -e "${RED}Restore cancelled${NC}"
        exit 0
    fi
}

# Function to restore PostgreSQL
restore_postgres() {
    echo -e "\n${YELLOW}=== PostgreSQL Restore ===${NC}"
    
    # Select backup
    backup_file=$(select_backup "PostgreSQL" "warehouse_db_*.dump.gz")
    
    if [ -z "$backup_file" ]; then
        echo -e "${RED}No backup selected${NC}"
        return 1
    fi
    
    echo -e "${BLUE}Selected backup: $backup_file${NC}"
    
    # Confirm
    confirm "⚠️  WARNING: This will REPLACE all current data in the database!"
    
    # Stop backend to prevent connections
    echo -e "${YELLOW}Stopping backend service...${NC}"
    docker compose -f $PROJECT_DIR/docker-compose.prod.yml stop backend
    
    # Decompress backup
    echo -e "${YELLOW}Decompressing backup...${NC}"
    temp_file="${backup_file%.gz}"
    gunzip -c "$backup_file" > "$temp_file"
    
    # Restore database
    echo -e "${YELLOW}Restoring database...${NC}"
    docker compose -f $PROJECT_DIR/docker-compose.prod.yml exec -T postgres \
        pg_restore -U warehouse_user -d warehouse_db -c < "$temp_file"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ PostgreSQL restore completed${NC}"
        
        # Clean up temp file
        rm -f "$temp_file"
        
        # Start backend
        echo -e "${YELLOW}Starting backend service...${NC}"
        docker compose -f $PROJECT_DIR/docker-compose.prod.yml start backend
        
        echo -e "${GREEN}✓ Backend service started${NC}"
    else
        echo -e "${RED}✗ PostgreSQL restore failed${NC}"
        rm -f "$temp_file"
        
        # Start backend anyway
        docker compose -f $PROJECT_DIR/docker-compose.prod.yml start backend
        return 1
    fi
}

# Function to restore Redis
restore_redis() {
    echo -e "\n${YELLOW}=== Redis Restore ===${NC}"
    
    # Select backup
    backup_file=$(select_backup "Redis" "redis_*.rdb.gz")
    
    if [ -z "$backup_file" ]; then
        echo -e "${RED}No backup selected${NC}"
        return 1
    fi
    
    echo -e "${BLUE}Selected backup: $backup_file${NC}"
    
    # Confirm
    confirm "⚠️  WARNING: This will REPLACE all current data in Redis!"
    
    # Stop Redis
    echo -e "${YELLOW}Stopping Redis service...${NC}"
    docker compose -f $PROJECT_DIR/docker-compose.prod.yml stop redis
    
    # Decompress backup
    echo -e "${YELLOW}Decompressing backup...${NC}"
    temp_file="${backup_file%.gz}"
    gunzip -c "$backup_file" > "$temp_file"
    
    # Copy to container
    echo -e "${YELLOW}Restoring Redis data...${NC}"
    docker compose -f $PROJECT_DIR/docker-compose.prod.yml cp \
        "$temp_file" redis:/data/dump.rdb
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Redis restore completed${NC}"
        
        # Clean up temp file
        rm -f "$temp_file"
        
        # Start Redis
        echo -e "${YELLOW}Starting Redis service...${NC}"
        docker compose -f $PROJECT_DIR/docker-compose.prod.yml start redis
        
        echo -e "${GREEN}✓ Redis service started${NC}"
    else
        echo -e "${RED}✗ Redis restore failed${NC}"
        rm -f "$temp_file"
        
        # Start Redis anyway
        docker compose -f $PROJECT_DIR/docker-compose.prod.yml start redis
        return 1
    fi
}

# Function to restore from volume backup
restore_volume() {
    local volume_name=$1
    local backup_pattern=$2
    
    echo -e "\n${YELLOW}=== Volume Restore: $volume_name ===${NC}"
    
    # Select backup
    backup_file=$(select_backup "$volume_name" "$backup_pattern")
    
    if [ -z "$backup_file" ]; then
        echo -e "${RED}No backup selected${NC}"
        return 1
    fi
    
    echo -e "${BLUE}Selected backup: $backup_file${NC}"
    
    # Confirm
    confirm "⚠️  WARNING: This will REPLACE all data in volume $volume_name!"
    
    # Stop services
    echo -e "${YELLOW}Stopping services...${NC}"
    docker compose -f $PROJECT_DIR/docker-compose.prod.yml down
    
    # Remove old volume
    echo -e "${YELLOW}Removing old volume...${NC}"
    docker volume rm $volume_name
    
    # Create new volume
    echo -e "${YELLOW}Creating new volume...${NC}"
    docker volume create $volume_name
    
    # Restore from backup
    echo -e "${YELLOW}Restoring volume...${NC}"
    docker run --rm \
        -v $volume_name:/data \
        -v $BACKUP_DIR:/backup \
        alpine sh -c "cd / && tar xzf /backup/$(basename $backup_file)"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Volume restore completed${NC}"
        
        # Start services
        echo -e "${YELLOW}Starting services...${NC}"
        docker compose -f $PROJECT_DIR/docker-compose.prod.yml up -d
        
        echo -e "${GREEN}✓ Services started${NC}"
    else
        echo -e "${RED}✗ Volume restore failed${NC}"
        return 1
    fi
}

# Main menu
show_menu() {
    echo -e "\n${BLUE}=== What do you want to restore? ===${NC}"
    echo "1) PostgreSQL Database"
    echo "2) Redis Data"
    echo "3) PostgreSQL Volume"
    echo "4) Redis Volume"
    echo "5) List all backups"
    echo "6) Exit"
    echo ""
}

# Main execution
main() {
    # Check if backup directory exists
    if [ ! -d "$BACKUP_DIR" ]; then
        echo -e "${RED}Backup directory not found: $BACKUP_DIR${NC}"
        exit 1
    fi
    
    while true; do
        show_menu
        read -p "Select option: " choice
        
        case $choice in
            1)
                restore_postgres
                ;;
            2)
                restore_redis
                ;;
            3)
                restore_volume "warehouse_postgres_data" "postgres_volume_*.tar.gz"
                ;;
            4)
                restore_volume "warehouse_redis_data" "redis_volume_*.tar.gz"
                ;;
            5)
                list_backups
                ;;
            6)
                echo -e "${GREEN}Goodbye!${NC}"
                exit 0
                ;;
            *)
                echo -e "${RED}Invalid option${NC}"
                ;;
        esac
    done
}

# Run main function
main

# Exit
exit 0
