# API CRUD Operations Documentation

Complete guide for all Service and Subcategory (ServiceCategory) CRUD operations with curl examples.

## Base URL
```
http://localhost:4000/api/services
```

## API Endpoints Summary

### Services (by MongoDB _id):
- `POST /api/services` - Create service
- `PUT /api/services/:id` - Update service (by MongoDB `_id`)
- `DELETE /api/services/:id` - Delete service (by MongoDB `_id`)

### Services (by Category):
- `PUT /api/services/:category/:slug` - Update category item
- `DELETE /api/services/:category/:slug` - Delete category item

### Services (by Subcategory):
- `POST /api/services/:category/:subcategory/:slug` - Create subcategory item
- `PUT /api/services/:category/:subcategory/:slug` - Update subcategory item
- `DELETE /api/services/:category/:subcategory/:slug` - Delete subcategory item

### Subcategories (ServiceCategory):
- `POST /api/services/categories` - Create subcategory
- `PUT /api/services/categories/:id` - Update subcategory (by `_id`, `slug`, or `id`)
- `DELETE /api/services/categories/:id` - Delete subcategory (by `_id`, `slug`, or `id`)

---

## Service Operations

### 1. Create Service

**Endpoint:** `POST /api/services`

**Description:** Create a new service.

**Request Body:**
```json
{
  "title": "GST Registration",
  "shortDescription": "Complete GST registration service for your business",
  "longDescription": "Comprehensive GST registration service including documentation, filing, and compliance support.",
  "iconName": "FileText",
  "category": "gst-category-id",
  "price": {
    "min": 5000,
    "max": 15000,
    "currency": "INR"
  },
  "duration": "7-10 days",
  "features": [
    "Document preparation",
    "Online filing",
    "Compliance support"
  ],
  "benefits": [
    "Fast processing",
    "Expert guidance",
    "Lifetime support"
  ],
  "requirements": [
    "PAN card",
    "Business address proof",
    "Bank account details"
  ],
  "process": [
    {
      "step": 1,
      "title": "Document Collection",
      "description": "Collect all required documents",
      "duration": "1-2 days"
    },
    {
      "step": 2,
      "title": "Application Filing",
      "description": "File GST registration application",
      "duration": "2-3 days"
    }
  ],
  "faqs": [
    {
      "id": "faq-1",
      "question": "What documents are required?",
      "answer": "PAN card, address proof, and bank details are required."
    }
  ],
  "relatedServices": []
}
```

**curl Example:**
```bash
curl -X POST http://localhost:4000/api/services \
  -H "Content-Type: application/json" \
  -d '{
    "title": "GST Registration",
    "shortDescription": "Complete GST registration service for your business",
    "longDescription": "Comprehensive GST registration service including documentation, filing, and compliance support.",
    "iconName": "FileText",
    "category": "gst-category-id",
    "price": {
      "min": 5000,
      "max": 15000,
      "currency": "INR"
    },
    "duration": "7-10 days",
    "features": ["Document preparation", "Online filing", "Compliance support"],
    "benefits": ["Fast processing", "Expert guidance", "Lifetime support"],
    "requirements": ["PAN card", "Business address proof", "Bank account details"],
    "process": [
      {
        "step": 1,
        "title": "Document Collection",
        "description": "Collect all required documents",
        "duration": "1-2 days"
      }
    ],
    "faqs": [
      {
        "id": "faq-1",
        "question": "What documents are required?",
        "answer": "PAN card, address proof, and bank details are required."
      }
    ],
    "relatedServices": []
  }'
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "694ad0271525812d58764a47",
    "slug": "gst-registration",
    "title": "GST Registration",
    "shortDescription": "Complete GST registration service for your business",
    "longDescription": "Comprehensive GST registration service...",
    "iconName": "FileText",
    "category": "gst-category-id",
    "price": {
      "min": 5000,
      "max": 15000,
      "currency": "INR"
    },
    "duration": "7-10 days",
    "features": ["Document preparation", "Online filing", "Compliance support"],
    "benefits": ["Fast processing", "Expert guidance", "Lifetime support"],
    "requirements": ["PAN card", "Business address proof", "Bank account details"],
    "process": [...],
    "faqs": [...],
    "relatedServices": [],
    "createdAt": "2025-12-23T17:23:51.725Z",
    "updatedAt": "2025-12-23T17:23:51.725Z"
  },
  "message": "Service created successfully"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Validation error: Title is required"
}
```

