# Backend API Requirements: Contact Information Management

## Overview
Create a RESTful API endpoint for managing business contact information that will be displayed on the client-side website. This is a single-document resource (not a collection) that stores all contact details in one record.

## API Endpoints

### 1. GET /api/contact
**Description:** Retrieve the current contact information

**Method:** `GET`

**URL:** `/api/contact`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "phone": "+91 1234567890",
    "whatsapp": "+91 1234567890",
    "email": "contact@cleartax.com",
    "address": "123 Business Street, City, State, PIN Code",
    "location": "Mumbai, Maharashtra",
    "website": "https://www.cleartax.com",
    "socialMedia": {
      "facebook": "https://www.facebook.com/cleartax",
      "twitter": "https://twitter.com/cleartax",
      "linkedin": "https://www.linkedin.com/company/cleartax",
      "instagram": "https://www.instagram.com/cleartax",
      "youtube": "https://www.youtube.com/@cleartax",
      "github": "https://github.com/cleartax"
    },
    "businessHours": {
      "monday": { "open": "09:00", "close": "18:00", "closed": false },
      "tuesday": { "open": "09:00", "close": "18:00", "closed": false },
      "wednesday": { "open": "09:00", "close": "18:00", "closed": false },
      "thursday": { "open": "09:00", "close": "18:00", "closed": false },
      "friday": { "open": "09:00", "close": "18:00", "closed": false },
      "saturday": { "open": "10:00", "close": "14:00", "closed": false },
      "sunday": { "open": "", "close": "", "closed": true }
    },
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Response (404 Not Found) - If no contact info exists:**
```json
{
  "success": false,
  "message": "Contact information not found"
}
```

---

### 2. PUT /api/contact
**Description:** Create or update contact information (Admin only)

**Method:** `PUT`

**URL:** `/api/contact`

**Request Body:**
```json
{
  "phone": "+91 1234567890",
  "whatsapp": "+91 1234567890",
  "email": "contact@cleartax.com",
  "address": "123 Business Street, City, State, PIN Code",
  "location": "Mumbai, Maharashtra",
  "website": "https://www.cleartax.com",
  "socialMedia": {
    "facebook": "https://www.facebook.com/cleartax",
    "twitter": "https://twitter.com/cleartax",
    "linkedin": "https://www.linkedin.com/company/cleartax",
    "instagram": "https://www.instagram.com/cleartax",
    "youtube": "https://www.youtube.com/@cleartax",
    "github": "https://github.com/cleartax"
  },
  "businessHours": {
    "monday": { "open": "09:00", "close": "18:00", "closed": false },
    "tuesday": { "open": "09:00", "close": "18:00", "closed": false },
    "wednesday": { "open": "09:00", "close": "18:00", "closed": false },
    "thursday": { "open": "09:00", "close": "18:00", "closed": false },
    "friday": { "open": "09:00", "close": "18:00", "closed": false },
    "saturday": { "open": "10:00", "close": "14:00", "closed": false },
    "sunday": { "open": "", "close": "", "closed": true }
  }
}
```

**Validation Rules:**
- `phone` (required, string): Phone number
- `whatsapp` (required, string): WhatsApp number
- `email` (required, string, valid email format): Email address
- `address` (required, string, max 500 chars): Full address
- `location` (optional, string, max 200 chars): City/Area location
- `website` (optional, string, valid URL): Website URL
- `socialMedia` (optional, object): Social media links
  - `facebook` (optional, string, valid URL): Facebook page URL
  - `twitter` (optional, string, valid URL): Twitter/X profile URL
  - `linkedin` (optional, string, valid URL): LinkedIn company/profile URL
  - `instagram` (optional, string, valid URL): Instagram profile URL
  - `youtube` (optional, string, valid URL): YouTube channel URL
  - `github` (optional, string, valid URL): GitHub profile/organization URL
