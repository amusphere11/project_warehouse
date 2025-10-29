#!/bin/bash

# Warehouse Development Startup Script
# This script starts both backend and frontend services

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PROJECT_DIR="/home/azka/project_warehouse"

echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   Starting Warehouse Management System                ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Change to project directory
cd $PROJECT_DIR

# Function to start backend
start_backend() {
    echo -e "${YELLOW}Starting Backend API...${NC}"
    cd backend
    npm run dev > ../logs/backend.log 2>&1 &
    BACKEND_PID=$!
    echo $BACKEND_PID > ../backend.pid
    echo -e "${GREEN}✓ Backend started (PID: $BACKEND_PID)${NC}"
    cd ..
}

# Function to start frontend
start_frontend() {
    echo -e "${YELLOW}Starting Frontend...${NC}"
    cd frontend
    npm run dev > ../logs/frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > ../frontend.pid
    echo -e "${GREEN}✓ Frontend started (PID: $FRONTEND_PID)${NC}"
    cd ..
}

# Create logs directory if not exists
mkdir -p logs

# Start services
start_backend
sleep 3
start_frontend

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              Services Started Successfully             ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Access:${NC}"
echo -e "  Frontend: ${YELLOW}http://localhost:5173${NC}"
echo -e "  Backend:  ${YELLOW}http://localhost:3000${NC}"
echo -e "  API Docs: ${YELLOW}http://localhost:3000/api-docs${NC}"
echo ""
echo -e "${BLUE}View Logs:${NC}"
echo -e "  Backend:  ${YELLOW}tail -f logs/backend.log${NC}"
echo -e "  Frontend: ${YELLOW}tail -f logs/frontend.log${NC}"
echo ""
echo -e "${BLUE}Stop Services:${NC}"
echo -e "  Run: ${YELLOW}./stop.sh${NC}"
echo ""

# Keep script running
wait
