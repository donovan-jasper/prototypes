import { View, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { getProductById } from '../../lib/database/queries';
import { Card, Title, Paragraph, Button, DataTable } from 'react-native-paper';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const loadProduct = async () => {
      const result = await getProductById(id);
      setProduct(result);
    };
    loadProduct();
  }, [id]);

  if (!product) {
    return <View />;
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Cover source={{ uri: product.imageUrl }} />
        <Card.Content>
          <Title>{product.name}</Title>
          <Paragraph>{product.brand}</Paragraph>
          <Paragraph>${product.price}</Paragraph>
        </Card.Content>
      </Card>
      <DataTable style={styles.table}>
        <DataTable.Header>
          <DataTable.Title>Specification</DataTable.Title>
          <DataTable.Title>Value</DataTable.Title>
        </DataTable.Header>
        <DataTable.Row>
          <DataTable.Cell>Impedance</DataTable.Cell>
          <DataTable.Cell>{product.impedance}Ω</DataTable.Cell>
        </DataTable.Row>
        <DataTable.Row>
          <DataTable.Cell>Power Handling</DataTable.Cell>
          <DataTable.Cell>{product.power}W</DataTable.Cell>
        </DataTable.Row>
        <DataTable.Row>
          <DataTable.Cell>Connections</DataTable.Cell>
          <DataTable.Cell>{product.connections.join(', ')}</DataTable.Cell>
        </DataTable.Row>
      </DataTable>
      <Button
        mode="contained"
        onPress={() => console.log('Add to system')}
        style={styles.button}
      >
        Add to System
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  table: {
    marginBottom: 16,
  },
  button: {
    marginTop: 16,
  },
});
