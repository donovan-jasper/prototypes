import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Switch, Button, Card } from 'react-native-paper';
import { useUserStore } from '../../store/userStore';

export default function Profile() {
  const { isPremium, notificationEnabled, setSettings } = useUserStore();

  const togglePremium = () => {
    setSettings({ isPremium: !isPremium });
  };

  const toggleNotifications = () => {
    setSettings({ notificationEnabled: !notificationEnabled });
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Profile
      </Text>

      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.row}>
            <Text variant="bodyLarge">Premium Status</Text>
            <Switch
              value={isPremium}
              onValueChange={togglePremium}
            />
          </View>

          <View style={styles.row}>
            <Text variant="bodyLarge">Notifications</Text>
            <Switch
              value={notificationEnabled}
              onValueChange={toggleNotifications}
            />
          </View>
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        onPress={() => {}}
        style={styles.button}
      >
        {isPremium ? 'Manage Subscription' : 'Upgrade to Premium'}
      </Button>

      <Button
        mode="outlined"
        onPress={() => {}}
        style={styles.button}
      >
        Log Out
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5'
  },
  title: {
    marginBottom: 16
  },
  card: {
    marginBottom: 16
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8
  },
  button: {
    marginTop: 16
  }
});
