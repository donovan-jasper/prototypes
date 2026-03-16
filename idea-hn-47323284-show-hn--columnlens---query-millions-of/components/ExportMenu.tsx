import React from 'react';
import { View, Button, StyleSheet } from 'react-native';

const ExportMenu = ({ onExport }) => {
  const handleExport = (format) => {
    onExport(format);
  };

  return (
    <View style={styles.container}>
      <Button title="Export as CSV" onPress={() => handleExport('csv')} />
      <Button title="Export as JSON" onPress={() => handleExport('json')} />
      <Button title="Export as PNG" onPress={() => handleExport('png')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});

export default ExportMenu;
