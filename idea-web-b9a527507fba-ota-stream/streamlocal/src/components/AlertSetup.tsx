import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Switch, Text } from 'react-native-paper';

interface AlertSetupProps {
  onSave: (alert: { program: string; time: string; weather: boolean; breakingNews: boolean }) => void;
}

const AlertSetup: React.FC<AlertSetupProps> = ({ onSave }) => {
  const [program, setProgram] = useState('');
  const [time, setTime] = useState('');
  const [weather, setWeather] = useState(false);
  const [breakingNews, setBreakingNews] = useState(false);

  const handleSave = () => {
    onSave({ program, time, weather, breakingNews });
  };

  return (
    <View style={styles.container}>
      <TextInput
        label="Program Name"
        value={program}
        onChangeText={setProgram}
        style={styles.input}
      />
      <TextInput
        label="Time"
        value={time}
        onChangeText={setTime}
        style={styles.input}
      />
      <View style={styles.switchContainer}>
        <Text>Weather Alerts</Text>
        <Switch value={weather} onValueChange={setWeather} />
      </View>
      <View style={styles.switchContainer}>
        <Text>Breaking News Alerts</Text>
        <Switch value={breakingNews} onValueChange={setBreakingNews} />
      </View>
      <Button mode="contained" onPress={handleSave} style={styles.button}>
        Save Alert
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  input: {
    marginBottom: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  button: {
    marginTop: 16,
  },
});

export default AlertSetup;
