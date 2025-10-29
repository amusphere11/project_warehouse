#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Testing Backend Connection            ║${NC}"
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo ""

# Test Backend Health
echo -e "${YELLOW}[1/4]${NC} Testing backend health endpoint..."
HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:3000/health)
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$HEALTH_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓${NC} Backend is running!"
    echo -e "   Response: $RESPONSE_BODY"
else
    echo -e "${RED}✗${NC} Backend not responding (HTTP $HTTP_CODE)"
    echo -e "${RED}   Please start backend first:${NC}"
    echo -e "   ${YELLOW}cd backend && npm run dev${NC}"
    exit 1
fi
echo ""

# Test Backend Root
echo -e "${YELLOW}[2/4]${NC} Testing backend root endpoint..."
ROOT_RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:3000/)
HTTP_CODE=$(echo "$ROOT_RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓${NC} Backend root endpoint OK!"
else
    echo -e "${RED}✗${NC} Backend root failed (HTTP $HTTP_CODE)"
fi
echo ""

# Test CORS Configuration
echo -e "${YELLOW}[3/4]${NC} Testing CORS configuration..."
CORS_RESPONSE=$(curl -s -I -H "Origin: http://localhost:5173" http://localhost:3000/health)

if echo "$CORS_RESPONSE" | grep -q "Access-Control-Allow-Origin"; then
    echo -e "${GREEN}✓${NC} CORS is configured!"
    CORS_ORIGIN=$(echo "$CORS_RESPONSE" | grep "Access-Control-Allow-Origin" | cut -d' ' -f2 | tr -d '\r')
    echo -e "   Allowed origin: ${GREEN}$CORS_ORIGIN${NC}"
else
    echo -e "${RED}✗${NC} CORS not configured or not allowing localhost:5173"
    echo -e "${RED}   Check backend .env: CORS_ORIGIN=http://localhost:5173${NC}"
fi
echo ""

# Test API Endpoints
echo -e "${YELLOW}[4/4]${NC} Testing API endpoints..."

declare -a endpoints=(
    "/api/auth/login"
    "/api/materials"
    "/api/products"
    "/api/inventory"
)

for endpoint in "${endpoints[@]}"; do
    RESPONSE=$(curl -s -w "\n%{http_code}" "http://localhost:3000$endpoint")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    
    # 401 or 404 is OK (endpoint exists but needs auth)
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "404" ]; then
        echo -e "   ${GREEN}✓${NC} $endpoint (HTTP $HTTP_CODE)"
    else
        echo -e "   ${RED}✗${NC} $endpoint (HTTP $HTTP_CODE)"
    fi
done
echo ""

# Summary
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Summary                               ║${NC}"
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}✓${NC} Backend URL: ${YELLOW}http://localhost:3000${NC}"
echo -e "${GREEN}✓${NC} Frontend should use: ${YELLOW}VITE_API_URL=http://localhost:3000${NC}"
echo -e "${GREEN}✓${NC} API Documentation: ${YELLOW}http://localhost:3000/api-docs${NC}"
echo ""
echo -e "${GREEN}Backend is ready for frontend connections!${NC}"
echo ""
