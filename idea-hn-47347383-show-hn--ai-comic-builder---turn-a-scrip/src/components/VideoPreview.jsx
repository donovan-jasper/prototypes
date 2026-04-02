import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Video } from 'expo-av';

const VideoPreview = ({ scenes }) => {
  const [currentScene, setCurrentScene] = React.useState(0);

  React.useEffect(() => {
    const intervalId = setInterval(() => {
      if (currentScene < scenes.length - 1) {
        setCurrentScene(currentScene + 1);
      } else {
        setCurrentScene(0);
      }
    }, scenes[currentScene].duration * 1000);
    return () => clearInterval(intervalId);
  }, [currentScene, scenes]);

  return (
    <View style={styles.container}>
      {scenes.map((scene, index) => (
        <Video
          key={scene.id}
          source={{ uri: scene.asset }}
          style={styles.videoPlayer}
          useNativeControls // Allows users to play, pause, seek, etc.
          resizeMode="contain" // Ensures the whole video is visible, letterboxing if necessary
          isLooping={false} // Plays the video in a loop
          shouldPlay={index === currentScene} // Starts playing automatically when component mounts
          onPlaybackStatusUpdate={(status) => {
            if (status.didJustFinish) {
              if (index < scenes.length - 1) {
                setCurrentScene(index + 1);
              } else {
                setCurrentScene(0);
              }
            }
          }}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%', // Take full width of parent
    backgroundColor: '#000', // Dark background for video player
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlayer: {
    width: '100%',
    height: 300, // Fixed height for the video player, adjust as needed
    backgroundColor: 'black', // Background for the video area itself
  },
});

export default VideoPreview;
