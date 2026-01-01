# Frontend Service Creation Guide

## Overview

This guide explains how to create services for subcategories using the POST API endpoint. 

**Important:** When a subcategory has an empty `subServices` array (like "Financial Due Diligence" with `"subServices": []`), you need to create services using this API and they will be automatically linked to that subcategory.

## Problem: Empty subServices Array

If you see a subcategory like this:
```json
{
  "id": "due-diligence",
  "slug": "financial-due-diligence",
  "title": "Financial Due Diligence",
  "subServices": [],  // ← Empty array
  "categoryType": "ipo"
}
```

This means:
- The subcategory exists in the database
- But no services have been created/linked to it yet
- You need to use the POST API to create services for this subcategory

## API Endpoint

**POST** `/api/services/:category/:subcategory/:slug`

### URL Parameters
- `category`: Category slug, ID, or categoryType (e.g., `ipo`, `legal`, `gst-services`)
- `subcategory`: Subcategory slug or ID (e.g., `financial-due-diligence`, `due-diligence`)
- `slug`: Unique slug for the service (e.g., `peer-comparison-ratio-analysis`)

### Request Body

```typescript
{
  title: string;                    // Required: Service title
  shortDescription: string;         // Required: Brief description (max 500 chars)
  longDescription: string;          // Required: Detailed description
  iconName: string;                // Required: Icon name (e.g., "TrendingUp", "FileCheck")
  price: {
    min: number;                   // Required: Minimum price (>= 0)
    max: number;                   // Required: Maximum price (>= 0)
    currency: string;              // Default: "INR"
  };
  duration: string;                // Required: Service duration (e.g., "2-3 weeks")
  features?: string[];             // Optional: Array of feature strings
  benefits?: string[];             // Optional: Array of benefit strings
  requirements?: string[];         // Optional: Array of requirement strings
  process?: Array<{                // Optional: Process steps
    step: number;                  // Step number (positive integer)
    title: string;                 // Step title
    description: string;           // Step description
    duration: string;             // Step duration
  }>;
  faqs?: Array<{                   // Optional: FAQs
    id: string;                    // FAQ ID
    question: string;              // Question text
    answer: string;                // Answer text
  }>;
  relatedServices?: string[];      // Optional: Array of related service IDs
}
```

## Step-by-Step Process

### Step 1: Identify the Category and Subcategory

From your example:
- **Category**: `ipo` (categoryType)
- **Subcategory**: `financial-due-diligence` (slug) or `due-diligence` (id)
- **Service Slug**: Choose a unique slug (e.g., `peer-comparison-ratio-analysis`)

### Step 2: Prepare the Service Data

```javascript
const serviceData = {
  title: "Peer Comparison & Ratio Analysis",
  shortDescription: "Comprehensive peer comparison and financial ratio analysis for IPO readiness",
  longDescription: "Detailed analysis of peer companies and financial ratios to ensure your company meets IPO standards and investor expectations. This service includes comprehensive financial benchmarking, ratio analysis, and peer comparison reports.",
  iconName: "TrendingUp",
  price: {
    min: 5000,
    max: 10000,
    currency: "INR"
  },
  duration: "2-3 weeks",
  features: [
    "Comprehensive peer company analysis",
    "Financial ratio benchmarking",
    "Industry comparison reports",
    "Regulatory compliance review"
  ],
  benefits: [
    "Identify competitive positioning",
    "Meet investor expectations",
    "Ensure regulatory compliance",
    "Optimize financial presentation"
  ],
  requirements: [
    "Financial statements (last 3 years)",
    "Peer company data",
    "Industry benchmarks"
  ],
  process: [
    {
      step: 1,
      title: "Data Collection",
      description: "Collect financial data and peer company information",
      duration: "3-5 days"
    },
    {
      step: 2,
      title: "Analysis",
      description: "Perform comprehensive ratio and peer analysis",
      duration: "1-2 weeks"
    },
    {
      step: 3,
      title: "Report Generation",
      description: "Generate detailed comparison and analysis reports",
      duration: "3-5 days"
    }
  ],
  faqs: [
    {
      id: "faq1",
      question: "What is included in the peer comparison?",
      answer: "The peer comparison includes financial ratios, growth metrics, profitability analysis, and market positioning relative to similar companies in your industry."
    },
    {
      id: "faq2",
      question: "How long does the analysis take?",
      answer: "The complete analysis typically takes 2-3 weeks, depending on the complexity and availability of peer company data."
    }
  ],
  relatedServices: [] // Optional: Add related service IDs if any
};
```

