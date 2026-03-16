import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Title, Paragraph, Badge } from 'react-native-paper';

export function ComponentCard({ component, onPress, onLongPress }) {
  return (
    <TouchableOpacity onPress={onPress} onLongPress={onLongPress}>
      <Card style={styles.card}>
        <Card.Cover source={{ uri: component.imageUrl }} />
        <Card.Content>
          <Title>{component.name}</Title>
          <Paragraph>{component.brand}</Paragraph>
          <View style={styles.specs}>
            <Badge style={styles.badge}>{component.impedance}Ω</Badge>
            <Badge style={styles.badge}>{component.power}W</Badge>
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
