import { StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface PageViewProps {
  source: any;
}

export default function PageView({ source }: PageViewProps) {
  return (
    <Image
      source={source}
      style={styles.image}
      contentFit="contain"
      priority="high"
      cachePolicy="memory-disk"
    />
  );
}

const styles = StyleSheet.create({
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
});
