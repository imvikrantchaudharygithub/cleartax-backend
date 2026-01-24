# Frontend API Integration: Home Info Management

## Overview
This guide documents the API integration for managing the Homepage content. The backend provides a single-document resource for `Banner`, `Benefits`, and `Services` sections.

## Base URL
```
http://localhost:4000/api/home-info
```

## Types (TypeScript)

```typescript
export interface IBanner {
  heading: string;
  description: string;
  button1Text: string;
  button2Text: string;
  checklistItems: string[]; // exactly 3 items
  heroImage?: string; // URL
  heroImageAlt?: string;
  heroImageFile?: File; // For upload only
}

export interface IBenefitItem {
  title: string;
  description: string;
  image?: string; // URL
  imagePosition: 'left' | 'right';
  imageAlt?: string;
  imageFile?: File; // For upload only
}

export interface IBenefits {
  heading: string;
  subheading: string;
  items: IBenefitItem[]; // exactly 3 items
}

export interface IServiceCard {
  title: string;
  description: string;
  features: string[]; // min 1
  href: string; // starts with /
  icon: 'Receipt' | 'Building2' | 'Calculator' | 'Award';
  colorGradient: string; // "from-{color} to-{color}"
}

export interface IServices {
  heading: string;
  subheading: string;
  cards: IServiceCard[]; // exactly 4 items
  ctaButtonText: string;
  ctaButtonLink: string;
}

export interface IHomeInfo {
  banner: IBanner;
  benefits: IBenefits;
  services: IServices;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  errors?: Array<{ field: string; message: string }>;
}
```

## API Endpoints

### 1. GET /api/home-info
Retrieves the current home page content.

**Usage:**
```typescript
const fetchHomeInfo = async (): Promise<IHomeInfo | null> => {
  try {
    const response = await fetch('http://localhost:4000/api/home-info');
    const data: ApiResponse<IHomeInfo> = await response.json();
    if (data.success) {
      return data.data;
    }
    console.error(data.message);
    return null;
  } catch (error) {
    console.error('Fetch error:', error);
    return null;
  }
};
```

### 2. PUT /api/home-info
Updates the home page content. Supports partial updates. Requires Admin authentication.
For updates involving images, use `FormData`. For text-only updates, `application/json` is sufficient (though `FormData` can handle both).

**Handling Image Uploads (FormData Construction):**
You must append fields using bracket notation for nested objects.

```typescript
const updateHomeInfo = async (homeInfo: IHomeInfo, token: string): Promise<ApiResponse<IHomeInfo>> => {
  const formData = new FormData();

  // Helper to append nested object
  const appendFormData = (data: any, rootKey: string) => {
    if (data instanceof File) {
      formData.append(rootKey, data);
    } else if (Array.isArray(data)) {
      data.forEach((item, index) => {
        appendFormData(item, `${rootKey}[${index}]`);
      });
    } else if (typeof data === 'object' && data !== null) {
      Object.keys(data).forEach(key => {
        appendFormData(data[key], `${rootKey}[${key}]`);
      });
    } else {
      formData.append(rootKey, String(data));
    }
  };

  // Append sections
  if (homeInfo.banner) appendFormData(homeInfo.banner, 'banner');
  if (homeInfo.benefits) appendFormData(homeInfo.benefits, 'benefits');
  if (homeInfo.services) appendFormData(homeInfo.services, 'services');

  const response = await fetch('http://localhost:4000/api/home-info', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      // Do NOT set Content-Type header when using FormData; browser sets it with boundary
    },
    body: formData,
  });

  return await response.json();
};
```

## React Integration Tips

1.  **Form State**: Maintain the full `IHomeInfo` object in state.
2.  **File Inputs**: When a user selects a file, update the state with the `File` object (e.g., `banner.heroImageFile`).
3.  **Preview**: Create local object URLs (`URL.createObjectURL(file)`) for immediate preview of uploaded images.
4.  **Validation**:
    *   Check required fields before submission.
    *   `checklistItems` must be length 3.
    *   `benefits.items` must be length 3.
    *   `services.cards` must be length 4.

## Example: Updating Banner Image

```tsx
const handleBannerImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  if (e.target.files && e.target.files[0]) {
    const file = e.target.files[0];
    setHomeInfo(prev => ({
      ...prev,
      banner: {
        ...prev.banner,
        heroImageFile: file, // Store file for upload
        heroImage: URL.createObjectURL(file) // Update preview URL
      }
    }));
  }
};
```

## Error Handling
The API returns `400 Bad Request` with an `errors` array if validation fails.
Display these errors next to the respective fields.

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "banner.heading",
      "message": "Heading is required"
    }
  ]
}
```
