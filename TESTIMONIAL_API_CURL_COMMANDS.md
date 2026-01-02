# Testimonial API - CRUD Operations cURL Commands

Base URL:
- **Local:** `http://localhost:4000/api/testimonials`
- **Production:** `https://cleartax-backend.vercel.app/api/testimonials`

---

## 1. GET All Testimonials

**Endpoint:** `GET /api/testimonials`

**Description:** Retrieve all testimonials, sorted by order (ascending) then by creation date (descending)

### cURL Command:
```bash
# Local
curl -X GET http://localhost:4000/api/testimonials

# Production
curl -X GET https://cleartax-backend.vercel.app/api/testimonials
```

### Response Example:
```json
{
  "success": true,
  "data": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "id": "verma-associates",
      "companyName": "VermaAssociates",
      "companyLogo": "https://res.cloudinary.com/.../company-logo.jpg",
      "testimonial": "I use ClearTax for all my clients. The accuracy of calculations and the detailed reports help me provide better service. Highly recommended!",
      "personName": "Rahul Verma",
      "personRole": "Tax Consultant",
      "personAvatar": "https://res.cloudinary.com/.../person-avatar.jpg",
      "rating": 5,
      "featured": true,
      "order": 1,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

---

## 2. GET Featured Testimonials

**Endpoint:** `GET /api/testimonials/featured`

**Description:** Retrieve only featured testimonials, sorted by order then creation date

### cURL Command:
```bash
# Local
curl -X GET http://localhost:4000/api/testimonials/featured

# Production
curl -X GET https://cleartax-backend.vercel.app/api/testimonials/featured
```

### Response Example:
```json
{
  "success": true,
  "data": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "id": "verma-associates",
      "companyName": "VermaAssociates",
      "companyLogo": "https://res.cloudinary.com/.../company-logo.jpg",
      "testimonial": "I use ClearTax for all my clients...",
      "personName": "Rahul Verma",
      "personRole": "Tax Consultant",
      "personAvatar": "https://res.cloudinary.com/.../person-avatar.jpg",
      "rating": 5,
      "featured": true,
      "order": 1,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

---

## 3. GET Testimonial by ID

**Endpoint:** `GET /api/testimonials/:id`

**Description:** Retrieve a specific testimonial by its MongoDB `_id`

### cURL Command:
```bash
# Local
curl -X GET http://localhost:4000/api/testimonials/65a1b2c3d4e5f6g7h8i9j0k1

# Production
curl -X GET https://cleartax-backend.vercel.app/api/testimonials/65a1b2c3d4e5f6g7h8i9j0k1
```

### Response Example:
```json
{
  "success": true,
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "id": "verma-associates",
    "companyName": "VermaAssociates",
    "companyLogo": "https://res.cloudinary.com/.../company-logo.jpg",
    "testimonial": "I use ClearTax for all my clients. The accuracy of calculations and the detailed reports help me provide better service. Highly recommended!",
    "personName": "Rahul Verma",
    "personRole": "Tax Consultant",
    "personAvatar": "https://res.cloudinary.com/.../person-avatar.jpg",
    "rating": 5,
    "featured": true,
    "order": 1,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

## 4. CREATE Testimonial

**Endpoint:** `POST /api/testimonials`

**Description:** Create a new testimonial. Supports both JSON body (with image URLs) and multipart/form-data (with file uploads for company logo and/or person avatar).

### Option A: With Image URLs (JSON)

```bash
# Local
curl -X POST http://localhost:4000/api/testimonials \
  -H "Content-Type: application/json" \
  -d '{
    "id": "verma-associates",
    "companyName": "VermaAssociates",
    "companyLogo": "https://example.com/company-logo.jpg",
    "testimonial": "I use ClearTax for all my clients. The accuracy of calculations and the detailed reports help me provide better service. Highly recommended!",
    "personName": "Rahul Verma",
    "personRole": "Tax Consultant",
    "personAvatar": "https://example.com/person-avatar.jpg",
    "rating": 5,
    "featured": true,
    "order": 1
  }'

