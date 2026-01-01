import { z } from 'zod';

// Income Tax Calculator Schema
export const incomeTaxSchema = z.object({
  body: z.object({
    financialYear: z.string().min(1, 'Financial year is required'),
    incomeType: z.enum(['salary', 'business', 'investment', 'other']),
    grossIncome: z.number().min(0, 'Gross income must be positive').max(100000000, 'Amount too large'),
    age: z.number().min(0, 'Age must be positive').max(120, 'Invalid age'),
    deductions: z.object({
      section80C: z.number().min(0).max(150000, '80C deduction limited to ₹1,50,000'),
      section80D: z.number().min(0).max(100000, '80D deduction limited to ₹1,00,000'),
      section80E: z.number().min(0).max(500000, 'Invalid deduction amount'),
      others: z.number().min(0).max(500000, 'Invalid deduction amount'),
    }),
    state: z.string().min(1, 'State is required'),
    surcharge: z.boolean(),
  }),
});

// GST Calculator Schema
export const gstSchema = z.object({
  body: z.object({
    calculationType: z.enum(['add', 'remove']),
    amount: z.number().min(1, 'Amount must be greater than 0').max(10000000000, 'Amount too large'),
    gstRate: z.union([z.literal(5), z.literal(12), z.literal(18), z.literal(28)]),
    transactionType: z.enum(['b2b', 'b2c']),
    interstate: z.boolean(),
  }),
});

// EMI Calculator Schema
export const emiSchema = z.object({
  body: z.object({
    loanAmount: z.number().min(10000, 'Minimum loan amount is ₹10,000').max(100000000, 'Amount too large'),
    interestRate: z.number().min(1, 'Interest rate must be at least 1%').max(30, 'Interest rate too high'),
    loanDuration: z.number().min(1, 'Loan duration must be at least 1 month').max(360, 'Maximum 30 years (360 months)'),
    loanType: z.enum(['home', 'auto', 'personal', 'education']),
    processingFee: z.number().min(0).max(100000).optional(),
    insurance: z.number().min(0).max(10000).optional(),
    prepayment: z.number().min(0).optional(),
  }),
});

// HRA Calculator Schema
export const hraSchema = z.object({
  body: z.object({
    basicSalary: z.number().min(0, 'Basic salary must be positive').max(10000000, 'Amount too large'),
    da: z.number().min(0, 'DA must be positive').max(10000000, 'Amount too large'),
    hraReceived: z.number().min(0, 'HRA received must be positive').max(10000000, 'Amount too large'),
    cityType: z.enum(['metro', 'non-metro']),
    rentPaid: z.number().min(0, 'Rent paid must be positive').max(10000000, 'Amount too large'),
    spouseIncome: z.number().min(0).max(10000000).optional(),
  }),
});

// TDS Calculator Schema
export const tdsSchema = z.object({
  body: z.object({
    tdsType: z.enum(['salary', 'professional', 'contract', 'rent', 'commission', 'interest', 'dividend']),
    amount: z.number().min(1, 'Amount must be greater than 0').max(100000000, 'Amount too large'),
    hasPAN: z.boolean(),
    financialYear: z.string().min(1, 'Financial year is required'),
    quarter: z.enum(['Q1', 'Q2', 'Q3', 'Q4']),
    specialCategory: z.boolean().optional(),
  }),
});

