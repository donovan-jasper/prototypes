import { useState, useEffect } from 'react';
import { getHoldings, addHolding as dbAddHolding, updateHolding as dbUpdateHolding, deleteHolding as dbDeleteHolding } from '../lib/database';
import { fetchAssetPrice } from '../lib/priceService';
import { Holding } from '../lib/types';
import { calculatePortfolioGains } from '../lib/calculations';

export const usePortfolio = () => {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);
  const [portfolio, setPortfolio] = useState({
    totalValue: 0,
    totalGain: 0,
    totalPercentGain: 0,
    holdings: [],
  });

  useEffect(() => {
    const loadHoldings = async () => {
      try {
        const data = await getHoldings();
        setHoldings(data);
        await updatePortfolio(data);
      } catch (error) {
        console.error('Failed to load holdings', error);
      } finally {
        setLoading(false);
      }
    };

    loadHoldings();
  }, []);

  const updatePortfolio = async (holdings: Holding[]) => {
    try {
      const updatedHoldings = await Promise.all(
        holdings.map(async (holding) => {
          const currentPrice = await fetchAssetPrice(holding.symbol);
          const gain = (currentPrice - holding.costBasis) * holding.shares;
          const percentGain = ((currentPrice - holding.costBasis) / holding.costBasis) * 100;
          const currentValue = currentPrice * holding.shares;
          return { ...holding, currentPrice, gain, percentGain, currentValue };
        })
      );

      const { totalGain, percentGain } = calculatePortfolioGains(updatedHoldings);
      const totalValue = updatedHoldings.reduce((sum, holding) => sum + holding.currentValue, 0);

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

  const addHolding = async (holding: Omit<Holding, 'id'>) => {
    try {
      const result = await dbAddHolding(holding);
      const newHolding = { ...holding, id: result.insertId };
      const updatedHoldings = [...holdings, newHolding];
      setHoldings(updatedHoldings);
      await updatePortfolio(updatedHoldings);
    } catch (error) {
      console.error('Failed to add holding', error);
      throw error;
    }
  };

  const updateHolding = async (holding: Holding) => {
    try {
      await dbUpdateHolding(holding);
      const updatedHoldings = holdings.map((h) => (h.id === holding.id ? holding : h));
      setHoldings(updatedHoldings);
      await updatePortfolio(updatedHoldings);
    } catch (error) {
      console.error('Failed to update holding', error);
      throw error;
    }
  };

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

  return { portfolio, loading, addHolding, updateHolding, deleteHolding };
};
