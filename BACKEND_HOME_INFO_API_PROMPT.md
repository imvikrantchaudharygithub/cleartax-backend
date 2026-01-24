# Backend API Requirements: Home Info Management

## Overview
Create a RESTful API endpoint for managing homepage content that will be displayed on the client-side website. This is a single-document resource (not a collection) that stores all homepage content in one record.

## API Endpoints

### 1. GET /api/home-info
**Description:** Retrieve the current home info content

**Method:** `GET`

**URL:** `/api/home-info`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "banner": {
      "heading": "Your Complete Tax & Compliance Solution",
      "description": "Calculate, Comply, and Save with Confidence. Professional tax calculators, compliance dashboard, and expert guidance all in one place.",
      "button1Text": "Request Callback",
      "button2Text": "Connect on WhatsApp",
      "checklistItems": [
        "10M+ Invoices Processed",
        "50K+ Businesses Trust Us",
        "100% Accurate Calculations"
      ],
      "heroImage": "https://example.com/images/hero.jpg",
      "heroImageAlt": "Tax Solutions"
    },
    "benefits": {
      "heading": "Why Choose ClearTax?",
      "subheading": "All our products are designed to deliver exceptional value",
      "items": [
        {
          "title": "Maximum Tax Savings",
          "description": "Businesses save up to 2-7% of their net GST with us every month. Individuals can save up to ₹86,500 by filing their tax returns through our platform.",
          "image": "https://example.com/images/benefit1.jpg",
          "imagePosition": "right",
          "imageAlt": "Tax Savings"
        },
        {
          "title": "Unparalleled Speed",
          "description": "Experience 3x faster GST filings, 5x faster invoice reconciliation, and 10x faster e-waybill generation. Individuals file their tax returns in under 3 minutes.",
          "image": "https://example.com/images/benefit2.jpg",
          "imagePosition": "left",
          "imageAlt": "Speed"
        },
        {
          "title": "Accurate Compliance",
          "description": "Our products are designed and tested by in-house tax experts, ensuring every new clause, form, or feature is updated and sent to you over the cloud.",
          "image": "https://example.com/images/benefit3.jpg",
          "imagePosition": "right",
          "imageAlt": "Compliance"
        }
      ]
    },
    "services": {
      "heading": "Professional Services",
      "subheading": "From business registration to tax compliance, we handle all your professional service needs with expert guidance",
      "cards": [
        {
          "title": "GST Services",
          "description": "Complete GST registration, filing, and compliance solutions for your business.",
          "features": [
            "GST Registration",
            "Return Filing",
            "Annual Returns",
            "LUT Filing"
          ],
          "href": "/services/gst",
          "icon": "Receipt",
          "colorGradient": "from-accent to-primary"
        },
        {
          "title": "Business Registration",
          "description": "Start your business with expert guidance on company formation and registration.",
          "features": [
            "Private Limited",
            "LLP Registration",
            "OPC Formation",
            "Proprietorship"
          ],
          "href": "/services/registration",
          "icon": "Building2",
          "colorGradient": "from-primary to-accent"
        },
        {
          "title": "Income Tax Services",
          "description": "Expert income tax filing and compliance for individuals and businesses.",
          "features": [
            "ITR Filing",
            "TDS Returns",
            "Tax Planning",
            "Notice Handling"
          ],
          "href": "/services/income-tax",
          "icon": "Calculator",
          "colorGradient": "from-success to-primary"
        },
        {
          "title": "Trademark & IP",
          "description": "Protect your brand with trademark registration and IP services.",
          "features": [
            "Trademark Registration",
            "Copyright",
            "Patent Filing",
            "Design Registration"
          ],
          "href": "/services/trademarks",
          "icon": "Award",
          "colorGradient": "from-warning to-accent"
        }
      ],
      "ctaButtonText": "View All Services",
      "ctaButtonLink": "/services"
    },
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Home info not found"
}
```

### 2. PUT /api/home-info
**Description:** Update home info content (Admin only)

**Method:** `PUT`

**URL:** `/api/home-info`

**Authentication:** Required (Admin only)

**Content-Type:** 
- `application/json` (for text-only updates)
- `multipart/form-data` (for updates with image uploads)

**Request Body (JSON):**
```json
{
  "banner": {
    "heading": "Your Complete Tax & Compliance Solution",
    "description": "Calculate, Comply, and Save with Confidence. Professional tax calculators, compliance dashboard, and expert guidance all in one place.",
    "button1Text": "Request Callback",
    "button2Text": "Connect on WhatsApp",
    "checklistItems": [
      "10M+ Invoices Processed",
      "50K+ Businesses Trust Us",
      "100% Accurate Calculations"
    ],
    "heroImage": "https://example.com/images/hero.jpg",
    "heroImageAlt": "Tax Solutions"
  },
  "benefits": {
    "heading": "Why Choose ClearTax?",
    "subheading": "All our products are designed to deliver exceptional value",
    "items": [
      {
        "title": "Maximum Tax Savings",
        "description": "Businesses save up to 2-7% of their net GST with us every month. Individuals can save up to ₹86,500 by filing their tax returns through our platform.",
        "image": "https://example.com/images/benefit1.jpg",
        "imagePosition": "right",
        "imageAlt": "Tax Savings"
      },
      {
        "title": "Unparalleled Speed",
        "description": "Experience 3x faster GST filings, 5x faster invoice reconciliation, and 10x faster e-waybill generation. Individuals file their tax returns in under 3 minutes.",
        "image": "https://example.com/images/benefit2.jpg",
        "imagePosition": "left",
        "imageAlt": "Speed"
      },
      {
        "title": "Accurate Compliance",
        "description": "Our products are designed and tested by in-house tax experts, ensuring every new clause, form, or feature is updated and sent to you over the cloud.",
        "image": "https://example.com/images/benefit3.jpg",
        "imagePosition": "right",
        "imageAlt": "Compliance"
      }
    ]
  },
  "services": {
    "heading": "Professional Services",
    "subheading": "From business registration to tax compliance, we handle all your professional service needs with expert guidance",
    "cards": [
      {
        "title": "GST Services",
        "description": "Complete GST registration, filing, and compliance solutions for your business.",
        "features": [
          "GST Registration",
          "Return Filing",
          "Annual Returns",
          "LUT Filing"
        ],
        "href": "/services/gst",
        "icon": "Receipt",
        "colorGradient": "from-accent to-primary"
      },
      {
        "title": "Business Registration",
        "description": "Start your business with expert guidance on company formation and registration.",
        "features": [
          "Private Limited",
          "LLP Registration",
          "OPC Formation",
          "Proprietorship"
        ],
        "href": "/services/registration",
        "icon": "Building2",
        "colorGradient": "from-primary to-accent"
      },
      {
        "title": "Income Tax Services",
        "description": "Expert income tax filing and compliance for individuals and businesses.",
        "features": [
          "ITR Filing",
          "TDS Returns",
          "Tax Planning",
          "Notice Handling"
        ],
        "href": "/services/income-tax",
        "icon": "Calculator",
        "colorGradient": "from-success to-primary"
      },
      {
        "title": "Trademark & IP",
        "description": "Protect your brand with trademark registration and IP services.",
        "features": [
          "Trademark Registration",
          "Copyright",
          "Patent Filing",
          "Design Registration"
        ],
        "href": "/services/trademarks",
        "icon": "Award",
        "colorGradient": "from-warning to-accent"
      }
    ],
    "ctaButtonText": "View All Services",
    "ctaButtonLink": "/services"
  }
}
```

**Request Body (FormData - when uploading images):**
The frontend sends FormData with nested field names using bracket notation:
- `banner[heading]`
- `banner[description]`
- `banner[button1Text]`
- `banner[button2Text]`
- `banner[checklistItems][0]`
- `banner[checklistItems][1]`
- `banner[checklistItems][2]`
- `banner[heroImage]` (URL string, if not uploading file)
- `banner[heroImageFile]` (File object, if uploading)
- `banner[heroImageAlt]`
- `benefits[heading]`
- `benefits[subheading]`
- `benefits[items][0][title]`
- `benefits[items][0][description]`
- `benefits[items][0][image]` (URL string, if not uploading file)
- `benefits[items][0][imageFile]` (File object, if uploading)
- `benefits[items][0][imagePosition]`
- `benefits[items][0][imageAlt]`
- `benefits[items][1][title]`
- `benefits[items][1][description]`
- `benefits[items][1][image]` (URL string, if not uploading file)
- `benefits[items][1][imageFile]` (File object, if uploading)
- `benefits[items][1][imagePosition]`
- `benefits[items][1][imageAlt]`
- `benefits[items][2][title]`
- `benefits[items][2][description]`
- `benefits[items][2][image]` (URL string, if not uploading file)
- `benefits[items][2][imageFile]` (File object, if uploading)
- `benefits[items][2][imagePosition]`
- `benefits[items][2][imageAlt]`
- `services[heading]`
- `services[subheading]`
- `services[cards][0][title]`
- `services[cards][0][description]`
- `services[cards][0][href]`
- `services[cards][0][icon]`
- `services[cards][0][colorGradient]`
- `services[cards][0][features][0]`
- `services[cards][0][features][1]`
- `services[cards][0][features][2]`
- `services[cards][0][features][3]`
- (Repeat for cards[1], cards[2], cards[3])
- `services[ctaButtonText]`
- `services[ctaButtonLink]`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Home info updated successfully",
  "data": {
    // Same structure as GET response with updated data
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "banner.heading",
      "message": "Heading is required"
    },
    {
      "field": "banner.checklistItems",
      "message": "Exactly 3 checklist items are required"
    }
  ]
}
```