### Step 3: Make the API Call

```javascript
// Example using fetch
async function createServiceInSubcategory(category, subcategory, slug, serviceData) {
  try {
    const response = await fetch(
      `http://localhost:4000/api/services/${category}/${subcategory}/${slug}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serviceData),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to create service');
    }

    console.log('Service created successfully:', result);
    return result;
  } catch (error) {
    console.error('Error creating service:', error);
    throw error;
  }
}

// Usage
createServiceInSubcategory(
  'ipo',
  'financial-due-diligence',
  'peer-comparison-ratio-analysis',
  serviceData
);
```

### Step 4: Handle the Response

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "694ad0281525812d58764a33",
    "slug": "peer-comparison-ratio-analysis",
    "title": "Peer Comparison & Ratio Analysis",
    "shortDescription": "Comprehensive peer comparison and financial ratio analysis for IPO readiness",
    "longDescription": "Detailed analysis...",
    "iconName": "TrendingUp",
    "price": {
      "min": 5000,
      "max": 10000,
      "currency": "INR"
    },
    "duration": "2-3 weeks",
    "features": [...],
    "benefits": [...],
    "requirements": [...],
    "process": [...],
    "faqs": [...],
    "category": "694ad0261525812d587649e5",
    "subcategory": "694ad0271525812d58764a32",
    "createdAt": "2025-12-23T17:30:00.000Z",
    "updatedAt": "2025-12-23T17:30:00.000Z"
  },
  "message": "Service created successfully",
  "category": {
    "_id": "694ad0261525812d587649e5",
    "id": "...",
    "slug": "...",
    "title": "...",
    "categoryType": "ipo"
  },
  "subcategory": {
    "_id": "694ad0271525812d58764a32",
    "id": "due-diligence",
    "slug": "financial-due-diligence",
    "title": "Financial Due Diligence",
    "categoryType": "ipo"
  }
}
```

**Error Responses:**

1. **Category Not Found (404):**
```json
{
  "success": false,
  "message": "Category not found"
}
```

2. **Subcategory Not Found (404):**
```json
{
  "success": false,
  "message": "Subcategory not found"
}
```

3. **Subcategory Mismatch (400):**
```json
{
  "success": false,
  "message": "Subcategory does not belong to the specified category"
}
```

4. **Duplicate Slug (409):**
```json
{
  "success": false,
  "message": "A service with this slug already exists"
}
```

5. **Validation Error (400):**
```json
{
  "success": false,
  "message": "Validation error details"
}
```

## React/Next.js Example

