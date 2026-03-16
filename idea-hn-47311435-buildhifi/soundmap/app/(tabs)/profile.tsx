import { View, StyleSheet } from 'react-native';
import { usePremiumStore } from '../../lib/store/premiumStore';
import { Button, Card, Title, Paragraph } from 'react-native-paper';

export default function ProfileScreen() {
  const { isPremium, unlockPremium } = usePremiumStore();

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>Premium Status</Title>
          <Paragraph>{isPremium ? 'Premium' : 'Free'}</Paragraph>
        </Card.Content>
        {!isPremium && (
          <Card.Actions>
            <Button onPress={unlockPremium}>Upgrade to Premium</Button>
          </Card.Actions>
        )}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
});