## Validation Rules

### Banner Section
- `heading`: Required, string, max 200 characters
- `description`: Required, string, max 500 characters
- `button1Text`: Required, string, max 50 characters
- `button2Text`: Required, string, max 50 characters
- `checklistItems`: Required, array of exactly 3 strings, each max 100 characters
- `heroImage`: Optional, string (URL), must be valid URL if provided
- `heroImageAlt`: Optional, string, max 200 characters

### Benefits Section
- `heading`: Required, string, max 200 characters
- `subheading`: Required, string, max 300 characters
- `items`: Required, array of exactly 3 objects
  - Each item:
    - `title`: Required, string, max 100 characters
    - `description`: Required, string, max 500 characters
    - `image`: Optional, string (URL), must be valid URL if provided
    - `imagePosition`: Required, enum: "left" | "right"
    - `imageAlt`: Optional, string, max 200 characters

### Services Section
- `heading`: Required, string, max 200 characters
- `subheading`: Required, string, max 300 characters
- `cards`: Required, array of exactly 4 objects
  - Each card:
    - `title`: Required, string, max 100 characters
    - `description`: Required, string, max 300 characters
    - `features`: Required, array of strings, each max 100 characters, minimum 1 feature
    - `href`: Required, string, must start with "/"
    - `icon`: Required, enum: "Receipt" | "Building2" | "Calculator" | "Award"
    - `colorGradient`: Required, string, must match pattern: `from-{color} to-{color}`
