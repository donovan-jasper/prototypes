import { View, Text, StyleSheet } from 'react-native';

export default function TicketDetailScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Ticket details coming soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    color: '#8E8E93',
  },
});
