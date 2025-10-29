#!/bin/bash

# Warehouse Stop Script
# This script stops both backend and frontend services

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PROJECT_DIR="/home/azka/project_warehouse"

echo -e "${YELLOW}Stopping Warehouse Management System...${NC}"
echo ""

cd $PROJECT_DIR

# Stop backend
if [ -f backend.pid ]; then
    BACKEND_PID=$(cat backend.pid)
    if kill -0 $BACKEND_PID 2>/dev/null; then
        kill $BACKEND_PID
        echo -e "${GREEN}✓ Backend stopped (PID: $BACKEND_PID)${NC}"
    else
        echo -e "${YELLOW}! Backend not running${NC}"
    fi
    rm -f backend.pid
else
    echo -e "${YELLOW}! Backend PID file not found${NC}"
fi

# Stop frontend
if [ -f frontend.pid ]; then
    FRONTEND_PID=$(cat frontend.pid)
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        kill $FRONTEND_PID
        echo -e "${GREEN}✓ Frontend stopped (PID: $FRONTEND_PID)${NC}"
    else
        echo -e "${YELLOW}! Frontend not running${NC}"
    fi
    rm -f frontend.pid
else
    echo -e "${YELLOW}! Frontend PID file not found${NC}"
fi

# Kill any remaining processes on ports 3000 and 5173
echo ""
echo -e "${YELLOW}Checking for processes on ports 3000 and 5173...${NC}"

# Port 3000 (backend)
BACKEND_PORT_PID=$(lsof -ti:3000)
if [ ! -z "$BACKEND_PORT_PID" ]; then
    kill -9 $BACKEND_PORT_PID 2>/dev/null
    echo -e "${GREEN}✓ Killed process on port 3000${NC}"
fi

# Port 5173 (frontend)
FRONTEND_PORT_PID=$(lsof -ti:5173)
if [ ! -z "$FRONTEND_PORT_PID" ]; then
    kill -9 $FRONTEND_PORT_PID 2>/dev/null
    echo -e "${GREEN}✓ Killed process on port 5173${NC}"
fi

echo ""
echo -e "${GREEN}All services stopped${NC}"
