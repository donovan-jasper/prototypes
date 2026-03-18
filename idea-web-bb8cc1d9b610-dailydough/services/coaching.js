import { getDatabase } from './database';

export async function generatePersonalizedInsights() {
  const db = getDatabase();
  const insights = [];
  
  // Get current month data
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).toISOString();
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59).toISOString();
  
  // Get previous month data for comparison
  const firstDayOfPrevMonth = new Date(currentYear, currentMonth - 1, 1).toISOString();
  const lastDayOfPrevMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59).toISOString();
  
  // Get total income for current month
  const incomeResult = await db.getAllAsync(
    'SELECT SUM(amount) as total FROM income WHERE date >= ? AND date <= ?',
    [firstDayOfMonth, lastDayOfMonth]
  );
  const totalIncome = incomeResult[0]?.total || 0;
  
  // Get total expenses for current month
  const expensesResult = await db.getAllAsync(
    'SELECT SUM(amount) as total FROM expenses WHERE date >= ? AND date <= ?',
    [firstDayOfMonth, lastDayOfMonth]
  );
  const totalExpenses = expensesResult[0]?.total || 0;
  
  // Get expenses by category for current month
  const categoryBreakdown = await db.getAllAsync(
    'SELECT category, SUM(amount) as total FROM expenses WHERE date >= ? AND date <= ? GROUP BY category ORDER BY total DESC',
    [firstDayOfMonth, lastDayOfMonth]
  );
  
  // Get previous month expenses for comparison
  const prevMonthExpenses = await db.getAllAsync(
    'SELECT SUM(amount) as total FROM expenses WHERE date >= ? AND date <= ?',
    [firstDayOfPrevMonth, lastDayOfPrevMonth]
  );
  const prevTotalExpenses = prevMonthExpenses[0]?.total || 0;
  
  // Get previous month category breakdown
  const prevCategoryBreakdown = await db.getAllAsync(
    'SELECT category, SUM(amount) as total FROM expenses WHERE date >= ? AND date <= ? GROUP BY category',
    [firstDayOfPrevMonth, lastDayOfPrevMonth]
  );
  
  // Income vs Expenses insight
  if (totalIncome > 0) {
    const expenseRatio = (totalExpenses / totalIncome) * 100;
    if (expenseRatio > 90) {
      insights.push({
        type: 'warning',
        category: 'Budget',
        title: 'High Spending Alert',
        message: `You've spent $${totalExpenses.toFixed(2)} this month, which is ${expenseRatio.toFixed(0)}% of your income ($${totalIncome.toFixed(2)}). Consider reducing expenses to build savings.`,
        priority: 1
      });
    } else if (expenseRatio < 70) {
      insights.push({
        type: 'success',
        category: 'Budget',
        title: 'Great Savings Rate',
        message: `You're only spending ${expenseRatio.toFixed(0)}% of your income. You're saving $${(totalIncome - totalExpenses).toFixed(2)} this month!`,
        priority: 3
      });
    }
  }
  
  // Category-specific insights
  for (const category of categoryBreakdown) {
    const categoryPercent = totalIncome > 0 ? (category.total / totalIncome) * 100 : 0;
    
    // Food & Dining insight
    if (category.category === 'Food & Dining' && categoryPercent > 30) {
      const potentialSavings = category.total * 0.3;
      insights.push({
        type: 'tip',
        category: 'Food & Dining',
        title: 'High Dining Expenses',
        message: `You spent $${category.total.toFixed(2)} on dining this month, which is ${categoryPercent.toFixed(0)}% of your income. Consider meal prepping to save up to $${potentialSavings.toFixed(2)} per month.`,
        priority: 2
      });
    }
    
    // Transportation insight
    if (category.category === 'Transportation' && categoryPercent > 20) {
      insights.push({
        type: 'tip',
        category: 'Transportation',
        title: 'Transportation Costs',
        message: `Transportation is ${categoryPercent.toFixed(0)}% of your income ($${category.total.toFixed(2)}). Consider carpooling or public transit to reduce costs.`,
        priority: 2
      });
    }
    
    // Entertainment insight
    if (category.category === 'Entertainment' && categoryPercent > 15) {
      insights.push({
        type: 'tip',
        category: 'Entertainment',
        title: 'Entertainment Spending',
        message: `You're spending $${category.total.toFixed(2)} on entertainment (${categoryPercent.toFixed(0)}% of income). Look for free alternatives or share subscriptions with family.`,
        priority: 2
      });
    }
  }
  
  // Month-over-month comparison
  if (prevTotalExpenses > 0 && totalExpenses > 0) {
    const expenseChange = ((totalExpenses - prevTotalExpenses) / prevTotalExpenses) * 100;
    if (expenseChange > 20) {
      insights.push({
        type: 'warning',
        category: 'Trends',
        title: 'Spending Increased',
        message: `Your spending increased by ${expenseChange.toFixed(0)}% compared to last month ($${prevTotalExpenses.toFixed(2)} → $${totalExpenses.toFixed(2)}).`,
        priority: 1
      });
    } else if (expenseChange < -10) {
      insights.push({
        type: 'success',
        category: 'Trends',
        title: 'Spending Decreased',
        message: `Great job! You reduced spending by ${Math.abs(expenseChange).toFixed(0)}% compared to last month, saving $${(prevTotalExpenses - totalExpenses).toFixed(2)}.`,
        priority: 3
      });
    }
  }
  
  // Category trend analysis
  for (const category of categoryBreakdown) {
    const prevCategory = prevCategoryBreakdown.find(c => c.category === category.category);
    if (prevCategory && prevCategory.total > 0) {
      const categoryChange = ((category.total - prevCategory.total) / prevCategory.total) * 100;
      if (categoryChange > 50) {
        insights.push({
          type: 'info',
          category: category.category,
          title: `${category.category} Spike`,
          message: `Your ${category.category} spending jumped ${categoryChange.toFixed(0)}% from $${prevCategory.total.toFixed(2)} to $${category.total.toFixed(2)}.`,
          priority: 2
        });
      }
    }
  }
  
  // No data insights
  if (totalIncome === 0 && totalExpenses === 0) {
    insights.push({
      type: 'info',
      category: 'Getting Started',
      title: 'Start Tracking',
      message: 'Add your income and expenses to get personalized financial insights and recommendations.',
      priority: 1
    });
  } else if (totalIncome === 0) {
    insights.push({
      type: 'info',
      category: 'Income',
      title: 'Add Income',
      message: 'Add your income sources to see how your spending compares and get better insights.',
      priority: 1
    });
  }
  
  // Sort by priority
  insights.sort((a, b) => a.priority - b.priority);
  
  return insights;
}

