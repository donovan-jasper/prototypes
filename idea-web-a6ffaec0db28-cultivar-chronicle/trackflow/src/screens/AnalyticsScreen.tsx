import React from 'react';
import { View, StyleSheet } from 'react-native';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import StreakCalendar from '../components/StreakCalendar';
import { useEntries } from '../hooks/useEntries';
import { useCategories } from '../hooks/useCategories';

const AnalyticsScreen: React.FC = () => {
  const { selectedCategoryId } = useCategories();
  const { entries } = useEntries(selectedCategoryId);

  return (
    <View style={styles.container}>
      <AnalyticsDashboard categoryId={selectedCategoryId} entries={entries} />
      <StreakCalendar entries={entries} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});

export default AnalyticsScreen;
