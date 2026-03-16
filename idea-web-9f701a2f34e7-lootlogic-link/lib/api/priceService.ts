export const fetchItemPrice = (game: string, itemId: string): Promise<number> => {
  return Promise.resolve(Math.floor(Math.random() * 1000) + 500);
};

export const getPriceHistory = (itemId: string): Promise<Array<{ date: string; price: number }>> => {
  const history = [];
  for (let i = 0; i < 30; i++) {
    history.push({
      date: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      price: Math.floor(Math.random() * 1000) + 500,
    });
  }
  return Promise.resolve(history);
};

export const shouldBuyNow = (currentPrice: number, averagePrice: number): boolean => {
  return currentPrice < averagePrice * 0.8;
};
