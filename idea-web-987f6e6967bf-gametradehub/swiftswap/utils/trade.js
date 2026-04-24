export const calculateTradeProfit = (buyPrice, sellPrice) => {
  if (typeof buyPrice !== 'number' || typeof sellPrice !== 'number' || isNaN(buyPrice) || isNaN(sellPrice)) {
    return 0;
  }
  return sellPrice - buyPrice;
};

export const formatCurrency = (amount) => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return 'N/A';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

export const getPriceColor = (profit) => {
  if (profit > 0) return 'green';
  if (profit < 0) return 'red';
  return 'black';
};
