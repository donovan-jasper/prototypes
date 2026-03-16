import { View, Text, StyleSheet } from 'react-native';

export function CollaborationBar() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Collaborators: 1</Text>
      {/* Add active users and cursors here */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  text: {
    fontSize: 16,
  },
});