---

### 2. Update Service

**Endpoint:** `PUT /api/services/:id`

**Description:** Update an existing service by MongoDB `_id`.

**Parameters:**
- `id` (path parameter): MongoDB `_id` of the service

**Request Body:** (All fields are optional - partial update)
```json
{
  "title": "GST Registration - Updated",
  "price": {
    "min": 6000,
    "max": 18000,
    "currency": "INR"
  },
  "features": [
    "Document preparation",
    "Online filing",
    "Compliance support",
    "Post-registration support"
  ]
}
```

**curl Example:**
```bash
curl -X PUT http://localhost:4000/api/services/694ad0271525812d58764a47 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "GST Registration - Updated",
    "price": {
      "min": 6000,
      "max": 18000,
      "currency": "INR"
    },
    "features": [
      "Document preparation",
      "Online filing",
      "Compliance support",
      "Post-registration support"
    ]
  }'
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "694ad0271525812d58764a47",
    "slug": "gst-registration-updated",
    "title": "GST Registration - Updated",
    ...
  },
  "message": "Service updated successfully"
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Service not found"
}
```

**Note:** If you update the `title`, the `slug` will be automatically regenerated based on the new title.

---

### 3. Delete Service

**Endpoint:** `DELETE /api/services/:id`

**Description:** Delete a service by MongoDB `_id`.

**Parameters:**
- `id` (path parameter): MongoDB `_id` of the service

**curl Example:**
```bash
curl -X DELETE http://localhost:4000/api/services/694ad0271525812d58764a47
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Service deleted successfully"
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Service not found"
}
```

---

## Subcategory (ServiceCategory) Operations

### 4. Create Subcategory

**Endpoint:** `POST /api/services/categories`

**Description:** Create a new service category (subcategory).

**Request Body:**
```json
{
  "id": "financial-due-diligence",
  "title": "Financial Due Diligence",
  "description": "Comprehensive financial analysis, reporting, and compliance services",
  "iconName": "FileCheck",
  "heroTitle": "Financial Due Diligence Services",
  "heroDescription": "Rigorous financial analysis and reporting to ensure your company meets all IPO financial requirements.",
  "categoryType": "ipo",
  "subServices": []
}
```

**curl Example:**
```bash
curl -X POST http://localhost:4000/api/services/categories \
  -H "Content-Type: application/json" \
  -d '{
    "id": "financial-due-diligence",
    "title": "Financial Due Diligence",
    "description": "Comprehensive financial analysis, reporting, and compliance services",
    "iconName": "FileCheck",
    "heroTitle": "Financial Due Diligence Services",
    "heroDescription": "Rigorous financial analysis and reporting to ensure your company meets all IPO financial requirements.",
    "categoryType": "ipo",
    "subServices": []
  }'
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "694ad0271525812d58764a32",
    "id": "financial-due-diligence",
    "slug": "financial-due-diligence",
    "title": "Financial Due Diligence",
    "description": "Comprehensive financial analysis, reporting, and compliance services",
    "iconName": "FileCheck",
    "heroTitle": "Financial Due Diligence Services",
    "heroDescription": "Rigorous financial analysis and reporting...",
    "categoryType": "ipo",
    "subServices": [],
    "createdAt": "2025-12-23T17:23:52.775Z",
    "updatedAt": "2025-12-23T17:23:52.775Z"
  },
  "message": "Service category created successfully"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "A service category with this ID or title already exists"
}
```

---

### 5. Update Subcategory

**Endpoint:** `PUT /api/services/categories/:id`

**Description:** Update an existing service category. The `id` parameter can be:
- MongoDB `_id`
- Category `slug`
- Category `id` field

