import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert, Linking } from 'react-native';
import { markAsUnsubscribed, unsubscribe } from '../services/SubscriptionService';

const UnsubscribeButton = ({ subscription, onComplete }) => {
  const handlePress = async () => {
    if (!subscription.unsubscribe_url) {
      Alert.alert(
        'No Unsubscribe Link',
        'This subscription does not have an unsubscribe URL. Would you like to remove it from your list?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Remove', 
            style: 'destructive', 
            onPress: async () => {
              await unsubscribe(subscription.id);
              if (onComplete) onComplete();
            }
          },
        ]
      );
      return;
    }

    Alert.alert(
      'Unsubscribe',
      'This will open the unsubscribe page in your browser. After unsubscribing, please confirm so we can remove it from your list.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Open Link', 
          onPress: async () => {
            try {
              await markAsUnsubscribed(subscription.id);
              
              const supported = await Linking.canOpenURL(subscription.unsubscribe_url);
              if (supported) {
                await Linking.openURL(subscription.unsubscribe_url);
                
                setTimeout(() => {
                  Alert.alert(
                    'Unsubscribe Complete?',
                    'Did you successfully unsubscribe?',
                    [
                      { 
                        text: 'Not Yet', 
                        style: 'cancel',
                        onPress: async () => {
                          await markAsUnsubscribed(subscription.id);
                        }
                      },
                      { 
                        text: 'Yes, Remove It', 
                        onPress: async () => {
                          await unsubscribe(subscription.id);
                          if (onComplete) onComplete();
                        }
                      },
                    ]
                  );
                }, 2000);
              } else {
                Alert.alert('Error', 'Cannot open this URL');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to open unsubscribe link');
            }
          }
        },
      ]
    );
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.button}>
      <Text style={styles.text}>Unsubscribe</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#FF3B30',
    borderRadius: 6,
  },
  text: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default UnsubscribeButton;