- `ctaButtonText`: Required, string, max 50 characters
- `ctaButtonLink`: Required, string, must start with "/"

## Image Upload Handling

When FormData is received with image files:
1. Validate file types: Only accept `image/jpeg`, `image/png`, `image/webp`, `image/gif`
2. Validate file size: Maximum 5MB per image
3. Process and store images:
   - Generate unique filename (e.g., `hero-{timestamp}-{random}.jpg`)
   - Save to configured storage (local filesystem, S3, Cloudinary, etc.)
   - Return public URL for the stored image
4. Update the corresponding field in the database with the image URL
5. If an existing image URL is provided (not a file), keep it as-is

**Image Fields:**
- `banner[heroImageFile]` → stored as `banner.heroImage`
- `benefits[items][0][imageFile]` → stored as `benefits.items[0].image`
- `benefits[items][1][imageFile]` → stored as `benefits.items[1].image`
- `benefits[items][2][imageFile]` → stored as `benefits.items[2].image`

## Database Schema

### HomeInfo Collection/Table
```javascript
{
  _id: ObjectId,
  banner: {
    heading: String (required),
    description: String (required),
    button1Text: String (required),
    button2Text: String (required),
    checklistItems: [String] (required, exactly 3 items),
    heroImage: String (optional, URL),
    heroImageAlt: String (optional)
  },
  benefits: {
    heading: String (required),
    subheading: String (required),
    items: [
      {
        title: String (required),
        description: String (required),
        image: String (optional, URL),
        imagePosition: String (required, enum: "left" | "right"),
        imageAlt: String (optional)
      }
    ] (required, exactly 3 items)
  },
  services: {
    heading: String (required),
    subheading: String (required),
    cards: [
      {
        title: String (required),
        description: String (required),
        features: [String] (required, minimum 1),
        href: String (required),
        icon: String (required, enum: "Receipt" | "Building2" | "Calculator" | "Award"),
        colorGradient: String (required)
      }
    ] (required, exactly 4 items),
    ctaButtonText: String (required),
    ctaButtonLink: String (required)
  },
  createdAt: Date,
  updatedAt: Date
}
```

