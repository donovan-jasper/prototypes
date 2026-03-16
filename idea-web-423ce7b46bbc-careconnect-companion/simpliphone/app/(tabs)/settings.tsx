import { View, StyleSheet, Text, Switch } from 'react-native';
import { useContext } from 'react';
import { SettingsContext } from '../../contexts/SettingsContext';

export default function SettingsScreen() {
  const { theme, toggleTheme } = useContext(SettingsContext);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.setting}>
        <Text style={[styles.settingText, { color: theme.colors.text }]}>Dark Mode</Text>
        <Switch
          value={theme.dark}
          onValueChange={toggleTheme}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  setting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  settingText: {
    fontSize: 18,
  },
});
