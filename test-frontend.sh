#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Testing Frontend Configuration        ║${NC}"
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo ""

# Check if frontend .env exists
echo -e "${YELLOW}[1/4]${NC} Checking frontend .env file..."
if [ -f "frontend/.env" ]; then
    echo -e "${GREEN}✓${NC} frontend/.env exists"
    echo -e "   Content:"
    cat frontend/.env | grep VITE_ | while read line; do
        echo -e "   ${YELLOW}$line${NC}"
    done
else
    echo -e "${RED}✗${NC} frontend/.env not found!"
    echo -e "${YELLOW}   Creating from .env.example...${NC}"
    cp frontend/.env.example frontend/.env
    echo -e "${GREEN}✓${NC} Created frontend/.env"
fi
echo ""

# Check API URL configuration
echo -e "${YELLOW}[2/4]${NC} Checking API URL configuration..."
if grep -q "VITE_API_URL=http://localhost:3000" frontend/.env; then
    echo -e "${GREEN}✓${NC} API URL correctly configured for development"
    echo -e "   ${GREEN}VITE_API_URL=http://localhost:3000${NC}"
else
    echo -e "${RED}✗${NC} API URL might be incorrect"
    API_URL=$(grep VITE_API_URL frontend/.env || echo "Not found")
    echo -e "   Current: ${YELLOW}$API_URL${NC}"
    echo -e "   Expected: ${GREEN}VITE_API_URL=http://localhost:3000${NC}"
fi
echo ""

# Check if frontend is running
echo -e "${YELLOW}[3/4]${NC} Checking if frontend is running..."
FRONTEND_RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:5173 2>/dev/null)
HTTP_CODE=$(echo "$FRONTEND_RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓${NC} Frontend is running at http://localhost:5173"
else
    echo -e "${YELLOW}!${NC} Frontend not running"
    echo -e "   Start with: ${YELLOW}cd frontend && npm run dev${NC}"
fi
echo ""

# Check Vite config
echo -e "${YELLOW}[4/4]${NC} Checking Vite proxy configuration..."
if grep -q "proxy:" frontend/vite.config.ts; then
    echo -e "${GREEN}✓${NC} Vite proxy configured"
    echo -e "   (Note: In development, direct API URL is preferred)"
else
    echo -e "${YELLOW}!${NC} No Vite proxy found"
fi
echo ""

# Summary
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Summary                               ║${NC}"
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}✓${NC} Frontend URL: ${YELLOW}http://localhost:5173${NC}"
echo -e "${GREEN}✓${NC} Backend URL: ${YELLOW}http://localhost:3000${NC}"
echo -e "${GREEN}✓${NC} Mode: ${YELLOW}Development (Direct Connection)${NC}"
echo ""
echo -e "${BLUE}To start development:${NC}"
echo -e "   ${YELLOW}npm run dev${NC}  ${BLUE}(in root directory)${NC}"
echo ""
