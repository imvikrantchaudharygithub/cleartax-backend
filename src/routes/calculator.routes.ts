import { Router } from 'express';
import * as calculatorController from '../controllers/calculator.controller';
import { validate } from '../middlewares/validation.middleware';
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

// History endpoint (requires authentication) - AUTH TEMPORARILY DISABLED
// router.get('/history', authenticate, calculatorController.getCalculationHistory);
router.get('/history', calculatorController.getCalculationHistory);

export default router;

