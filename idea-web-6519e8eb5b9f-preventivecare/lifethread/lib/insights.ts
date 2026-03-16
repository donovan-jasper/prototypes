export const calculateHealthScore = (habitLogs, totalHabits) => {
  const completedHabits = habitLogs.filter(log => log.completed).length;
  return Math.round((completedHabits / totalHabits) * 100);
};

export const findCorrelations = (habitA, habitB) => {
  if (habitA.length !== habitB.length) {
    throw new Error('Arrays must be of equal length');
  }

  const n = habitA.length;
  const sumA = habitA.reduce((a, b) => a + b, 0);
  const sumB = habitB.reduce((a, b) => a + b, 0);
  const sumProduct = habitA.reduce((sum, a, i) => sum + a * habitB[i], 0);
  const sumSquaredA = habitA.reduce((sum, a) => sum + a * a, 0);
  const sumSquaredB = habitB.reduce((sum, b) => sum + b * b, 0);

  const numerator = sumProduct - (sumA * sumB) / n;
  const denominatorA = Math.sqrt(sumSquaredA - (sumA * sumA) / n);
  const denominatorB = Math.sqrt(sumSquaredB - (sumB * sumB) / n);

  if (denominatorA === 0 || denominatorB === 0) {
    return { strength: 0, insight: 'No correlation detected' };
  }

  const strength = numerator / (denominatorA * denominatorB);

  let insight;
  if (strength > 0.7) {
    insight = `Strong positive correlation: When you do ${habitA.name}, you tend to ${habitB.name} more.`;
  } else if (strength > 0.5) {
    insight = `Moderate positive correlation: There's a trend where ${habitA.name} and ${habitB.name} happen together.`;
  } else if (strength > 0.3) {
    insight = `Weak positive correlation: You might ${habitB.name} slightly more when you ${habitA.name}.`;
  } else if (strength < -0.7) {
    insight = `Strong negative correlation: When you do ${habitA.name}, you tend to ${habitB.name} less.`;
  } else if (strength < -0.5) {
    insight = `Moderate negative correlation: There's a trend where ${habitA.name} and ${habitB.name} happen less together.`;
  } else if (strength < -0.3) {
    insight = `Weak negative correlation: You might ${habitB.name} slightly less when you ${habitA.name}.`;
  } else {
    insight = 'No significant correlation detected.';
  }

  return { strength, insight };
};

export const generateInsights = (habitLogs) => {
  const insights = [];
  const habits = [...new Set(habitLogs.map(log => log.habitId))];

  for (let i = 0; i < habits.length; i++) {
    for (let j = i + 1; j < habits.length; j++) {
      const habitALogs = habitLogs.filter(log => log.habitId === habits[i]);
      const habitBLogs = habitLogs.filter(log => log.habitId === habits[j]);

      const correlation = findCorrelations(
        habitALogs.map(log => log.completed ? 1 : 0),
        habitBLogs.map(log => log.completed ? 1 : 0)
      );

      if (Math.abs(correlation.strength) > 0.3) {
        insights.push({
          habitA: habitALogs[0].habitName,
          habitB: habitBLogs[0].habitName,
          strength: correlation.strength,
          insight: correlation.insight,
        });
      }
    }
  }

  return insights;
};