export async function getCategoryBreakdown() {
  const db = getDatabase();
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).toISOString();
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59).toISOString();
  
  const breakdown = await db.getAllAsync(
    'SELECT category, SUM(amount) as total, COUNT(*) as count FROM expenses WHERE date >= ? AND date <= ? GROUP BY category ORDER BY total DESC',
    [firstDayOfMonth, lastDayOfMonth]
  );
  
  const totalExpenses = breakdown.reduce((sum, cat) => sum + cat.total, 0);
  
  return breakdown.map(cat => ({
    ...cat,
    percentage: totalExpenses > 0 ? (cat.total / totalExpenses) * 100 : 0
  }));
}

export async function getSpendingTrends() {
  const db = getDatabase();
  const trends = [];
  
  for (let i = 0; i < 6; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const month = date.getMonth();
    const year = date.getFullYear();
    const firstDay = new Date(year, month, 1).toISOString();
    const lastDay = new Date(year, month + 1, 0, 23, 59, 59).toISOString();
    
    const result = await db.getAllAsync(
      'SELECT SUM(amount) as total FROM expenses WHERE date >= ? AND date <= ?',
      [firstDay, lastDay]
    );
    
    trends.unshift({
      month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      total: result[0]?.total || 0
    });
  }
  
  return trends;
}
