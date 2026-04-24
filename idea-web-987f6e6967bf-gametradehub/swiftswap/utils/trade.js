export const calculateTradeProfit = (buyPrice, sellPrice) => {
  if (typeof buyPrice !== 'number' || typeof sellPrice !== 'number') {
    return 0;
  }
  return sellPrice - buyPrice;
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};
