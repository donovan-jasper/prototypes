import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import ComponentCard from './ComponentCard';
import ConnectionLine from './ConnectionLine';
import { Build } from '@/lib/types';

interface BuildCanvasProps {
  build?: Build | null;
}

const BuildCanvas: React.FC<BuildCanvasProps> = ({ build }) => {
  if (!build) {
    return (
      <View style={styles.container}>
        <Text>No build selected</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.canvas}>
        {build.components.map((component, index) => (
          <ComponentCard key={index} component={component} />
        ))}
        {build.components.length > 1 && (
          <ConnectionLine
            from={build.components[0]}
            to={build.components[1]}
            status="compatible"
          />
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  canvas: {
    flex: 1,
    padding: 16,
  },
});

export default BuildCanvas;
