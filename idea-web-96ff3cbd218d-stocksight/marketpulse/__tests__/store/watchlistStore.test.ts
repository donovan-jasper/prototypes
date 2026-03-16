import { useWatchlistStore } from '../../store/watchlistStore';

describe('Watchlist Store', () => {
  it('should add a stock to the watchlist', () => {
    const { addStock, stocks } = useWatchlistStore.getState();
    addStock('AAPL');
    expect(stocks).toContainEqual({ symbol: 'AAPL', price: 0, change: 0 });
  });

  it('should remove a stock from the watchlist', () => {
    const { removeStock, stocks } = useWatchlistStore.getState();
    removeStock('AAPL');
    expect(stocks).not.toContainEqual({ symbol: 'AAPL', price: 0, change: 0 });
  });

  it('should enforce free tier limits', () => {
    const { addStock, stocks } = useWatchlistStore.getState();
    for (let i = 0; i < 6; i++) {
      addStock(`STOCK${i}`);
    }
    expect(stocks.length).toBe(5);
  });
});