# Production
curl -X POST https://cleartax-backend.vercel.app/api/testimonials \
  -H "Content-Type: application/json" \
  -d '{
    "id": "verma-associates",
    "companyName": "VermaAssociates",
    "companyLogo": "https://example.com/company-logo.jpg",
    "testimonial": "I use ClearTax for all my clients. The accuracy of calculations and the detailed reports help me provide better service. Highly recommended!",
    "personName": "Rahul Verma",
    "personRole": "Tax Consultant",
    "personAvatar": "https://example.com/person-avatar.jpg",
    "rating": 5,
    "featured": true,
    "order": 1
  }'
```

### Option B: With File Uploads (Multipart Form Data)

```bash
# Local - Upload both company logo and person avatar
curl -X POST http://localhost:4000/api/testimonials \
  -F "id=verma-associates" \
  -F "companyName=VermaAssociates" \
  -F "testimonial=I use ClearTax for all my clients. The accuracy of calculations and the detailed reports help me provide better service. Highly recommended!" \
  -F "personName=Rahul Verma" \
  -F "personRole=Tax Consultant" \
  -F "rating=5" \
  -F "featured=true" \
  -F "order=1" \
  -F "companyLogo=@/path/to/company-logo.jpg" \
  -F "personAvatar=@/path/to/person-avatar.jpg"

# Local - Upload only company logo
curl -X POST http://localhost:4000/api/testimonials \
  -F "id=verma-associates" \
  -F "companyName=VermaAssociates" \
  -F "testimonial=I use ClearTax for all my clients..." \
  -F "personName=Rahul Verma" \
  -F "personRole=Tax Consultant" \
  -F "rating=5" \
  -F "companyLogo=@/path/to/company-logo.jpg"

# Local - Upload only person avatar
curl -X POST http://localhost:4000/api/testimonials \
  -F "id=verma-associates" \
  -F "companyName=VermaAssociates" \
  -F "testimonial=I use ClearTax for all my clients..." \
  -F "personName=Rahul Verma" \
  -F "personRole=Tax Consultant" \
  -F "rating=5" \
  -F "personAvatar=@/path/to/person-avatar.jpg"

# Production
curl -X POST https://cleartax-backend.vercel.app/api/testimonials \
  -F "id=verma-associates" \
  -F "companyName=VermaAssociates" \
  -F "testimonial=I use ClearTax for all my clients. The accuracy of calculations and the detailed reports help me provide better service. Highly recommended!" \
  -F "personName=Rahul Verma" \
  -F "personRole=Tax Consultant" \
  -F "rating=5" \
  -F "featured=true" \
  -F "order=1" \
  -F "companyLogo=@/path/to/company-logo.jpg" \
  -F "personAvatar=@/path/to/person-avatar.jpg"
```

### Required Fields:
- `id` (string, unique, lowercase) - Testimonial identifier
- `companyName` (string, max 100 chars) - Company name
- `testimonial` (string, max 1000 chars) - Testimonial text/quote
- `personName` (string, max 100 chars) - Person's name
- `personRole` (string, max 100 chars) - Person's role/title
- `rating` (number, min 1, max 5) - Star rating (1-5)

### Optional Fields:
- `companyLogo` (string, valid URL) - Company logo URL (if not uploading file)
- `personAvatar` (string, valid URL) - Person's avatar URL (if not uploading file)
- `featured` (boolean, default false) - Featured testimonial flag
- `order` (number, default 0) - Display order for sorting

### File Upload Fields:
- `companyLogo` - File upload for company logo (JPEG, PNG, or WebP)
- `personAvatar` - File upload for person avatar (JPEG, PNG, or WebP)

### Response Example:
```json
{
  "success": true,
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "id": "verma-associates",
    "companyName": "VermaAssociates",
    "companyLogo": "https://res.cloudinary.com/.../uploaded-company-logo.jpg",
    "testimonial": "I use ClearTax for all my clients. The accuracy of calculations and the detailed reports help me provide better service. Highly recommended!",
    "personName": "Rahul Verma",
    "personRole": "Tax Consultant",
    "personAvatar": "https://res.cloudinary.com/.../uploaded-person-avatar.jpg",
    "rating": 5,
    "featured": true,
    "order": 1,
    "createdAt": "2024-01-15T11:00:00.000Z",
    "updatedAt": "2024-01-15T11:00:00.000Z"
  },
  "message": "Testimonial created successfully"
}
```

---

## 5. UPDATE Testimonial

**Endpoint:** `PUT /api/testimonials/:id`

**Description:** Update an existing testimonial by MongoDB `_id`. Supports partial updates and file uploads for both company logo and person avatar.

### Option A: Update with JSON (No File Upload)

```bash
# Local
curl -X PUT http://localhost:4000/api/testimonials/65a1b2c3d4e5f6g7h8i9j0k1 \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "VermaAssociates Updated",
    "testimonial": "Updated testimonial text here",
    "rating": 4,
    "featured": false,
    "order": 2
  }'

