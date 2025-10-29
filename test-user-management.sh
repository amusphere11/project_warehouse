#!/bin/bash

# User Management Feature Test Script
# This script tests the backend API endpoints for user management

echo "🧪 User Management API Test Suite"
echo "=================================="
echo ""

# Configuration
API_URL="http://localhost:3000"
ADMIN_TOKEN=""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to print test results
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ PASS${NC} - $2"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC} - $2"
        ((TESTS_FAILED++))
    fi
}

# Function to make authenticated requests
api_call() {
    local method=$1
    local endpoint=$2
    local data=$3
    
    if [ -z "$data" ]; then
        curl -s -X "$method" "$API_URL$endpoint" \
            -H "Authorization: Bearer $ADMIN_TOKEN" \
            -H "Content-Type: application/json"
    else
        curl -s -X "$method" "$API_URL$endpoint" \
            -H "Authorization: Bearer $ADMIN_TOKEN" \
            -H "Content-Type: application/json" \
            -d "$data"
    fi
}

echo "Step 1: Login as Admin"
echo "----------------------"
read -p "Enter admin email: " ADMIN_EMAIL
read -s -p "Enter admin password: " ADMIN_PASSWORD
echo ""

LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")

ADMIN_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | sed 's/"token":"//')

if [ -z "$ADMIN_TOKEN" ]; then
    echo -e "${RED}Failed to login. Please check credentials.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Login successful${NC}"
echo ""

echo "Step 2: Testing User Management Endpoints"
echo "-----------------------------------------"
echo ""

# Test 1: Get all users
echo "Test 1: GET /api/users - Fetch all users"
RESPONSE=$(api_call "GET" "/api/users?page=1&limit=10")
if echo "$RESPONSE" | grep -q '"status":"success"'; then
    print_result 0 "Fetch all users"
    echo "   Found $(echo "$RESPONSE" | grep -o '"total":[0-9]*' | sed 's/"total"://') users"
else
    print_result 1 "Fetch all users"
fi
echo ""

# Test 2: Search users
echo "Test 2: GET /api/users?search=admin - Search users"
RESPONSE=$(api_call "GET" "/api/users?search=admin")
if echo "$RESPONSE" | grep -q '"status":"success"'; then
    print_result 0 "Search users"
else
    print_result 1 "Search users"
fi
echo ""

# Test 3: Filter by role
echo "Test 3: GET /api/users?role=ADMIN - Filter by role"
RESPONSE=$(api_call "GET" "/api/users?role=ADMIN")
if echo "$RESPONSE" | grep -q '"status":"success"'; then
    print_result 0 "Filter by role"
else
    print_result 1 "Filter by role"
fi
echo ""

# Test 4: Filter by active status
echo "Test 4: GET /api/users?isActive=true - Filter by status"
RESPONSE=$(api_call "GET" "/api/users?isActive=true")
if echo "$RESPONSE" | grep -q '"status":"success"'; then
    print_result 0 "Filter by active status"
else
    print_result 1 "Filter by active status"
fi
echo ""

# Test 5: Create new user
echo "Test 5: POST /api/users - Create new user"
TIMESTAMP=$(date +%s)
TEST_EMAIL="test_$TIMESTAMP@example.com"
CREATE_DATA="{
    \"email\":\"$TEST_EMAIL\",
    \"name\":\"Test User $TIMESTAMP\",
    \"password\":\"TestPass123!\",
    \"role\":\"OPERATOR\",
    \"isActive\":true
}"
RESPONSE=$(api_call "POST" "/api/users" "$CREATE_DATA")
if echo "$RESPONSE" | grep -q '"status":"success"'; then
    print_result 0 "Create new user"
    USER_ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*' | sed 's/"id":"//')
    echo "   Created user ID: $USER_ID"
else
    print_result 1 "Create new user"
    echo "   Response: $RESPONSE"
fi
echo ""

