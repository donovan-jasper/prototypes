import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Text, Banner, IconButton } from 'react-native-paper';
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

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const BuildCanvas: React.FC<BuildCanvasProps> = ({ build }) => {
  const { currentBuild, setCurrentBuild } = useBuildStore();
  const [componentPositions, setComponentPositions] = useState<{ [key: number]: { x: number; y: number } }>({});
  const [validation, setValidation] = useState<{ isValid: boolean; suggestions: string[]; issues: any[] }>({
    isValid: true,
    suggestions: [],
    issues: []
  });

  // Snap positions for each component type
  const snapPositions = {
    source: { x: SCREEN_WIDTH * 0.2, y: 100 },
    preamp: { x: SCREEN_WIDTH * 0.4, y: 100 },
    amp: { x: SCREEN_WIDTH * 0.6, y: 100 },
    speaker: { x: SCREEN_WIDTH * 0.8, y: 100 }
  };

  useEffect(() => {
    if (build) {
      setCurrentBuild(build);
      // Initialize positions from build components
      const initialPositions: { [key: number]: { x: number; y: number } } = {};
      build.components.forEach(component => {
        // Determine snap position based on component type
        let snapPosition = { x: 0, y: 0 };
        if (component.type === 'turntable' || component.type === 'streamer') {
          snapPosition = snapPositions.source;
        } else if (component.type === 'preamp') {
          snapPosition = snapPositions.preamp;
        } else if (component.type === 'amplifier') {
          snapPosition = snapPositions.amp;
        } else if (component.type === 'speaker') {
          snapPosition = snapPositions.speaker;
        }

        initialPositions[component.id] = {
          x: component.position?.x || snapPosition.x,
          y: component.position?.y || snapPosition.y
        };
      });
      setComponentPositions(initialPositions);
    }
  }, [build]);

  useEffect(() => {
    if (currentBuild?.components.length) {
      const validationResult = validateSignalChain(currentBuild.components);
      setValidation(validationResult);
    }
  }, [currentBuild?.components]);

  const handleDragEnd = (componentId: number, x: number, y: number) => {
    if (currentBuild?.id) {
      // Find the component type to determine snap position
      const component = currentBuild.components.find(c => c.id === componentId);
      if (!component) return;

      let snapPosition = { x, y };
      if (component.type === 'turntable' || component.type === 'streamer') {
        snapPosition = snapPositions.source;
      } else if (component.type === 'preamp') {
        snapPosition = snapPositions.preamp;
      } else if (component.type === 'amplifier') {
        snapPosition = snapPositions.amp;
      } else if (component.type === 'speaker') {
        snapPosition = snapPositions.speaker;
      }

      // Update position with snap
      const newPositions = {
        ...componentPositions,
        [componentId]: {
          x: snapPosition.x,
          y: snapPosition.y
        }
      };
      setComponentPositions(newPositions);

      // Save to database
      saveComponentPosition(currentBuild.id, componentId, snapPosition.x, snapPosition.y);

      // Update Zustand store
      setCurrentBuild({
        ...currentBuild,
        components: currentBuild.components.map(c =>
          c.id === componentId
            ? { ...c, position: { x: snapPosition.x, y: snapPosition.y } }
            : c
        )
      });
    }
  };

  if (!currentBuild) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No build selected. Create a new build to start designing your audio system.</Text>
        <IconButton
          icon="plus"
          size={24}
          onPress={() => {
            // Logic to create new build would go here
          }}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {validation.issues.length > 0 && (
        <Banner
          visible={true}
          icon={validation.isValid ? "alert-circle" : "close-circle"}
          style={[styles.banner, validation.isValid ? styles.warningBanner : styles.errorBanner]}
          actions={[
            {
              label: 'Dismiss',
              onPress: () => {},
            },
          ]}
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
              setComponentPositions(prev => ({
                ...prev,
                [component.id]: {
                  x: prev[component.id]?.x || 0 + e.translationX,
                  y: prev[component.id]?.y || 0 + e.translationY
                }
              }));
            })
            .onEnd((e) => {
              handleDragEnd(component.id, e.translationX, e.translationY);
            });

          const animatedStyle = useAnimatedStyle(() => {
            return {
              transform: [
                { translateX: componentPositions[component.id]?.x || 0 },
                { translateY: componentPositions[component.id]?.y || 0 },
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
                    from={{
                      ...component,
                      position: componentPositions[component.id] || { x: 0, y: 0 }
                    }}
                    to={{
                      ...nextComponent,
                      position: componentPositions[nextComponent.id] || { x: 0, y: 0 }
                    }}
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
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 16,
  },
  canvas: {
    flex: 1,
    minHeight: 600,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  componentContainer: {
    position: 'absolute',
    width: 120,
    height: 120,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: '#666',
    fontSize: 16,
  },
  banner: {
    marginBottom: 16,
    borderLeftWidth: 4,
  },
  warningBanner: {
    borderLeftColor: '#ff9800',
    backgroundColor: '#fff8e1',
  },
  errorBanner: {
    borderLeftColor: '#f44336',
    backgroundColor: '#ffebee',
  },
  bannerTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  issueText: {
    marginBottom: 4,
  },
});

export default BuildCanvas;