```typescript
// hooks/useCreateService.ts
import { useState } from 'react';

interface ServiceData {
  title: string;
  shortDescription: string;
  longDescription: string;
  iconName: string;
  price: {
    min: number;
    max: number;
    currency: string;
  };
  duration: string;
  features?: string[];
  benefits?: string[];
  requirements?: string[];
  process?: Array<{
    step: number;
    title: string;
    description: string;
    duration: string;
  }>;
  faqs?: Array<{
    id: string;
    question: string;
    answer: string;
  }>;
  relatedServices?: string[];
}

export const useCreateService = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createService = async (
    category: string,
    subcategory: string,
    slug: string,
    serviceData: ServiceData
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/services/${category}/${subcategory}/${slug}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(serviceData),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to create service');
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createService, loading, error };
};

// components/CreateServiceForm.tsx
import { useState } from 'react';
import { useCreateService } from '../hooks/useCreateService';

export default function CreateServiceForm() {
  const { createService, loading, error } = useCreateService();
  const [formData, setFormData] = useState({
    category: 'ipo',
    subcategory: 'financial-due-diligence',
    slug: '',
    title: '',
    shortDescription: '',
    longDescription: '',
    iconName: 'TrendingUp',
    priceMin: 0,
    priceMax: 0,
    duration: '',
    features: [] as string[],
    benefits: [] as string[],
    requirements: [] as string[],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const result = await createService(
        formData.category,
        formData.subcategory,
        formData.slug,
        {
          title: formData.title,
          shortDescription: formData.shortDescription,
          longDescription: formData.longDescription,
          iconName: formData.iconName,
          price: {
            min: formData.priceMin,
            max: formData.priceMax,
            currency: 'INR',
          },
          duration: formData.duration,
          features: formData.features,
          benefits: formData.benefits,
          requirements: formData.requirements,
          process: [],
          faqs: [],
        }
      );

      alert('Service created successfully!');
      console.log('Created service:', result);
    } catch (err) {
      console.error('Error creating service:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Category:</label>
        <input
          type="text"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          required
        />
      </div>
      
      <div>
        <label>Subcategory:</label>
        <input
          type="text"
          value={formData.subcategory}
          onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
          required
        />
      </div>
      
      <div>
        <label>Slug:</label>
        <input
          type="text"
          value={formData.slug}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          required
        />
      </div>
      
      <div>
        <label>Title:</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>
      
      <div>
        <label>Short Description:</label>
        <textarea
          value={formData.shortDescription}
          onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
          required
        />
      </div>
      
      <div>
        <label>Long Description:</label>
        <textarea
          value={formData.longDescription}
          onChange={(e) => setFormData({ ...formData, longDescription: e.target.value })}
          required
        />
      </div>
      
      <div>
        <label>Price Min:</label>
        <input
          type="number"
          value={formData.priceMin}
          onChange={(e) => setFormData({ ...formData, priceMin: Number(e.target.value) })}
          required
        />
      </div>
      
      <div>
        <label>Price Max:</label>
        <input
          type="number"
          value={formData.priceMax}
          onChange={(e) => setFormData({ ...formData, priceMax: Number(e.target.value) })}
          required
        />
      </div>
      
      <div>
        <label>Duration:</label>
        <input
          type="text"
          value={formData.duration}
          onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
          required
        />
      </div>
      
      {error && <div style={{ color: 'red' }}>Error: {error}</div>}
      
      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Service'}
      </button>
    </form>
  );
}
```

## Bulk Creation Example

If you need to create multiple services for a subcategory:

```javascript
const servicesToCreate = [
  {
    slug: 'peer-comparison-ratio-analysis',
    title: 'Peer Comparison & Ratio Analysis',
    // ... other fields
  },
  {
    slug: 'financial-statement-review',
    title: 'Financial Statement Review',
    // ... other fields
  },
  // ... more services
];

async function createMultipleServices(category, subcategory, services) {
  const results = [];
  const errors = [];

  for (const service of services) {
    try {
      const result = await createServiceInSubcategory(
        category,
        subcategory,
        service.slug,
        service
      );
      results.push(result);
      console.log(`✅ Created: ${service.slug}`);
    } catch (error) {
      errors.push({ slug: service.slug, error: error.message });
      console.error(`❌ Failed: ${service.slug}`, error.message);
    }
  }

  return { results, errors };
}

// Usage
createMultipleServices('ipo', 'financial-due-diligence', servicesToCreate);
```

## Important Notes

1. **Slug Uniqueness**: The slug must be unique across all services. If a service with the same slug exists, you'll get a 409 error.

2. **Category/Subcategory Validation**: The API automatically validates that:
   - The category exists
   - The subcategory exists
   - The subcategory belongs to the category type

3. **Automatic Linking**: The service is automatically linked to the category and subcategory specified in the URL. You don't need to include `category` or `subcategory` in the request body.

4. **After Creation**: Once services are created, they will appear when you call:
   - `GET /api/services/ipo/financial-due-diligence` - Returns all services in the subcategory
   - `GET /api/services/ipo/financial-due-diligence/{slug}` - Returns specific service detail

## Troubleshooting

### Issue: "Category not found"
- **Solution**: Verify the category slug/id/categoryType is correct
- Check: `GET /api/services/categories` to see all available categories

### Issue: "Subcategory not found"
- **Solution**: Verify the subcategory slug/id is correct
- Check: `GET /api/services/ipo` to see all subcategories for IPO

### Issue: "A service with this slug already exists"
- **Solution**: Use a different slug or update the existing service instead

