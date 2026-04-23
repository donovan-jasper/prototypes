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

export function calculateProfit({
  salePrice,
  sourcingCost,
  platform,
  shippingCost
}: ProfitCalculationParams): ProfitResult {
  const platformFee = calculateFees(salePrice, platform);
  const totalCost = sourcingCost + platformFee + shippingCost;
  const profit = salePrice - totalCost;
  const margin = (profit / salePrice) * 100;

  return {
    profit: Math.max(0, profit), // Ensure profit isn't negative
    margin: isNaN(margin) ? 0 : margin,
    fees: platformFee
  };
}

export function calculateFees(price: number, platform: string): number {
  const platformLower = platform.toLowerCase();

  switch (platformLower) {
    case 'ebay':
      // eBay final value fee (13.5% for most items)
      return price * 0.135;
    case 'poshmark':
      // Poshmark takes 15% + $2.99 per sale
      return (price * 0.15) + 2.99;
    case 'mercari':
      // Mercari takes 10% + $0.30 per sale
      return (price * 0.10) + 0.30;
    case 'depop':
      // Depop takes 10% + $0.25 per sale
      return (price * 0.10) + 0.25;
    default:
      // Default 10% fee for unknown platforms
      return price * 0.10;
  }
}
