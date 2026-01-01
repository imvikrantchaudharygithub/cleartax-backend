import {
  IncomeTaxInput,
  IncomeTaxResult,
  GSTInput,
  GSTResult,
  EMIInput,
  EMIResult,
  HRAInput,
  HRAResult,
  TDSInput,
  TDSResult,
} from '../types/calculator.types';

// Tax slabs for FY 2023-24 (New Regime)
const TAX_SLABS = [
  { min: 0, max: 300000, rate: 0 },
  { min: 300000, max: 600000, rate: 5 },
  { min: 600000, max: 900000, rate: 10 },
  { min: 900000, max: 1200000, rate: 15 },
  { min: 1200000, max: 1500000, rate: 20 },
  { min: 1500000, max: Infinity, rate: 30 },
];

const CESS_RATE = 0.04; // 4% Health and Education Cess

export const calculateIncomeTax = (input: IncomeTaxInput): IncomeTaxResult => {
  // Calculate total deductions (max 150,000 for 80C)
  const totalDeductions = Math.min(
    input.deductions.section80C +
      input.deductions.section80D +
      input.deductions.section80E +
      input.deductions.others,
    150000
  );

  // Apply age-based exemptions
  let exemptionLimit = 250000;
  if (input.age >= 60 && input.age < 80) {
    exemptionLimit = 300000; // Senior citizen
  } else if (input.age >= 80) {
    exemptionLimit = 500000; // Super senior citizen
  }

  // Calculate taxable income
  const taxableIncome = Math.max(0, input.grossIncome - totalDeductions - exemptionLimit);

  // Calculate tax for each slab
  const taxBreakdown: { slab: string; rate: number; amount: number }[] = [];
  let baseTax = 0;

  for (let i = 0; i < TAX_SLABS.length; i++) {
    const slab = TAX_SLABS[i];
    if (taxableIncome > slab.min) {
      const taxableInSlab = Math.min(taxableIncome, slab.max) - slab.min;
      const taxAmount = (taxableInSlab * slab.rate) / 100;

      if (taxAmount > 0) {
        taxBreakdown.push({
          slab: `₹${slab.min.toLocaleString('en-IN')} - ${
            slab.max === Infinity ? 'Above' : '₹' + slab.max.toLocaleString('en-IN')
          }`,
          rate: slab.rate,
          amount: taxAmount,
        });
        baseTax += taxAmount;
      }
    }
  }

  // Calculate surcharge (for income above ₹50 lakhs)
  let surchargeAmount = 0;
  if (input.surcharge && input.grossIncome > 5000000) {
    if (input.grossIncome > 10000000) {
      surchargeAmount = baseTax * 0.15; // 15% surcharge
    } else {
      surchargeAmount = baseTax * 0.10; // 10% surcharge
    }
  }

  // Calculate cess
  const cess = (baseTax + surchargeAmount) * CESS_RATE;

  // Total tax
  const totalTax = baseTax + surchargeAmount + cess;

  // Effective tax rate
  const effectiveRate = input.grossIncome > 0 ? (totalTax / input.grossIncome) * 100 : 0;

  return {
    grossIncome: input.grossIncome,
    totalDeductions,
    taxableIncome,
    taxBreakdown,
    baseTax,
    cess,
    surcharge: surchargeAmount,
    totalTax,
    effectiveRate,
  };
};

export const calculateGST = (input: GSTInput): GSTResult => {
  let originalAmount: number;
  let gstAmount: number;
  let totalAmount: number;

  if (input.calculationType === 'add') {
    // Add GST to the amount
    originalAmount = input.amount;
    gstAmount = (input.amount * input.gstRate) / 100;
    totalAmount = originalAmount + gstAmount;
  } else {
    // Remove GST from the amount (amount includes GST)
    totalAmount = input.amount;
    originalAmount = (input.amount * 100) / (100 + input.gstRate);
    gstAmount = totalAmount - originalAmount;
  }

  // Calculate tax distribution
  let cgst = 0;
  let sgst = 0;
  let igst = 0;

  if (input.interstate) {
    // Interstate transaction - IGST applies
    igst = gstAmount;
  } else {
    // Intrastate transaction - CGST + SGST applies
    cgst = gstAmount / 2;
    sgst = gstAmount / 2;
  }

  const effectiveRate = (gstAmount / originalAmount) * 100;

  return {
    originalAmount,
    gstAmount,
    cgst,
    sgst,
    igst,
    totalAmount,
    effectiveRate,
  };
};

