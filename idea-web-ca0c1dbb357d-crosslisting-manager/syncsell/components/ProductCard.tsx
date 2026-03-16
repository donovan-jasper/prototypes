import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function ProductCard({ product }) {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => router.push(`/product/${product.id}`)}
    >
      <Image source={{ uri: product.imageUri }} style={styles.image} />
      <View style={styles.details}>
        <Text style={styles.title}>{product.title}</Text>
        <Text style={styles.price}>${product.price}</Text>
        <Text style={styles.inventory}>Inventory: {product.inventory}</Text>
        <View style={styles.platforms}>
          {product.platforms.map((platform) => (
            <View key={platform} style={styles.platformBadge}>
              <Text style={styles.platformText}>{platform}</Text>
            </View>
          ))}
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => router.push(`/product/${product.id}`)}>
          <MaterialIcons name="edit" size={24} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {}}>
          <MaterialIcons name="delete" size={24} color="#666" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  details: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    color: '#4CAF50',
    marginBottom: 4,
  },
  inventory: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  platforms: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  platformBadge: {
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    padding: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  platformText: {
    fontSize: 12,
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 50,
  },
});
