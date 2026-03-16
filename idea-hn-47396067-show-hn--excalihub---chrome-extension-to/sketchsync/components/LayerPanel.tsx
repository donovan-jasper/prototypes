import { View, Text, StyleSheet } from 'react-native';

export function LayerPanel() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Layers</Text>
      {/* Add layer management UI here */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});
