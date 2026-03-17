import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Listing } from '../lib/database';

interface ListingCardProps {
  listing: Listing;
  onPress?: () => void;
}

const PLATFORM_COLORS: Record<string, string> = {
  ebay: '#E53238',
  poshmark: '#630A34',
  mercari: '#3F51B5',
  depop: '#FF0000',
  vinted: '#09B1BA',
  etsy: '#F1641E',
};

export default function ListingCard({ listing, onPress }: ListingCardProps) {
  const images = listing.images ? JSON.parse(listing.images) : [];
  const thumbnailUri = images.length > 0 ? images[0] : null;
  
  const platformColor = PLATFORM_COLORS[listing.platform.toLowerCase()] || '#666';
  
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.imageContainer}>
        {thumbnailUri ? (
          <Image source={{ uri: thumbnailUri }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.image, styles.placeholderImage]}>
            <Text style={styles.placeholderText}>No Image</Text>
          </View>
        )}
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>{listing.title}</Text>
        
        <View style={styles.footer}>
          <Text style={styles.price}>${listing.price.toFixed(2)}</Text>
          <View style={[styles.platformBadge, { backgroundColor: platformColor }]}>
            <Text style={styles.platformText}>{listing.platform.toUpperCase()}</Text>
          </View>
        </View>
        
        <View style={styles.statusRow}>
          <View style={[styles.statusBadge, getStatusStyle(listing.status)]}>
            <Text style={styles.statusText}>{listing.status.toUpperCase()}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function getStatusStyle(status: string) {
  switch (status) {
    case 'active':
      return { backgroundColor: '#4CAF50' };
    case 'sold':
      return { backgroundColor: '#2196F3' };
    case 'draft':
      return { backgroundColor: '#9E9E9E' };
    case 'expired':
      return { backgroundColor: '#FF9800' };
    default:
      return { backgroundColor: '#666' };
  }
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: 200,
    backgroundColor: '#f5f5f5',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
  },
  placeholderText: {
    color: '#999',
    fontSize: 14,
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2E7D32',
  },
  platformBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  platformText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  statusRow: {
    flexDirection: 'row',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
});
