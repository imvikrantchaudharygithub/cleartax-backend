# Team API - CRUD Operations cURL Commands

Base URL:
- **Local:** `http://localhost:4000/api/team`
- **Production:** `https://cleartax-backend.vercel.app/api/team`

---

## 1. GET All Team Members

**Endpoint:** `GET /api/team`

**Description:** Retrieve all team members

### cURL Command:
```bash
# Local
curl -X GET http://localhost:4000/api/team

# Production
curl -X GET https://cleartax-backend.vercel.app/api/team
```

### Response Example:
```json
{
  "success": true,
  "data": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "id": "john-doe",
      "name": "John Doe",
      "role": "CEO",
      "description": "Founder and CEO of ClearTax",
      "linkedin": "https://linkedin.com/in/johndoe",
      "avatar": "https://res.cloudinary.com/.../avatar.jpg",
      "accent": "#FF5733",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

---

## 2. GET Team Member by ID

**Endpoint:** `GET /api/team/:id`

**Description:** Retrieve a specific team member by their MongoDB `_id`

### cURL Command:
```bash
# Local
curl -X GET http://localhost:4000/api/team/65a1b2c3d4e5f6g7h8i9j0k1

# Production
curl -X GET https://cleartax-backend.vercel.app/api/team/65a1b2c3d4e5f6g7h8i9j0k1
```

### Response Example:
```json
{
  "success": true,
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "id": "john-doe",
    "name": "John Doe",
    "role": "CEO",
    "description": "Founder and CEO of ClearTax",
    "linkedin": "https://linkedin.com/in/johndoe",
    "avatar": "https://res.cloudinary.com/.../avatar.jpg",
    "accent": "#FF5733",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

## 3. CREATE Team Member

**Endpoint:** `POST /api/team`

**Description:** Create a new team member. Supports both JSON body (with avatar URL) and multipart/form-data (with file upload).

### Option A: With Avatar URL (JSON)

```bash
# Local
curl -X POST http://localhost:4000/api/team \
  -H "Content-Type: application/json" \
  -d '{
    "id": "jane-smith",
    "name": "Jane Smith",
    "role": "CTO",
    "description": "Chief Technology Officer with 10+ years of experience",
    "linkedin": "https://linkedin.com/in/janesmith",
    "avatar": "https://example.com/avatar.jpg",
    "accent": "#3498DB"
  }'

# Production
curl -X POST https://cleartax-backend.vercel.app/api/team \
  -H "Content-Type: application/json" \
  -d '{
    "id": "jane-smith",
    "name": "Jane Smith",
    "role": "CTO",
    "description": "Chief Technology Officer with 10+ years of experience",
    "linkedin": "https://linkedin.com/in/janesmith",
    "avatar": "https://example.com/avatar.jpg",
    "accent": "#3498DB"
  }'
```

### Option B: With File Upload (Multipart Form Data)

```bash
# Local
curl -X POST http://localhost:4000/api/team \
  -F "id=jane-smith" \
  -F "name=Jane Smith" \
  -F "role=CTO" \
  -F "description=Chief Technology Officer with 10+ years of experience" \
  -F "linkedin=https://linkedin.com/in/janesmith" \
  -F "accent=#3498DB" \
  -F "file=@/path/to/avatar.jpg"

# Production
curl -X POST https://cleartax-backend.vercel.app/api/team \
  -F "id=jane-smith" \
  -F "name=Jane Smith" \
  -F "role=CTO" \
  -F "description=Chief Technology Officer with 10+ years of experience" \
  -F "linkedin=https://linkedin.com/in/janesmith" \
  -F "accent=#3498DB" \
  -F "file=@/path/to/avatar.jpg"
```

### Required Fields:
- `id` (string, unique, lowercase) - Team member identifier
- `name` (string, max 100 chars) - Full name
- `role` (string, max 100 chars) - Job title/role
- `description` (string, max 500 chars) - Bio/description
- `linkedin` (string, valid URL) - LinkedIn profile URL

### Optional Fields:
- `avatar` (string, valid URL) - Avatar image URL (if not uploading file)
- `accent` (string) - Accent color code

### Response Example:
```json
{
  "success": true,
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
    "id": "jane-smith",
    "name": "Jane Smith",
    "role": "CTO",
    "description": "Chief Technology Officer with 10+ years of experience",
    "linkedin": "https://linkedin.com/in/janesmith",
    "avatar": "https://res.cloudinary.com/.../uploaded-avatar.jpg",
    "accent": "#3498DB",
    "createdAt": "2024-01-15T11:00:00.000Z",
    "updatedAt": "2024-01-15T11:00:00.000Z"
  },
  "message": "Team member created successfully"
}
```

---

## 4. UPDATE Team Member

**Endpoint:** `PUT /api/team/:id`

**Description:** Update an existing team member by MongoDB `_id`. Supports partial updates and file uploads.

### Option A: Update with JSON (No File Upload)

```bash
# Local
curl -X PUT http://localhost:4000/api/team/65a1b2c3d4e5f6g7h8i9j0k1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe Updated",
    "role": "CEO & Founder",
    "description": "Updated description here",
    "accent": "#FF0000"
  }'

# Production
curl -X PUT https://cleartax-backend.vercel.app/api/team/65a1b2c3d4e5f6g7h8i9j0k1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe Updated",
    "role": "CEO & Founder",
    "description": "Updated description here",
    "accent": "#FF0000"
  }'
```

### Option B: Update with File Upload

```bash
# Local
curl -X PUT http://localhost:4000/api/team/65a1b2c3d4e5f6g7h8i9j0k1 \
  -F "name=John Doe Updated" \
  -F "role=CEO & Founder" \
  -F "description=Updated description here" \
  -F "linkedin=https://linkedin.com/in/johndoe" \
  -F "accent=#FF0000" \
  -F "file=@/path/to/new-avatar.jpg"

# Production
curl -X PUT https://cleartax-backend.vercel.app/api/team/65a1b2c3d4e5f6g7h8i9j0k1 \
  -F "name=John Doe Updated" \
  -F "role=CEO & Founder" \
  -F "description=Updated description here" \
  -F "linkedin=https://linkedin.com/in/johndoe" \
  -F "accent=#FF0000" \
  -F "file=@/path/to/new-avatar.jpg"
```

### Note:
- All fields are optional for updates (partial updates supported)
- If you upload a file, it will replace the existing avatar
- If you don't include a field, it remains unchanged

### Response Example:
```json
{
  "success": true,
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "id": "john-doe",
    "name": "John Doe Updated",
    "role": "CEO & Founder",
    "description": "Updated description here",
    "linkedin": "https://linkedin.com/in/johndoe",
    "avatar": "https://res.cloudinary.com/.../new-avatar.jpg",
    "accent": "#FF0000",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T12:00:00.000Z"
  },
  "message": "Team member updated successfully"
}
```

---

## 5. DELETE Team Member

**Endpoint:** `DELETE /api/team/:id`

**Description:** Delete a team member by MongoDB `_id`

### cURL Command:
```bash
# Local
curl -X DELETE http://localhost:4000/api/team/65a1b2c3d4e5f6g7h8i9j0k1

# Production
curl -X DELETE https://cleartax-backend.vercel.app/api/team/65a1b2c3d4e5f6g7h8i9j0k1
```

### Response Example:
```json
{
  "success": true,
  "message": "Team member deleted successfully"
}
```

---

## Frontend Integration Examples

### JavaScript/Fetch API

#### GET All Team Members
```javascript
const response = await fetch('https://cleartax-backend.vercel.app/api/team');
const data = await response.json();
console.log(data.data); // Array of team members
```

#### GET Team Member by ID
```javascript
const memberId = '65a1b2c3d4e5f6g7h8i9j0k1';
const response = await fetch(`https://cleartax-backend.vercel.app/api/team/${memberId}`);
const data = await response.json();
console.log(data.data); // Team member object
```

#### CREATE Team Member (with file upload)
```javascript
const formData = new FormData();
formData.append('id', 'jane-smith');
formData.append('name', 'Jane Smith');
formData.append('role', 'CTO');
formData.append('description', 'Chief Technology Officer');
formData.append('linkedin', 'https://linkedin.com/in/janesmith');
formData.append('accent', '#3498DB');
formData.append('file', fileInput.files[0]); // File from input element

const response = await fetch('https://cleartax-backend.vercel.app/api/team', {
  method: 'POST',
  body: formData,
});
const data = await response.json();
```

#### UPDATE Team Member
```javascript
const memberId = '65a1b2c3d4e5f6g7h8i9j0k1';
const response = await fetch(`https://cleartax-backend.vercel.app/api/team/${memberId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'John Doe Updated',
    role: 'CEO & Founder',
  }),
});
const data = await response.json();
```

#### DELETE Team Member
```javascript
const memberId = '65a1b2c3d4e5f6g7h8i9j0k1';
const response = await fetch(`https://cleartax-backend.vercel.app/api/team/${memberId}`, {
  method: 'DELETE',
});
const data = await response.json();
```

### Axios Examples

#### GET All Team Members
```javascript
import axios from 'axios';

