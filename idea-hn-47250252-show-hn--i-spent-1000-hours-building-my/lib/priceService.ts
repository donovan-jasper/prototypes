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
  GME: 25,
  DOGE: 0.15,
};

/**
 * Fetches prices from CoinGecko API
 * @param symbol The asset symbol (e.g., 'BTC', 'ETH')
 * @returns Promise with the current price
 */
const fetchFromCoinGecko = async (symbol: string): Promise<number> => {
  try {
    // CoinGecko API endpoints
    const endpoints = {
      'BTC': 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd',
      'ETH': 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd',
      'SOL': 'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd',
      'ADA': 'https://api.coingecko.com/api/v3/simple/price?ids=cardano&vs_currencies=usd',
      'DOT': 'https://api.coingecko.com/api/v3/simple/price?ids=polkadot&vs_currencies=usd',
      'AAPL': 'https://api.coingecko.com/api/v3/simple/price?ids=apple&vs_currencies=usd',
      'MSFT': 'https://api.coingecko.com/api/v3/simple/price?ids=microsoft&vs_currencies=usd',
      'GOOGL': 'https://api.coingecko.com/api/v3/simple/price?ids=alphabet&vs_currencies=usd',
      'AMZN': 'https://api.coingecko.com/api/v3/simple/price?ids=amazon&vs_currencies=usd',
      'TSLA': 'https://api.coingecko.com/api/v3/simple/price?ids=tesla&vs_currencies=usd',
    };

    const endpoint = endpoints[symbol];
    if (!endpoint) {
      throw new Error(`No CoinGecko endpoint configured for symbol: ${symbol}`);
    }

    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`CoinGecko API request failed with status ${response.status}`);
    }

    const data = await response.json();

    // Map the response to the expected format
    const priceData = {
      'BTC': data.bitcoin?.usd,
      'ETH': data.ethereum?.usd,
      'SOL': data.solana?.usd,
      'ADA': data.cardano?.usd,
      'DOT': data.polkadot?.usd,
      'AAPL': data.apple?.usd,
      'MSFT': data.microsoft?.usd,
      'GOOGL': data.alphabet?.usd,
      'AMZN': data.amazon?.usd,
      'TSLA': data.tesla?.usd,
    };

    const price = priceData[symbol];
    if (!price) {
      throw new Error(`No price data found for symbol: ${symbol}`);
    }

    return price;
  } catch (error) {
    console.error(`Error fetching price from CoinGecko for ${symbol}:`, error);
    // Fallback to mock data if API fails
    if (mockExternalApiPrices[symbol]) {
      console.log(`Falling back to mock price for ${symbol}`);
      return mockExternalApiPrices[symbol];
    }
    throw error;
  }
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
   * @param fetchApi Optional. A function to fetch prices from an external API. Defaults to CoinGecko implementation.
   */
  constructor(isPremium: boolean, fetchApi: (symbol: string) => Promise<number> = fetchFromCoinGecko) {
    this.isPremium = isPremium;
    this.cache = new Map<string, CachedPrice>();
    this.fetchApi = fetchApi;
  }

  /**
   * Fetches the current price for a given asset symbol, utilizing caching based on subscription tier.
   * If a price is cached and still valid according to the tier's cache duration, it's returned.
   * Otherwise, a new price is fetched from the external API and cached.
   * If fetching fails, it attempts to return an expired cached price as a fallback.
   * @param symbol The asset symbol to fetch the price for.
   * @returns A promise that resolves with the current price.
   */
  public async getPrice(symbol: string): Promise<number> {
    const cacheKey = symbol.toUpperCase();
    const cachedPrice = this.cache.get(cacheKey);
    const now = Date.now();
    const cacheDuration = this.isPremium ? this.PREMIUM_TIER_CACHE_DURATION_MS : this.FREE_TIER_CACHE_DURATION_MS;

    // Check if we have a valid cached price
    if (cachedPrice && (now - cachedPrice.timestamp) < cacheDuration) {
      return cachedPrice.price;
    }

    try {
      // Fetch fresh price from API
      const price = await this.fetchApi(cacheKey);

      // Update cache
      this.cache.set(cacheKey, {
        price,
        timestamp: now
      });

      // Notify subscribers if there's a callback
      if (this.updateCallback) {
        this.updateCallback();
      }

      return price;
    } catch (error) {
      console.error(`Failed to fetch price for ${symbol}:`, error);

      // If we have an expired cached price, return that as fallback
      if (cachedPrice) {
        console.log(`Returning expired cached price for ${symbol}`);
        return cachedPrice.price;
      }

      // If we have no cached price at all, throw the error
      throw error;
    }
  }

  /**
   * Starts periodic updates of all cached prices.
   * @param intervalMs The interval in milliseconds between updates.
   * @param callback Optional callback to be called after each update cycle.
   */
  public startPeriodicUpdates(intervalMs: number, callback?: () => void): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    this.updateCallback = callback;
    this.updateInterval = setInterval(async () => {
      try {
        // Update all cached symbols
        const symbols = Array.from(this.cache.keys());
        await Promise.all(symbols.map(symbol => this.getPrice(symbol)));

        if (this.updateCallback) {
          this.updateCallback();
        }
      } catch (error) {
        console.error('Error during periodic price updates:', error);
      }
    }, intervalMs);
  }

  /**
   * Stops periodic updates.
   */
  public stopPeriodicUpdates(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  /**
   * Clears the price cache.
   */
  public clearCache(): void {
    this.cache.clear();
  }

  /**
   * Gets the last update time for a symbol.
   * @param symbol The asset symbol.
   * @returns The timestamp of the last update, or null if never updated.
   */
  public getLastUpdateTime(symbol: string): number | null {
    const cacheKey = symbol.toUpperCase();
    const cachedPrice = this.cache.get(cacheKey);
    return cachedPrice ? cachedPrice.timestamp : null;
  }

  /**
   * Converts a price between currencies using CoinGecko's exchange rates API.
   * @param amount The amount to convert.
   * @param fromCurrency The currency to convert from (e.g., 'usd').
   * @param toCurrency The currency to convert to (e.g., 'eur').
   * @returns A promise that resolves with the converted amount.
   */
  public async convertCurrency(amount: number, fromCurrency: string, toCurrency: string): Promise<number> {
    try {
      const response = await fetch(`https://api.coingecko.com/api/v3/exchange_rates`);
      if (!response.ok) {
        throw new Error(`Failed to fetch exchange rates: ${response.status}`);
      }

      const data = await response.json();
      const rates = data.rates;

      if (!rates[fromCurrency] || !rates[toCurrency]) {
        throw new Error(`Currency not found in exchange rates: ${fromCurrency} or ${toCurrency}`);
      }

      const fromRate = rates[fromCurrency].value;
      const toRate = rates[toCurrency].value;

      // Convert amount from fromCurrency to toCurrency
      const convertedAmount = (amount / fromRate) * toRate;
      return convertedAmount;
    } catch (error) {
      console.error('Error converting currency:', error);
      throw error;
    }
  }
}