**Parameters:**
- `id` (path parameter): MongoDB `_id`, `slug`, or `id` field of the category

**Request Body:** (All fields are optional - partial update)
```json
{
  "title": "Financial Due Diligence - Updated",
  "description": "Updated comprehensive financial analysis services",
  "heroTitle": "Updated Financial Due Diligence Services",
  "subServices": ["service-id-1", "service-id-2"]
}
```

**curl Example (by MongoDB _id):**
```bash
curl -X PUT http://localhost:4000/api/services/categories/694ad0271525812d58764a32 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Financial Due Diligence - Updated",
    "description": "Updated comprehensive financial analysis services",
    "heroTitle": "Updated Financial Due Diligence Services"
  }'
```

**curl Example (by slug):**
```bash
curl -X PUT http://localhost:4000/api/services/categories/financial-due-diligence \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Financial Due Diligence - Updated",
    "description": "Updated comprehensive financial analysis services"
  }'
```

**curl Example (by id field):**
```bash
curl -X PUT http://localhost:4000/api/services/categories/financial-due-diligence \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Financial Due Diligence - Updated"
  }'
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "694ad0271525812d58764a32",
    "id": "financial-due-diligence",
    "slug": "financial-due-diligence-updated",
    "title": "Financial Due Diligence - Updated",
    "description": "Updated comprehensive financial analysis services",
    ...
  },
  "message": "Service category updated successfully"
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Service category not found"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "A service category with this title already exists"
}
```

**Note:** 
- If you update the `title`, the `slug` will be automatically regenerated
- `subServices` array should contain service MongoDB `_id` strings
- `categoryType` must be one of: `'simple'`, `'banking-finance'`, `'ipo'`, `'legal'`

---

### 6. Delete Subcategory

**Endpoint:** `DELETE /api/services/categories/:id`

**Description:** Delete a service category. The `id` parameter can be:
- MongoDB `_id`
- Category `slug`
- Category `id` field

**Important:** The category cannot be deleted if it has services linked to it. You must update or remove those services first.

**Parameters:**
- `id` (path parameter): MongoDB `_id`, `slug`, or `id` field of the category

**curl Example (by MongoDB _id):**
```bash
curl -X DELETE http://localhost:4000/api/services/categories/694ad0271525812d58764a32
```

**curl Example (by slug):**
```bash
curl -X DELETE http://localhost:4000/api/services/categories/financial-due-diligence
```

**curl Example (by id field):**
```bash
curl -X DELETE http://localhost:4000/api/services/categories/financial-due-diligence
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Service category deleted successfully"
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Service category not found"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Cannot delete category: 5 service(s) are linked to this category. Please update or remove those services first."
}
```

---

## Create Service with Category and Subcategory

### 7. Create Service by Subcategory

**Endpoint:** `POST /api/services/:category/:subcategory/:slug`

**Description:** Create a new service and automatically link it to a specific category and subcategory.

**Parameters:**
- `category` (path parameter): Category slug, id, or categoryType (e.g., "ipo", "banking-finance")
- `subcategory` (path parameter): Subcategory slug or id (e.g., "financial-due-diligence")
- `slug` (path parameter): Unique slug for the service (e.g., "financial-disclosures-notes-preparation")

**Request Body:**
```json
{
  "title": "Financial Disclosures & Notes Preparation",
  "shortDescription": "Comprehensive preparation of financial disclosures",
  "longDescription": "Financial Disclosures & Notes Preparation involves creating comprehensive, compliant financial disclosures...",
  "iconName": "FileText",
  "price": {
    "min": 600000,
    "max": 1500000,
    "currency": "INR"
  },
  "duration": "4-6 weeks",
  "features": ["Comprehensive notes to accounts", "Segment reporting"],
  "benefits": ["Complete regulatory compliance", "Investor transparency"],
  "requirements": ["Audited financial statements", "Related party transaction details"],
  "process": [
    {
      "step": 1,
      "title": "Disclosure Requirements Analysis",
      "description": "Identifying all disclosure requirements",
      "duration": "1 week"
    }
  ],
  "faqs": [
    {
      "id": "disclosure-1",
      "question": "What disclosures are mandatory for IPO?",
      "answer": "Mandatory disclosures include notes to accounts..."
    }
  ],
  "relatedServices": []
}
```

