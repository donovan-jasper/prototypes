export const calculateHealthScore = (habitLogs, totalHabits) => {
  const completedHabits = habitLogs.filter(log => log.completed).length;
  return Math.round((completedHabits / totalHabits) * 100);
};

export const findCorrelations = (habitALogs, habitBLogs) => {
  if (!habitALogs || !habitBLogs || habitALogs.length === 0 || habitBLogs.length === 0) {
    return { strength: 0, insight: 'Insufficient data for correlation' };
  }

  const habitA = habitALogs.map(log => log.completed ? 1 : 0);
  const habitB = habitBLogs.map(log => log.completed ? 1 : 0);

  if (habitA.length !== habitB.length) {
    return { strength: 0, insight: 'Data length mismatch' };
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
    insight = `Strong positive correlation detected`;
  } else if (strength > 0.5) {
    insight = `Moderate positive correlation detected`;
  } else if (strength > 0.3) {
    insight = `Weak positive correlation detected`;
  } else if (strength < -0.7) {
    insight = `Strong negative correlation detected`;
  } else if (strength < -0.5) {
    insight = `Moderate negative correlation detected`;
  } else if (strength < -0.3) {
    insight = `Weak negative correlation detected`;
  } else {
    insight = 'No significant correlation detected';
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
