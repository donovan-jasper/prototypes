import React, { useState } from 'react';
import { View, StyleSheet, Text, Switch } from 'react-native';
import Colors from '../constants/Colors';

const PrivacyToggle = ({ title, description, settingKey }) => {
  const [isEnabled, setIsEnabled] = useState(true);

  const toggleSwitch = () => {
    setIsEnabled(previousState => !previousState);
    // Implement actual setting update logic here
  };

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      <Switch
        trackColor={{ false: Colors.gray, true: Colors.primary }}
        thumbColor={isEnabled ? Colors.white : Colors.white}
        ios_backgroundColor={Colors.gray}
        onValueChange={toggleSwitch}
        value={isEnabled}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  textContainer: {
    flex: 1,
    marginRight: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  description: {
    fontSize: 14,
    color: Colors.text,
    marginTop: 5,
  },
});

export default PrivacyToggle;
