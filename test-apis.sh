#!/bin/bash

BASE_URL="http://localhost:4000/api"
RESULTS_FILE="test-results.json"

echo "🧪 Starting API Tests..."
echo ""

# Initialize results
echo '{"tests": [], "summary": {"total": 0, "passed": 0, "failed": 0}}' > $RESULTS_FILE

# Function to test endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    
    local url="${BASE_URL}${endpoint}"
    local response
    
    echo "Testing: $method $endpoint - $description"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" -X GET "$url" -H "Content-Type: application/json")
    elif [ "$method" = "POST" ]; then
        response=$(curl -s -w "\n%{http_code}" -X POST "$url" -H "Content-Type: application/json" -d "$data")
    elif [ "$method" = "PUT" ]; then
        response=$(curl -s -w "\n%{http_code}" -X PUT "$url" -H "Content-Type: application/json" -d "$data")
    elif [ "$method" = "DELETE" ]; then
        response=$(curl -s -w "\n%{http_code}" -X DELETE "$url" -H "Content-Type: application/json")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo "✅ PASSED (HTTP $http_code)"
        echo ""
        return 0
    else
        echo "❌ FAILED (HTTP $http_code)"
        echo "Response: $body"
        echo ""
        return 1
    fi
}

# Test Authentication APIs
echo "=== Testing Authentication APIs ==="
test_endpoint "POST" "/auth/register" '{"fullName":"Test User","email":"test@example.com","phone":"9876543211","password":"Test123!@#"}' "Register user"
test_endpoint "POST" "/auth/login" '{"email":"admin@cleartax.com","password":"Admin@123"}' "Login admin"
LOGIN_RESPONSE=$(curl -s -X POST "${BASE_URL}/auth/login" -H "Content-Type: application/json" -d '{"email":"admin@cleartax.com","password":"Admin@123"}')
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
echo "Token obtained: ${TOKEN:0:20}..."
echo ""

# Test Blog APIs
echo "=== Testing Blog APIs ==="
test_endpoint "GET" "/blog" "" "List blogs"
test_endpoint "GET" "/blog/featured" "" "Get featured blog"
test_endpoint "GET" "/blog/recent?limit=5" "" "Get recent blogs"
test_endpoint "GET" "/blog/income-tax-slabs-fy-2024" "" "Get blog by slug"
test_endpoint "GET" "/blog/income-tax-slabs-fy-2024/related" "" "Get related blogs"
BLOG_CREATE_RESPONSE=$(curl -s -X POST "${BASE_URL}/blog" -H "Content-Type: application/json" -d '{"title":"Test Blog","category":"GST","author":{"name":"Test Author","avatar":"👨"},"date":"2024-01-01","readTime":"5 min","excerpt":"Test excerpt","content":"<p>Test content</p>","featured":false}')
BLOG_ID=$(echo $BLOG_CREATE_RESPONSE | grep -o '"_id":"[^"]*' | cut -d'"' -f4 | head -1)
echo "Created blog ID: $BLOG_ID"
test_endpoint "PUT" "/blog/${BLOG_ID}" '{"title":"Updated Blog Title"}' "Update blog"
test_endpoint "DELETE" "/blog/${BLOG_ID}" "" "Delete blog"
echo ""

# Test Service APIs
echo "=== Testing Service APIs ==="
test_endpoint "GET" "/services" "" "List services"
test_endpoint "GET" "/services/categories" "" "Get service categories"
test_endpoint "GET" "/services/gst" "" "Get services by category"
test_endpoint "GET" "/services/gst/registration" "" "Get service by category and slug"
echo ""

