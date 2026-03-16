import React from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { PARTS, isPremiumPart } from '../lib/parts';
import { useStore } from '../lib/store';

const PartPalette = () => {
  const { isPremium, setSelectedPart } = useStore();

  const handleSelectPart = (type) => {
    if (isPremiumPart(type) && !isPremium) {
      // Show premium paywall
      return;
    }
    setSelectedPart(type);
  };

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {Object.entries(PARTS).map(([type, part]) => (
          <TouchableOpacity
            key={type}
            style={styles.partButton}
            onPress={() => handleSelectPart(type)}
          >
            {isPremiumPart(type) && !isPremium ? (
              <MaterialIcons name="lock" size={24} color="#6200ee" />
            ) : (
              <MaterialIcons name={part.icon} size={24} color="#6200ee" />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 60,
    backgroundColor: '#f5f5f5',
    padding: 8,
  },
  partButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
});

export default PartPalette;