**curl Example:**
```bash
curl -X POST http://localhost:4000/api/services/ipo/financial-due-diligence/financial-disclosures-notes-preparation \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Financial Disclosures & Notes Preparation",
    "shortDescription": "Comprehensive preparation of financial disclosures",
    "longDescription": "Financial Disclosures & Notes Preparation involves creating comprehensive, compliant financial disclosures...",
    "iconName": "FileText",
    "price": {
      "min": 600000,
      "max": 1500000,
      "currency": "INR"
    },
    "duration": "4-6 weeks",
    "features": ["Comprehensive notes to accounts", "Segment reporting"],
    "benefits": ["Complete regulatory compliance", "Investor transparency"],
    "requirements": ["Audited financial statements", "Related party transaction details"],
    "process": [
      {
        "step": 1,
        "title": "Disclosure Requirements Analysis",
        "description": "Identifying all disclosure requirements",
        "duration": "1 week"
      }
    ],
    "faqs": [
      {
        "id": "disclosure-1",
        "question": "What disclosures are mandatory for IPO?",
        "answer": "Mandatory disclosures include notes to accounts..."
      }
    ],
    "relatedServices": []
  }'
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "694ad0271525812d58764a47",
    "slug": "financial-disclosures-notes-preparation",
    "title": "Financial Disclosures & Notes Preparation",
    ...
    "category": "694ad0271525812d58764a32",
    "subcategory": "694ad0271525812d58764a32",
    "categoryInfo": {...},
    "subcategoryInfo": {...}
  },
  "message": "Service created successfully"
}
```

---

## Update and Delete Service by Category

### 8. Update Category Item

**Endpoint:** `PUT /api/services/:category/:slug`

**Description:** Update a service that belongs to a specific category. The service is identified by its slug and verified to belong to the specified category.

**Parameters:**
- `category` (path parameter): Category slug, id, or categoryType (e.g., "ipo", "banking-finance", "gst")
- `slug` (path parameter): Service slug (e.g., "gst-registration")

**Request Body:** (All fields are optional - partial update)
```json
{
  "title": "GST Registration - Updated",
  "price": {
    "min": 6000,
    "max": 18000,
    "currency": "INR"
  },
  "features": [
    "Document preparation",
    "Online filing",
    "Compliance support",
    "Post-registration support"
  ]
}
```

**curl Example:**
```bash
curl -X PUT http://localhost:4000/api/services/gst/gst-registration \
  -H "Content-Type: application/json" \
  -d '{
    "title": "GST Registration - Updated",
    "price": {
      "min": 6000,
      "max": 18000,
      "currency": "INR"
    },
    "features": [
      "Document preparation",
      "Online filing",
      "Compliance support",
      "Post-registration support"
    ]
  }'
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "694ad0271525812d58764a47",
    "slug": "gst-registration-updated",
    "title": "GST Registration - Updated",
    ...
  },
  "message": "Service updated successfully"
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Service not found in the specified category"
}
```

---

### 9. Delete Category Item

**Endpoint:** `DELETE /api/services/:category/:slug`

**Description:** Delete a service that belongs to a specific category. The service is identified by its slug and verified to belong to the specified category.

**Parameters:**
- `category` (path parameter): Category slug, id, or categoryType (e.g., "ipo", "banking-finance", "gst")
- `slug` (path parameter): Service slug (e.g., "gst-registration")

**curl Example:**
```bash
curl -X DELETE http://localhost:4000/api/services/gst/gst-registration
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Service deleted successfully"
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Service not found in the specified category"
}
```

---

## Update and Delete Service by Subcategory

### 10. Update Subcategory Item

**Endpoint:** `PUT /api/services/:category/:subcategory/:slug`

**Description:** Update a service that belongs to a specific subcategory. The service is identified by its slug and verified to belong to the specified category and subcategory.

