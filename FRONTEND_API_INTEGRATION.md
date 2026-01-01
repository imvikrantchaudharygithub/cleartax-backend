# Frontend API Integration Guide

## Overview

This guide provides comprehensive documentation for integrating the ClearTax backend services API with your frontend application. The API supports both simple categories (with direct services) and complex categories (with subcategories).

## Base URL

```
http://localhost:4000/api
```

## Key Features

- **Category Detection**: Use `hasSubcategories` flag to determine if a category has subcategories
- **Items Count**: Get the count of subcategories or services for any category/subcategory
- **Flexible Routing**: Support for category types, slugs, and IDs
- **Nested Structure**: Handle categories with subcategories seamlessly

## API Endpoints

### 1. Get All Services

**Endpoint:** `GET /api/services`

**Query Parameters:**
- `category` (optional): Filter by category slug, ID, or categoryType (e.g., `gst`, `ipo`, `legal`)
- `search` (optional): Search in title and description
- `page` (optional): Page number for pagination
- `limit` (optional): Items per page

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "string",
      "slug": "string",
      "title": "string",
      "shortDescription": "string",
      "longDescription": "string",
      "iconName": "string",
      "price": {
        "min": 0,
        "max": 1000,
        "currency": "INR"
      },
      "duration": "string",
      "features": ["string"],
      "benefits": ["string"],
      "requirements": ["string"],
      "process": [
        {
          "step": 1,
          "title": "string",
          "description": "string",
          "duration": "string"
        }
      ],
      "faqs": [
        {
          "id": "string",
          "question": "string",
          "answer": "string"
        }
      ],
      "relatedServices": ["string"],
      "category": "string",
      "categoryInfo": {
        "_id": "string",
        "id": "string",
        "slug": "string",
        "title": "string",
        "categoryType": "string",
        "hasSubcategories": false,
        "itemsCount": 5
      },
      "subcategory": "string",
      "subcategoryInfo": {
        "_id": "string",
        "slug": "string",
        "title": "string"
      },
      "createdAt": "ISO date string",
      "updatedAt": "ISO date string"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

**Example Usage:**
```javascript
// Get all services
const response = await fetch('http://localhost:4000/api/services');

// Get GST services
const gstServices = await fetch('http://localhost:4000/api/services?category=gst');

// Search services
const searchResults = await fetch('http://localhost:4000/api/services?search=tax');

// Paginated results
const paginated = await fetch('http://localhost:4000/api/services?page=1&limit=20');
```

---

### 2. Get Category with Services

**Endpoint:** `GET /api/services/:category`

**URL Parameters:**
- `category`: Category slug, ID, or categoryType (e.g., `ipo`, `legal`, `gst-services`)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "string",
      "slug": "string",
      "title": "string",
      "shortDescription": "string",
      "longDescription": "string",
      "iconName": "string",
      "price": {
        "min": 0,
        "max": 1000,
        "currency": "INR"
      },
      "duration": "string",
      "features": ["string"],
      "benefits": ["string"],
      "requirements": ["string"],
      "process": [
        {
          "step": 1,
          "title": "string",
          "description": "string",
          "duration": "string"
        }
      ],
      "faqs": [
        {
          "id": "string",
          "question": "string",
          "answer": "string"
        }
      ],
      "relatedServices": ["string"],
      "category": "string",
      "categoryInfo": {
        "_id": "string",
        "id": "string",
        "slug": "string",
        "title": "string",
        "categoryType": "string"
      },
      "createdAt": "ISO date string",
      "updatedAt": "ISO date string"
    }
  ],
  "category": {
    "_id": "string",
    "id": "string",
    "slug": "string",
    "title": "string",
    "description": "string",
    "iconName": "string",
    "heroTitle": "string",
    "heroDescription": "string",
    "categoryType": "string",
    "hasSubcategories": true,
    "itemsCount": 3
  },
  "subcategories": [
    {
      "_id": "string",
      "slug": "string",
      "title": "string",
      "shortDescription": "string",
      "iconName": "string",
      "price": {
        "min": 0,
        "max": 1000,
        "currency": "INR"
      },
      "duration": "string",
      "itemsCount": 5
    }
  ]
}
```

**Key Fields:**
- `category.hasSubcategories`: `true` if category has subcategories, `false` otherwise
- `category.itemsCount`: Number of subcategories (if `hasSubcategories` is `true`) or number of services (if `false`)
- `subcategories[].itemsCount`: Number of services/items in each subcategory

**Example Usage:**
```javascript
// Get IPO category (has subcategories)
const ipoCategory = await fetch('http://localhost:4000/api/services/ipo');
const ipoData = await ipoCategory.json();

