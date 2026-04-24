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

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

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
    source: { x: SCREEN_WIDTH * 0.2, y: SCREEN_HEIGHT * 0.3 },
    preamp: { x: SCREEN_WIDTH * 0.4, y: SCREEN_HEIGHT * 0.3 },
    amp: { x: SCREEN_WIDTH * 0.6, y: SCREEN_HEIGHT * 0.3 },
    speaker: { x: SCREEN_WIDTH * 0.8, y: SCREEN_HEIGHT * 0.3 }
  };

  // Drop zone areas for visual feedback
  const dropZones = {
    source: {
      x: snapPositions.source.x - 75,
      y: snapPositions.source.y - 100,
      width: 150,
      height: 200
    },
    preamp: {
      x: snapPositions.preamp.x - 75,
      y: snapPositions.preamp.y - 100,
      width: 150,
      height: 200
    },
    amp: {
      x: snapPositions.amp.x - 75,
      y: snapPositions.amp.y - 100,
      width: 150,
      height: 200
    },
    speaker: {
      x: snapPositions.speaker.x - 75,
      y: snapPositions.speaker.y - 100,
      width: 150,
      height: 200
    }
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
      let componentType = '';

      // Check which drop zone the component is closest to
      const distances = Object.entries(dropZones).map(([type, zone]) => {
        const dx = Math.abs(x - zone.x - zone.width/2);
        const dy = Math.abs(y - zone.y - zone.height/2);
        return { type, distance: Math.sqrt(dx*dx + dy*dy) };
      });

      const closestZone = distances.reduce((prev, curr) =>
        prev.distance < curr.distance ? prev : curr
      );

      // Snap to the closest valid drop zone
      if (closestZone.type === 'source' && (component.type === 'turntable' || component.type === 'streamer')) {
        snapPosition = snapPositions.source;
        componentType = 'source';
      } else if (closestZone.type === 'preamp' && component.type === 'preamp') {
        snapPosition = snapPositions.preamp;
        componentType = 'preamp';
      } else if (closestZone.type === 'amp' && component.type === 'amplifier') {
        snapPosition = snapPositions.amp;
        componentType = 'amp';
      } else if (closestZone.type === 'speaker' && component.type === 'speaker') {
        snapPosition = snapPositions.speaker;
        componentType = 'speaker';
      } else {
        // If not in a valid zone, snap back to original position
        snapPosition = componentPositions[componentId] || { x: 0, y: 0 };
      }

      // Update position with snap
      const newPositions = {
        ...componentPositions,
        [componentId]: snapPosition
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
        position: 'absolute',
        width: 150,
        height: 200,
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

    const components = [...currentBuild.components].sort((a, b) => {
      // Sort by position to ensure proper connection order
      const aPos = componentPositions[a.id] || { x: 0, y: 0 };
      const bPos = componentPositions[b.id] || { x: 0, y: 0 };
      return aPos.x - bPos.x;
    });

    return components.map((component, index) => {
      if (index === components.length - 1) return null;

      const nextComponent = components[index + 1];
      const currentPos = componentPositions[component.id] || { x: 0, y: 0 };
      const nextPos = componentPositions[nextComponent.id] || { x: 0, y: 0 };

      // Get validation status for this connection
      const connectionValidation = validation.issues.find(
        issue => issue.fromId === component.id && issue.toId === nextComponent.id
      );

      let status = 'compatible';
      if (connectionValidation) {
        status = connectionValidation.status;
      }

      return (
        <ConnectionLine
          key={`connection-${component.id}-${nextComponent.id}`}
          from={{ x: currentPos.x + 75, y: currentPos.y + 200 }}
          to={{ x: nextPos.x + 75, y: nextPos.y }}
          status={status}
        />
      );
    });
  };

  const renderDropZones = () => {
    return Object.entries(dropZones).map(([type, zone]) => (
      <View
        key={`drop-zone-${type}`}
        style={[
          styles.dropZone,
          {
            left: zone.x,
            top: zone.y,
            width: zone.width,
            height: zone.height,
            borderColor: type === 'source' ? '#4CAF50' :
                        type === 'preamp' ? '#FFC107' :
                        type === 'amp' ? '#2196F3' :
                        '#9C27B0'
          }
        ]}
      />
    ));
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        <View style={styles.canvas}>
          {renderDropZones()}
          {currentBuild?.components.map(renderComponent)}
          {renderConnectionLines()}
        </View>
      </ScrollView>

      {!validation.isValid && (
        <Banner
          visible={true}
          actions={[
            {
              label: 'Fix Issues',
              onPress: () => console.log('Show suggestions'),
            },
          ]}
          icon={({ size }) => (
            <IconButton
              icon="alert-circle"
              size={size}
              color="#FF5252"
            />
          )}
        >
          {validation.suggestions.length > 0 ? validation.suggestions[0] : 'Your build has issues'}
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
    flexGrow: 1,
    padding: 20,
  },
  canvas: {
    width: SCREEN_WIDTH * 2, // Wider than screen to allow horizontal scrolling
    height: SCREEN_HEIGHT * 0.8,
    position: 'relative',
  },
  componentContainer: {
    width: 150,
    height: 200,
    position: 'absolute',
  },
  dropZone: {
    position: 'absolute',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 8,
    opacity: 0.3,
  },
});

export default BuildCanvas;
