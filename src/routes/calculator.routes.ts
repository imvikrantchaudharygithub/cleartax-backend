import { Router } from 'express';
import * as calculatorController from '../controllers/calculator.controller';
import { validate } from '../middlewares/validation.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import {
  incomeTaxSchema,
  gstSchema,
  emiSchema,
  hraSchema,
  tdsSchema,
} from '../validations/calculator.validations';

const router = Router();

// Calculator endpoints (public, but history requires auth)
router.post('/income-tax', validate(incomeTaxSchema), calculatorController.calculateIncomeTax);
router.post('/gst', validate(gstSchema), calculatorController.calculateGST);
router.post('/emi', validate(emiSchema), calculatorController.calculateEMI);
router.post('/hra', validate(hraSchema), calculatorController.calculateHRA);
router.post('/tds', validate(tdsSchema), calculatorController.calculateTDS);

// History endpoint (requires authentication)
router.get('/history', authenticate, calculatorController.getCalculationHistory);

export default router;

