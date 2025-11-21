#!/bin/bash

# 🧪 CareerLens API Testing Script
# Tests all API endpoints after deployment

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
BASE_URL="${1:-https://careerlens-1.web.app}"
PASSED=0
FAILED=0
TOTAL=0

print_header() {
    echo ""
    echo "╔════════════════════════════════════════╗"
    echo "║   🧪 API Testing Suite                ║"
    echo "║   Testing: $BASE_URL"
    echo "╚════════════════════════════════════════╝"
    echo ""
}

test_endpoint() {
    local method=$1
    local endpoint=$2
    local description=$3
    local expected_status=${4:-200}
    local data=$5
    
    TOTAL=$((TOTAL + 1))
    echo -n "Testing: $description... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$BASE_URL$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi
    
    status_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    if [ "$status_code" = "$expected_status" ]; then
        echo -e "${GREEN}✓ PASSED${NC} (Status: $status_code)"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}✗ FAILED${NC} (Expected: $expected_status, Got: $status_code)"
        echo "  Response: $body"
        FAILED=$((FAILED + 1))
    fi
}

print_header

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📚 eBooks API Tests"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_endpoint "GET" "/api/ebooks/archive/search?query=python&limit=5" "Search books - Python" 200
test_endpoint "GET" "/api/ebooks/archive/search?query=javascript&limit=3" "Search books - JavaScript" 200
test_endpoint "GET" "/api/ebooks/archive/metadata?identifier=test" "Get book metadata" 200

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📰 Career Updates API Tests"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_endpoint "GET" "/api/career-updates/latest" "Get latest career updates" 200
test_endpoint "GET" "/api/news" "Get news articles" 200

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🤖 AI API Tests"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_endpoint "POST" "/api/ai/career-summary" "Generate career summary" 200 '{"profile":"Software Engineer with 5 years experience"}'
test_endpoint "POST" "/api/copilot/chat" "AI Chat" 200 '{"message":"Hello"}'

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎓 Course API Tests"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_endpoint "POST" "/api/courses/scrape" "Scrape course" 200 '{"url":"https://example.com/course"}'

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⚙️ Background Jobs API Tests"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_endpoint "POST" "/api/jobs" "Create background job" 200 '{"type":"test","data":{}}'

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🗣️ English Helper API Tests"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_endpoint "POST" "/api/english-helper" "English assistance" 200 '{"text":"I have went to school","type":"grammar"}'

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎯 Career Navigator API Tests"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_endpoint "POST" "/api/career-navigator" "Get career recommendations" 200 '{"skills":["JavaScript","React"]}'

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 BigQuery API Tests"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_endpoint "GET" "/api/bigquery/trending-skills" "Get trending skills" 200
test_endpoint "GET" "/api/bigquery/salary-range?role=developer&location=us" "Get salary range" 200
test_endpoint "POST" "/api/bigquery/skill-gap-analysis" "Skill gap analysis" 200 '{"currentSkills":["JavaScript"],"targetRole":"Senior Developer"}'

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📄 Resume & College API Tests"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_endpoint "POST" "/api/parse-resume" "Parse resume" 200 '{"resumeText":"Software Engineer with 5 years..."}'
test_endpoint "POST" "/api/college-recommendations" "College recommendations" 200 '{"score":1400,"interests":["Computer Science"]}'

echo ""
echo "╔════════════════════════════════════════╗"
echo "║   📊 Test Results Summary              ║"
echo "╚════════════════════════════════════════╝"
echo ""
echo -e "Total Tests:  $TOTAL"
echo -e "${GREEN}Passed:       $PASSED${NC}"
echo -e "${RED}Failed:       $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}⚠️  Some tests failed. Please review the errors above.${NC}"
    exit 1
fi