if (ipoData.category.hasSubcategories) {
  // Category has subcategories
  console.log(`Category has ${ipoData.category.itemsCount} subcategories`);
  ipoData.subcategories.forEach(sub => {
    console.log(`${sub.title}: ${sub.itemsCount} items`);
  });
} else {
  // Category has direct services
  console.log(`Category has ${ipoData.category.itemsCount} services`);
}

// Get GST category (no subcategories)
const gstCategory = await fetch('http://localhost:4000/api/services/gst-services');
```

---

### 3. Get Subcategory Items

**Endpoint:** `GET /api/services/:category/:subcategory`

**URL Parameters:**
- `category`: Parent category slug, ID, or categoryType
- `subcategory`: Subcategory slug or ID

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "string",
      "slug": "string",
      "title": "string",
      "shortDescription": "string",
      "longDescription": "string",
      "iconName": "string",
      "price": {
        "min": 0,
        "max": 1000,
        "currency": "INR"
      },
      "duration": "string",
      "features": ["string"],
      "benefits": ["string"],
      "requirements": ["string"],
      "process": [
        {
          "step": 1,
          "title": "string",
          "description": "string",
          "duration": "string"
        }
      ],
      "faqs": [
        {
          "id": "string",
          "question": "string",
          "answer": "string"
        }
      ],
      "relatedServices": ["string"],
      "category": "string",
      "categoryInfo": {
        "_id": "string",
        "id": "string",
        "slug": "string",
        "title": "string",
        "categoryType": "string"
      },
      "subcategory": "string",
      "subcategoryInfo": {
        "_id": "string",
        "slug": "string",
        "title": "string"
      },
      "createdAt": "ISO date string",
      "updatedAt": "ISO date string"
    }
  ],
  "category": {
    "_id": "string",
    "id": "string",
    "slug": "string",
    "title": "string",
    "categoryType": "string",
    "itemsCount": 3
  },
  "subcategory": {
    "_id": "string",
    "id": "string",
    "slug": "string",
    "title": "string",
    "description": "string",
    "iconName": "string",
    "heroTitle": "string",
    "heroDescription": "string",
    "categoryType": "string",
    "itemsCount": 5
  }
}
```

**Key Fields:**
- `category.itemsCount`: Number of subcategories in the parent category
- `subcategory.itemsCount`: Number of services/items in this subcategory

**Example Usage:**
```javascript
// Get IPO Advisory & Strategy subcategory items
const subcategoryItems = await fetch('http://localhost:4000/api/services/ipo/ipo-advisory-strategy');
const subcategoryData = await subcategoryItems.json();

console.log(`Subcategory has ${subcategoryData.subcategory.itemsCount} items`);
console.log(`Parent category has ${subcategoryData.category.itemsCount} subcategories`);
```

---

### 4. Get Service Detail (Category Item)

**Endpoint:** `GET /api/services/:category/:slug`

