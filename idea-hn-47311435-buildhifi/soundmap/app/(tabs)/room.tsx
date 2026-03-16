import { View, StyleSheet } from 'react-native';
import { useState } from 'react';
import { RoomVisualizer } from '../../components/RoomVisualizer';
import { Button, TextInput } from 'react-native-paper';

export default function RoomScreen() {
  const [roomDimensions, setRoomDimensions] = useState({ width: 0, height: 0 });

  return (
    <View style={styles.container}>
      <TextInput
        label="Room Width (feet)"
        value={roomDimensions.width.toString()}
        onChangeText={(text) => setRoomDimensions({ ...roomDimensions, width: parseFloat(text) || 0 })}
        keyboardType="numeric"
        style={styles.input}
      />
      <TextInput
        label="Room Height (feet)"
        value={roomDimensions.height.toString()}
        onChangeText={(text) => setRoomDimensions({ ...roomDimensions, height: parseFloat(text) || 0 })}
        keyboardType="numeric"
        style={styles.input}
      />
      <RoomVisualizer dimensions={roomDimensions} />
      <Button
        mode="contained"
        onPress={() => console.log('Export diagram')}
        style={styles.button}
      >
        Export Diagram
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 16,
  },
});
