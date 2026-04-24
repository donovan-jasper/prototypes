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

    return currentBuild.components.map((component, index) => {
      if (index === currentBuild.components.length - 1) return null;

      const nextComponent = currentBuild.components[index + 1];
      const fromPosition = componentPositions[component.id] || { x: 0, y: 0 };
      const toPosition = componentPositions[nextComponent.id] || { x: 0, y: 0 };

      // Determine connection status
      const connectionStatus = validation.issues.find(
        issue => issue.fromId === component.id && issue.toId === nextComponent.id
      )?.status || 'compatible';

      return (
        <ConnectionLine
          key={`connection-${component.id}-${nextComponent.id}`}
          from={{ ...component, position: fromPosition }}
          to={{ ...nextComponent, position: toPosition }}
          status={connectionStatus}
        />
      );
    });
  };

  return (
    <View style={styles.container}>
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
              color="#ff9800"
            />
          )}
        >
          {validation.suggestions.length > 0 ? validation.suggestions[0] : 'Some components may not be compatible'}
        </Banner>
      )}

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        <View style={styles.canvas}>
          {renderConnectionLines()}
          {currentBuild?.components.map(renderComponent)}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 20,
  },
  canvas: {
    width: SCREEN_WIDTH * 2,
    height: SCREEN_HEIGHT * 0.7,
    position: 'relative',
  },
  componentContainer: {
    width: 150,
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
  },
});

export default BuildCanvas;