- `businessHours` (required, object):
  - Each day (monday-sunday) must have:
    - `open` (string, format "HH:mm"): Opening time (required if not closed)
    - `close` (string, format "HH:mm"): Closing time (required if not closed)
    - `closed` (boolean): Whether the day is closed
  - If `closed` is `true`, `open` and `close` can be empty strings
  - If `closed` is `false`, `open` and `close` must be valid time strings

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "phone": "+91 1234567890",
    "whatsapp": "+91 1234567890",
    "email": "contact@cleartax.com",
    "address": "123 Business Street, City, State, PIN Code",
    "location": "Mumbai, Maharashtra",
    "website": "https://www.cleartax.com",
    "socialMedia": {
      "facebook": "https://www.facebook.com/cleartax",
      "twitter": "https://twitter.com/cleartax",
      "linkedin": "https://www.linkedin.com/company/cleartax",
      "instagram": "https://www.instagram.com/cleartax",
      "youtube": "https://www.youtube.com/@cleartax",
      "github": "https://github.com/cleartax"
    },
    "businessHours": {
      "monday": { "open": "09:00", "close": "18:00", "closed": false },
      "tuesday": { "open": "09:00", "close": "18:00", "closed": false },
      "wednesday": { "open": "09:00", "close": "18:00", "closed": false },
      "thursday": { "open": "09:00", "close": "18:00", "closed": false },
      "friday": { "open": "09:00", "close": "18:00", "closed": false },
      "saturday": { "open": "10:00", "close": "14:00", "closed": false },
      "sunday": { "open": "", "close": "", "closed": true }
    },
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T12:00:00.000Z"
  },
  "message": "Contact information updated successfully"
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "body.phone",
      "message": "Phone number is required"
    },
    {
      "field": "body.businessHours.monday.open",
      "message": "Open time is required when day is not closed"
    }
  ]
}
```

---

## Database Schema

### Contact Collection/Table
```javascript
{
  _id: ObjectId,
  phone: String (required),
  whatsapp: String (required),
  email: String (required, unique),
  address: String (required),
  location: String (optional),
  website: String (optional),
  socialMedia: {
    facebook: String (optional),
    twitter: String (optional),
    linkedin: String (optional),
    instagram: String (optional),
    youtube: String (optional),
    github: String (optional)
  },
  businessHours: {
    monday: { open: String, close: String, closed: Boolean },
    tuesday: { open: String, close: String, closed: Boolean },
    wednesday: { open: String, close: String, closed: Boolean },
    thursday: { open: String, close: String, closed: Boolean },
    friday: { open: String, close: String, closed: Boolean },
    saturday: { open: String, close: String, closed: Boolean },
    sunday: { open: String, close: String, closed: Boolean }
  },
  createdAt: Date,
  updatedAt: Date
}
```

**Note:** Since this is a single-document resource, you can either:
1. Store only one document in the collection (upsert on PUT)
2. Use a singleton pattern with a fixed `_id` or identifier

---

## Implementation Notes

1. **Single Document Resource:** This should be a singleton - only one contact information record should exist. On PUT, if no record exists, create it; if it exists, update it.

2. **Business Hours Validation:**
   - If `closed: true`, `open` and `close` can be empty strings
   - If `closed: false`, both `open` and `close` must be provided and in "HH:mm" format
   - Validate that `close` time is after `open` time for each day

3. **Time Format:** All times should be in 24-hour format (HH:mm), e.g., "09:00", "18:00", "14:30"

4. **Authentication:** PUT endpoint should require admin authentication (same as other admin endpoints)

5. **Error Handling:** Return proper HTTP status codes:
   - 200: Success
   - 400: Validation error
   - 401: Unauthorized
   - 404: Not found (for GET if no data exists)
   - 500: Server error

6. **CORS:** Ensure CORS is properly configured for the frontend domain

---

## Example cURL Commands

### GET Contact Information
```bash
curl -X GET http://localhost:4000/api/contact
```

### Update Contact Information
```bash
curl -X PUT http://localhost:4000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+91 1234567890",
    "whatsapp": "+91 1234567890",
    "email": "contact@cleartax.com",
    "address": "123 Business Street, Mumbai, Maharashtra, 400001",
    "location": "Mumbai, Maharashtra",
    "website": "https://www.cleartax.com",
    "socialMedia": {
      "facebook": "https://www.facebook.com/cleartax",
      "twitter": "https://twitter.com/cleartax",
      "linkedin": "https://www.linkedin.com/company/cleartax",
      "instagram": "https://www.instagram.com/cleartax",
      "youtube": "https://www.youtube.com/@cleartax",
      "github": "https://github.com/cleartax"
    },
    "businessHours": {
      "monday": { "open": "09:00", "close": "18:00", "closed": false },
      "tuesday": { "open": "09:00", "close": "18:00", "closed": false },
      "wednesday": { "open": "09:00", "close": "18:00", "closed": false },
      "thursday": { "open": "09:00", "close": "18:00", "closed": false },
      "friday": { "open": "09:00", "close": "18:00", "closed": false },
      "saturday": { "open": "10:00", "close": "14:00", "closed": false },
      "sunday": { "open": "", "close": "", "closed": true }
    }
  }'
```

---

## Frontend Integration

The frontend is already set up to consume these APIs:
- Service: `contactService.get()` and `contactService.update()`
- Types: `ContactInfo` interface
- Admin Page: `/admin/contact`

Once the backend APIs are implemented, the frontend will automatically work without any changes.

