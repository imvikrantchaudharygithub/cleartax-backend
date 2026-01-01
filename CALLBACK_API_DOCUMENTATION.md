# Request Callback API Documentation

Complete API documentation for Request Callback endpoints with cURL examples.

## Base URL
```
http://localhost:4000/api/callbacks
```

---

## API Endpoints Summary

### Client Endpoints:
- `POST /api/callbacks` - Create a callback request (Public)

### Admin Endpoints:
- `GET /api/callbacks` - Get all callback requests with filtering and pagination
- `GET /api/callbacks/:id` - Get a single callback request by ID
- `PUT /api/callbacks/:id` - Update a callback request (status, message, businessType)
- `DELETE /api/callbacks/:id` - Delete a callback request
- `GET /api/callbacks/stats` - Get callback statistics

---

## 1. Create Callback Request (Client)

**Endpoint:** `POST /api/callbacks`

**Description:** Create a new callback request. This endpoint is public and can be called from the frontend.

**Request Body:**
```json
{
  "name": "John Doe",
  "phone": "+91-9876543210",
  "email": "john.doe@example.com",
  "businessType": "private-limited",
  "message": "I need help with GST registration",
  "sourcePage": "/services/gst/registration",
  "category": "gst",
  "subcategory": null,
  "serviceId": "694ad0271525812d58764a47"
}
```

**Note:** 
- `name`, `phone`, `email`, and `sourcePage` are **required**
- `category` and `subcategory` are **optional** - they will be auto-populated from `sourcePage` if not provided
- `businessType` is optional and can be: `'individual' | 'proprietorship' | 'partnership' | 'llp' | 'private-limited' | 'public-limited' | 'other'`
- `message` is optional (max 2000 characters)
- `serviceId` is optional (MongoDB ObjectId of the service)

**cURL Example:**
```bash
curl -X POST http://localhost:4000/api/callbacks \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "phone": "+91-9876543210",
    "email": "john.doe@example.com",
    "businessType": "private-limited",
    "message": "I need help with GST registration",
    "sourcePage": "/services/gst/registration",
    "category": "gst",
    "serviceId": "694ad0271525812d58764a47"
  }'
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "694ad0281525812d58764b01",
    "name": "John Doe",
    "phone": "+91-9876543210",
    "email": "john.doe@example.com",
    "businessType": "private-limited",
    "message": "I need help with GST registration",
    "sourcePage": "/services/gst/registration",
    "category": "gst",
    "subcategory": null,
    "serviceId": "694ad0271525812d58764a47",
    "status": "pending",
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z"
  },
  "message": "Callback request created successfully!"
}
```

**Error Response (400) - Validation Error:**
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email address"
    }
  ]
}
```

**Example with Auto-Populated Category/Subcategory:**
```bash
curl -X POST http://localhost:4000/api/callbacks \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "phone": "+91-9876543211",
    "email": "jane.smith@example.com",
    "message": "Interested in IPO advisory services",
    "sourcePage": "/services/ipo/financial-due-diligence/peer-comparison-ratio-analysis"
  }'
