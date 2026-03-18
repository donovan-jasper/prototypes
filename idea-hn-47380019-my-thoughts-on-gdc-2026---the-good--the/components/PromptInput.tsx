import { View, TextInput, Button, Alert } from 'react-native';
import { useState } from 'react';
import { useAppStore } from '../store/app-store';
import { generateImage } from '../lib/ai-service';
import { saveToMediaLibrary } from '../lib/storage';

export default function PromptInput() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const addGeneration = useAppStore(state => state.addGeneration);
  const user = useAppStore(state => state.user);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      Alert.alert('Error', 'Please enter a prompt');
      return;
    }

    if (!user.premiumStatus && user.generationCount >= 10) {
      Alert.alert('Limit Reached', 'Upgrade to premium for unlimited generations');
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateImage(prompt);
      
      // Save to media library and get the asset URI
      const saved = await saveToMediaLibrary(result.imageUrl);
      
      if (saved) {
        Alert.alert('Success', 'Image saved to your photo library');
        
        // Store the generation with the media library asset URI
        await addGeneration({
          id: Date.now(),
          prompt,
          imageUri: saved,
          attribution: result.attribution,
          timestamp: new Date()
        });
      } else {
        Alert.alert('Warning', 'Image generated but could not be saved to photo library');
        
        // Still store the generation with the temp URI
        await addGeneration({
          id: Date.now(),
          prompt,
          imageUri: result.imageUrl,
          attribution: result.attribution,
          timestamp: new Date()
        });
      }
      
      setPrompt('');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to generate image');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <View style={{ flexDirection: 'row', marginBottom: 16 }}>
      <TextInput
        value={prompt}
        onChangeText={setPrompt}
        placeholder="Enter your prompt..."
        style={{ 
          flex: 1, 
          borderWidth: 1, 
          borderColor: '#ddd', 
          borderRadius: 8, 
          padding: 12,
          marginRight: 8
        }}
      />
      <Button 
        title={isGenerating ? '...' : 'Generate'} 
        onPress={handleGenerate} 
        disabled={isGenerating}
      />
    </View>
  );
}
