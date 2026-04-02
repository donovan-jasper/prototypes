import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import VideoPreview from '../components/VideoPreview';

const VideoPreviewScreen = ({ scenes }) => {
  return (
    <View style={styles.container}>
      <FlatList
        data={scenes}
        renderItem={({ item, index }) => (
          <VideoPreview scenes={[item]} />
        )}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default VideoPreviewScreen;
