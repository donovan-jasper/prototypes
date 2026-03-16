import { format, subWeeks, isWithinInterval } from 'date-fns';

export const calculateWeeklyEarnings = (sales) => {
  const now = new Date();
  const oneWeekAgo = subWeeks(now, 1);

  const weeklySales = sales.filter((sale) =>
    isWithinInterval(new Date(sale.soldAt), { start: oneWeekAgo, end: now })
  );

  const total = weeklySales.reduce((sum, sale) => sum + sale.amount, 0);

  const previousWeekSales = sales.filter((sale) =>
    isWithinInterval(new Date(sale.soldAt), { start: subWeeks(oneWeekAgo, 1), end: oneWeekAgo })
  );

  const previousTotal = previousWeekSales.reduce((sum, sale) => sum + sale.amount, 0);

  const change = previousTotal === 0 ? 0 : ((total - previousTotal) / previousTotal) * 100;

  return { total, change };
};

export const getTopProducts = (sales, limit) => {
  const productSales = sales.reduce((acc, sale) => {
    if (!acc[sale.productId]) {
      acc[sale.productId] = { total: 0, title: sale.productTitle };
    }
    acc[sale.productId].total += sale.amount;
    return acc;
  }, {});

  const sortedProducts = Object.entries(productSales)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);

  return sortedProducts;
};

export const suggestPostingTime = (sales) => {
  const salesByHour = Array(24).fill(0);

  sales.forEach((sale) => {
    const hour = new Date(sale.soldAt).getHours();
    salesByHour[hour]++;
  });

  const bestHour = salesByHour.indexOf(Math.max(...salesByHour));

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const bestDay = days[new Date(sales[0].soldAt).getDay()];

  return `Post at ${bestHour}:00 on ${bestDay}s`;
};
