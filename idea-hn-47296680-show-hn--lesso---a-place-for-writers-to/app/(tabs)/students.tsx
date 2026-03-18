import { View, Text, StyleSheet } from 'react-native';

export default function StudentsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Students Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  text: {
    fontSize: 18,
    color: '#8E8E93',
  },
});
