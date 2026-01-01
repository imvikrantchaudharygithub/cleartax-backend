// Income Tax Calculator
export interface IncomeTaxInput {
  financialYear: string;
  incomeType: 'salary' | 'business' | 'investment' | 'other';
  grossIncome: number;
  age: number;
  deductions: {
    section80C: number;
    section80D: number;
    section80E: number;
    others: number;
  };
  state: string;
  surcharge: boolean;
}

export interface IncomeTaxResult {
  grossIncome: number;
  totalDeductions: number;
  taxableIncome: number;
  taxBreakdown: {
    slab: string;
    rate: number;
    amount: number;
  }[];
  baseTax: number;
  cess: number;
  surcharge: number;
  totalTax: number;
  effectiveRate: number;
}

// GST Calculator
export interface GSTInput {
  calculationType: 'add' | 'remove';
  amount: number;
  gstRate: 5 | 12 | 18 | 28;
  transactionType: 'b2b' | 'b2c';
  interstate: boolean;
}

export interface GSTResult {
  originalAmount: number;
  gstAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalAmount: number;
  effectiveRate: number;
}

// EMI Calculator
export interface EMIInput {
  loanAmount: number;
  interestRate: number;
  loanDuration: number;
  loanType: 'home' | 'auto' | 'personal' | 'education';
  processingFee?: number;
  insurance?: number;
  prepayment?: number;
}

export interface EMIResult {
  principal: number;
  interestRate: number;
  tenure: number;
  emi: number;
  totalInterest: number;
  totalAmount: number;
  processingFee: number;
  insurance: number;
  totalCost: number;
  prepayment?: {
    amount: number;
    newEMI: number;
    interestSaved: number;
  };
}

// HRA Calculator
export interface HRAInput {
  basicSalary: number;
  da: number;
  hraReceived: number;
  cityType: 'metro' | 'non-metro';
  rentPaid: number;
  spouseIncome?: number;
}

export interface HRAResult {
  basicSalary: number;
  da: number;
  hraReceived: number;
  rentPaid: number;
  cityType: 'metro' | 'non-metro';
  exemption1: number; // 50% or 40% of (Basic + DA)
  exemption2: number; // HRA received
  exemption3: number; // Rent paid - 10% of (Basic + DA)
  hraExemption: number; // Minimum of the three
  taxableHRA: number;
}

// TDS Calculator
export interface TDSInput {
  tdsType: 'salary' | 'professional' | 'contract' | 'rent' | 'commission' | 'interest' | 'dividend';
  amount: number;
  hasPAN: boolean;
  financialYear: string;
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  specialCategory?: boolean;
}

export interface TDSResult {
  tdsType: string;
  amount: number;
  tdsRate: number;
  tdsAmount: number;
  hasPAN: boolean;
  surcharge?: number;
  cess?: number;
  totalTDS: number;
}

// Calculator History
export interface CalculatorHistoryCreate {
  calculatorType: 'income-tax' | 'gst' | 'emi' | 'hra' | 'tds';
  inputData: Record<string, any>;
  result: Record<string, any>;
  userId?: string;
}

export interface CalculatorHistoryResponse {
  _id: string;
  calculatorType: string;
  inputData: Record<string, any>;
  result: Record<string, any>;
  userId?: string;
  createdAt: Date;
}

