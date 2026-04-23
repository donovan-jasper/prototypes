import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
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

  useEffect(() => {
    async function loadData() {
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
      }
    }

    loadData();
  }, []);

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const items = await getItems();
      const suggestions = await generateOutfits(items, {
        weather: weather?.condition || 'sunny',
        temp: weather?.temp || 72,
        events: events
      });
      setOutfitSuggestions(suggestions);
    } catch (error) {
      console.error('Error refreshing suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading your outfit suggestions...</Text>
      </View>
    );
  }

  if (outfitSuggestions.length === 0) {
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

  return (
    <ScrollView style={styles.container}>
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
            onRefresh={handleRefresh}
          />
        ))}
      </View>

      <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
        <Text style={styles.refreshButtonText}>Get New Suggestions</Text>
      </TouchableOpacity>
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
  eventsCard: {
    backgroundColor: '#f8fafc',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  eventsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  eventItem: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 4,
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
  suggestionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  refreshButton: {
    backgroundColor: '#f1f5f9',
    padding: 16,
    marginHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 30,
  },
  refreshButtonText: {
    color: '#0369a1',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
