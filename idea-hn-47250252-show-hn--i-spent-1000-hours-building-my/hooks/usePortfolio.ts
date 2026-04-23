import { useState, useEffect, useCallback } from 'react';
import { getHoldings, updateHolding } from '../lib/database';
import { priceService } from '../lib/priceService';
import { Holding, PortfolioSummary } from '../lib/types';
import { calculatePortfolioGains, updateHoldingsWithPrices } from '../lib/calculations';

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

      // Update holdings with current prices
      const updatedHoldings = await updateHoldingsWithPrices(holdingsData, priceService);

      // Save updated prices to database
      await Promise.all(
        updatedHoldings.map(holding =>
          updateHolding({
            ...holding,
            currentPrice: holding.currentPrice || 0
          })
        )
      );

      // Calculate portfolio metrics
      const portfolioMetrics = calculatePortfolioGains(updatedHoldings);

      setPortfolio({
        totalValue: portfolioMetrics.totalValue,
        totalGain: portfolioMetrics.totalGain,
        totalPercentGain: portfolioMetrics.totalPercentGain,
        holdings: updatedHoldings,
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

  // Start periodic updates when component mounts
  useEffect(() => {
    // Set up periodic updates (every 5 minutes for premium, every hour for free)
    const updateInterval = priceService.isPremium ? 5 * 60 * 1000 : 60 * 60 * 1000;

    priceService.startPeriodicUpdates(updateInterval, () => {
      // When prices are updated, refresh the portfolio data
      fetchPortfolioData();
    });

    // Initial fetch
    fetchPortfolioData();

    // Clean up on unmount
    return () => {
      priceService.stopPeriodicUpdates();
    };
  }, [fetchPortfolioData]);

  return { portfolio, loading, error, refreshPortfolio };
};
