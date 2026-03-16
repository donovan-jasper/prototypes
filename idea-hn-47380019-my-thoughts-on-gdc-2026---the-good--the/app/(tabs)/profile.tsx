import { View, Text, Button } from 'react-native';
import EthicalScoreWidget from '../../components/EthicalScoreWidget';
import { useAppStore } from '../../store/app-store';

export default function ProfileScreen() {
  const user = useAppStore(state => state.user);
  const ethicalScore = useAppStore(state => state.ethicalScore);
  const generations = useAppStore(state => state.generations);

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <EthicalScoreWidget score={ethicalScore} />
      
      <View style={{ marginTop: 20 }}>
        <Text>Total Generations: {generations.length}</Text>
        <Text>Premium Status: {user.premiumStatus ? 'Active' : 'Inactive'}</Text>
        <Text>Monthly Limit: {user.generationCount}/10</Text>
      </View>
      
      {!user.premiumStatus && (
        <Button 
          title="Upgrade to Premium" 
          onPress={() => console.log('Upgrade pressed')} 
        />
      )}
    </View>
  );
}
