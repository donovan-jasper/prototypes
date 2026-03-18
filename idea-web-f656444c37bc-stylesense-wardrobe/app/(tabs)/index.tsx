import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Good morning!</Text>
        <Text style={styles.subtitle}>Here are your outfit suggestions for today</Text>
      </View>

      <View style={styles.weatherCard}>
        <Text style={styles.weatherText}>☀️ 72°F, Sunny</Text>
        <Text style={styles.weatherSubtext}>Perfect weather for light layers</Text>
      </View>

      <View style={styles.emptyState}>
        <Text style={styles.emptyIcon}>👕</Text>
        <Text style={styles.emptyTitle}>Build your wardrobe first</Text>
        <Text style={styles.emptyText}>
          Add some clothing items to get personalized outfit suggestions
        </Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/item/add')}
        >
          <Text style={styles.addButtonText}>Add Your First Item</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  weatherCard: {
    backgroundColor: '#f0f9ff',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  weatherText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0369a1',
    marginBottom: 4,
  },
  weatherSubtext: {
    fontSize: 14,
    color: '#0c4a6e',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 10,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
