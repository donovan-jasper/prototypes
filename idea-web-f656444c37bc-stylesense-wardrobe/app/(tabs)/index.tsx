import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { generateOutfits } from '@/lib/ai/outfitGenerator';
import { getItems } from '@/lib/database';
import { getWeather } from '@/lib/weather';
import { getTodayEvents } from '@/lib/calendar';
import SuggestionCard from '@/components/SuggestionCard';
import { OutfitSuggestion } from '@/types';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const [outfitSuggestions, setOutfitSuggestions] = useState<OutfitSuggestion[]>([]);
  const [weather, setWeather] = useState<{ temp: number; condition: string } | null>(null);
  const [events, setEvents] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      // Fetch weather data
      const weatherData = await getWeather();
      setWeather(weatherData);

      // Fetch calendar events
      const todayEvents = await getTodayEvents();
      setEvents(todayEvents);

      // Generate outfit suggestions
      const items = await getItems();
      const suggestions = await generateOutfits(items, {
        weather: weatherData.condition,
        temp: weatherData.temp,
        events: todayEvents
      });
      setOutfitSuggestions(suggestions);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading your outfit suggestions...</Text>
      </View>
    );
  }

  if (outfitSuggestions.length === 0) {
    return (
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
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

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Good morning!</Text>
        <Text style={styles.subtitle}>Here are your outfit suggestions for today</Text>
      </View>

      {weather && (
        <View style={styles.weatherCard}>
          <Text style={styles.weatherText}>
            {weather.condition === 'sunny' ? '☀️' : weather.condition === 'rainy' ? '🌧️' : '⛅️'}
            {' '}{Math.round(weather.temp)}°F, {weather.condition}
          </Text>
          <Text style={styles.weatherSubtext}>
            {weather.temp > 70 ? 'Perfect weather for light layers' :
             weather.temp > 50 ? 'Consider a light jacket' :
             'Bundle up with warm layers'}
          </Text>
        </View>
      )}

      {events.length > 0 && (
        <View style={styles.eventsCard}>
          <Text style={styles.eventsTitle}>Today's events:</Text>
          {events.map((event, index) => (
            <Text key={index} style={styles.eventItem}>• {event}</Text>
          ))}
        </View>
      )}

      <View style={styles.suggestionsContainer}>
        {outfitSuggestions.map((suggestion, index) => (
          <SuggestionCard
            key={index}
            suggestion={suggestion}
            onRefresh={onRefresh}
          />
        ))}
      </View>

      <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
        <Text style={styles.refreshButtonText}>Get New Suggestions</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  weatherCard: {
    backgroundColor: '#e3f2fd',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  weatherText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  weatherSubtext: {
    fontSize: 14,
    color: '#424242',
    marginTop: 4,
  },
  eventsCard: {
    backgroundColor: '#fff3e0',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  eventsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e65100',
    marginBottom: 8,
  },
  eventItem: {
    fontSize: 14,
    color: '#5d4037',
    marginBottom: 4,
  },
  suggestionsContainer: {
    marginBottom: 16,
  },
  refreshButton: {
    backgroundColor: '#2196f3',
    padding: 12,
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  refreshButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  addButton: {
    backgroundColor: '#4caf50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