**URL Parameters:**
- `category`: Category slug, ID, or categoryType
- `slug`: Service slug

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "string",
    "slug": "string",
    "title": "string",
    "shortDescription": "string",
    "longDescription": "string",
    "iconName": "string",
    "price": {
      "min": 0,
      "max": 1000,
      "currency": "INR"
    },
    "duration": "string",
    "features": ["string"],
    "benefits": ["string"],
    "requirements": ["string"],
    "process": [
      {
        "step": 1,
        "title": "string",
        "description": "string",
        "duration": "string"
      }
    ],
    "faqs": [
      {
        "id": "string",
        "question": "string",
        "answer": "string"
      }
    ],
    "relatedServices": ["string"],
    "category": "string",
    "categoryInfo": {
      "_id": "string",
      "id": "string",
      "slug": "string",
      "title": "string",
      "categoryType": "string"
    },
    "createdAt": "ISO date string",
    "updatedAt": "ISO date string"
  },
  "category": {
    "_id": "string",
    "id": "string",
    "slug": "string",
    "title": "string",
    "description": "string",
    "iconName": "string",
    "heroTitle": "string",
    "heroDescription": "string",
    "categoryType": "string",
    "hasSubcategories": false,
    "itemsCount": 5
  }
}
```

**Note:** This endpoint also handles subcategory categories. If `category` is a categoryType (like `ipo`) and `slug` matches a subcategory category, it returns the subcategory details with its services.

**Example Usage:**
```javascript
// Get GST Registration service detail
const serviceDetail = await fetch('http://localhost:4000/api/services/gst/gst-registration');
const serviceData = await serviceDetail.json();

// Get IPO Advisory & Strategy subcategory (returns subcategory with services)
const subcategoryDetail = await fetch('http://localhost:4000/api/services/ipo/ipo-advisory-strategy');
const subcategoryData = await subcategoryDetail.json();
```

---

### 5. Get Subcategory Service Detail

**Endpoint:** `GET /api/services/:category/:subcategory/:slug`

**URL Parameters:**
- `category`: Parent category slug, ID, or categoryType
- `subcategory`: Subcategory slug or ID
- `slug`: Service slug

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "string",
    "slug": "string",
    "title": "string",
    "shortDescription": "string",
    "longDescription": "string",
    "iconName": "string",
    "price": {
      "min": 0,
      "max": 1000,
      "currency": "INR"
    },
    "duration": "string",
    "features": ["string"],
    "benefits": ["string"],
    "requirements": ["string"],
    "process": [
      {
        "step": 1,
        "title": "string",
        "description": "string",
        "duration": "string"
      }
    ],
    "faqs": [
      {
        "id": "string",
        "question": "string",
        "answer": "string"
      }
    ],
    "relatedServices": ["string"],
    "category": "string",
    "categoryInfo": {
      "_id": "string",
      "id": "string",
      "slug": "string",
      "title": "string",
      "categoryType": "string"
    },
    "subcategory": "string",
    "subcategoryInfo": {
      "_id": "string",
      "slug": "string",
      "title": "string"
    },
    "createdAt": "ISO date string",
    "updatedAt": "ISO date string"
  },
  "category": {
    "_id": "string",
    "id": "string",
    "slug": "string",
    "title": "string",
    "categoryType": "string",
    "hasSubcategories": true,
    "itemsCount": 3
  },
  "subcategory": {
    "_id": "string",
    "slug": "string",
    "title": "string",
    "shortDescription": "string",
    "iconName": "string",
    "price": {
      "min": 0,
      "max": 1000,
      "currency": "INR"
    },
    "duration": "string",
    "itemsCount": 5
  }
}
```

**Example Usage:**
```javascript
// Get a specific service within a subcategory
const serviceDetail = await fetch('http://localhost:4000/api/services/ipo/ipo-advisory-strategy/specific-service-slug');
const serviceData = await serviceDetail.json();
```

---

### 6. Create Service in Subcategory

**Endpoint:** `POST /api/services/:category/:subcategory/:slug`

**URL Parameters:**
- `category`: Category slug, ID, or categoryType (e.g., `ipo`, `legal`)
- `subcategory`: Subcategory slug or ID (e.g., `financial-due-diligence`)
- `slug`: Unique slug for the service (e.g., `peer-comparison-ratio-analysis`)