export const calculateEMI = (input: EMIInput): EMIResult => {
  const principal = input.loanAmount;
  const monthlyRate = input.interestRate / 12 / 100;
  const totalMonths = input.loanDuration;

  // EMI Formula: P * r * (1 + r)^n / ((1 + r)^n - 1)
  const emi =
    monthlyRate === 0
      ? principal / totalMonths
      : (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
        (Math.pow(1 + monthlyRate, totalMonths) - 1);

  const totalAmount = emi * totalMonths;
  const totalInterest = totalAmount - principal;

  const processingFee = input.processingFee || 0;
  const insurance = input.insurance || 0;
  const totalCost = totalAmount + processingFee + insurance * totalMonths;

  let prepaymentResult;
  if (input.prepayment && input.prepayment > 0) {
    const newPrincipal = principal - input.prepayment;
    const newEMI =
      monthlyRate === 0
        ? newPrincipal / totalMonths
        : (newPrincipal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
          (Math.pow(1 + monthlyRate, totalMonths) - 1);
    const newTotalInterest = newEMI * totalMonths - newPrincipal;
    const interestSaved = totalInterest - newTotalInterest;

    prepaymentResult = {
      amount: input.prepayment,
      newEMI: Math.round(newEMI),
      interestSaved: Math.round(interestSaved),
    };
  }

  return {
    principal,
    interestRate: input.interestRate,
    tenure: totalMonths,
    emi: Math.round(emi),
    totalInterest: Math.round(totalInterest),
    totalAmount: Math.round(totalAmount),
    processingFee: Math.round(processingFee),
    insurance: Math.round(insurance),
    totalCost: Math.round(totalCost),
    prepayment: prepaymentResult,
  };
};

export const calculateHRA = (input: HRAInput): HRAResult => {
  const basicPlusDA = input.basicSalary + input.da;
  const actualHRA = input.hraReceived;

  // HRA Exemption is the minimum of:
  // 1. Actual HRA received
  // 2. Rent paid minus 10% of (Basic + DA)
  // 3. 50% of (Basic + DA) for metro, 40% for non-metro

  const tenPercentOfBasicDA = basicPlusDA * 0.1;
  const rentMinusTenPercent = Math.max(0, input.rentPaid - tenPercentOfBasicDA);

  const metroPercentage = input.cityType === 'metro' ? 0.5 : 0.4;
  const fiftyOrFortyPercent = basicPlusDA * metroPercentage;

  const exemption1 = fiftyOrFortyPercent;
  const exemption2 = actualHRA;
  const exemption3 = rentMinusTenPercent;

  const hraExemption = Math.min(exemption1, exemption2, exemption3);
  const taxableHRA = actualHRA - hraExemption;

  return {
    basicSalary: input.basicSalary,
    da: input.da,
    hraReceived: actualHRA,
    rentPaid: input.rentPaid,
    cityType: input.cityType,
    exemption1,
    exemption2,
    exemption3,
    hraExemption,
    taxableHRA,
  };
};

// TDS Rates for FY 2023-24
const TDS_RATES: Record<string, { withPAN: number; withoutPAN: number; threshold: number }> = {
  salary: { withPAN: 0, withoutPAN: 0, threshold: 250000 }, // Variable based on tax slab
  professional: { withPAN: 10, withoutPAN: 20, threshold: 30000 },
  contract: { withPAN: 2, withoutPAN: 20, threshold: 30000 },
  rent: { withPAN: 10, withoutPAN: 20, threshold: 240000 },
  commission: { withPAN: 5, withoutPAN: 20, threshold: 15000 },
  interest: { withPAN: 10, withoutPAN: 20, threshold: 40000 },
  dividend: { withPAN: 10, withoutPAN: 20, threshold: 5000 },
};

export const calculateTDS = (input: TDSInput): TDSResult => {
  const rateInfo = TDS_RATES[input.tdsType];

  let tdsRate = input.hasPAN ? rateInfo.withPAN : rateInfo.withoutPAN;

  // Special category (senior citizens, etc.) may have different rates
  if (input.specialCategory && input.tdsType === 'interest') {
    tdsRate = input.hasPAN ? 0 : 20;
  }

  const tdsAmount = (input.amount * tdsRate) / 100;
  const surcharge = 0; // Surcharge not typically applied to TDS
  const cess = tdsAmount * 0.04; // 4% cess on TDS
  const totalTDS = tdsAmount + cess;

  return {
    tdsType: input.tdsType,
    amount: input.amount,
    tdsRate,
    tdsAmount: Math.round(tdsAmount),
    hasPAN: input.hasPAN,
    surcharge,
    cess: Math.round(cess),
    totalTDS: Math.round(totalTDS),
  };
};