### Issue: Services not appearing after creation
- **Solution**: 
  1. Verify the service was created successfully (check response)
  2. Wait a moment for database indexing
  3. Check the service's `category` and `subcategory` fields match the subcategory ID

## Example: Creating Services for "Financial Due Diligence"

Since "Financial Due Diligence" has an empty `subServices` array, you need to create services for it:

```javascript
// Service 1: Peer Comparison & Ratio Analysis
await createServiceInSubcategory(
  'ipo',                              // Category: IPO (categoryType)
  'financial-due-diligence',         // Subcategory: Financial Due Diligence (slug)
  'peer-comparison-ratio-analysis',   // Service slug
  {
    title: 'Peer Comparison & Ratio Analysis',
    shortDescription: 'Comprehensive peer comparison and financial ratio analysis for IPO readiness',
    longDescription: 'Detailed analysis of peer companies and financial ratios to ensure your company meets IPO standards and investor expectations. This service includes comprehensive financial benchmarking, ratio analysis, and peer comparison reports.',
    iconName: 'TrendingUp',
    price: { min: 5000, max: 10000, currency: 'INR' },
    duration: '2-3 weeks',
    features: [
      'Comprehensive peer company analysis',
      'Financial ratio benchmarking',
      'Industry comparison reports',
      'Regulatory compliance review'
    ],
    benefits: [
      'Identify competitive positioning',
      'Meet investor expectations',
      'Ensure regulatory compliance',
      'Optimize financial presentation'
    ],
    requirements: [
      'Financial statements (last 3 years)',
      'Peer company data',
      'Industry benchmarks'
    ],
    process: [
      {
        step: 1,
        title: 'Data Collection',
        description: 'Collect financial data and peer company information',
        duration: '3-5 days'
      },
      {
        step: 2,
        title: 'Analysis',
        description: 'Perform comprehensive ratio and peer analysis',
        duration: '1-2 weeks'
      },
      {
        step: 3,
        title: 'Report Generation',
        description: 'Generate detailed comparison and analysis reports',
        duration: '3-5 days'
      }
    ],
    faqs: [
      {
        id: 'faq1',
        question: 'What is included in the peer comparison?',
        answer: 'The peer comparison includes financial ratios, growth metrics, profitability analysis, and market positioning relative to similar companies in your industry.'
      }
    ],
    relatedServices: []
  }
);

// Service 2: Financial Statement Review
await createServiceInSubcategory(
  'ipo',
  'financial-due-diligence',
  'financial-statement-review',
  {
    title: 'Financial Statement Review',
    shortDescription: 'Comprehensive review of financial statements for IPO compliance',
    longDescription: 'Thorough review of all financial statements to ensure they meet IPO standards and regulatory requirements...',
    iconName: 'FileCheck',
    price: { min: 3000, max: 8000, currency: 'INR' },
    duration: '1-2 weeks',
    features: ['Feature 1'],
    benefits: ['Benefit 1'],
    requirements: ['Requirement 1'],
    process: [],
    faqs: [],
  }
);

// Service 3: Regulatory Compliance Check
await createServiceInSubcategory(
  'ipo',
  'financial-due-diligence',
  'regulatory-compliance-check',
  {
    title: 'Regulatory Compliance Check',
    shortDescription: 'Ensure all financial reporting meets regulatory standards',
    longDescription: 'Comprehensive compliance review...',
    iconName: 'ShieldCheck',
    price: { min: 4000, max: 9000, currency: 'INR' },
    duration: '2 weeks',
    features: [],
    benefits: [],
    requirements: [],
    process: [],
    faqs: [],
  }
);
```

**After creating these services:**
1. They will be automatically linked to the "Financial Due Diligence" subcategory
2. They will appear when you call:
   - `GET /api/services/ipo/financial-due-diligence` - Returns all 3 services
   - `GET /api/services/ipo/financial-due-diligence/peer-comparison-ratio-analysis` - Returns first service detail
   - `GET /api/services/ipo/financial-due-diligence/financial-statement-review` - Returns second service detail
   - `GET /api/services/ipo/financial-due-diligence/regulatory-compliance-check` - Returns third service detail

**The subcategory's `itemsCount` will update automatically** to show the number of services created.

