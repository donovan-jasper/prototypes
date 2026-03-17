import { Text, View, StyleSheet } from 'react-native';

export default function ResourceFinderScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Resource Finder Screen</Text>
      <Text style={styles.subtitle}>Location-based search for shelters, food banks, legal aid, etc.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
});
