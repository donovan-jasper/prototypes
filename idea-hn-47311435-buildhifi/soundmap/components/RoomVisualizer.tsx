import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

export function RoomVisualizer({ dimensions }) {
  return (
    <View style={[styles.container, { width: dimensions.width * 20, height: dimensions.height * 20 }]}>
      <Text>Room Visualizer</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