**Request Body:**
```json
{
  "title": "string",
  "shortDescription": "string",
  "longDescription": "string",
  "iconName": "string",
  "price": {
    "min": 0,
    "max": 1000,
    "currency": "INR"
  },
  "duration": "string",
  "features": ["string"],
  "benefits": ["string"],
  "requirements": ["string"],
  "process": [
    {
      "step": 1,
      "title": "string",
      "description": "string",
      "duration": "string"
    }
  ],
  "faqs": [
    {
      "id": "string",
      "question": "string",
      "answer": "string"
    }
  ],
  "relatedServices": ["string"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "string",
    "slug": "string",
    "title": "string",
    "shortDescription": "string",
    "longDescription": "string",
    "iconName": "string",
    "price": {
      "min": 0,
      "max": 1000,
      "currency": "INR"
    },
    "duration": "string",
    "features": ["string"],
    "benefits": ["string"],
    "requirements": ["string"],
    "process": [...],
    "faqs": [...],
    "category": "string",
    "subcategory": "string",
    "createdAt": "ISO date string",
    "updatedAt": "ISO date string"
  },
  "message": "Service created successfully",
  "category": {
    "_id": "string",
    "id": "string",
    "slug": "string",
    "title": "string",
    "categoryType": "string"
  },
  "subcategory": {
    "_id": "string",
    "id": "string",
    "slug": "string",
    "title": "string",
    "categoryType": "string"
  }
}
```

**Example Usage:**
```javascript
// Create a service in Financial Due Diligence subcategory
const response = await fetch('http://localhost:4000/api/services/ipo/financial-due-diligence/peer-comparison-ratio-analysis', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: 'Peer Comparison & Ratio Analysis',
    shortDescription: 'Comprehensive peer comparison and financial ratio analysis',
    longDescription: 'Detailed analysis...',
    iconName: 'TrendingUp',
    price: { min: 5000, max: 10000, currency: 'INR' },
    duration: '2-3 weeks',
    features: ['Feature 1', 'Feature 2'],
    benefits: ['Benefit 1'],
    requirements: ['Requirement 1'],
    process: [],
    faqs: [],
  }),
});

const result = await response.json();
```

**Note:** This endpoint automatically links the service to the category and subcategory specified in the URL. You don't need to include `category` or `subcategory` in the request body.

**For detailed service creation guide, see:** `FRONTEND_SERVICE_CREATION_GUIDE.md`

---

## Frontend Integration Logic

### Detecting Category Type

Instead of hardcoding category types, use the `hasSubcategories` flag from the API response:

```javascript
// ❌ OLD WAY (Hardcoded)
const isComplexCategory = category === 'legal' || category === 'ipo' || category === 'banking-finance' || 
    (categoryType && ['legal', 'ipo', 'banking-finance'].includes(categoryType));

// ✅ NEW WAY (API-Driven)
const categoryData = await fetch(`http://localhost:4000/api/services/${category}`).then(r => r.json());
const isComplexCategory = categoryData.category?.hasSubcategories === true;
```

### Complete Frontend Flow

```javascript
// Step 1: Fetch category data
async function getCategoryData(category) {
  const response = await fetch(`http://localhost:4000/api/services/${category}`);
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.message || 'Failed to fetch category');
  }
  
  return data;
}

// Step 2: Determine category structure
async function renderCategory(category) {
  const categoryData = await getCategoryData(category);
  
  // Check if category has subcategories
  if (categoryData.category.hasSubcategories) {
    // Render subcategories
    renderSubcategories(categoryData.subcategories);
  } else {
    // Render direct services
    renderServices(categoryData.data);
  }
}

// Step 3: Render subcategories
function renderSubcategories(subcategories) {
  subcategories.forEach(subcategory => {
    console.log(`${subcategory.title}: ${subcategory.itemsCount} items`);
    // Render subcategory card with itemsCount
  });
}

// Step 4: Handle subcategory click
async function handleSubcategoryClick(category, subcategory) {
  // Fetch subcategory items
  const response = await fetch(`http://localhost:4000/api/services/${category}/${subcategory}`);
  const data = await response.json();
  
  // Render subcategory items
  renderServices(data.data);
}

