# Contact API - CRUD Operations cURL Commands

Base URL:
- **Local:** `http://localhost:4000/api/contact`
- **Production:** `https://cleartax-backend.vercel.app/api/contact`

---

## Overview

The Contact API manages business contact information as a **single-document resource** (singleton pattern). Only one contact information record exists in the database. The PUT endpoint creates the record if it doesn't exist, or updates it if it does.

---

## 1. GET Contact Information

**Endpoint:** `GET /api/contact`

**Description:** Retrieve the current contact information

### cURL Command:
```bash
# Local
curl -X GET http://localhost:4000/api/contact

# Production
curl -X GET https://cleartax-backend.vercel.app/api/contact
```

### Response Example (200 OK):
```json
{
  "success": true,
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
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

### Response Example (404 Not Found):
```json
{
  "success": false,
  "message": "Contact information not found"
}
```

---

## 2. UPDATE/CREATE Contact Information

**Endpoint:** `PUT /api/contact`

**Description:** Create or update contact information. If no contact information exists, it will be created. If it exists, it will be updated.

### cURL Command:
```bash
# Local
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

# Production
curl -X PUT https://cleartax-backend.vercel.app/api/contact \
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

### Required Fields:
- `phone` (string) - Phone number
- `whatsapp` (string) - WhatsApp number
- `email` (string, valid email format) - Email address
- `address` (string, max 500 chars) - Full address
- `businessHours` (object) - Business hours for all days

### Optional Fields:
- `location` (string, max 200 chars) - City/Area location
- `website` (string, valid URL) - Website URL
- `socialMedia` (object) - Social media links
  - `facebook` (optional, string, valid URL)
  - `twitter` (optional, string, valid URL)
  - `linkedin` (optional, string, valid URL)
  - `instagram` (optional, string, valid URL)
  - `youtube` (optional, string, valid URL)
  - `github` (optional, string, valid URL)

### Business Hours Validation:
Each day (monday-sunday) must have:
- `open` (string) - Opening time in "HH:mm" format (required if not closed)
- `close` (string) - Closing time in "HH:mm" format (required if not closed)
- `closed` (boolean) - Whether the day is closed

**Rules:**
- If `closed: true`, `open` and `close` can be empty strings
- If `closed: false`, both `open` and `close` must be provided in "HH:mm" format
- `close` time must be after `open` time for each day

### Response Example (200 OK):
```json
{
  "success": true,
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
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
    },
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T12:00:00.000Z"
  },
  "message": "Contact information updated successfully"
}
```

### Error Response (400 Bad Request):
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
      "field": "body.email",
      "message": "Invalid email format"
    },
    {
      "field": "body.businessHours.monday.open",
      "message": "Open and close times are required when day is not closed and must be in HH:mm format"
    },
    {
      "field": "body.businessHours.monday.close",
      "message": "Close time must be after open time"
    }
  ]
}
```

---

## Frontend Integration Examples

### JavaScript/Fetch API

#### GET Contact Information
```javascript
const response = await fetch('https://cleartax-backend.vercel.app/api/contact');
const data = await response.json();

if (data.success) {
  console.log(data.data); // Contact information object
} else {
  console.error('Contact information not found');
}
```

#### UPDATE Contact Information
```javascript
const contactData = {
  phone: "+91 1234567890",
  whatsapp: "+91 1234567890",
  email: "contact@cleartax.com",
  address: "123 Business Street, Mumbai, Maharashtra, 400001",
  location: "Mumbai, Maharashtra",
  website: "https://www.cleartax.com",
  socialMedia: {
    facebook: "https://www.facebook.com/cleartax",
    twitter: "https://twitter.com/cleartax",
    linkedin: "https://www.linkedin.com/company/cleartax",
    instagram: "https://www.instagram.com/cleartax",
    youtube: "https://www.youtube.com/@cleartax",
    github: "https://github.com/cleartax"
  },
  businessHours: {
    monday: { open: "09:00", close: "18:00", closed: false },
    tuesday: { open: "09:00", close: "18:00", closed: false },
    wednesday: { open: "09:00", close: "18:00", closed: false },
    thursday: { open: "09:00", close: "18:00", closed: false },
    friday: { open: "09:00", close: "18:00", closed: false },
    saturday: { open: "10:00", close: "14:00", closed: false },
    sunday: { open: "", close: "", closed: true }
  }
};

