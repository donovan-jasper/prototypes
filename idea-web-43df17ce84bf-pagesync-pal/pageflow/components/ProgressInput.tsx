import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';
import { ProgressUnit } from '../types';

interface ProgressInputProps {
  currentProgress: number;
  totalProgress: number;
  unit: ProgressUnit;
  onUpdate: (progress: number) => void;
}

const ProgressInput: React.FC<ProgressInputProps> = ({
  currentProgress,
  totalProgress,
  unit,
  onUpdate,
}) => {
  const [progress, setProgress] = useState(currentProgress.toString());

  const handleUpdate = () => {
    const newProgress = parseFloat(progress);
    if (!isNaN(newProgress) && newProgress >= 0 && newProgress <= totalProgress) {
      onUpdate(newProgress);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={progress}
        onChangeText={setProgress}
      />
      <Text style={styles.unit}>/{totalProgress} {unit}</Text>
      <Button title="Update Progress" onPress={handleUpdate} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginRight: 8,
  },
  unit: {
    marginRight: 8,
  },
});

export default ProgressInput;
