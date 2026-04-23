import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { generateOutfits } from '@/lib/ai/outfitGenerator';
import { getItems } from '@/lib/database';
import { getWeather } from '@/lib/weather';
import { getTodayEvents } from '@/lib/calendar';
import SuggestionCard from '@/components/SuggestionCard';
import { OutfitSuggestion } from '@/types';
import { useWardrobeStore } from '@/store/wardrobeStore';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const { items: wardrobeItems } = useWardrobeStore();
  const [outfitSuggestions, setOutfitSuggestions] = useState<OutfitSuggestion[]>([]);
  const [weather, setWeather] = useState<{ temp: number; condition: string } | null>(null);
  const [events, setEvents] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);

      // Fetch weather data
      const weatherData = await getWeather();
      setWeather(weatherData);

      // Fetch calendar events
      const todayEvents = await getTodayEvents();
      setEvents(todayEvents);

      // Generate outfit suggestions
      const items = wardrobeItems.length > 0 ? wardrobeItems : await getItems();
      const suggestions = await generateOutfits(items, {
        weather: weatherData.condition,
        temp: weatherData.temp,
        events: todayEvents
      });
      setOutfitSuggestions(suggestions);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load outfit suggestions. Please try again.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [wardrobeItems]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const handleSuggestionAccepted = useCallback(() => {
    // Refresh suggestions after an outfit is accepted
    setTimeout(() => {
      loadData();
    }, 500);
  }, [loadData]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Loading your outfit suggestions...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (wardrobeItems.length === 0) {
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

        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>👗</Text>
          <Text style={styles.emptyTitle}>No suggestions available</Text>
          <Text style={styles.emptyText}>
            We couldn't find any suitable outfit combinations. Try adding more items to your wardrobe.
          </Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/item/add')}
          >
            <Text style={styles.addButtonText}>Add More Items</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          <Text style={styles.refreshButtonText}>Get New Suggestions</Text>
        </TouchableOpacity>
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
            onAccepted={handleSuggestionAccepted}
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
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#6200ee',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    marginBottom: 20,
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
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  weatherText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  weatherSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  eventsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  eventItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  suggestionsContainer: {
    marginBottom: 20,
  },
  refreshButton: {
    backgroundColor: '#6200ee',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyState: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#6200ee',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
