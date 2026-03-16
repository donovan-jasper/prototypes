import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Animated } from 'react-native';
import { useMatches } from '../hooks/useMatches';
import CompatibilityScore from './CompatibilityScore';
import Colors from '../constants/Colors';

const MatchCard = ({ match }) => {
  const { acceptMatch, passMatch } = useMatches();
  const swipeAnim = new Animated.Value(0);

  const handleAccept = () => {
    Animated.timing(swipeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      acceptMatch(match.id);
    });
  };

  const handlePass = () => {
    Animated.timing(swipeAnim, {
      toValue: -1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      passMatch(match.id);
    });
  };

  const rotate = swipeAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-15deg', '0deg', '15deg'],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ rotate }],
        },
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.name}>{match.matchedUser.name}</Text>
        <Text style={styles.age}>{match.matchedUser.age}</Text>
      </View>
      <View style={styles.scoreContainer}>
        <CompatibilityScore score={match.compatibilityScore} />
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.passButton]}
          onPress={handlePass}
        >
          <Text style={styles.actionText}>Pass</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.acceptButton]}
          onPress={handleAccept}
        >
          <Text style={styles.actionText}>Accept</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: 10,
    padding: 20,
    marginBottom: 10,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  age: {
    fontSize: 16,
    color: Colors.text,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  passButton: {
    backgroundColor: Colors.error,
  },
  acceptButton: {
    backgroundColor: Colors.success,
  },
  actionText: {
    color: Colors.white,
    fontWeight: 'bold',
  },
});

export default MatchCard;