const response = await fetch('https://cleartax-backend.vercel.app/api/contact', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(contactData),
});

const data = await response.json();
if (data.success) {
  console.log('Contact information updated:', data.data);
} else {
  console.error('Update failed:', data.message);
}
```

### Axios Examples

#### GET Contact Information
```javascript
import axios from 'axios';

try {
  const response = await axios.get('https://cleartax-backend.vercel.app/api/contact');
  console.log(response.data.data); // Contact information object
} catch (error) {
  if (error.response?.status === 404) {
    console.error('Contact information not found');
  } else {
    console.error('Error fetching contact information:', error);
  }
}
```

#### UPDATE Contact Information
```javascript
import axios from 'axios';

const contactData = {
  phone: "+91 1234567890",
  whatsapp: "+91 1234567890",
  email: "contact@cleartax.com",
  address: "123 Business Street, Mumbai, Maharashtra, 400001",
  location: "Mumbai, Maharashtra",
  website: "https://www.cleartax.com",
  socialMedia: {
    facebook: "https://www.facebook.com/cleartax",
    twitter: "https://twitter.com/cleartax",
    linkedin: "https://www.linkedin.com/company/cleartax",
    instagram: "https://www.instagram.com/cleartax",
    youtube: "https://www.youtube.com/@cleartax",
    github: "https://github.com/cleartax"
  },
  businessHours: {
    monday: { open: "09:00", close: "18:00", closed: false },
    tuesday: { open: "09:00", close: "18:00", closed: false },
    wednesday: { open: "09:00", close: "18:00", closed: false },
    thursday: { open: "09:00", close: "18:00", closed: false },
    friday: { open: "09:00", close: "18:00", closed: false },
    saturday: { open: "10:00", close: "14:00", closed: false },
    sunday: { open: "", close: "", closed: true }
  }
};

try {
  const response = await axios.put(
    'https://cleartax-backend.vercel.app/api/contact',
    contactData
  );
  console.log('Contact information updated:', response.data.data);
} catch (error) {
  if (error.response?.status === 400) {
    console.error('Validation errors:', error.response.data.errors);
  } else {
    console.error('Error updating contact information:', error);
  }
}
```

---

## Error Responses

All endpoints return errors in the following format:

```json
{
  "success": false,
  "message": "Error message here",
  "errors": [
    {
      "field": "body.phone",
      "message": "Phone number is required"
    }
  ]
}
```

### Common Error Codes:
- `400` - Bad Request (validation errors)
- `404` - Not Found (contact information not found for GET)
- `401` - Unauthorized (when authentication is enabled)
- `500` - Internal Server Error

---

## Notes

1. **Singleton Pattern:** 
   - Only one contact information record exists in the database
   - PUT endpoint uses upsert logic: creates if doesn't exist, updates if exists
   - No need to specify an ID when updating

2. **Business Hours:**
   - Time format: 24-hour format "HH:mm" (e.g., "09:00", "18:00", "14:30")
   - If a day is closed (`closed: true`), `open` and `close` can be empty strings
   - If a day is open (`closed: false`), both `open` and `close` must be provided
   - Close time must be after open time for each day

3. **Social Media Links:**
   - All social media fields are optional
   - If provided, must be valid URLs
   - You can provide any combination of social media links

4. **Email:**
   - Email must be unique (enforced at database level)
   - Email is automatically converted to lowercase

5. **Authentication:** 
   - Currently, authentication is disabled. When enabled, PUT endpoint will require admin authentication:
   ```bash
   -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```

6. **Partial Updates:**
   - The PUT endpoint requires all required fields
   - To update only specific fields, you must include all required fields in the request

---

## Example: Minimal Contact Information

```bash
curl -X PUT http://localhost:4000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+91 1234567890",
    "whatsapp": "+91 1234567890",
    "email": "contact@cleartax.com",
    "address": "123 Business Street, Mumbai, Maharashtra, 400001",
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

## Example: Complete Contact Information with All Fields

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

