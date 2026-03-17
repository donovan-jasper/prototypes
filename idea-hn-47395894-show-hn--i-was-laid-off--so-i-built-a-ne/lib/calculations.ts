export const calculateEquityValue = (
  shares: number,
  strikePrice: number,
  currentPrice: number
): number => {
  return Math.max(0, (currentPrice - strikePrice) * shares);
};

export const calculateVestedShares = (
  totalShares: number,
  grantDate: Date,
  currentDate: Date,
  vestingYears: number
): number => {
  const monthsElapsed = (currentDate.getTime() - grantDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
  const totalMonths = vestingYears * 12;
  const vestedPercentage = Math.min(monthsElapsed / totalMonths, 1);
  return Math.floor(totalShares * vestedPercentage);
};

export const calculateTaxImpact = (
  gain: number,
  holdingPeriod: 'short' | 'long',
  annualIncome: number
): number => {
  // Simplified tax calculation (US federal only)
  const rate = holdingPeriod === 'long'
    ? (annualIncome > 500000 ? 0.20 : 0.15)
    : (annualIncome > 500000 ? 0.37 : 0.24);
  return gain * rate;
};

export const calculateAMT = (
  shares: number,
  strikePrice: number,
  fmv: number
): number => {
  const spread = (fmv - strikePrice) * shares;
  return spread * 0.28; // AMT rate
};
