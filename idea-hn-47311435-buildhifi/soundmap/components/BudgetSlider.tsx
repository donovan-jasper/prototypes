import { View, StyleSheet } from 'react-native';
import { Slider, Text } from 'react-native-paper';

export function BudgetSlider({ budget, onChange }) {
  return (
    <View style={styles.container}>
      <Text>Budget: ${budget}</Text>
      <Slider
        value={budget}
        onValueChange={onChange}
        minimumValue={0}
        maximumValue={10000}
        step={100}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
});
