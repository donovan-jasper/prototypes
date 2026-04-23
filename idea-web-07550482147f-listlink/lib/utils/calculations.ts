interface ProfitCalculationParams {
  salePrice: number;
  sourcingCost: number;
  platform: string;
  shippingCost: number;
}

interface ProfitResult {
  profit: number;
  margin: number;
  fees: number;
}

export function calculateProfit(params: ProfitCalculationParams): ProfitResult {
  const { salePrice, sourcingCost, platform, shippingCost } = params;

  // Platform-specific fee structures
  const platformFees = {
    ebay: 0.13, // 13% final value fee
    poshmark: 0.15, // 15% processing fee
    mercari: 0.1, // 10% service fee
    depop: 0.12, // 12% processing fee
    stockx: 0.1, // 10% processing fee
    whatnot: 0.1, // 10% processing fee
  };

  const feePercentage = platformFees[platform.toLowerCase()] || 0.1;
  const fees = salePrice * feePercentage;
  const totalCost = sourcingCost + fees + shippingCost;
  const profit = salePrice - totalCost;
  const margin = (profit / salePrice) * 100;

  return {
    profit: Math.max(0, profit), // Ensure profit isn't negative
    margin: Math.max(0, margin), // Ensure margin isn't negative
    fees,
  };
}

export function calculateFees(price: number, platform: string): number {
  const platformFees = {
    ebay: 0.13,
    poshmark: 0.15,
    mercari: 0.1,
    depop: 0.12,
    stockx: 0.1,
    whatnot: 0.1,
  };

  const feePercentage = platformFees[platform.toLowerCase()] || 0.1;
  return price * feePercentage;
}

export function calculateMargin(profit: number, salePrice: number): number {
  return (profit / salePrice) * 100;
}
