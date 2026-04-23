import { useState, useEffect, useCallback } from 'react';
import { getHoldings } from '../lib/database';
import { PriceService } from '../lib/priceService';
import { Holding, PortfolioSummary } from '../lib/types';
import { calculatePortfolioGains } from '../lib/calculations';

const priceService = new PriceService(false); // Default to free tier

export const usePortfolio = () => {
  const [portfolio, setPortfolio] = useState<PortfolioSummary>({
    totalValue: 0,
    totalGain: 0,
    totalPercentGain: 0,
    holdings: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPortfolioData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get holdings from database
      const holdingsData = await getHoldings();

      // Fetch current prices for each holding
      const updatedHoldings = await Promise.all(
        holdingsData.map(async (holding) => {
          try {
            const currentPrice = await priceService.getPrice(holding.symbol);
            return {
              ...holding,
              currentPrice,
            };
          } catch (err) {
            console.error(`Failed to fetch price for ${holding.symbol}:`, err);
            return {
              ...holding,
              currentPrice: undefined,
            };
          }
        })
      );

      // Calculate portfolio metrics
      const portfolioMetrics = calculatePortfolioGains(updatedHoldings);

      // Add calculated values to each holding
      const holdingsWithCalculations = updatedHoldings.map((holding) => {
        const costBasis = holding.shares * holding.costBasis;
        const currentValue = holding.shares * (holding.currentPrice || 0);
        const gain = currentValue - costBasis;
        const percentGain = costBasis > 0 ? (gain / costBasis) * 100 : 0;

        return {
          ...holding,
          currentValue,
          gain,
          percentGain,
        };
      });

      setPortfolio({
        totalValue: portfolioMetrics.totalValue,
        totalGain: portfolioMetrics.totalGain,
        totalPercentGain: portfolioMetrics.totalPercentGain,
        holdings: holdingsWithCalculations,
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load portfolio'));
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshPortfolio = useCallback(async () => {
    // Clear price cache to force fresh data
    priceService.clearCache();
    await fetchPortfolioData();
  }, [fetchPortfolioData]);

  useEffect(() => {
    fetchPortfolioData();
  }, [fetchPortfolioData]);

  return { portfolio, loading, error, refreshPortfolio };
};