```

**Response (category and subcategory auto-populated):**
```json
{
  "success": true,
  "data": {
    "_id": "694ad0281525812d58764b02",
    "name": "Jane Smith",
    "phone": "+91-9876543211",
    "email": "jane.smith@example.com",
    "businessType": null,
    "message": "Interested in IPO advisory services",
    "sourcePage": "/services/ipo/financial-due-diligence/peer-comparison-ratio-analysis",
    "category": "ipo",
    "subcategory": "financial-due-diligence",
    "serviceId": null,
    "status": "pending",
    "createdAt": "2025-01-15T10:35:00.000Z",
    "updatedAt": "2025-01-15T10:35:00.000Z"
  },
  "message": "Callback request created successfully!"
}
```

---

## 2. Get All Callback Requests (Admin)

**Endpoint:** `GET /api/callbacks`

**Description:** Get all callback requests with filtering, searching, and pagination support.

**Query Parameters:**
- `page` (number, optional, default: 1) - Page number for pagination
- `limit` (number, optional, default: 10, max: 100) - Items per page
- `status` (string, optional) - Filter by status: `'pending' | 'contacted' | 'resolved' | 'archived'`
- `category` (string, optional) - Filter by category slug (e.g., `'gst'`, `'ipo'`, `'legal'`)
- `subcategory` (string, optional) - Filter by subcategory slug (e.g., `'financial-due-diligence'`)
- `sourcePage` (string, optional) - Filter by source page path (partial match supported)
- `search` (string, optional) - Search in name, email, phone, message fields
- `startDate` (string, optional, ISO format) - Filter by creation date (from)
- `endDate` (string, optional, ISO format) - Filter by creation date (to)

**cURL Examples:**

**Get all callbacks (default pagination):**
```bash
curl -X GET "http://localhost:4000/api/callbacks"
```

**Get callbacks with pagination:**
```bash
curl -X GET "http://localhost:4000/api/callbacks?page=1&limit=20"
```

**Filter by status:**
```bash
curl -X GET "http://localhost:4000/api/callbacks?status=pending"
```

**Filter by category:**
```bash
curl -X GET "http://localhost:4000/api/callbacks?category=ipo"
```

**Filter by subcategory:**
```bash
curl -X GET "http://localhost:4000/api/callbacks?subcategory=financial-due-diligence"
```

**Search by name, email, phone, or message:**
```bash
curl -X GET "http://localhost:4000/api/callbacks?search=john"
```

**Filter by date range:**
```bash
curl -X GET "http://localhost:4000/api/callbacks?startDate=2025-01-01T00:00:00.000Z&endDate=2025-01-31T23:59:59.999Z"
```

**Combined filters:**
```bash
curl -X GET "http://localhost:4000/api/callbacks?status=pending&category=ipo&page=1&limit=10&search=financial"
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "694ad0281525812d58764b01",
      "name": "John Doe",
      "phone": "+91-9876543210",
      "email": "john.doe@example.com",
      "businessType": "private-limited",
      "message": "I need help with GST registration",
      "sourcePage": "/services/gst/registration",
      "category": "gst",
      "subcategory": null,
      "serviceId": "694ad0271525812d58764a47",
      "status": "pending",
      "createdAt": "2025-01-15T10:30:00.000Z",
      "updatedAt": "2025-01-15T10:30:00.000Z"
    },
    {
      "_id": "694ad0281525812d58764b02",
      "name": "Jane Smith",
      "phone": "+91-9876543211",
      "email": "jane.smith@example.com",
      "businessType": null,
      "message": "Interested in IPO advisory services",
      "sourcePage": "/services/ipo/financial-due-diligence/peer-comparison-ratio-analysis",
      "category": "ipo",
      "subcategory": "financial-due-diligence",
      "serviceId": null,
      "status": "contacted",
      "createdAt": "2025-01-15T10:35:00.000Z",
      "updatedAt": "2025-01-15T11:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "totalPages": 15
  },
  "message": "Callbacks retrieved successfully"
}
```

---

## 3. Get Callback Request by ID (Admin)

**Endpoint:** `GET /api/callbacks/:id`

**Description:** Get a single callback request by its MongoDB `_id`.

**Parameters:**
- `id` (path parameter): MongoDB `_id` of the callback request

**cURL Example:**
```bash
curl -X GET "http://localhost:4000/api/callbacks/694ad0281525812d58764b01"
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "694ad0281525812d58764b01",
    "name": "John Doe",
    "phone": "+91-9876543210",
    "email": "john.doe@example.com",
    "businessType": "private-limited",
    "message": "I need help with GST registration",
    "sourcePage": "/services/gst/registration",
    "category": "gst",
    "subcategory": null,
    "serviceId": "694ad0271525812d58764a47",
    "status": "pending",
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z"
  },
  "message": "Callback retrieved successfully"
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Callback request not found"
}
```

---

## 4. Update Callback Request (Admin)

**Endpoint:** `PUT /api/callbacks/:id`

**Description:** Update a callback request. Only `status`, `message`, and `businessType` can be updated.

**Parameters:**
- `id` (path parameter): MongoDB `_id` of the callback request

**Request Body (all fields optional):**
```json
{
  "status": "contacted",
  "message": "Updated message after contact",
  "businessType": "llp"
}
```

**cURL Example - Update Status:**
```bash
curl -X PUT http://localhost:4000/api/callbacks/694ad0281525812d58764b01 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "contacted"
  }'