## Implementation Notes

1. **Single Document Pattern**: This is a single-document resource. There should only be one home info record in the database. On first PUT request, create the document. On subsequent PUT requests, update the existing document.

2. **Partial Updates**: The PUT endpoint should support partial updates. If a section is not provided in the request, keep the existing values for that section.

3. **Image Storage**: 
   - Store images in a dedicated directory (e.g., `/uploads/home-info/`)
   - Use a CDN or cloud storage for production
   - Delete old images when new ones are uploaded (optional but recommended)

4. **FormData Parsing**: When receiving FormData, parse nested fields using bracket notation:
   - `banner[heading]` → `banner.heading`
   - `benefits[items][0][title]` → `benefits.items[0].title`
   - Use a library like `multer` (Node.js/Express) or `formidable` to handle multipart/form-data

5. **Error Handling**: Return specific validation errors for each field to help the frontend display appropriate error messages.

## cURL Examples

### GET Home Info
```bash
curl -X GET \
  https://your-api-domain.com/api/home-info \
  -H 'Content-Type: application/json'
```

### Update Home Info (JSON)
```bash
curl -X PUT \
  https://your-api-domain.com/api/home-info \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_ADMIN_TOKEN' \
  -d '{
    "banner": {
      "heading": "Your Complete Tax & Compliance Solution",
      "description": "Calculate, Comply, and Save with Confidence.",
      "button1Text": "Request Callback",
      "button2Text": "Connect on WhatsApp",
      "checklistItems": [
        "10M+ Invoices Processed",
        "50K+ Businesses Trust Us",
        "100% Accurate Calculations"
      ],
      "heroImage": "https://example.com/images/hero.jpg",
      "heroImageAlt": "Tax Solutions"
    }
  }'
```

### Update Home Info (FormData with Images)
```bash
curl -X PUT \
  https://your-api-domain.com/api/home-info \
  -H 'Authorization: Bearer YOUR_ADMIN_TOKEN' \
  -F 'banner[heading]=Your Complete Tax & Compliance Solution' \
  -F 'banner[description]=Calculate, Comply, and Save with Confidence.' \
  -F 'banner[button1Text]=Request Callback' \
  -F 'banner[button2Text]=Connect on WhatsApp' \
  -F 'banner[checklistItems][0]=10M+ Invoices Processed' \
  -F 'banner[checklistItems][1]=50K+ Businesses Trust Us' \
  -F 'banner[checklistItems][2]=100% Accurate Calculations' \
  -F 'banner[heroImageFile]=@/path/to/hero-image.jpg' \
  -F 'banner[heroImageAlt]=Tax Solutions' \
  -F 'benefits[heading]=Why Choose ClearTax?' \
  -F 'benefits[subheading]=All our products are designed to deliver exceptional value' \
  -F 'benefits[items][0][title]=Maximum Tax Savings' \
  -F 'benefits[items][0][description]=Businesses save up to 2-7% of their net GST...' \
  -F 'benefits[items][0][imagePosition]=right' \
  -F 'benefits[items][0][imageFile]=@/path/to/benefit1.jpg' \
  -F 'benefits[items][0][imageAlt]=Tax Savings'
```

## Testing Checklist

- [ ] GET endpoint returns 404 if no home info exists
- [ ] GET endpoint returns home info if it exists
- [ ] PUT endpoint creates home info if it doesn't exist
- [ ] PUT endpoint updates existing home info
- [ ] PUT endpoint validates all required fields
- [ ] PUT endpoint validates array lengths (3 checklist items, 3 benefit items, 4 service cards)
- [ ] PUT endpoint handles image uploads correctly
- [ ] PUT endpoint returns image URLs after upload
- [ ] PUT endpoint supports partial updates
- [ ] PUT endpoint requires admin authentication
- [ ] FormData parsing handles nested fields correctly
- [ ] Image validation (type, size) works correctly
- [ ] Old images are deleted when new ones are uploaded (optional)
