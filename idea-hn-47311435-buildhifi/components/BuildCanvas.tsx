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
  const { currentBuild, setCurrentBuild, updateComponentPosition } = useBuildStore();
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
      updateComponentPosition(componentId, snapPosition.x, snapPosition.y);
    }
  };

  const renderComponent = (component: Component) => {
    const position = componentPositions[component.id] || { x: 0, y: 0 };
    const x = useSharedValue(position.x);
    const y = useSharedValue(position.y);

    const gesture = Gesture.Pan()
      .onUpdate((e) => {
        x.value = e.translationX + position.x;
        y.value = e.translationY + position.y;
      })
      .onEnd(() => {
        handleDragEnd(component.id, x.value, y.value);
      });

    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [
          { translateX: x.value },
          { translateY: y.value },
        ],
      };
    });

    return (
      <GestureDetector key={component.id} gesture={gesture}>
        <Animated.View style={[styles.componentContainer, animatedStyle]}>
          <ComponentCard component={component} />
        </Animated.View>
      </GestureDetector>
    );
  };

  const renderConnectionLines = () => {
    if (!currentBuild?.components || currentBuild.components.length < 2) return null;

    return currentBuild.components.map((component, index) => {
      if (index === currentBuild.components.length - 1) return null;

      const nextComponent = currentBuild.components[index + 1];
      const fromPosition = componentPositions[component.id];
      const toPosition = componentPositions[nextComponent.id];

      if (!fromPosition || !toPosition) return null;

      // Determine connection status
      let status: 'compatible' | 'warning' | 'incompatible' = 'compatible';
      const issue = validation.issues.find(issue =>
        issue.componentIndices.includes(index) && issue.componentIndices.includes(index + 1)
      );

      if (issue) {
        status = issue.severity === 'error' ? 'incompatible' : 'warning';
      }

      return (
        <ConnectionLine
          key={`connection-${component.id}-${nextComponent.id}`}
          from={{ ...component, position: fromPosition }}
          to={{ ...nextComponent, position: toPosition }}
          status={status}
        />
      );
    });
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
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
        <View style={styles.canvas}>
          {renderConnectionLines()}
          {currentBuild.components.map(renderComponent)}
        </View>
      </ScrollView>

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
            {validation.isValid ? 'Potential Issues' : 'Incompatible Setup'}
          </Text>
          <Text style={styles.bannerContent}>
            {validation.issues.length} issue{validation.issues.length !== 1 ? 's' : ''} found
          </Text>
        </Banner>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  canvas: {
    width: SCREEN_WIDTH * 2,
    height: 600,
    padding: 20,
  },
  componentContainer: {
    position: 'absolute',
    width: 150,
    height: 200,
  },
  emptyText: {
    textAlign: 'center',
    margin: 20,
    color: '#666',
  },
  banner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    margin: 10,
  },
  warningBanner: {
    backgroundColor: '#fff8e1',
  },
  errorBanner: {
    backgroundColor: '#ffebee',
  },
  bannerTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  bannerContent: {
    fontSize: 12,
  },
});

export default BuildCanvas;