```

**cURL Example - Update Multiple Fields:**
```bash
curl -X PUT http://localhost:4000/api/callbacks/694ad0281525812d58764b01 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "resolved",
    "message": "Issue resolved successfully"
  }'
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "694ad0281525812d58764b01",
    "name": "John Doe",
    "phone": "+91-9876543210",
    "email": "john.doe@example.com",
    "businessType": "llp",
    "message": "Issue resolved successfully",
    "sourcePage": "/services/gst/registration",
    "category": "gst",
    "subcategory": null,
    "serviceId": "694ad0271525812d58764a47",
    "status": "resolved",
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T12:00:00.000Z"
  },
  "message": "Callback request updated successfully!"
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Callback request not found"
}
```

---

## 5. Delete Callback Request (Admin)

**Endpoint:** `DELETE /api/callbacks/:id`

**Description:** Delete a callback request by its MongoDB `_id`.

**Parameters:**
- `id` (path parameter): MongoDB `_id` of the callback request

**cURL Example:**
```bash
curl -X DELETE http://localhost:4000/api/callbacks/694ad0281525812d58764b01
```

**Success Response (200):**
```json
{
  "success": true,
  "data": null,
  "message": "Callback request deleted successfully!"
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Callback request not found"
}
```

---

## 6. Get Callback Statistics (Admin)

**Endpoint:** `GET /api/callbacks/stats`

**Description:** Get aggregated statistics about callback requests including counts by status, category, subcategory, and source page.

**cURL Example:**
```bash
curl -X GET "http://localhost:4000/api/callbacks/stats"
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "total": 150,
    "pending": 45,
    "contacted": 60,
    "resolved": 40,
    "archived": 5,
    "byCategory": {
      "gst": 30,
      "ipo": 25,
      "legal": 20,
      "banking-finance": 15,
      "other": 10
    },
    "bySubcategory": {
      "financial-due-diligence": 10,
      "advisory-strategy": 8,
      "loan-credit-facilities": 5
    },
    "bySourcePage": {
      "/services/gst/registration": 15,
      "/services/ipo/financial-due-diligence": 10,
      "/services/ipo/financial-due-diligence/peer-comparison-ratio-analysis": 8,
      "/services/legal/company-incorporation": 12
    }
  },
  "message": "Statistics retrieved successfully"
}
```

---

## Status Values

Valid `status` values:
- `"pending"` - New callback request, not yet contacted (default)
- `"contacted"` - Customer has been contacted
- `"resolved"` - Request has been resolved
- `"archived"` - Request has been archived

---

## Business Type Values

Valid `businessType` values:
- `"individual"` - Individual/sole proprietor
- `"proprietorship"` - Proprietorship
- `"partnership"` - Partnership firm
- `"llp"` - Limited Liability Partnership
- `"private-limited"` - Private Limited Company
- `"public-limited"` - Public Limited Company
- `"other"` - Other business type

---

## Auto-Population Logic

The API automatically extracts `category` and `subcategory` from the `sourcePage` URL if not provided:

**Examples:**
- `/services/gst/registration` → `category: "gst"`
- `/services/ipo/financial-due-diligence` → `category: "ipo"`, `subcategory: "financial-due-diligence"`
- `/services/ipo/financial-due-diligence/peer-comparison` → `category: "ipo"`, `subcategory: "financial-due-diligence"`
- `/services/banking-finance/loan-credit-facilities` → `category: "banking-finance"`, `subcategory: "loan-credit-facilities"`

**Complex categories** (that have subcategories):
- `ipo`
- `legal`
- `banking-finance`

**Simple categories** (no subcategories):
- `gst`
- Other categories

---

## Error Handling

All endpoints return standardized error responses:

**Validation Error (400):**
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email address"
    }
  ]
}
```

**Not Found Error (404):**
```json
{
  "success": false,
  "message": "Callback request not found"
}
```

**Server Error (500):**
```json
{
  "success": false,
  "message": "Internal server error",
  "stack": "Error stack trace (in development)"
}
```

---

## Best Practices

1. **Always use Content-Type header:** Set `Content-Type: application/json` for POST/PUT requests
2. **Handle errors gracefully:** Check the `success` field in responses
3. **Use appropriate HTTP methods:** GET for retrieval, POST for creation, PUT for updates, DELETE for deletion
4. **Validate data before sending:** Ensure required fields are present and properly formatted
5. **Use pagination:** For GET all requests, always use pagination to avoid loading too much data
6. **Filter efficiently:** Use query parameters to filter data on the server side rather than filtering on the client
7. **Include sourcePage:** Always include the `sourcePage` field to track where requests originated
8. **Update status:** Use the update endpoint to change status as you process callback requests

---

## Frontend Integration Notes

1. **Create Callback:** Use `POST /api/callbacks` from any page where users can request a callback
2. **Admin Dashboard:** Use `GET /api/callbacks` with filters to display and manage callback requests
3. **Statistics Dashboard:** Use `GET /api/callbacks/stats` to display analytics
4. **Status Management:** Use `PUT /api/callbacks/:id` to update status as you process requests
5. **Toast Notifications:** All success responses include a `message` field suitable for toast notifications

---

## Example Frontend Usage

```javascript
// Create callback request
const createCallback = async (formData) => {
  const response = await fetch('http://localhost:4000/api/callbacks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      sourcePage: window.location.pathname, // Auto-populate from current page
      message: formData.message,
      businessType: formData.businessType,
    }),
  });
  
  const result = await response.json();
  
  if (result.success) {
    // Show success toast: result.message
    console.log('Callback created:', result.data);
  } else {
    // Show error toast: result.message
    console.error('Error:', result.errors);
  }
};

// Get all callbacks with filters
const getCallbacks = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const response = await fetch(`http://localhost:4000/api/callbacks?${params}`);
  const result = await response.json();
  
  if (result.success) {
    return {
      callbacks: result.data,
      pagination: result.pagination,
    };
  }
};

// Update callback status
const updateCallbackStatus = async (id, status) => {
  const response = await fetch(`http://localhost:4000/api/callbacks/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });
  
  const result = await response.json();
  
  if (result.success) {
    // Show success toast: result.message
    return result.data;
  }
};
```

---

**All APIs are ready for frontend integration!**


