import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Button, TextInput } from 'react-native-paper';
import { useProductStore } from '../../lib/store/useProductStore';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const { products, updateProduct, deleteProduct } = useProductStore();
  const product = products.find((p) => p.id === id);

  const [title, setTitle] = React.useState(product?.title || '');
  const [price, setPrice] = React.useState(product?.price || '');
  const [description, setDescription] = React.useState(product?.description || '');
  const [inventory, setInventory] = React.useState(product?.inventory || '');

  useEffect(() => {
    if (product) {
      setTitle(product.title);
      setPrice(product.price);
      setDescription(product.description);
      setInventory(product.inventory);
    }
  }, [product]);

  const handleUpdate = () => {
    updateProduct({
      ...product,
      title,
      price,
      description,
      inventory,
    });
  };

  const handleDelete = () => {
    deleteProduct(product.id);
  };

  if (!product) {
    return (
      <View style={styles.container}>
        <Text>Product not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: product.imageUri }} style={styles.image} />
      <TextInput
        label="Title"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      />
      <TextInput
        label="Price"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
        style={styles.input}
      />
      <TextInput
        label="Description"
        value={description}
        onChangeText={setDescription}
        multiline
        style={styles.input}
      />
      <TextInput
        label="Inventory"
        value={inventory}
        onChangeText={setInventory}
        keyboardType="numeric"
        style={styles.input}
      />
      <Button mode="contained" onPress={handleUpdate} style={styles.button}>
        Update Product
      </Button>
      <Button mode="outlined" onPress={handleDelete} style={styles.button}>
        Delete Product
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 16,
  },
});