# Production
curl -X PUT https://cleartax-backend.vercel.app/api/testimonials/65a1b2c3d4e5f6g7h8i9j0k1 \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "VermaAssociates Updated",
    "testimonial": "Updated testimonial text here",
    "rating": 4,
    "featured": false,
    "order": 2
  }'
```

### Option B: Update with File Uploads

```bash
# Local - Update both images
curl -X PUT http://localhost:4000/api/testimonials/65a1b2c3d4e5f6g7h8i9j0k1 \
  -F "companyName=VermaAssociates Updated" \
  -F "testimonial=Updated testimonial text here" \
  -F "personName=Rahul Verma" \
  -F "personRole=Senior Tax Consultant" \
  -F "rating=5" \
  -F "companyLogoFile=@/path/to/new-company-logo.jpg" \
  -F "personAvatarFile=@/path/to/new-person-avatar.jpg"

# Local - Update only company logo
curl -X PUT http://localhost:4000/api/testimonials/65a1b2c3d4e5f6g7h8i9j0k1 \
  -F "companyName=VermaAssociates Updated" \
  -F "companyLogoFile=@/path/to/new-company-logo.jpg"

# Local - Update only person avatar
curl -X PUT http://localhost:4000/api/testimonials/65a1b2c3d4e5f6g7h8i9j0k1 \
  -F "personName=Rahul Verma Updated" \
  -F "personAvatarFile=@/path/to/new-person-avatar.jpg"

# Production
curl -X PUT https://cleartax-backend.vercel.app/api/testimonials/65a1b2c3d4e5f6g7h8i9j0k1 \
  -F "companyName=VermaAssociates Updated" \
  -F "testimonial=Updated testimonial text here" \
  -F "rating=5" \
  -F "companyLogoFile=@/path/to/new-company-logo.jpg" \
  -F "personAvatarFile=@/path/to/new-person-avatar.jpg"
```

### Note:
- All fields are optional for updates (partial updates supported)
- If you upload a file, it will replace the existing image
- If you don't include a field, it remains unchanged
- You can update company logo and person avatar independently

### Response Example:
```json
{
  "success": true,
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "id": "verma-associates",
    "companyName": "VermaAssociates Updated",
    "companyLogo": "https://res.cloudinary.com/.../new-company-logo.jpg",
    "testimonial": "Updated testimonial text here",
    "personName": "Rahul Verma",
    "personRole": "Senior Tax Consultant",
    "personAvatar": "https://res.cloudinary.com/.../new-person-avatar.jpg",
    "rating": 5,
    "featured": true,
    "order": 1,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T12:00:00.000Z"
  },
  "message": "Testimonial updated successfully"
}
```

---

## 6. DELETE Testimonial

**Endpoint:** `DELETE /api/testimonials/:id`

**Description:** Delete a testimonial by MongoDB `_id`

### cURL Command:
```bash
# Local
curl -X DELETE http://localhost:4000/api/testimonials/65a1b2c3d4e5f6g7h8i9j0k1

# Production
curl -X DELETE https://cleartax-backend.vercel.app/api/testimonials/65a1b2c3d4e5f6g7h8i9j0k1
```

### Response Example:
```json
{
  "success": true,
  "message": "Testimonial deleted successfully"
}
```

---

## Frontend Integration Examples

### JavaScript/Fetch API

#### GET All Testimonials
```javascript
const response = await fetch('https://cleartax-backend.vercel.app/api/testimonials');
const data = await response.json();
console.log(data.data); // Array of testimonials
```

#### GET Featured Testimonials
```javascript
const response = await fetch('https://cleartax-backend.vercel.app/api/testimonials/featured');
const data = await response.json();
console.log(data.data); // Array of featured testimonials
```

#### GET Testimonial by ID
```javascript
const testimonialId = '65a1b2c3d4e5f6g7h8i9j0k1';
const response = await fetch(`https://cleartax-backend.vercel.app/api/testimonials/${testimonialId}`);
const data = await response.json();
console.log(data.data); // Testimonial object
```

#### CREATE Testimonial (with file uploads)
```javascript
const formData = new FormData();
formData.append('id', 'verma-associates');
formData.append('companyName', 'VermaAssociates');
formData.append('testimonial', 'I use ClearTax for all my clients...');
formData.append('personName', 'Rahul Verma');
formData.append('personRole', 'Tax Consultant');
formData.append('rating', '5');
formData.append('featured', 'true');
formData.append('order', '1');
formData.append('companyLogo', companyLogoInput.files[0]); // File from input element
formData.append('personAvatar', personAvatarInput.files[0]); // File from input element