// Step 5: Handle service detail
async function handleServiceClick(category, slug, subcategory = null) {
  let url;
  if (subcategory) {
    url = `http://localhost:4000/api/services/${category}/${subcategory}/${slug}`;
  } else {
    url = `http://localhost:4000/api/services/${category}/${slug}`;
  }
  
  const response = await fetch(url);
  const data = await response.json();
  
  // Render service detail page
  renderServiceDetail(data.data);
}
```

### React/Next.js Example

```typescript
// types.ts
interface Category {
  _id: string;
  id: string;
  slug: string;
  title: string;
  description?: string;
  iconName?: string;
  heroTitle?: string;
  heroDescription?: string;
  categoryType?: string;
  hasSubcategories: boolean;
  itemsCount: number;
}

interface Subcategory {
  _id: string;
  slug: string;
  title: string;
  shortDescription?: string;
  iconName?: string;
  price?: {
    min: number;
    max: number;
    currency: string;
  };
  duration?: string;
  itemsCount: number;
}

interface Service {
  _id: string;
  slug: string;
  title: string;
  shortDescription: string;
  longDescription?: string;
  iconName?: string;
  price?: {
    min: number;
    max: number;
    currency: string;
  };
  duration?: string;
  features?: string[];
  benefits?: string[];
  requirements?: string[];
  process?: Array<{
    step: number;
    title: string;
    description: string;
    duration?: string;
  }>;
  faqs?: Array<{
    id: string;
    question: string;
    answer: string;
  }>;
  relatedServices?: string[];
  category?: string;
  categoryInfo?: Category;
  subcategory?: string;
  subcategoryInfo?: Subcategory;
  createdAt: string;
  updatedAt: string;
}

interface CategoryResponse {
  success: boolean;
  data: Service[];
  category: Category;
  subcategories?: Subcategory[];
}

