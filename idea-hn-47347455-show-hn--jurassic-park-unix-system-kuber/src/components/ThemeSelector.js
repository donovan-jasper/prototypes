import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const ThemeSelector = () => {
  const [selectedTheme, setSelectedTheme] = useState('retro');

  const handleThemeChange = (theme) => {
    setSelectedTheme(theme);
  };

  return (
    <View style={styles.container}>
      <Text>Theme:</Text>
      <TouchableOpacity onPress={() => handleThemeChange('retro')}>
        <Text>Retro</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleThemeChange('modern')}>
        <Text>Modern</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ThemeSelector;
