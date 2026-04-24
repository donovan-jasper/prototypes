import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Banner } from 'react-native-paper';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import ComponentCard from './ComponentCard';
import ConnectionLine from './ConnectionLine';
import { Build, Component } from '@/lib/types';
import { validateSignalChain } from '@/lib/validation/chain';
import { saveComponentPosition } from '@/lib/db/queries';
import useBuildStore from '@/lib/store/buildStore';

interface BuildCanvasProps {
  build?: Build | null;
}

const BuildCanvas: React.FC<BuildCanvasProps> = ({ build }) => {
  const { currentBuild, setCurrentBuild } = useBuildStore();
  const positions = useSharedValue<{ [key: number]: { x: number; y: number } }>({});

  useEffect(() => {
    if (build) {
      setCurrentBuild(build);
      // Initialize positions from build components
      const initialPositions: { [key: number]: { x: number; y: number } } = {};
      build.components.forEach(component => {
        initialPositions[component.id] = {
          x: component.position?.x || 0,
          y: component.position?.y || 0
        };
      });
      positions.value = initialPositions;
    }
  }, [build]);

  if (!currentBuild) {
    return (
      <View style={styles.container}>
        <Text>No build selected</Text>
      </View>
    );
  }

  const validation = currentBuild.components.length > 0
    ? validateSignalChain(currentBuild.components)
    : { isValid: true, suggestions: [], issues: [] };

  const handleDragEnd = (componentId: number, x: number, y: number) => {
    if (currentBuild.id) {
      saveComponentPosition(currentBuild.id, componentId, x, y);
      // Update Zustand store with new position
      setCurrentBuild({
        ...currentBuild,
        components: currentBuild.components.map(component =>
          component.id === componentId
            ? { ...component, position: { x, y } }
            : component
        )
      });
    }
  };

  return (
    <ScrollView style={styles.container}>
      {validation.issues.length > 0 && (
        <Banner
          visible={true}
          icon="alert-circle"
          style={[styles.banner, validation.isValid ? styles.warningBanner : styles.errorBanner]}
        >
          <Text style={styles.bannerTitle}>
            {validation.isValid ? 'Warnings Found' : 'Compatibility Issues Found'}
          </Text>
          {validation.issues.map((issue, index) => (
            <Text key={index} style={styles.issueText}>
              • {issue.message}
            </Text>
          ))}
        </Banner>
      )}

      <View style={styles.canvas}>
        {currentBuild.components.map((component, index) => {
          const nextComponent = currentBuild.components[index + 1];
          let connectionStatus: 'compatible' | 'warning' | 'incompatible' = 'compatible';

          if (nextComponent) {
            const pairValidation = validateSignalChain([component, nextComponent]);
            if (!pairValidation.isValid) {
              connectionStatus = 'incompatible';
            } else if (pairValidation.issues.some(issue => issue.severity === 'warning')) {
              connectionStatus = 'warning';
            }
          }

          const dragGesture = Gesture.Pan()
            .onUpdate((e) => {
              if (positions.value[component.id]) {
                positions.value[component.id] = {
                  x: e.translationX,
                  y: e.translationY,
                };
              }
            })
            .onEnd((e) => {
              if (positions.value[component.id]) {
                handleDragEnd(component.id, e.translationX, e.translationY);
              }
            });

          const animatedStyle = useAnimatedStyle(() => {
            return {
              transform: [
                { translateX: positions.value[component.id]?.x || 0 },
                { translateY: positions.value[component.id]?.y || 0 },
              ],
            };
          });

          return (
            <GestureDetector key={component.id} gesture={dragGesture}>
              <Animated.View style={[styles.componentContainer, animatedStyle]}>
                <ComponentCard
                  component={component}
                  validationStatus={connectionStatus}
                />
                {nextComponent && (
                  <ConnectionLine
                    from={component}
                    to={nextComponent}
                    status={connectionStatus}
                  />
                )}
              </Animated.View>
            </GestureDetector>
          );
        })}
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
  componentContainer: {
    marginBottom: 20,
  },
  banner: {
    marginBottom: 16,
  },
  errorBanner: {
    backgroundColor: '#ffebee',
  },
  warningBanner: {
    backgroundColor: '#fff3e0',
  },
  bannerTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  issueText: {
    fontSize: 14,
    marginVertical: 2,
  },
});

export default BuildCanvas;
