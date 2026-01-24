import { Request, Response, NextFunction } from 'express';
import { getHomeInfoPublic, updateHomeInfo } from '../services/homeInfo.service';
import { homeInfoSchema } from '../validations/homeInfo.validations';
import { ZodError } from 'zod';

// Helper to unflatten request body
const unflatten = (data: any): any => {
    if (Object(data) !== data || Array.isArray(data)) return data;
    const result: any = {};
    for (const p in data) {
        let cur = result, prop = '', parts = p.match(/[^\[\]]+/g) || [];
        for (let i = 0; i < parts.length; i++) {
            prop = parts[i];
            if (i === parts.length - 1) {
                cur[prop] = data[p];
            } else {
                if (!cur[prop]) cur[prop] = isNaN(Number(parts[i + 1])) ? {} : [];
                cur = cur[prop];
            }
        }
    }
    return result;
};

export const getHomeInfoController = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const homeInfo = await getHomeInfoPublic();
    if (!homeInfo) {
      res.status(404).json({ success: false, message: 'Home info not found' });
      return;
    }
    res.status(200).json({ success: true, data: homeInfo });
  } catch (error) {
    next(error);
  }
};

export const updateHomeInfoController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1. Unflatten body if needed (for FormData with bracket notation)
    let body = req.body;
    // Check if any key contains brackets, implying it needs unflattening
    const needsUnflattening = Object.keys(body).some(k => k.includes('['));
    if (needsUnflattening) {
        body = unflatten(body);
    }
    
    // 2. Validate
    // If partial update, we only validate the sections that are present.
    // Zod schema expects full object structure for the parts that are present.
    
    // We need to validate ONLY the fields that are present in `body`.
    // However, `homeInfoSchema` defines `body` as containing banner, benefits, services.
    // We should parse it section by section or make the schema partial.
    // Given the prompt: "Validation Rules... Banner Section... Benefits Section..."
    // And "If a section is not provided... keep existing".
    // This implies we should validate each section independently if it exists.
    
    try {
        if (body.banner) {
            homeInfoSchema.shape.body.shape.banner.parse(body.banner);
        }
        if (body.benefits) {
             homeInfoSchema.shape.body.shape.benefits.parse(body.benefits);
        }
        if (body.services) {
             homeInfoSchema.shape.body.shape.services.parse(body.services);
        }
    } catch (error) {
        if (error instanceof ZodError) {
             res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: error.errors.map(e => ({
                    field: e.path.join('.'),
                    message: e.message
                }))
             });
             return;
        }
        throw error;
    }

    // 3. Update
    const updatedHomeInfo = await updateHomeInfo(body, req.files as Express.Multer.File[]);

    res.status(200).json({
      success: true,
      message: 'Home info updated successfully',
      data: updatedHomeInfo,
    });
  } catch (error) {
    next(error);
  }
};
