import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Title, Paragraph, Badge } from 'react-native-paper';

export function ProductCard({ product, onPress }) {
  return (
    <TouchableOpacity onPress={onPress}>
      <Card style={styles.card}>
        <Card.Cover source={{ uri: product.imageUrl }} />
        <Card.Content>
          <Title>{product.name}</Title>
          <Paragraph>{product.brand}</Paragraph>
          <Paragraph>${product.price}</Paragraph>
          <View style={styles.specs}>
            <Badge style={styles.badge}>{product.impedance}Ω</Badge>
            <Badge style={styles.badge}>{product.power}W</Badge>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 8,
    width: 150,
  },
  specs: {
    flexDirection: 'row',
    marginTop: 8,
  },
  badge: {
    marginRight: 8,
  },
});