**Parameters:**
- `category` (path parameter): Category slug, id, or categoryType (e.g., "ipo", "banking-finance")
- `subcategory` (path parameter): Subcategory slug or id (e.g., "financial-due-diligence")
- `slug` (path parameter): Service slug (e.g., "financial-disclosures-notes-preparation")

**Request Body:** (All fields are optional - partial update)
```json
{
  "title": "Financial Disclosures & Notes Preparation - Updated",
  "price": {
    "min": 700000,
    "max": 1600000,
    "currency": "INR"
  },
  "duration": "5-7 weeks",
  "features": [
    "Comprehensive notes to accounts",
    "Segment reporting",
    "Related party disclosures",
    "Enhanced compliance checks"
  ]
}
```

**curl Example:**
```bash
curl -X PUT http://localhost:4000/api/services/ipo/financial-due-diligence/financial-disclosures-notes-preparation \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Financial Disclosures & Notes Preparation - Updated",
    "price": {
      "min": 700000,
      "max": 1600000,
      "currency": "INR"
    },
    "duration": "5-7 weeks",
    "features": [
      "Comprehensive notes to accounts",
      "Segment reporting",
      "Related party disclosures",
      "Enhanced compliance checks"
    ]
  }'
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "694ad0271525812d58764a47",
    "slug": "financial-disclosures-notes-preparation-updated",
    "title": "Financial Disclosures & Notes Preparation - Updated",
    ...
  },
  "message": "Service updated successfully"
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Service not found in the specified subcategory"
}
```

---

### 11. Delete Subcategory Item

**Endpoint:** `DELETE /api/services/:category/:subcategory/:slug`

**Description:** Delete a service that belongs to a specific subcategory. The service is identified by its slug and verified to belong to the specified category and subcategory.

**Parameters:**
- `category` (path parameter): Category slug, id, or categoryType (e.g., "ipo", "banking-finance")
- `subcategory` (path parameter): Subcategory slug or id (e.g., "financial-due-diligence")
- `slug` (path parameter): Service slug (e.g., "financial-disclosures-notes-preparation")

**curl Example:**
```bash
curl -X DELETE http://localhost:4000/api/services/ipo/financial-due-diligence/financial-disclosures-notes-preparation
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Service deleted successfully"
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Service not found in the specified subcategory"
}
```

---

## Update and Delete Service by Category

### 8. Update Category Item

**Endpoint:** `PUT /api/services/:category/:slug`

**Description:** Update a service that belongs to a specific category. The service is identified by its slug and verified to belong to the specified category.

**Parameters:**
- `category` (path parameter): Category slug, id, or categoryType (e.g., "ipo", "banking-finance", "gst")
- `slug` (path parameter): Service slug (e.g., "gst-registration")

**Request Body:** (All fields are optional - partial update)
```json
{
  "title": "GST Registration - Updated",
  "price": {
    "min": 6000,
    "max": 18000,
    "currency": "INR"
  },
  "features": [
    "Document preparation",
    "Online filing",
    "Compliance support",
    "Post-registration support"
  ]
}
```

**curl Example:**
```bash
curl -X PUT http://localhost:4000/api/services/gst/gst-registration \
  -H "Content-Type: application/json" \
  -d '{
    "title": "GST Registration - Updated",
    "price": {
      "min": 6000,
      "max": 18000,
      "currency": "INR"
    },
    "features": [
      "Document preparation",
      "Online filing",
      "Compliance support",
      "Post-registration support"
    ]
  }'
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "694ad0271525812d58764a47",
    "slug": "gst-registration-updated",
    "title": "GST Registration - Updated",
    ...
  },
  "message": "Service updated successfully"
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Service not found in the specified category"
}
```

---

### 9. Delete Category Item

**Endpoint:** `DELETE /api/services/:category/:slug`

**Description:** Delete a service that belongs to a specific category. The service is identified by its slug and verified to belong to the specified category.