const response = await fetch('https://cleartax-backend.vercel.app/api/testimonials', {
  method: 'POST',
  body: formData,
});
const data = await response.json();
```

#### UPDATE Testimonial
```javascript
const testimonialId = '65a1b2c3d4e5f6g7h8i9j0k1';
const response = await fetch(`https://cleartax-backend.vercel.app/api/testimonials/${testimonialId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    companyName: 'VermaAssociates Updated',
    rating: 5,
  }),
});
const data = await response.json();
```

#### DELETE Testimonial
```javascript
const testimonialId = '65a1b2c3d4e5f6g7h8i9j0k1';
const response = await fetch(`https://cleartax-backend.vercel.app/api/testimonials/${testimonialId}`, {
  method: 'DELETE',
});
const data = await response.json();
```

### Axios Examples

#### GET All Testimonials
```javascript
import axios from 'axios';

const response = await axios.get('https://cleartax-backend.vercel.app/api/testimonials');
console.log(response.data.data);
```

#### CREATE Testimonial (with file uploads)
```javascript
import axios from 'axios';

const formData = new FormData();
formData.append('id', 'verma-associates');
formData.append('companyName', 'VermaAssociates');
formData.append('testimonial', 'I use ClearTax for all my clients...');
formData.append('personName', 'Rahul Verma');
formData.append('personRole', 'Tax Consultant');
formData.append('rating', '5');
formData.append('companyLogoFile', companyLogoInput.files[0]);
formData.append('personAvatarFile', personAvatarInput.files[0]);

const response = await axios.post(
  'https://cleartax-backend.vercel.app/api/testimonials',
  formData,
  {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }
);
```

#### UPDATE Testimonial (with file uploads)
```javascript
import axios from 'axios';

const formData = new FormData();
formData.append('companyName', 'VermaAssociates Updated');
formData.append('rating', '5');
formData.append('companyLogoFile', companyLogoInput.files[0]);
formData.append('personAvatarFile', personAvatarInput.files[0]);

const response = await axios.put(
  'https://cleartax-backend.vercel.app/api/testimonials/65a1b2c3d4e5f6g7h8i9j0k1',
  formData,
  {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }
);
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
      "field": "rating",
      "message": "Rating must be at least 1"
    }
  ]
}
```

### Common Error Codes:
- `400` - Bad Request (validation errors, invalid ID format)
- `404` - Not Found (testimonial not found)
- `409` - Conflict (duplicate `id`)
- `500` - Internal Server Error

---

## Notes

1. **File Upload Fields:** 
   - Use `companyLogo` for company logo uploads
   - Use `personAvatar` for person avatar uploads
   - Both fields are optional - you can upload one, both, or neither
   - Supported formats: JPEG, PNG, WebP
   - Max file size: 10MB

2. **ID Field:** 
   - The `id` field must be unique, lowercase, and is used as a slug/identifier
   - Use the MongoDB `_id` (not the `id` field) for GET by ID, UPDATE, and DELETE operations

3. **Rating:** 
   - Must be a number between 1 and 5 (inclusive)
   - Represents the star rating (1 star to 5 stars)

4. **Sorting:** 
   - Testimonials are sorted by `order` (ascending) first, then by `createdAt` (descending)
   - Use the `order` field to control display order
   - Featured testimonials can be retrieved separately using `/featured` endpoint

5. **Authentication:** 
   - Currently, authentication is disabled. When enabled, you'll need to include an Authorization header:
   ```bash
   -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```

6. **File Upload Strategy:**
   - You can mix and match: provide URLs in JSON, upload files, or do both
   - If both URL and file are provided, the uploaded file takes precedence
   - Files are uploaded to Cloudinary and the secure URL is stored in the database

