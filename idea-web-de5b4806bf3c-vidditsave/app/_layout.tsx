import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, AppState, AppStateStatus } from 'react-native';
import { initDB } from '@/lib/db';
import { initStorage } from '@/lib/storage';
import { getSharedUrl, processSharedUrl, isValidUrl } from '@/lib/share-extension';

export default function RootLayout() {
  const [isProcessingShare, setIsProcessingShare] = useState(false);

  useEffect(() => {
    async function initialize() {
      await initDB();
      await initStorage();
      await checkForSharedContent();
    }
    initialize();

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, []);

  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (nextAppState === 'active' && !isProcessingShare) {
      await checkForSharedContent();
    }
  };

  const checkForSharedContent = async () => {
    try {
      const sharedUrl = await getSharedUrl();
      
      if (sharedUrl && isValidUrl(sharedUrl) && !isProcessingShare) {
        setIsProcessingShare(true);
        
        Alert.alert(
          'Save Content',
          `Do you want to save this content?\n\n${sharedUrl.substring(0, 100)}${sharedUrl.length > 100 ? '...' : ''}`,
          [
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => setIsProcessingShare(false),
            },
            {
              text: 'Save',
              onPress: async () => {
                const result = await processSharedUrl(sharedUrl, (message) => {
                  console.log('Share progress:', message);
                });

                setIsProcessingShare(false);

                if (result.success) {
                  Alert.alert('Success', 'Content saved to your library!');
                } else {
                  Alert.alert('Error', result.error || 'Failed to save content');
                }
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error checking for shared content:', error);
      setIsProcessingShare(false);
    }
  };

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="item/[id]" 
        options={{ 
          presentation: 'modal',
          headerTitle: 'Item Details'
        }} 
      />
    </Stack>
  );
}
