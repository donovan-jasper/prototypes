import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../types/product';
import { useNavigation } from '@react-navigation/native';
import { useProductStore } from '../store/products';

interface ProductCardProps {
  product: Product;
  onEdit?: () => void;
  onPublish?: () => void;
}

export default function ProductCard({ product, onEdit, onPublish }: ProductCardProps) {
  const navigation = useNavigation();
  const updateProduct = useProductStore((state) => state.updateProduct);

  const handleEdit = () => {
    if (onEdit) {
      onEdit();
    } else {
      navigation.navigate('product', { id: product.id });
    }
  };

  const handlePublish = () => {
    if (onPublish) {
      onPublish();
    } else {
      Alert.alert(
        'Publish Product',
        `Are you sure you want to publish "${product.title}" to all connected platforms?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Publish',
            onPress: () => {
              updateProduct({
                ...product,
                published: true,
                publishedAt: new Date().toISOString(),
              });
            },
          },
        ]
      );
    }
  };

  return (
    <View style={styles.cardContainer}>
      <View style={styles.cardHeader}>
        {product.imageUri ? (
          <Image source={{ uri: product.imageUri }} style={styles.productImage} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="image-outline" size={40} color="#C7C7CC" />
          </View>
        )}
        <View style={styles.productInfo}>
          <Text style={styles.productTitle} numberOfLines={1}>
            {product.title}
          </Text>
          <Text style={styles.productPrice}>${product.price.toFixed(2)}</Text>
          <Text style={styles.productQuantity}>Qty: {product.quantity}</Text>
        </View>
      </View>

      <View style={styles.platformBadges}>
        {product.platforms.map((platform) => (
          <View key={platform} style={styles.platformBadge}>
            <Text style={styles.platformBadgeText}>{platform}</Text>
          </View>
        ))}
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={handleEdit}
        >
          <Ionicons name="pencil-outline" size={18} color="#007AFF" />
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.publishButton]}
          onPress={handlePublish}
        >
          <Ionicons name="cloud-upload-outline" size={18} color="#34C759" />
          <Text style={[styles.actionButtonText, styles.publishButtonText]}>
            {product.published ? 'Republish' : 'Publish'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  imagePlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 4,
  },
  productQuantity: {
    fontSize: 14,
    color: '#8E8E93',
  },
  platformBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
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
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  editButton: {
    borderColor: '#007AFF',
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  publishButton: {
    borderColor: '#34C759',
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  publishButtonText: {
    color: '#34C759',
  },
});
