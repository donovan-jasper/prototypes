import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  quantity: number;
  imageUri?: string;
  platforms: string[];
}

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([
    {
      id: '1',
      title: 'Vintage Leather Jacket',
      description: 'Classic brown leather jacket in excellent condition',
      price: 89.99,
      quantity: 1,
      platforms: ['eBay', 'Shopify'],
    },
    {
      id: '2',
      title: 'Handmade Ceramic Mug Set',
      description: 'Set of 4 artisan coffee mugs',
      price: 45.00,
      quantity: 3,
      platforms: ['Etsy', 'Amazon'],
    },
    {
      id: '3',
      title: 'Wireless Bluetooth Headphones',
      description: 'Noise-cancelling over-ear headphones',
      price: 129.99,
      quantity: 5,
      platforms: ['Amazon', 'eBay'],
    },
  ]);

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity style={styles.productCard}>
      <View style={styles.productImageContainer}>
        {item.imageUri ? (
          <Image source={{ uri: item.imageUri }} style={styles.productImage} />
        ) : (
          <View style={styles.productImagePlaceholder}>
            <Ionicons name="image-outline" size={40} color="#C7C7CC" />
          </View>
        )}
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.productDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.productMeta}>
          <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
          <Text style={styles.productQuantity}>Qty: {item.quantity}</Text>
        </View>
        <View style={styles.platformBadges}>
          {item.platforms.map((platform) => (
            <View key={platform} style={styles.platformBadge}>
              <Text style={styles.platformBadgeText}>{platform}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {products.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="cube-outline" size={64} color="#C7C7CC" />
          <Text style={styles.emptyStateTitle}>No products yet</Text>
          <Text style={styles.emptyStateText}>
            Tap the Create tab to add your first product
          </Text>
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  listContent: {
    padding: 16,
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImageContainer: {
    width: 100,
    height: 100,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
    padding: 12,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },
  productMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007AFF',
  },
  productQuantity: {
    fontSize: 14,
    color: '#8E8E93',
  },
  platformBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  platformBadge: {
    backgroundColor: '#E5F3FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  platformBadgeText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
});