**Parameters:**
- `category` (path parameter): Category slug, id, or categoryType (e.g., "ipo", "banking-finance", "gst")
- `slug` (path parameter): Service slug (e.g., "gst-registration")

**curl Example:**
```bash
curl -X DELETE http://localhost:4000/api/services/gst/gst-registration
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Service deleted successfully"
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Service not found in the specified category"
}
```

---

## Update and Delete Service by Subcategory

### 10. Update Subcategory Item

**Endpoint:** `PUT /api/services/:category/:subcategory/:slug`

**Description:** Update a service that belongs to a specific subcategory. The service is identified by its slug and verified to belong to the specified category and subcategory.

**Parameters:**
- `category` (path parameter): Category slug, id, or categoryType (e.g., "ipo", "banking-finance")
- `subcategory` (path parameter): Subcategory slug or id (e.g., "financial-due-diligence")
- `slug` (path parameter): Service slug (e.g., "financial-disclosures-notes-preparation")

**Request Body:** (All fields are optional - partial update)
```json
{
  "title": "Financial Disclosures & Notes Preparation - Updated",
  "price": {
    "min": 700000,
    "max": 1600000,
    "currency": "INR"
  },
  "duration": "5-7 weeks",
  "features": [
    "Comprehensive notes to accounts",
    "Segment reporting",
    "Related party disclosures",
    "Enhanced compliance checks"
  ]
}
```

**curl Example:**
```bash
curl -X PUT http://localhost:4000/api/services/ipo/financial-due-diligence/financial-disclosures-notes-preparation \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Financial Disclosures & Notes Preparation - Updated",
    "price": {
      "min": 700000,
      "max": 1600000,
      "currency": "INR"
    },
    "duration": "5-7 weeks",
    "features": [
      "Comprehensive notes to accounts",
      "Segment reporting",
      "Related party disclosures",
      "Enhanced compliance checks"
    ]
  }'
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "694ad0271525812d58764a47",
    "slug": "financial-disclosures-notes-preparation-updated",
    "title": "Financial Disclosures & Notes Preparation - Updated",
    ...
  },
  "message": "Service updated successfully"
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Service not found in the specified subcategory"
}
```

---

### 11. Delete Subcategory Item

**Endpoint:** `DELETE /api/services/:category/:subcategory/:slug`

**Description:** Delete a service that belongs to a specific subcategory. The service is identified by its slug and verified to belong to the specified category and subcategory.

**Parameters:**
- `category` (path parameter): Category slug, id, or categoryType (e.g., "ipo", "banking-finance")
- `subcategory` (path parameter): Subcategory slug or id (e.g., "financial-due-diligence")
- `slug` (path parameter): Service slug (e.g., "financial-disclosures-notes-preparation")

**curl Example:**
```bash
curl -X DELETE http://localhost:4000/api/services/ipo/financial-due-diligence/financial-disclosures-notes-preparation
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Service deleted successfully"
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Service not found in the specified subcategory"
}
```

---

## Error Handling

All endpoints return standardized error responses:

**Validation Error (400):**
```json
{
  "success": false,
  "message": "Validation error: [field] is required"
}
```

**Not Found Error (404):**
```json
{
  "success": false,
  "message": "[Resource] not found"
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
5. **Check for linked resources:** Before deleting a category, ensure no services are linked to it
6. **Use slugs for readability:** When possible, use slugs instead of MongoDB `_id` for better API usability
7. **Partial updates:** For PUT requests, only send fields you want to update (all fields are optional)

---

## Category Types

Valid `categoryType` values:
- `"simple"` - Simple category type
- `"banking-finance"` - Banking and finance services
- `"ipo"` - IPO-related services
- `"legal"` - Legal services

---

## Notes

- All timestamps are in ISO 8601 format (UTC)
- MongoDB `_id` fields are returned as strings
- Slugs are automatically generated from titles (lowercase, hyphenated)
- When updating a title, the slug is automatically regenerated
- Service categories can have `subServices` array containing service IDs
- Services can be linked to categories via `category` field (ObjectId or string)
- Services can optionally have a `subcategory` field for additional categorization

