import { View, StyleSheet, FlatList } from 'react-native';
import { useState, useEffect } from 'react';
import { searchProducts } from '../../lib/database/queries';
import { ProductCard } from '../../components/ProductCard';
import { Searchbar, FAB, Portal } from 'react-native-paper';

export default function LibraryScreen() {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const loadProducts = async () => {
      const results = await searchProducts(searchQuery);
      setProducts(results);
    };
    loadProducts();
  }, [searchQuery]);

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search products"
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />
      <FlatList
        data={products}
        renderItem={({ item }) => <ProductCard product={item} />}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
      />
      <Portal>
        <FAB
          icon="barcode-scan"
          style={styles.fab}
          onPress={() => console.log('Scan barcode')}
        />
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  searchbar: {
    marginBottom: 16,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
