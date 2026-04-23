import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useGiftStore } from '../../store/giftStore';

const HomeScreen = () => {
  const router = useRouter();
  const { gifts } = useGiftStore();

  const recentGifts = gifts.slice(0, 3);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, User!</Text>
        <Text style={styles.subtitle}>Send a gift to someone special</Text>
      </View>

      <TouchableOpacity
        style={styles.sendButton}
        onPress={() => router.push('/gift/send')}
      >
        <Text style={styles.sendButtonText}>Send a Gift</Text>
      </TouchableOpacity>

      {recentGifts.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Recent Gifts</Text>
          <View style={styles.recentGiftsContainer}>
            {recentGifts.map((gift) => (
              <TouchableOpacity
                key={gift.id}
                style={styles.giftCard}
                onPress={() => router.push(`/gift/${gift.id}`)}
              >
                <Image
                  source={{ uri: gift.restaurant.image }}
                  style={styles.giftImage}
                />
                <View style={styles.giftInfo}>
                  <Text style={styles.giftRecipient}>{gift.recipientName}</Text>
                  <Text style={styles.giftRestaurant}>{gift.restaurant.name}</Text>
                  <Text style={styles.giftStatus}>{gift.status}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      <Text style={styles.sectionTitle}>Quick Send</Text>
      <View style={styles.quickSendContainer}>
        <TouchableOpacity
          style={styles.quickSendOption}
          onPress={() => router.push('/gift/send')}
        >
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' }}
            style={styles.quickSendImage}
          />
          <Text style={styles.quickSendText}>Pizza</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickSendOption}
          onPress={() => router.push('/gift/send')}
        >
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' }}
            style={styles.quickSendImage}
          />
          <Text style={styles.quickSendText}>Tacos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickSendOption}
          onPress={() => router.push('/gift/send')}
        >
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' }}
            style={styles.quickSendImage}
          />
          <Text style={styles.quickSendText}>Sushi</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  sendButton: {
    backgroundColor: '#FF6B6B',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 30,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  recentGiftsContainer: {
    marginBottom: 30,
  },
  giftCard: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
  },
  giftImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 15,
  },
  giftInfo: {
    flex: 1,
  },
  giftRecipient: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  giftRestaurant: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  giftStatus: {
    fontSize: 12,
    color: '#FF6B6B',
    fontWeight: 'bold',
  },
  quickSendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickSendOption: {
    alignItems: 'center',
    width: '30%',
  },
  quickSendImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  quickSendText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default HomeScreen;
