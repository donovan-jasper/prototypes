import { useState, useEffect, useCallback } from 'react';
import { Holding, PortfolioSummary } from '../lib/types';
import { PriceService } from '../lib/priceService';
import { calculatePortfolioGains, updateHoldingsWithPrices } from '../lib/calculations';
import { getHoldings, addHolding as dbAddHolding, updateHolding as dbUpdateHolding, deleteHolding as dbDeleteHolding } from '../lib/database';

// Initialize the price service
const priceService = new PriceService(false); // false for free tier

export const usePortfolio = () => {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioSummary>({
    totalValue: 0,
    totalGain: 0,
    totalPercentGain: 0,
    holdings: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load holdings from database and update prices
  const loadHoldings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get holdings from database
      const dbHoldings = await getHoldings();

      // Update holdings with current prices
      const updatedHoldings = await updateHoldingsWithPrices(dbHoldings, priceService);

      // Calculate portfolio summary
      const portfolioSummary = calculatePortfolioGains(updatedHoldings);

      setHoldings(updatedHoldings);
      setPortfolio(portfolioSummary);
    } catch (err) {
      console.error('Error loading portfolio:', err);
      setError(err instanceof Error ? err : new Error('Failed to load portfolio'));
    } finally {
      setLoading(false);
    }
  }, []);

  // Add a new holding
  const addHolding = useCallback(async (holding: Omit<Holding, 'id'>) => {
    try {
      setLoading(true);
      setError(null);

      // Add to database
      const newHolding = await dbAddHolding(holding);

      // Get current price
      const currentPrice = await priceService.getPrice(newHolding.symbol);

      // Update the holding with current price
      const updatedHolding = {
        ...newHolding,
        currentPrice,
        ...calculateHoldingDetails({ ...newHolding, currentPrice })
      };

      // Update state
      setHoldings(prev => [...prev, updatedHolding]);
      setPortfolio(prev => calculatePortfolioGains([...prev.holdings, updatedHolding]));
    } catch (err) {
      console.error('Error adding holding:', err);
      setError(err instanceof Error ? err : new Error('Failed to add holding'));
      throw err; // Re-throw to let the caller handle it
    } finally {
      setLoading(false);
    }
  }, []);

  // Update an existing holding
  const updateHolding = useCallback(async (id: number, updates: Partial<Holding>) => {
    try {
      setLoading(true);
      setError(null);

      // Update in database
      const updatedHolding = await dbUpdateHolding(id, updates);

      // If symbol changed, get new price
      if (updates.symbol) {
        const currentPrice = await priceService.getPrice(updatedHolding.symbol);
        updatedHolding.currentPrice = currentPrice;
      }

      // Calculate derived values
      const holdingWithDetails = calculateHoldingDetails(updatedHolding);

      // Update state
      setHoldings(prev => prev.map(h => h.id === id ? holdingWithDetails : h));
      setPortfolio(prev => calculatePortfolioGains(prev.holdings.map(h => h.id === id ? holdingWithDetails : h)));
    } catch (err) {
      console.error('Error updating holding:', err);
      setError(err instanceof Error ? err : new Error('Failed to update holding'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete a holding
  const deleteHolding = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);

      // Delete from database
      await dbDeleteHolding(id);

      // Update state
      setHoldings(prev => prev.filter(h => h.id !== id));
      setPortfolio(prev => calculatePortfolioGains(prev.holdings.filter(h => h.id !== id)));
    } catch (err) {
      console.error('Error deleting holding:', err);
      setError(err instanceof Error ? err : new Error('Failed to delete holding'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh portfolio data
  const refreshPortfolio = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Clear cache to force fresh data
      priceService.clearCache();

      // Reload holdings
      await loadHoldings();
    } catch (err) {
      console.error('Error refreshing portfolio:', err);
      setError(err instanceof Error ? err : new Error('Failed to refresh portfolio'));
    } finally {
      setLoading(false);
    }
  }, [loadHoldings]);

  // Load initial data
  useEffect(() => {
    loadHoldings();

    // Set up periodic updates for premium users
    // For free tier, we'll update when the app comes to foreground
    const interval = priceService.startPeriodicUpdates(300000, () => {
      loadHoldings();
    });

    return () => {
      priceService.stopPeriodicUpdates();
    };
  }, [loadHoldings]);

  return {
    holdings,
    portfolio,
    loading,
    error,
    addHolding,
    updateHolding,
    deleteHolding,
    refreshPortfolio,
  };
};

// Helper function to calculate holding details
const calculateHoldingDetails = (holding: Holding): Holding => {
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
