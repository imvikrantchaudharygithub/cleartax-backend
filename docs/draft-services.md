# Service Drafts (Backend)

## Overview
This document describes the draft lifecycle and API contract for saving partial service data and publishing later.

Drafts are stored in the same `Service` collection with:
- `status: 'draft' | 'published'` (default: `draft`)
- `draftMeta.completionStep` (number)
- `draftMeta.lastSavedAt` (ISO timestamp)

Published services require all mandatory fields; drafts can be partial.

## Endpoints

### Create Draft
`POST /api/services/draft`

**Body (partial allowed):**
```json
{
  "title": "GST Filing",
  "shortDescription": "Quick GST filing",
  "longDescription": "Longer description...",
  "iconName": "FileText",
  "category": "gst",
  "subcategory": "some-subcategory-slug",
  "price": { "min": 499, "max": 999, "currency": "INR" },
  "duration": "3-5 days",
  "features": ["Feature A"],
  "benefits": ["Benefit A"],
  "requirements": ["Requirement A"],
  "process": [{ "step": 1, "title": "Step", "description": "Desc", "duration": "1 day" }],
  "faqs": [{ "id": "faq-1", "question": "Q?", "answer": "A." }],
  "relatedServices": ["<serviceId>"],
  "draftMeta": { "completionStep": 2, "lastSavedAt": "2026-01-24T12:00:00.000Z" }
}
```

**Response:** Service with `status: 'draft'`.

### Update Draft
`PUT /api/services/draft/:id`

**Body:** same as create (partial allowed).

### Get Draft by ID
`GET /api/services/draft/:id`

### List Drafts
`GET /api/services/drafts?category=<categorySlug>`

Returns drafts sorted by `updatedAt` desc.

### Publish Draft
`POST /api/services/publish/:id`

Publishes the draft after validating required fields:
- `title`, `shortDescription`, `longDescription`, `iconName`
- `category`
- `price.min`, `price.max`
- `duration`

On success, `status` is set to `published`.

## Draft vs Published Rules
- Drafts can be partial.
- Published services must satisfy all required fields.
- Public queries should default to `status: 'published'` unless `includeDrafts=true` is explicitly used in admin-only contexts.

## Query Flag (Admin)
`GET /api/services?includeDrafts=true`

When set, draft records are included in the response.

## Notes
- `category` should be a category slug/id or display name; backend resolves to `ServiceCategory` or stores `categoryName` fallback.
- `subcategory` is optional and follows the same resolution logic as `category`.
