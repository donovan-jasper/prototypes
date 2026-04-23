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
            zIndex: isCurrent ? 1 : 0,
          };

          return (
            <Animated.View
              key={user.id}
              style={[styles.card, animatedStyle]}
              {...(isCurrent ? panResponder.panHandlers : {})}
            >
              <Image
                source={{ uri: user.photoUrl }}
                style={styles.userImage}
              />
              <View style={styles.cardContent}>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.matchScore}>Match: {user.matchScore}%</Text>
                <Text style={styles.hobbiesTitle}>Hobbies:</Text>
                <Text style={styles.hobbies}>{user.hobbies.join(', ')}</Text>
                <Text style={styles.bioTitle}>About:</Text>
                <Text style={styles.bio}>{user.bio}</Text>
              </View>

              {isCurrent && (
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.dislikeButton]}
                    onPress={() => handleSwipe('left')}
                  >
                    <Text style={styles.actionButtonText}>✕</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.likeButton]}
                    onPress={() => handleSwipe('right')}
                  >
                    <Text style={styles.actionButtonText}>❤️</Text>
                  </TouchableOpacity>
                </View>
              )}
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  refreshButton: {
    padding: 8,
  },
  refreshButtonText: {
    fontSize: 16,
    color: '#6200ee',
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '90%',
    height: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    position: 'absolute',
    padding: 16,
  },
  userImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  cardContent: {
    padding: 16,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  matchScore: {
    fontSize: 16,
    color: '#6200ee',
    marginBottom: 12,
  },
  hobbiesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
  hobbies: {
    fontSize: 14,
    marginBottom: 12,
  },
  bioTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
  bio: {
    fontSize: 14,
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 'auto',
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  dislikeButton: {
    backgroundColor: '#ff4444',
  },
  likeButton: {
    backgroundColor: '#4caf50',
  },
  actionButtonText: {
    fontSize: 24,
    color: 'white',
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#333',
  },
  emptySubtext: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: '#666',
  },
  button: {
    backgroundColor: '#6200ee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#6200ee',
  },
  secondaryButtonText: {
    color: '#6200ee',
  },
});

export default MatchScreen;