const response = await axios.get('https://cleartax-backend.vercel.app/api/team');
console.log(response.data.data);
```

#### CREATE Team Member (with file upload)
```javascript
import axios from 'axios';

const formData = new FormData();
formData.append('id', 'jane-smith');
formData.append('name', 'Jane Smith');
formData.append('role', 'CTO');
formData.append('description', 'Chief Technology Officer');
formData.append('linkedin', 'https://linkedin.com/in/janesmith');
formData.append('file', fileInput.files[0]);

const response = await axios.post(
  'https://cleartax-backend.vercel.app/api/team',
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
  "errors": {
    "field": "Field-specific error message"
  }
}
```

### Common Error Codes:
- `400` - Bad Request (validation errors)
- `404` - Not Found (team member not found)
- `409` - Conflict (duplicate `id`)
- `500` - Internal Server Error

---

## Notes

1. **File Upload:** The file field name should be `file` (not `avatar` or `image`)
2. **ID Field:** The `id` field must be unique, lowercase, and is used as a slug/identifier
3. **MongoDB ID:** Use the MongoDB `_id` (not the `id` field) for GET by ID, UPDATE, and DELETE operations
4. **Authentication:** Currently, authentication is disabled. When enabled, you'll need to include an Authorization header:
   ```bash
   -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```