// CategoryPage.tsx
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function CategoryPage() {
  const { category } = useParams();
  const router = useRouter();
  const [categoryData, setCategoryData] = useState<CategoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategory() {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:4000/api/services/${category}`);
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.message || 'Failed to fetch category');
        }
        
        setCategoryData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }
    
    if (category) {
      fetchCategory();
    }
  }, [category]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!categoryData) return <div>No data found</div>;

  const { category: cat, subcategories, data: services } = categoryData;

  return (
    <div>
      <h1>{cat.title}</h1>
      <p>{cat.description}</p>
      
      {cat.hasSubcategories ? (
        // Render subcategories
        <div>
          <h2>Subcategories ({cat.itemsCount})</h2>
          <div className="subcategories-grid">
            {subcategories?.map((subcategory) => (
              <div
                key={subcategory._id}
                className="subcategory-card"
                onClick={() => router.push(`/services/${category}/${subcategory.slug}`)}
              >
                <h3>{subcategory.title}</h3>
                <p>{subcategory.shortDescription}</p>
                <span>{subcategory.itemsCount} items</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        // Render direct services
        <div>
          <h2>Services ({cat.itemsCount})</h2>
          <div className="services-grid">
            {services.map((service) => (
              <div
                key={service._id}
                className="service-card"
                onClick={() => router.push(`/services/${category}/${service.slug}`)}
              >
                <h3>{service.title}</h3>
                <p>{service.shortDescription}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// SubcategoryPage.tsx
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function SubcategoryPage() {
  const { category, subcategory } = useParams();
  const router = useRouter();
  const [subcategoryData, setSubcategoryData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSubcategory() {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:4000/api/services/${category}/${subcategory}`);
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.message || 'Failed to fetch subcategory');
        }
        
        setSubcategoryData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }
    
    if (category && subcategory) {
      fetchSubcategory();
    }
  }, [category, subcategory]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!subcategoryData) return <div>No data found</div>;

  const { subcategory: sub, data: services } = subcategoryData;

  return (
    <div>
      <h1>{sub.title}</h1>
      <p>{sub.description}</p>
      <p>{sub.itemsCount} items</p>
      
      <div className="services-grid">
        {services.map((service: Service) => (
          <div
            key={service._id}
            className="service-card"
            onClick={() => router.push(`/services/${category}/${subcategory}/${service.slug}`)}
          >
            <h3>{service.title}</h3>
            <p>{service.shortDescription}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ServiceDetailPage.tsx
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function ServiceDetailPage() {
  const { category, subcategory, slug } = useParams();
  const [serviceData, setServiceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchService() {
      try {
        setLoading(true);
        let url;
        if (subcategory) {
          url = `http://localhost:4000/api/services/${category}/${subcategory}/${slug}`;
        } else {
          url = `http://localhost:4000/api/services/${category}/${slug}`;
        }
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.message || 'Failed to fetch service');
        }
        
        setServiceData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }
    
    if (category && slug) {
      fetchService();
    }
  }, [category, subcategory, slug]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!serviceData?.data) return <div>No data found</div>;

  const service = serviceData.data;

  return (
    <div>
      <h1>{service.title}</h1>
      <p>{service.longDescription}</p>
      
      {service.price && (
        <div>
          <p>Price: ₹{service.price.min} - ₹{service.price.max}</p>
        </div>
      )}
      
      {service.features && service.features.length > 0 && (
        <div>
          <h2>Features</h2>
          <ul>
            {service.features.map((feature: string, index: number) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
        </div>
      )}
      
      {service.process && service.process.length > 0 && (
        <div>
          <h2>Process</h2>
          {service.process.map((step: any) => (
            <div key={step.step}>
              <h3>Step {step.step}: {step.title}</h3>
              <p>{step.description}</p>
            </div>
          ))}
        </div>
      )}
      
      {service.faqs && service.faqs.length > 0 && (
        <div>
          <h2>FAQs</h2>
          {service.faqs.map((faq: any) => (
            <div key={faq.id}>
              <h3>{faq.question}</h3>
              <p>{faq.answer}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## Decision Flow

```
Start: User clicks on a category
  │
  ├─→ Fetch GET /api/services/:category
  │
  ├─→ Check category.hasSubcategories
  │
  ├─→ If hasSubcategories === true
  │   │
  │   ├─→ Display subcategories list
  │   │   └─→ Show itemsCount for each subcategory
  │   │
  │   └─→ User clicks subcategory
  │       │
  │       ├─→ Fetch GET /api/services/:category/:subcategory
  │       │
  │       └─→ Display services in subcategory
  │           └─→ User clicks service
  │               └─→ Fetch GET /api/services/:category/:subcategory/:slug
  │
  └─→ If hasSubcategories === false
      │
      ├─→ Display services directly
      │
      └─→ User clicks service
          └─→ Fetch GET /api/services/:category/:slug
```

---

## Best Practices

1. **Use API Flags**: Always use `hasSubcategories` flag instead of hardcoding category types
2. **Display Items Count**: Show `itemsCount` to users for better UX
3. **Handle Loading States**: Always show loading indicators while fetching data
4. **Error Handling**: Implement proper error handling for failed API calls
5. **Caching**: Consider caching category data to reduce API calls
6. **Type Safety**: Use TypeScript interfaces for type safety

---

## Error Handling

All endpoints return errors in the following format:

```json
{
  "success": false,
  "message": "Error message here"
}
```

**Common Error Scenarios:**
- `404`: Category/Subcategory/Service not found
- `400`: Invalid request parameters
- `500`: Server error

**Example Error Handling:**
```javascript
try {
  const response = await fetch(`http://localhost:4000/api/services/${category}`);
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.message || 'Failed to fetch data');
  }
  
  // Use data
} catch (error) {
  console.error('Error:', error.message);
  // Show error to user
}
```

---

## Summary

- **Use `hasSubcategories` flag** to determine category structure dynamically
- **Use `itemsCount`** to display counts to users
- **Follow the routing pattern**: `/category` → `/category/subcategory` → `/category/subcategory/service`
- **Handle both simple and complex categories** using the same logic
- **Always check API responses** for `success` flag before using data

This approach makes your frontend code more maintainable and flexible, as it adapts to backend changes without requiring frontend code updates.

