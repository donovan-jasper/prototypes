import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Colors } from '@/constants/Colors';

interface MapMarkerProps {
  score: number;
  isSelected: boolean;
}

export const MapMarker: React.FC<MapMarkerProps> = ({ score, isSelected }) => {
  // Determine color based on score
  let color = Colors.green;
  if (score < 80) color = Colors.yellow;
  if (score < 70) color = Colors.red;

  // Scale size based on selection
  const size = isSelected ? 40 : 30;

  return (
    <View style={[
      styles.markerContainer,
      {
        width: size,
        height: size,
        borderColor: isSelected ? Colors.primary : color,
      }
    ]}>
      <View style={[
        styles.marker,
        {
          backgroundColor: color,
          width: size * 0.6,
          height: size * 0.6,
        }
      ]}>
        <Text style={[
          styles.scoreText,
          {
            fontSize: size * 0.3,
          }
        ]}>
          {score}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  markerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 2,
  },
  marker: {
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreText: {
    color: Colors.white,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
