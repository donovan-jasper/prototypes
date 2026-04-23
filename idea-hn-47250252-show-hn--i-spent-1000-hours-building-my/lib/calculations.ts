import { Holding, PortfolioSummary, Asset, Liability, NetWorth } from './types';
import { PriceService } from './priceService';

export const calculatePortfolioGains = (holdings: Holding[]): PortfolioSummary => {
  let totalValue = 0;
  let totalCostBasis = 0;

  const updatedHoldings = holdings.map(holding => {
    const currentValue = holding.shares * (holding.currentPrice || 0);
    const costBasis = holding.shares * holding.costBasis;
    const gain = currentValue - costBasis;
    const percentGain = costBasis > 0 ? (gain / costBasis) * 100 : 0;

    totalCostBasis += costBasis;
    totalValue += currentValue;

    return {
      ...holding,
      currentValue,
      gain,
      percentGain
    };
  });

  const totalGain = totalValue - totalCostBasis;
  const totalPercentGain = totalCostBasis > 0 ? (totalGain / totalCostBasis) * 100 : 0;

  return {
    totalValue,
    totalGain,
    totalPercentGain,
    holdings: updatedHoldings,
  };
};

export const calculateNetWorth = (assets: Asset[], liabilities: Liability[]): NetWorth => {
  const totalAssets = assets.reduce((sum, asset) => sum + asset.value, 0);
  const totalLiabilities = liabilities.reduce((sum, liability) => sum + liability.value, 0);
  const netWorth = totalAssets - totalLiabilities;

  return {
    totalAssets,
    totalLiabilities,
    netWorth
  };
};

export const calculateHoldingDetails = (holding: Holding): Holding => {
  const currentValue = holding.shares * (holding.currentPrice || 0);
  const costBasis = holding.shares * holding.costBasis;
  const gain = currentValue - costBasis;
  const percentGain = costBasis > 0 ? (gain / costBasis) * 100 : 0;

  return {
    ...holding,
    currentValue,
    gain,
    percentGain
  };
};

/**
 * Updates holdings with current prices
 * @param holdings Array of holdings to update
 * @param priceService Price service instance
 * @returns Promise that resolves with updated holdings
 */
export const updateHoldingsWithPrices = async (
  holdings: Holding[],
  priceService: PriceService
): Promise<Holding[]> => {
  return Promise.all(
    holdings.map(async (holding) => {
      try {
        const currentPrice = await priceService.getPrice(holding.symbol);
        return {
          ...holding,
          currentPrice,
          ...calculateHoldingDetails({ ...holding, currentPrice })
        };
      } catch (error) {
        console.error(`Failed to update price for ${holding.symbol}:`, error);
        return holding; // Return original holding if price update fails
      }
    })
  );
};

/**
 * Converts all asset values to a target currency
 * @param assets Array of assets
 * @param priceService Price service instance
 * @param targetCurrency Target currency code (e.g., 'eur', 'gbp')
 * @returns Promise that resolves with converted assets
 */
export const convertAssetsToCurrency = async (
  assets: Asset[],
  priceService: PriceService,
  targetCurrency: string
): Promise<Asset[]> => {
  return Promise.all(
    assets.map(async (asset) => {
      try {
        // Only convert if the asset is in a different currency
        if (asset.currency && asset.currency.toLowerCase() !== targetCurrency.toLowerCase()) {
          const convertedValue = await priceService.convertCurrency(
            asset.value,
            asset.currency.toLowerCase(),
            targetCurrency.toLowerCase()
          );

          return {
            ...asset,
            value: convertedValue,
            currency: targetCurrency.toUpperCase()
          };
        }
        return asset;
      } catch (error) {
        console.error(`Failed to convert asset ${asset.name} to ${targetCurrency}:`, error);
        return asset; // Return original asset if conversion fails
      }
    })
  );
};

/**
 * Converts all liability values to a target currency
 * @param liabilities Array of liabilities
 * @param priceService Price service instance
 * @param targetCurrency Target currency code (e.g., 'eur', 'gbp')
 * @returns Promise that resolves with converted liabilities
 */
export const convertLiabilitiesToCurrency = async (
  liabilities: Liability[],
  priceService: PriceService,
  targetCurrency: string
): Promise<Liability[]> => {
  return Promise.all(
    liabilities.map(async (liability) => {
      try {
        // Only convert if the liability is in a different currency
        if (liability.currency && liability.currency.toLowerCase() !== targetCurrency.toLowerCase()) {
          const convertedValue = await priceService.convertCurrency(
            liability.value,
            liability.currency.toLowerCase(),
            targetCurrency.toLowerCase()
          );

          return {
            ...liability,
            value: convertedValue,
            currency: targetCurrency.toUpperCase()
          };
        }
        return liability;
      } catch (error) {
        console.error(`Failed to convert liability ${liability.name} to ${targetCurrency}:`, error);
        return liability; // Return original liability if conversion fails
      }
    })
  );
};
