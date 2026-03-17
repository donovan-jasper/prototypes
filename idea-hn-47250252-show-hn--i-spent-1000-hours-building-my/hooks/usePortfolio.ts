import { useState, useEffect, useRef } from 'react';
import { getHoldings, addHolding as dbAddHolding, updateHolding as dbUpdateHolding, deleteHolding as dbDeleteHolding } from '../lib/database';
import { Holding } from '../lib/types';
import { calculatePortfolioGains } from '../lib/calculations';
import { PriceService } from '../lib/priceService'; // Import the new PriceService

// Mock for premium status. In a real app, this would come from a user context or settings.
// For testing, you can toggle this value.
const MOCK_IS_PREMIUM_USER = false; // Set to true to test premium features

export const usePortfolio = () => {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(MOCK_IS_PREMIUM_USER); // State for premium status
  const priceServiceRef = useRef(new PriceService(isPremium)); // Use ref to keep instance stable

  const [portfolio, setPortfolio] = useState({
    totalValue: 0,
    totalGain: 0,
    totalPercentGain: 0,
    holdings: [],
  });

  // Effect to update PriceService instance if isPremium changes
  useEffect(() => {
    priceServiceRef.current.setPremiumStatus(isPremium);
    // When premium status changes, re-fetch prices to apply new cache rules immediately
    // This will trigger updatePortfolio with the current holdings
    updatePortfolio(holdings);
  }, [isPremium]); // Depend on isPremium

  // Effect to load holdings initially and set up price refresh interval
  useEffect(() => {
    const loadHoldingsAndSetupRefresh = async () => {
      try {
        const data = await getHoldings();
        setHoldings(data);
        await updatePortfolio(data); // Initial portfolio update with fetched prices
      } catch (error) {
        console.error('Failed to load holdings', error);
      } finally {
        setLoading(false);
      }
    };

    loadHoldingsAndSetupRefresh();

    // Set up interval for refreshing prices.
    // The actual API call frequency is managed by PriceService's internal caching.
    // This interval ensures that PriceService is queried periodically.
    const refreshIntervalMs = isPremium ? 30 * 1000 : 60 * 60 * 1000; // 30 seconds for premium, 1 hour for free
    const intervalId = setInterval(() => {
      // console.log(`[usePortfolio] Triggering price refresh (Premium: ${isPremium})...`);
      updatePortfolio(holdings); // Re-fetch prices for all holdings
    }, refreshIntervalMs);

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [holdings, isPremium]); // Depend on holdings and isPremium to re-setup interval

  /**
   * Updates the portfolio by fetching current prices for all holdings and recalculating totals.
   * @param currentHoldings The list of holdings to update.
   */
  const updatePortfolio = async (currentHoldings: Holding[]) => {
    try {
      const updatedHoldings = await Promise.all(
        currentHoldings.map(async (holding) => {
          try {
            const currentPrice = await priceServiceRef.current.getPrice(holding.symbol); // Use PriceService
            const gain = (currentPrice - holding.costBasis) * holding.shares;
            const percentGain = holding.costBasis !== 0 ? ((currentPrice - holding.costBasis) / holding.costBasis) * 100 : 0;
            const currentValue = currentPrice * holding.shares;
            return { ...holding, currentPrice, gain, percentGain, currentValue };
          } catch (priceError) {
            console.warn(`Could not fetch price for ${holding.symbol}:`, priceError);
            // If price fetch fails, use the last known currentPrice from the holding
            // This prevents the entire portfolio from failing if one price fetch fails
            const gain = (holding.currentPrice - holding.costBasis) * holding.shares;
            const percentGain = holding.costBasis !== 0 ? ((holding.currentPrice - holding.costBasis) / holding.costBasis) * 100 : 0;
            const currentValue = holding.currentPrice * holding.shares;
            return { ...holding, gain, percentGain, currentValue };
          }
        })
      );

      const { totalGain, percentGain } = calculatePortfolioGains(updatedHoldings);
      const totalValue = updatedHoldings.reduce((sum, holding) => sum + (holding.currentValue || 0), 0); // Ensure currentValue is number

      setPortfolio({
        totalValue,
        totalGain,
        totalPercentGain: percentGain,
        holdings: updatedHoldings,
      });
    } catch (error) {
      console.error('Failed to update portfolio', error);
    }
  };

  /**
   * Adds a new holding to the database and updates the portfolio.
   * @param holding The holding data (without ID and initial currentPrice).
   */
  const addHolding = async (holding: Omit<Holding, 'id' | 'currentPrice'>) => {
    try {
      const initialPrice = await priceServiceRef.current.getPrice(holding.symbol); // Fetch initial price
      const holdingWithPrice = { ...holding, currentPrice: initialPrice };
      const result = await dbAddHolding(holdingWithPrice);
      const newHolding = { ...holdingWithPrice, id: result.insertId };
      const updatedHoldings = [...holdings, newHolding];
      setHoldings(updatedHoldings);
      await updatePortfolio(updatedHoldings);
    } catch (error) {
      console.error('Failed to add holding', error);
      throw error;
    }
  };

  /**
   * Updates an existing holding in the database and refreshes the portfolio.
   * @param holding The updated holding data.
   */
  const updateHolding = async (holding: Holding) => {
    try {
      // When updating a holding, re-fetch its price immediately to ensure it's current
      const updatedPrice = await priceServiceRef.current.getPrice(holding.symbol);
      const holdingWithUpdatedPrice = { ...holding, currentPrice: updatedPrice };

      await dbUpdateHolding(holdingWithUpdatedPrice);
      const updatedHoldings = holdings.map((h) => (h.id === holding.id ? holdingWithUpdatedPrice : h));
      setHoldings(updatedHoldings);
      await updatePortfolio(updatedHoldings);
    } catch (error) {
      console.error('Failed to update holding', error);
      throw error;
    }
  };

  /**
   * Deletes a holding from the database and refreshes the portfolio.
   * @param id The ID of the holding to delete.
   */
  const deleteHolding = async (id: number) => {
    try {
      await dbDeleteHolding(id);
      const updatedHoldings = holdings.filter((h) => h.id !== id);
      setHoldings(updatedHoldings);
      await updatePortfolio(updatedHoldings);
    } catch (error) {
      console.error('Failed to delete holding', error);
      throw error;
    }
  };

  // Expose setIsPremium for testing or future settings screen to toggle premium status
  return { portfolio, loading, addHolding, updateHolding, deleteHolding, setIsPremium, isPremium };
};