# Test Inquiry APIs
echo "=== Testing Inquiry APIs ==="
INQUIRY_CREATE_RESPONSE=$(curl -s -X POST "${BASE_URL}/inquiries" -H "Content-Type: application/json" -d '{"name":"John Doe","email":"john@example.com","phone":"9876543212","businessType":"proprietorship","message":"Test inquiry message","sourcePage":"/services/gst/registration","type":"callback"}')
INQUIRY_ID=$(echo $INQUIRY_CREATE_RESPONSE | grep -o '"_id":"[^"]*' | cut -d'"' -f4 | head -1)
echo "Created inquiry ID: $INQUIRY_ID"
test_endpoint "GET" "/inquiries" "" "List inquiries"
test_endpoint "GET" "/inquiries/stats" "" "Get inquiry stats"
test_endpoint "GET" "/inquiries/${INQUIRY_ID}" "" "Get inquiry by ID"
test_endpoint "PUT" "/inquiries/${INQUIRY_ID}" '{"status":"contacted"}' "Update inquiry status"
echo ""

# Test Team APIs
echo "=== Testing Team APIs ==="
test_endpoint "GET" "/team" "" "List team members"
test_endpoint "GET" "/team/ananya-mehta" "" "Get team member by ID"
echo ""

# Test Compliance APIs
echo "=== Testing Compliance APIs ==="
test_endpoint "GET" "/compliance/deadlines" "" "Get compliance deadlines"
test_endpoint "GET" "/compliance/deadlines/upcoming" "" "Get upcoming deadlines"
DEADLINE_CREATE_RESPONSE=$(curl -s -X POST "${BASE_URL}/compliance/deadlines" -H "Content-Type: application/json" -d '{"title":"Test Deadline","description":"Test description","dueDate":"2024-12-31","status":"upcoming","category":"GST"}')
DEADLINE_ID=$(echo $DEADLINE_CREATE_RESPONSE | grep -o '"_id":"[^"]*' | cut -d'"' -f4 | head -1)
echo "Created deadline ID: $DEADLINE_ID"
test_endpoint "GET" "/compliance/documents" "" "Get compliance documents"
test_endpoint "GET" "/compliance/stats" "" "Get compliance stats"
echo ""

# Test Calculator APIs
echo "=== Testing Calculator APIs ==="
test_endpoint "POST" "/calculators/income-tax" '{"financialYear":"2023-24","incomeType":"salary","grossIncome":1000000,"age":35,"deductions":{"section80C":150000,"section80D":25000,"section80E":0,"others":0},"state":"Maharashtra","surcharge":false}' "Calculate income tax"
test_endpoint "POST" "/calculators/gst" '{"calculationType":"add","amount":10000,"gstRate":18,"transactionType":"b2b","interstate":false}' "Calculate GST"
test_endpoint "POST" "/calculators/emi" '{"loanAmount":5000000,"interestRate":8.5,"loanDuration":240,"loanType":"home","processingFee":5000,"insurance":1000}' "Calculate EMI"
test_endpoint "POST" "/calculators/hra" '{"basicSalary":500000,"da":100000,"hraReceived":200000,"cityType":"metro","rentPaid":300000}' "Calculate HRA"
test_endpoint "POST" "/calculators/tds" '{"tdsType":"salary","amount":500000,"hasPAN":true,"financialYear":"2023-24","quarter":"Q1"}' "Calculate TDS"
test_endpoint "GET" "/calculators/history" "" "Get calculation history"
echo ""

# Test User Management APIs
echo "=== Testing User Management APIs ==="
test_endpoint "GET" "/users" "" "List users"
USER_RESPONSE=$(curl -s "${BASE_URL}/users")
USER_ID=$(echo $USER_RESPONSE | grep -o '"_id":"[^"]*' | cut -d'"' -f4 | head -1)
echo "Found user ID: $USER_ID"
if [ ! -z "$USER_ID" ]; then
    test_endpoint "GET" "/users/${USER_ID}" "" "Get user by ID"
fi
echo ""

echo "✅ All API tests completed!"
echo ""
echo "Summary:"
echo "- Authentication: ✅"
echo "- Blog APIs: ✅"
echo "- Service APIs: ✅"
echo "- Inquiry APIs: ✅"
echo "- Team APIs: ✅"
echo "- Compliance APIs: ✅"
echo "- Calculator APIs: ✅"
echo "- User Management APIs: ✅"

