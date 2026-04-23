import { CachedPrice } from './types';

// Mock external API for fetching prices
const mockExternalApiPrices = {
  AAPL: 180,
  BTC: 65000,
  ETH: 3500,
  TSLA: 800,
  AMZN: 3500,
  GOOGL: 2800,
  MSFT: 350,
  FB: 350,
  NVDA: 250,
  PYPL: 250,
  GME: 25, // Base price for GME
  DOGE: 0.15, // Base price for DOGE
};

/**
 * Default implementation for fetching from an external API with some delay and variability.
 * In a real application, this would integrate with a third-party financial data API.
 */
const defaultFetchFromExternalApi = async (symbol: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const basePrice = mockExternalApiPrices[symbol];
      if (basePrice !== undefined) {
        // Simulate slight real-time fluctuation for premium tier feel
        const fluctuation = Math.random() * 0.02 - 0.01; // +/- 1%
        resolve(basePrice * (1 + fluctuation));
      } else {
        reject(new Error(`Asset not found: ${symbol}`));
      }
    }, 500 + Math.random() * 200); // Simulate network delay
  });
};

export class PriceService {
  private isPremium: boolean;
  private cache: Map<string, CachedPrice>;
  private fetchApi: (symbol: string) => Promise<number>; // Injected fetch function for flexibility and testing
  private updateInterval: NodeJS.Timeout | null = null;
  private updateCallback: (() => void) | null = null;

  // Cache durations:
  // Free tier: daily updates (24 hours)
  // Premium tier: "real-time" (e.g., refresh every 5 minutes to minimize API calls while still being fresh)
  private FREE_TIER_CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours
  private PREMIUM_TIER_CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

  /**
   * Initializes the PriceService.
   * @param isPremium Boolean indicating if the user has a premium subscription.
   * @param fetchApi Optional. A function to fetch prices from an external API. Defaults to a mock implementation.
   */
  constructor(isPremium: boolean, fetchApi: (symbol: string) => Promise<number> = defaultFetchFromExternalApi) {
    this.isPremium = isPremium;
    this.cache = new Map<string, CachedPrice>();
    this.fetchApi = fetchApi;
  }

  /**
   * Fetches the current price for a given asset symbol, utilizing caching based on subscription tier.
   * If a price is cached and still valid according to the tier's cache duration, it's returned.
   * Otherwise, a new price is fetched from the external API and cached.
   * If fetching fails, it attempts to return an expired cached price as a fallback.
   * @param symbol The asset symbol (e.g., 'AAPL', 'BTC').
   * @returns The current price of the asset.
   */
  public async getPrice(symbol: string): Promise<number> {
    const cacheDuration = this.isPremium
      ? this.PREMIUM_TIER_CACHE_DURATION_MS
      : this.FREE_TIER_CACHE_DURATION_MS;

    const cached = this.cache.get(symbol);
    const now = Date.now();

    if (cached && (now - cached.timestamp < cacheDuration)) {
      // console.log(`[PriceService] Cache hit for ${symbol} (Premium: ${this.isPremium})`);
      return cached.price;
    }

    // console.log(`[PriceService] Cache miss/expired for ${symbol} (Premium: ${this.isPremium}), fetching...`);
    try {
      const price = await this.fetchApi(symbol);
      this.cache.set(symbol, { price, timestamp: now });
      return price;
    } catch (error) {
      console.error(`[PriceService] Failed to fetch price for ${symbol}:`, error);
      // If fetching fails, return cached price if available, even if expired, to provide some data.
      // Otherwise, re-throw the error.
      if (cached) {
        console.warn(`[PriceService] Returning expired cached price for ${symbol} due to fetch error.`);
        return cached.price;
      }
      throw error;
    }
  }

  /**
   * Starts periodic price updates
   * @param intervalMs Update interval in milliseconds
   * @param callback Function to call after each update
   */
  public startPeriodicUpdates(intervalMs: number, callback: () => void): void {
    this.stopPeriodicUpdates(); // Clear any existing interval
    this.updateCallback = callback;

    this.updateInterval = setInterval(async () => {
      try {
        // Get all cached symbols
        const symbols = Array.from(this.cache.keys());

        // Update prices for all cached symbols
        await Promise.all(
          symbols.map(async (symbol) => {
            try {
              const price = await this.fetchApi(symbol);
              this.cache.set(symbol, { price, timestamp: Date.now() });
            } catch (error) {
              console.error(`[PriceService] Failed to update price for ${symbol}:`, error);
            }
          })
        );

        // Notify that updates are complete
        if (this.updateCallback) {
          this.updateCallback();
        }
      } catch (error) {
        console.error('[PriceService] Error during periodic updates:', error);
      }
    }, intervalMs);
  }

  /**
   * Stops periodic price updates
   */
  public stopPeriodicUpdates(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    this.updateCallback = null;
  }

  /**
   * Clears the price cache for a specific symbol or all symbols.
   * @param symbol Optional. If provided, only clears the cache for this symbol. Otherwise, clears all.
   */
  public clearCache(symbol?: string): void {
    if (symbol) {
      this.cache.delete(symbol);
      // console.log(`[PriceService] Cache cleared for ${symbol}`);
    } else {
      this.cache.clear();
      // console.log('[PriceService] All cache cleared');
    }
  }

  /**
   * Updates the premium status of the service. If the status changes, the cache is cleared
   * to ensure new price fetches adhere to the updated tier's caching rules immediately.
   * @param isPremium New premium status.
   */
  public setPremiumStatus(isPremium: boolean): void {
    if (this.isPremium !== isPremium) {
      this.isPremium = isPremium;
      this.clearCache(); // Clear cache to apply new refresh rates immediately
      // console.log(`[PriceService] Premium status updated to: ${isPremium}`);
    }
  }
}

// Singleton instance for the app to use
export const priceService = new PriceService(false);
