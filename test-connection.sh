#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}"
echo "╔══════════════════════════════════════════════════════════╗"
echo "║                                                          ║"
echo "║   Production & Inventory Management System               ║"
echo "║   Connection Test Suite                                  ║"
echo "║                                                          ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# Test Backend
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo -e "${BLUE}  BACKEND TEST${NC}"
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo ""

./test-backend.sh
BACKEND_STATUS=$?

echo ""
echo ""

# Test Frontend  
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo -e "${BLUE}  FRONTEND TEST${NC}"
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo ""

./test-frontend.sh
FRONTEND_STATUS=$?

echo ""
echo ""

# Final Summary
echo -e "${CYAN}═══════════════════════════════════════════${NC}"
echo -e "${CYAN}  FINAL SUMMARY${NC}"
echo -e "${CYAN}═══════════════════════════════════════════${NC}"
echo ""

if [ $BACKEND_STATUS -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Backend: ${GREEN}OK${NC}"
else
    echo -e "${RED}✗${NC} Backend: ${RED}NOT RUNNING${NC}"
fi

if [ $FRONTEND_STATUS -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Frontend: ${GREEN}OK${NC}"
else
    echo -e "${YELLOW}!${NC} Frontend: ${YELLOW}NOT RUNNING${NC}"
fi

echo ""

if [ $BACKEND_STATUS -eq 0 ]; then
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}  Ready for Development!${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${BLUE}Access your application:${NC}"
    echo -e "  ${YELLOW}Frontend:${NC}      http://localhost:5173"
    echo -e "  ${YELLOW}Backend:${NC}       http://localhost:3000"
    echo -e "  ${YELLOW}API Docs:${NC}      http://localhost:3000/api-docs"
    echo ""
    
    if [ $FRONTEND_STATUS -ne 0 ]; then
        echo -e "${YELLOW}To start frontend:${NC}"
        echo -e "  cd frontend && npm run dev"
        echo ""
    fi
else
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}  Please Start Backend First!${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${YELLOW}To start development:${NC}"
    echo -e "  ${CYAN}npm run dev${NC}  ${BLUE}(runs both frontend & backend)${NC}"
    echo ""
    echo -e "${YELLOW}Or manually:${NC}"
    echo -e "  ${CYAN}cd backend && npm run dev${NC}"
    echo -e "  ${CYAN}cd frontend && npm run dev${NC}"
    echo ""
fi

echo ""
