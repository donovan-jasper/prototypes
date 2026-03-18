import { View, Text, Button, TextInput, ScrollView, Alert, Linking } from 'react-native';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EthicalScoreWidget from '../../components/EthicalScoreWidget';
import { useAppStore } from '../../store/app-store';

const OPENAI_KEY_STORAGE = '@credigen_openai_key';
const ANTHROPIC_KEY_STORAGE = '@credigen_anthropic_key';

export default function ProfileScreen() {
  const user = useAppStore(state => state.user);
  const ethicalScore = useAppStore(state => state.ethicalScore);
  const generations = useAppStore(state => state.generations);
  
  const [openaiKey, setOpenaiKey] = useState('');
  const [anthropicKey, setAnthropicKey] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    try {
      const [savedOpenaiKey, savedAnthropicKey] = await Promise.all([
        AsyncStorage.getItem(OPENAI_KEY_STORAGE),
        AsyncStorage.getItem(ANTHROPIC_KEY_STORAGE)
      ]);
      
      if (savedOpenaiKey) setOpenaiKey(savedOpenaiKey);
      if (savedAnthropicKey) setAnthropicKey(savedAnthropicKey);
    } catch (error) {
      console.error('Error loading API keys:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveApiKeys = async () => {
    try {
      await Promise.all([
        AsyncStorage.setItem(OPENAI_KEY_STORAGE, openaiKey.trim()),
        AsyncStorage.setItem(ANTHROPIC_KEY_STORAGE, anthropicKey.trim())
      ]);
      Alert.alert('Success', 'API keys saved successfully');
    } catch (error) {
      console.error('Error saving API keys:', error);
      Alert.alert('Error', 'Failed to save API keys');
    }
  };

  const openSignupPage = (provider: 'openai' | 'anthropic') => {
    const url = provider === 'openai' 
      ? 'https://platform.openai.com/signup'
      : 'https://console.anthropic.com/';
    Linking.openURL(url);
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
      <EthicalScoreWidget score={ethicalScore} />
      
      <View style={{ marginTop: 20, marginBottom: 30 }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>Stats</Text>
        <Text>Total Generations: {generations.length}</Text>
        <Text>Premium Status: {user.premiumStatus ? 'Active' : 'Inactive'}</Text>
        <Text>Monthly Limit: {user.generationCount}/10</Text>
      </View>

      <View style={{ marginBottom: 30 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>API Configuration</Text>
        
        <View style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <Text style={{ fontSize: 14, fontWeight: '600' }}>OpenAI API Key</Text>
            <Button 
              title="Get Key" 
              onPress={() => openSignupPage('openai')}
            />
          </View>
          <TextInput
            value={openaiKey}
            onChangeText={setOpenaiKey}
            placeholder="sk-..."
            secureTextEntry
            style={{ 
              borderWidth: 1, 
              borderColor: '#ddd', 
              borderRadius: 8, 
              padding: 12,
              backgroundColor: '#f9f9f9'
            }}
          />
        </View>

        <View style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <Text style={{ fontSize: 14, fontWeight: '600' }}>Anthropic API Key</Text>
            <Button 
              title="Get Key" 
              onPress={() => openSignupPage('anthropic')}
            />
          </View>
          <TextInput
            value={anthropicKey}
            onChangeText={setAnthropicKey}
            placeholder="sk-ant-..."
            secureTextEntry
            style={{ 
              borderWidth: 1, 
              borderColor: '#ddd', 
              borderRadius: 8, 
              padding: 12,
              backgroundColor: '#f9f9f9'
            }}
          />
        </View>

        <Button 
          title="Save API Keys" 
          onPress={saveApiKeys}
        />
      </View>
      
      {!user.premiumStatus && (
        <Button 
          title="Upgrade to Premium" 
          onPress={() => console.log('Upgrade pressed')} 
        />
      )}
    </ScrollView>
  );
}
