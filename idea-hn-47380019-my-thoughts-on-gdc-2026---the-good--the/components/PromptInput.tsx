import { View, TextInput, Button, Alert } from 'react-native';
import { useState } from 'react';
import { useAppStore } from '../store/app-store';
import { generateImage } from '../lib/ai-service';

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
      addGeneration({
        id: Date.now(),
        prompt,
        imageUri: result.imageUrl,
        attribution: result.attribution,
        timestamp: new Date()
      });
      setPrompt('');
    } catch (error) {
      Alert.alert('Error', 'Failed to generate image');
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
