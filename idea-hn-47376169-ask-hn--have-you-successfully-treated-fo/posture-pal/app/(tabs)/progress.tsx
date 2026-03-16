import { View, Text, StyleSheet } from 'react-native';
import { useStore } from '@/store/useStore';
import { PosturePhoto } from '@/components/PosturePhoto';
import { PainTracker } from '@/components/PainTracker';

export default function ProgressScreen() {
  const { painHistory, posturePhotos } = useStore();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Progress</Text>
      <PainTracker painHistory={painHistory} />
      <PosturePhoto photos={posturePhotos} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});
