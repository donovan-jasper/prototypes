import { View, StyleSheet, Dimensions } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import PageView from './PageView';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;
const VERTICAL_SWIPE_THRESHOLD = SCREEN_HEIGHT * 0.2;

interface GestureReaderProps {
  pages: any[];
  currentPage: number;
  onPageChange: (page: number) => void;
  readingMode: 'ltr' | 'rtl' | 'vertical';
}

export default function GestureReader({
  pages,
  currentPage,
  onPageChange,
  readingMode,
}: GestureReaderProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);

  const changePage = (newPage: number) => {
    if (newPage >= 0 && newPage < pages.length) {
      onPageChange(newPage);
    }
  };

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (scale.value === 1) {
        if (readingMode === 'vertical') {
          translateY.value = event.translationY;
        } else {
          translateX.value = event.translationX;
        }
      }
    })
    .onEnd((event) => {
      if (scale.value === 1) {
        if (readingMode === 'vertical') {
          if (event.translationY > VERTICAL_SWIPE_THRESHOLD && currentPage > 0) {
            runOnJS(changePage)(currentPage - 1);
          } else if (event.translationY < -VERTICAL_SWIPE_THRESHOLD && currentPage < pages.length - 1) {
            runOnJS(changePage)(currentPage + 1);
          }
          translateY.value = withSpring(0);
        } else if (readingMode === 'rtl') {
          if (event.translationX < -SWIPE_THRESHOLD && currentPage > 0) {
            runOnJS(changePage)(currentPage - 1);
          } else if (event.translationX > SWIPE_THRESHOLD && currentPage < pages.length - 1) {
            runOnJS(changePage)(currentPage + 1);
          }
          translateX.value = withSpring(0);
        } else {
          if (event.translationX > SWIPE_THRESHOLD && currentPage > 0) {
            runOnJS(changePage)(currentPage - 1);
          } else if (event.translationX < -SWIPE_THRESHOLD && currentPage < pages.length - 1) {
            runOnJS(changePage)(currentPage + 1);
          }
          translateX.value = withSpring(0);
        }
      }
    });

  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = savedScale.value * event.scale;
    })
    .onEnd(() => {
      if (scale.value < 1) {
        scale.value = withSpring(1);
        savedScale.value = 1;
      } else if (scale.value > 3) {
        scale.value = withSpring(3);
        savedScale.value = 3;
      } else {
        savedScale.value = scale.value;
      }
    });

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      if (scale.value > 1) {
        scale.value = withSpring(1);
        savedScale.value = 1;
      } else {
        scale.value = withSpring(2);
        savedScale.value = 2;
      }
    });

  const composed = Gesture.Simultaneous(
    panGesture,
    pinchGesture,
    doubleTapGesture
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <View style={styles.container}>
      <GestureDetector gesture={composed}>
        <Animated.View style={[styles.pageContainer, animatedStyle]}>
          <PageView source={pages[currentPage]} />
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  pageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
