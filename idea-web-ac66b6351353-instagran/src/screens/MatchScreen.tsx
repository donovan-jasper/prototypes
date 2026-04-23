import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, Image, Animated, PanResponder } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { getMatchingScore } from '../utils/matching';
import { useUser } from '../context/UserContext';
import { generateMockUsers, MockUser } from '../utils/mockUsers';

type MatchScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MatchScreen'>;

type Props = {
  navigation: MatchScreenNavigationProp;
};

interface MatchedUser extends MockUser {
  matchScore: number;
}

const MatchScreen = ({ navigation }: Props) => {
  const { currentUser } = useUser();
  const [matches, setMatches] = useState<MatchedUser[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipe] = useState(new Animated.ValueXY());
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

  const generateMatches = () => {
    if (!currentUser) return;

    const mockUsers = generateMockUsers(25);

    const usersWithScores: MatchedUser[] = mockUsers
      .map(user => ({
        ...user,
        matchScore: getMatchingScore({ hobbies: currentUser.hobbies }, user)
      }))
      .filter(user => user.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10);

    setMatches(usersWithScores);
    setCurrentIndex(0);
  };

  useEffect(() => {
    generateMatches();
  }, [currentUser]);

  const handleRefresh = () => {
    setRefreshing(true);
    generateMatches();
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleMatch = (user: MockUser) => {
    navigation.navigate('EventScreen', { user });
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    if (matches.length === 0) return;

    setSwipeDirection(direction);

    Animated.timing(swipe, {
      toValue: direction === 'left' ? { x: -500, y: 0 } : { x: 500, y: 0 },
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      if (direction === 'right') {
        handleMatch(matches[currentIndex]);
      }
      swipe.setValue({ x: 0, y: 0 });
      setSwipeDirection(null);
      setCurrentIndex(prev => (prev + 1) % matches.length);
    });
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => {
      swipe.setValue({ x: gestureState.dx, y: gestureState.dy });
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dx > 120) {
        handleSwipe('right');
      } else if (gestureState.dx < -120) {
        handleSwipe('left');
      } else {
        Animated.spring(swipe, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: true,
        }).start();
      }
    },
  });

  if (!currentUser) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>Please create your profile first</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('ProfileScreen')}
        >
          <Text style={styles.buttonText}>Go to Profile</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (matches.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No matches found</Text>
        <Text style={styles.emptySubtext}>
          Try adding more hobbies to your profile or refresh to see new users
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={handleRefresh}
        >
          <Text style={styles.buttonText}>Refresh Matches</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => navigation.navigate('ProfileScreen')}
        >
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>Edit Profile</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentUserCard = matches[currentIndex];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Top Matches</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleRefresh}
        >
          <Text style={styles.refreshButtonText}>↻ Refresh</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cardContainer}>
        {matches.map((user, index) => {
          if (index < currentIndex) return null;

          const isCurrent = index === currentIndex;
          const rotate = swipe.x.interpolate({
            inputRange: [-200, 0, 200],
            outputRange: ['-15deg', '0deg', '15deg'],
            extrapolate: 'clamp',
          });

          const animatedStyle = {
            transform: isCurrent ? [{ rotate }, ...swipe.getTranslateTransform()] : [],
            opacity: isCurrent ? 1 : 0.5,
            zIndex: matches.length - index,
          };

          return (
            <Animated.View
              key={user.id}
              style={[styles.userCard, animatedStyle]}
              {...(isCurrent ? panResponder.panHandlers : {})}
            >
              <Image
                source={{ uri: user.avatar }}
                style={styles.avatar}
              />
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.hobbies}>{user.hobbies.join(', ')}</Text>
                <Text style={styles.score}>Match Score: {user.matchScore}%</Text>
              </View>

              {isCurrent && (
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.swipeButton, styles.rejectButton]}
                    onPress={() => handleSwipe('left')}
                  >
                    <Text style={styles.swipeButtonText}>✕</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.swipeButton, styles.acceptButton]}
                    onPress={() => handleSwipe('right')}
                  >
                    <Text style={styles.swipeButtonText}>✓</Text>
                  </TouchableOpacity>
                </View>
              )}
            </Animated.View>
          );
        })}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Swipe left to reject or right to connect
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  refreshButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 50,
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  secondaryButtonText: {
    color: '#007AFF',
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userCard: {
    position: 'absolute',
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    marginBottom: 15,
  },
  userInfo: {
    marginBottom: 20,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  hobbies: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 5,
  },
  score: {
    fontSize: 14,
    color: '#007AFF',
    textAlign: 'center',
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
  },
  swipeButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rejectButton: {
    backgroundColor: '#FF3B30',
  },
  acceptButton: {
    backgroundColor: '#34C759',
  },
  swipeButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  footer: {
    padding: 15,
    alignItems: 'center',
  },
  footerText: {
    color: '#999',
    fontSize: 14,
  },
});

export default MatchScreen;
