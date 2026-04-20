import React, { useState } from 'react';
import { View, StyleSheet, Animated, PanResponder, Dimensions } from 'react-native';
import { Text, Card, Avatar, useTheme, IconButton } from 'react-native-paper';
import { useUnsubscribe } from '../hooks/useUnsubscribe';
import { Sender } from '../types';

const { width } = Dimensions.get('window');

interface EmailCardProps {
  sender: Sender;
}

const EmailCard: React.FC<EmailCardProps> = ({ sender }) => {
  const theme = useTheme();
  const { unsubscribe, isLoading } = useUnsubscribe();
  const [swipePosition] = useState(new Animated.Value(0));
  const [isSwiping, setIsSwiping] = useState(false);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dx > 0) {
        setIsSwiping(true);
        swipePosition.setValue(gestureState.dx);
      }
    },
    onPanResponderRelease: async (_, gestureState) => {
      setIsSwiping(false);

      if (gestureState.dx > width * 0.4) {
        // Swipe completed - perform unsubscribe
        Animated.timing(swipePosition, {
          toValue: width,
          duration: 300,
          useNativeDriver: true,
        }).start(async () => {
          await unsubscribe(sender.domain);
          swipePosition.setValue(0);
        });
      } else {
        // Swipe not completed - reset
        Animated.spring(swipePosition, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    },
  });

  const swipeStyle = {
    transform: [
      {
        translateX: swipePosition.interpolate({
          inputRange: [0, width],
          outputRange: [0, width],
          extrapolate: 'clamp',
        }),
      },
    ],
  };

  const opacity = swipePosition.interpolate({
    inputRange: [0, width * 0.3],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const scale = swipePosition.interpolate({
    inputRange: [0, width],
    outputRange: [1, 0.9],
    extrapolate: 'clamp',
  });

  const backgroundColor = swipePosition.interpolate({
    inputRange: [0, width * 0.3, width],
    outputRange: ['white', '#e3f2fd', '#bbdefb'],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View style={[styles.container, swipeStyle]}>
      <Animated.View
        style={[
          styles.swipeBackground,
          {
            opacity: swipePosition.interpolate({
              inputRange: [0, width * 0.2],
              outputRange: [0, 1],
              extrapolate: 'clamp',
            }),
          },
        ]}
      >
        <Text style={styles.swipeText}>Unsubscribe</Text>
      </Animated.View>

      <Animated.View
        style={[
          styles.cardContainer,
          {
            opacity,
            transform: [{ scale }],
            backgroundColor,
          },
        ]}
        {...panResponder.panHandlers}
      >
        <Card style={styles.card}>
          <Card.Content style={styles.content}>
            <Avatar.Text
              size={40}
              label={sender.domain.charAt(0).toUpperCase()}
              style={styles.avatar}
            />
            <View style={styles.info}>
              <Text variant="bodyMedium" style={styles.name}>
                {sender.name}
              </Text>
              <Text variant="bodySmall" style={styles.emailCount}>
                {sender.emailCount} emails
              </Text>
              <Text variant="bodySmall" style={styles.lastEmail}>
                Last email: {new Date(sender.lastEmailDate).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.actions}>
              {sender.tags.includes('unsubscribe-available') && (
                <IconButton
                  icon="email-remove"
                  size={24}
                  onPress={() => unsubscribe(sender.domain)}
                  disabled={isLoading}
                  style={styles.actionButton}
                />
              )}
              {sender.tags.includes('tracking') && (
                <IconButton
                  icon="eye-off"
                  size={24}
                  onPress={() => {}}
                  style={styles.actionButton}
                />
              )}
            </View>
          </Card.Content>
        </Card>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
    overflow: 'hidden',
    borderRadius: 12,
  },
  swipeBackground: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#bbdefb',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: 20,
    borderRadius: 12,
  },
  swipeText: {
    color: '#1976d2',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cardContainer: {
    borderRadius: 12,
    elevation: 2,
  },
  card: {
    borderRadius: 12,
    elevation: 0,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  avatar: {
    marginRight: 15,
  },
  info: {
    flex: 1,
  },
  name: {
    fontWeight: '500',
    marginBottom: 2,
  },
  emailCount: {
    color: 'gray',
    marginBottom: 2,
  },
  lastEmail: {
    color: 'gray',
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    marginLeft: 5,
  },
});

export default EmailCard;