# Test 6: Get user by ID
if [ ! -z "$USER_ID" ]; then
    echo "Test 6: GET /api/users/:id - Get user by ID"
    RESPONSE=$(api_call "GET" "/api/users/$USER_ID")
    if echo "$RESPONSE" | grep -q '"status":"success"'; then
        print_result 0 "Get user by ID"
    else
        print_result 1 "Get user by ID"
    fi
    echo ""
fi

# Test 7: Update user
if [ ! -z "$USER_ID" ]; then
    echo "Test 7: PUT /api/users/:id - Update user"
    UPDATE_DATA="{
        \"name\":\"Updated Test User\",
        \"role\":\"MANAGER\",
        \"isActive\":true
    }"
    RESPONSE=$(api_call "PUT" "/api/users/$USER_ID" "$UPDATE_DATA")
    if echo "$RESPONSE" | grep -q '"status":"success"'; then
        print_result 0 "Update user"
    else
        print_result 1 "Update user"
        echo "   Response: $RESPONSE"
    fi
    echo ""
fi

# Test 8: Validation - Create user with existing email
echo "Test 8: POST /api/users - Validation (duplicate email)"
DUPLICATE_DATA="{
    \"email\":\"$TEST_EMAIL\",
    \"name\":\"Duplicate User\",
    \"password\":\"TestPass123!\",
    \"role\":\"OPERATOR\"
}"
RESPONSE=$(api_call "POST" "/api/users" "$DUPLICATE_DATA")
if echo "$RESPONSE" | grep -q "already exists"; then
    print_result 0 "Duplicate email validation"
else
    print_result 1 "Duplicate email validation"
fi
echo ""

# Test 9: Validation - Create user without required fields
echo "Test 9: POST /api/users - Validation (missing fields)"
INVALID_DATA="{\"email\":\"incomplete@example.com\"}"
RESPONSE=$(api_call "POST" "/api/users" "$INVALID_DATA")
if echo "$RESPONSE" | grep -q "required"; then
    print_result 0 "Required fields validation"
else
    print_result 1 "Required fields validation"
fi
echo ""

# Test 10: Delete user
if [ ! -z "$USER_ID" ]; then
    echo "Test 10: DELETE /api/users/:id - Delete user"
    RESPONSE=$(api_call "DELETE" "/api/users/$USER_ID")
    if echo "$RESPONSE" | grep -q '"status":"success"'; then
        print_result 0 "Delete user (soft delete)"
    else
        print_result 1 "Delete user (soft delete)"
    fi
    echo ""
    
    # Verify user is soft deleted (inactive)
    echo "Test 11: Verify soft delete - User should be inactive"
    RESPONSE=$(api_call "GET" "/api/users/$USER_ID")
    if echo "$RESPONSE" | grep -q '"isActive":false'; then
        print_result 0 "User is soft deleted (inactive)"
    else
        print_result 1 "User is soft deleted (inactive)"
    fi
    echo ""
fi

# Test 12: Pagination
echo "Test 12: GET /api/users?page=1&limit=5 - Pagination"
RESPONSE=$(api_call "GET" "/api/users?page=1&limit=5")
if echo "$RESPONSE" | grep -q '"pagination"' && echo "$RESPONSE" | grep -q '"limit":5'; then
    print_result 0 "Pagination works correctly"
else
    print_result 1 "Pagination works correctly"
fi
echo ""

# Test 13: Authorization - Try to access without token
echo "Test 13: Authorization - Access without token"
RESPONSE=$(curl -s -X GET "$API_URL/api/users" -H "Content-Type: application/json")
if echo "$RESPONSE" | grep -q "Unauthorized\|not authenticated"; then
    print_result 0 "Unauthorized access blocked"
else
    print_result 1 "Unauthorized access blocked"
fi
echo ""

echo "=================================="
echo "Test Summary"
echo "=================================="
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed!${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  Some tests failed. Please check the output above.${NC}"
    exit 1
fi
